/**
 * WeChat SDK utilities for mini program.
 * Wraps common WeChat APIs: login, share, pay, scan, etc.
 */

/** WeChat login - get temporary code */
export function wechatLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error('WeChat login failed: no code returned'));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'WeChat login failed'));
      },
    });
  });
}

/** Get WeChat user profile (nickname, avatar) */
export function getWechatUserProfile(): Promise<{
  nickName: string;
  avatarUrl: string;
  gender: number;
}> {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: 'Used for member registration',
      success: (res) => {
        resolve({
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
          gender: res.userInfo.gender,
        });
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Get user profile failed'));
      },
    });
  });
}

/** Get phone number via WeChat button component
 *  Note: This must be triggered from a <button open-type="getPhoneNumber"> event
 */
export function extractPhoneData(e: any): { encryptedData: string; iv: string } | null {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    return {
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
    };
  }
  return null;
}

/** Scan QR code using WeChat camera */
export function scanCode(scanType: ('barCode' | 'qrCode')[] = ['qrCode', 'barCode']): Promise<{
  result: string;
  scanType: string;
  charSet: string;
}> {
  return new Promise((resolve, reject) => {
    uni.scanCode({
      scanType,
      success: (res) => {
        resolve({
          result: res.result,
          scanType: res.scanType,
          charSet: res.charSet || 'utf-8',
        });
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Scan failed'));
      },
    });
  });
}

/** WeChat Pay */
export function wechatPay(payParams: {
  timeStamp: string;
  nonceStr: string;
  packageValue: string;
  signType: string;
  paySign: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.packageValue,
      signType: payParams.signType as 'MD5' | 'HMAC-SHA256',
      paySign: payParams.paySign,
      success: () => resolve(),
      fail: (err) => {
        if (err.errMsg?.includes('cancel')) {
          reject(new Error('Payment cancelled'));
        } else {
          reject(new Error(err.errMsg || 'Payment failed'));
        }
      },
    });
  });
}

/** Share content to WeChat chat or timeline */
export function configureShare(options: {
  title: string;
  path: string;
  imageUrl?: string;
}): UniApp.ShareAppMessageOption {
  return {
    title: options.title,
    path: options.path,
    imageUrl: options.imageUrl || '',
  } as any;
}

/** Choose image from camera or album */
export function chooseImage(count = 1, sourceType: ('album' | 'camera')[] = ['album', 'camera']): Promise<string[]> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sourceType,
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Choose image failed'));
      },
    });
  });
}

/** Get user location */
export function getLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
        });
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Get location failed'));
      },
    });
  });
}

/** Open map and navigate to a location */
export function openLocation(options: {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.openLocation({
      latitude: options.latitude,
      longitude: options.longitude,
      name: options.name || '',
      address: options.address || '',
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || 'Open location failed')),
    });
  });
}

/** Subscribe to message template notifications */
export function subscribeMessage(tmplIds: string[]): Promise<{
  [key: string]: 'accept' | 'reject' | 'ban';
}> {
  return new Promise((resolve, reject) => {
    uni.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        const result: Record<string, 'accept' | 'reject' | 'ban'> = {};
        for (const id of tmplIds) {
          result[id] = (res as any)[id] || 'reject';
        }
        resolve(result);
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Subscribe message failed'));
      },
    });
  });
}

/** Preview image in full screen */
export function previewImage(urls: string[], current = 0): void {
  uni.previewImage({
    urls,
    current,
  });
}

/** Copy text to clipboard */
export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.setClipboardData({
      data: text,
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || 'Copy failed')),
    });
  });
}

/** Make a phone call */
export function makePhoneCall(phoneNumber: string): void {
  uni.makePhoneCall({ phoneNumber });
}
