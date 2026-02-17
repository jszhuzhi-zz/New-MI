export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'Link REIT Membership System',
    customerPortalUrl: process.env.CUSTOMER_PORTAL_URL || 'http://localhost:3001',
    mallPortalUrl: process.env.MALL_PORTAL_URL || 'http://localhost:3002',
    groupPortalUrl: process.env.GROUP_PORTAL_URL || 'http://localhost:3003',
    merchantPortalUrl: process.env.MERCHANT_PORTAL_URL || 'http://localhost:3004',
    defaultLocale: process.env.DEFAULT_LOCALE || 'zh-HK',
    supportedLocales: (process.env.SUPPORTED_LOCALES || 'zh-HK,zh-CN,en').split(','),
  },

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/link_reit_membership',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    ssl: process.env.DB_SSL === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'linkreit:',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'tencent',
    // Tencent Cloud SMS Configuration
    tencentSdkAppId: process.env.TENCENT_SMS_SDK_APP_ID || '1401088316',
    tencentAppKey: process.env.TENCENT_SMS_APP_KEY || '9d058acfae04eeb634827844a164fa9c',
    tencentSecretId: process.env.TENCENT_SECRET_ID || '',
    tencentSecretKey: process.env.TENCENT_SECRET_KEY || '',
    tencentSignName: process.env.TENCENT_SMS_SIGN_NAME || '领展会员',
    tencentTemplateId: process.env.TENCENT_SMS_TEMPLATE_ID || '',
    tencentRegion: process.env.TENCENT_SMS_REGION || 'ap-guangzhou',
    // Legacy Twilio Configuration (backup)
    accountSid: process.env.SMS_ACCOUNT_SID || '',
    authToken: process.env.SMS_AUTH_TOKEN || '',
    fromNumber: process.env.SMS_FROM_NUMBER || '',
    // OTP Settings
    otpLength: parseInt(process.env.SMS_OTP_LENGTH || '6', 10),
    otpExpiryMinutes: parseInt(process.env.SMS_OTP_EXPIRY_MINUTES || '5', 10),
    dailyLimit: parseInt(process.env.SMS_DAILY_LIMIT || '10', 10),
    // Rate limiting
    rateLimitWindow: parseInt(process.env.SMS_RATE_LIMIT_WINDOW || '60', 10),
    rateLimitMax: parseInt(process.env.SMS_RATE_LIMIT_MAX || '3', 10),
  },

  m365: {
    clientId: process.env.M365_CLIENT_ID || '',
    clientSecret: process.env.M365_CLIENT_SECRET || '',
    tenantId: process.env.M365_TENANT_ID || '',
    redirectUri: process.env.M365_REDIRECT_URI || '',
    authority: process.env.M365_AUTHORITY || 'https://login.microsoftonline.com',
    scopes: (process.env.M365_SCOPES || 'openid,profile,email').split(','),
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 's3',
    // AWS S3
    s3Region: process.env.S3_REGION || 'ap-east-1',
    s3Bucket: process.env.S3_BUCKET || 'link-reit-membership',
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    s3Endpoint: process.env.S3_ENDPOINT || undefined,
    // Alibaba Cloud OSS (alternative)
    ossRegion: process.env.OSS_REGION || '',
    ossBucket: process.env.OSS_BUCKET || '',
    ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
    // Upload limits
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: (
      process.env.ALLOWED_MIME_TYPES ||
      'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ).split(','),
  },

  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30', 10),
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10),
  },

  riskControl: {
    stampAnomalyThreshold: parseInt(process.env.STAMP_ANOMALY_THRESHOLD || '100', 10),
    dailyStampLimit: parseInt(process.env.DAILY_STAMP_LIMIT || '1000', 10),
    suspiciousPatternWindow: process.env.SUSPICIOUS_PATTERN_WINDOW || '1h',
  },
});
