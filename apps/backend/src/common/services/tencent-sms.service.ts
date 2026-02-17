import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as https from 'https';

interface SmsResponse {
  SendStatusSet?: Array<{
    SerialNo: string;
    PhoneNumber: string;
    Fee: number;
    SessionContext: string;
    Code: string;
    Message: string;
    IsoCode: string;
  }>;
  RequestId: string;
  Error?: {
    Code: string;
    Message: string;
  };
}

/**
 * Tencent Cloud SMS Service
 * Uses Tencent Cloud SMS API v3 for sending SMS messages
 */
@Injectable()
export class TencentSmsService {
  private readonly logger = new Logger(TencentSmsService.name);
  private readonly sdkAppId: string;
  private readonly appKey: string;
  private readonly signName: string;
  private readonly templateId: string;
  private readonly secretId: string;
  private readonly secretKey: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.sdkAppId = this.configService.get<string>('sms.tencentSdkAppId', '');
    this.appKey = this.configService.get<string>('sms.tencentAppKey', '');
    this.signName = this.configService.get<string>('sms.tencentSignName', '领展会员');
    this.templateId = this.configService.get<string>('sms.tencentTemplateId', '');
    this.secretId = this.configService.get<string>('sms.tencentSecretId', '');
    this.secretKey = this.configService.get<string>('sms.tencentSecretKey', '');
    this.region = this.configService.get<string>('sms.tencentRegion', 'ap-guangzhou');
  }

  /**
   * Send SMS verification code
   * @param phone Phone number with country code (e.g., +85291234567)
   * @param code Verification code
   * @param expiryMinutes Code expiry time in minutes
   */
  async sendVerificationCode(
    phone: string,
    code: string,
    expiryMinutes: number = 5,
  ): Promise<{ success: boolean; message: string; requestId?: string }> {
    // Format phone number - ensure it has country code prefix
    const formattedPhone = this.formatPhoneNumber(phone);

    try {
      const response = await this.sendSms(
        formattedPhone,
        [code, expiryMinutes.toString()],
      );

      if (response.Error) {
        this.logger.error(`SMS send failed: ${response.Error.Code} - ${response.Error.Message}`);
        throw new BadRequestException(`SMS send failed: ${response.Error.Message}`);
      }

      const sendStatus = response.SendStatusSet?.[0];
      if (sendStatus && sendStatus.Code !== 'Ok') {
        this.logger.error(`SMS delivery failed: ${sendStatus.Code} - ${sendStatus.Message}`);
        throw new BadRequestException(`SMS delivery failed: ${sendStatus.Message}`);
      }

      this.logger.log(`SMS sent successfully to ${this.maskPhone(formattedPhone)}, RequestId: ${response.RequestId}`);

      return {
        success: true,
        message: 'Verification code sent successfully',
        requestId: response.RequestId,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send SMS using Tencent Cloud API v3
   */
  private async sendSms(
    phoneNumber: string,
    templateParams: string[],
  ): Promise<SmsResponse> {
    const host = 'sms.tencentcloudapi.com';
    const service = 'sms';
    const action = 'SendSms';
    const version = '2021-01-11';
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];

    const payload = JSON.stringify({
      PhoneNumberSet: [phoneNumber],
      SmsSdkAppId: this.sdkAppId,
      SignName: this.signName,
      TemplateId: this.templateId,
      TemplateParamSet: templateParams,
    });

    // Calculate authorization signature (TC3-HMAC-SHA256)
    const hashedPayload = this.sha256Hex(payload);
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\nx-tc-action:${action.toLowerCase()}\n`;
    const signedHeaders = 'content-type;host;x-tc-action';

    const canonicalRequest = [
      httpRequestMethod,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      hashedPayload,
    ].join('\n');

    const credentialScope = `${date}/${service}/tc3_request`;
    const stringToSign = [
      'TC3-HMAC-SHA256',
      timestamp.toString(),
      credentialScope,
      this.sha256Hex(canonicalRequest),
    ].join('\n');

    // Calculate signature
    const secretDate = this.hmacSha256(`TC3${this.secretKey}`, date);
    const secretService = this.hmacSha256(secretDate, service);
    const secretSigning = this.hmacSha256(secretService, 'tc3_request');
    const signature = this.hmacSha256Hex(secretSigning, stringToSign);

    const authorization = `TC3-HMAC-SHA256 Credential=${this.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: host,
        method: 'POST',
        path: '/',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Host': host,
          'X-TC-Action': action,
          'X-TC-Version': version,
          'X-TC-Timestamp': timestamp.toString(),
          'X-TC-Region': this.region,
          'Authorization': authorization,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.Response || response);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(payload);
      req.end();
    });
  }

  /**
   * Format phone number with country code
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If no country code, assume Hong Kong (+852)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('852')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 8) {
        // Hong Kong local number
        cleaned = '+852' + cleaned;
      } else if (cleaned.startsWith('86') && cleaned.length >= 13) {
        // China mainland number
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+852' + cleaned;
      }
    }

    return cleaned;
  }

  /**
   * Mask phone number for logging
   */
  private maskPhone(phone: string): string {
    if (phone.length <= 6) return '****';
    return phone.substring(0, 4) + '****' + phone.substring(phone.length - 4);
  }

  /**
   * SHA256 hex hash
   */
  private sha256Hex(message: string): string {
    return crypto.createHash('sha256').update(message).digest('hex');
  }

  /**
   * HMAC-SHA256
   */
  private hmacSha256(key: string | Buffer, message: string): Buffer {
    return crypto.createHmac('sha256', key).update(message).digest();
  }

  /**
   * HMAC-SHA256 hex
   */
  private hmacSha256Hex(key: Buffer, message: string): string {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
  }

  /**
   * Check if SMS service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.sdkAppId && this.secretId && this.secretKey && this.templateId);
  }
}
