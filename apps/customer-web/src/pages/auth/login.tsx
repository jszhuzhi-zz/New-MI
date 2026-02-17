import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Form, Toast, Tabs, Card, Dialog } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore, type Locale } from '../../store/settings';
import { authApi } from '../../services/api';

const PRIMARY = '#00694B';

// Demo account credentials
const DEMO_ACCOUNT = {
  phone: '85291234567',
  password: 'demo123',
};

// Multilingual labels
const labels: Record<string, Record<Locale, string>> = {
  title: { 'zh-TW': '領展會員計劃', 'zh-CN': '领展会员计划', en: 'Link Membership' },
  smsLogin: { 'zh-TW': '短信驗證', 'zh-CN': '短信验证', en: 'SMS Login' },
  passwordLogin: { 'zh-TW': '密碼登入', 'zh-CN': '密码登录', en: 'Password Login' },
  phoneNumber: { 'zh-TW': '手機號碼', 'zh-CN': '手机号码', en: 'Phone Number' },
  enterPhone: { 'zh-TW': '請輸入手機號碼', 'zh-CN': '请输入手机号码', en: 'Enter phone number' },
  verifyCode: { 'zh-TW': '驗證碼', 'zh-CN': '验证码', en: 'Verification Code' },
  enterCode: { 'zh-TW': '請輸入驗證碼', 'zh-CN': '请输入验证码', en: 'Enter code' },
  sendCode: { 'zh-TW': '發送驗證碼', 'zh-CN': '发送验证码', en: 'Send Code' },
  resendIn: { 'zh-TW': '重新發送', 'zh-CN': '重新发送', en: 'Resend in' },
  login: { 'zh-TW': '登入', 'zh-CN': '登录', en: 'Login' },
  password: { 'zh-TW': '密碼', 'zh-CN': '密码', en: 'Password' },
  enterPassword: { 'zh-TW': '請輸入密碼', 'zh-CN': '请输入密码', en: 'Enter password' },
  forgotPassword: { 'zh-TW': '忘記密碼？', 'zh-CN': '忘记密码？', en: 'Forgot password?' },
  demoLogin: { 'zh-TW': 'Demo 體驗帳號', 'zh-CN': 'Demo 体验账号', en: 'Demo Account' },
  register: { 'zh-TW': '新會員註冊', 'zh-CN': '新会员注册', en: 'New Member Register' },
  agreeTerms: { 'zh-TW': '登入即表示您同意', 'zh-CN': '登录即表示您同意', en: 'By logging in, you agree to our' },
  termsOfService: { 'zh-TW': '服務條款', 'zh-CN': '服务条款', en: 'Terms of Service' },
  and: { 'zh-TW': '和', 'zh-CN': '和', en: 'and' },
  privacyPolicy: { 'zh-TW': '隱私政策', 'zh-CN': '隐私政策', en: 'Privacy Policy' },
  loggingIn: { 'zh-TW': '登入中...', 'zh-CN': '登录中...', en: 'Logging in...' },
  loginSuccess: { 'zh-TW': '登入成功', 'zh-CN': '登录成功', en: 'Login successful' },
  codeSent: { 'zh-TW': '驗證碼已發送', 'zh-CN': '验证码已发送', en: 'Code sent' },
  invalidCredentials: { 'zh-TW': '手機號碼或密碼錯誤', 'zh-CN': '手机号码或密码错误', en: 'Invalid phone or password' },
  registerTitle: { 'zh-TW': '會員註冊', 'zh-CN': '会员注册', en: 'Member Registration' },
  confirmPassword: { 'zh-TW': '確認密碼', 'zh-CN': '确认密码', en: 'Confirm Password' },
  enterConfirmPassword: { 'zh-TW': '請再次輸入密碼', 'zh-CN': '请再次输入密码', en: 'Re-enter password' },
  passwordMismatch: { 'zh-TW': '密碼不一致', 'zh-CN': '密码不一致', en: 'Passwords do not match' },
  registerSuccess: { 'zh-TW': '註冊成功！', 'zh-CN': '注册成功！', en: 'Registration successful!' },
  welcomeBonus: { 'zh-TW': '歡迎獎賞：1000 印花', 'zh-CN': '欢迎奖赏：1000 印花', en: 'Welcome bonus: 1000 stamps' },
  alreadyHaveAccount: { 'zh-TW': '已有帳號？立即登入', 'zh-CN': '已有账号？立即登录', en: 'Have account? Login now' },
  name: { 'zh-TW': '姓名', 'zh-CN': '姓名', en: 'Name' },
  enterName: { 'zh-TW': '請輸入姓名', 'zh-CN': '请输入姓名', en: 'Enter name' },
  demoHint: { 'zh-TW': '手機：85291234567 / 密碼：demo123', 'zh-CN': '手机：85291234567 / 密码：demo123', en: 'Phone: 85291234567 / Password: demo123' },
  sendingCode: { 'zh-TW': '發送中...', 'zh-CN': '发送中...', en: 'Sending...' },
  codeExpired: { 'zh-TW': '驗證碼已過期', 'zh-CN': '验证码已过期', en: 'Code expired' },
  invalidCode: { 'zh-TW': '驗證碼錯誤', 'zh-CN': '验证码错误', en: 'Invalid code' },
  networkError: { 'zh-TW': '網絡錯誤，請重試', 'zh-CN': '网络错误，请重试', en: 'Network error, please retry' },
  tooManyRequests: { 'zh-TW': '請求過於頻繁，請稍後再試', 'zh-CN': '请求过于频繁，请稍后再试', en: 'Too many requests, please try later' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const locale = useSettingsStore((s) => s.locale);
  const { setToken, setUser, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('sms');
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [smsPhone, setSmsPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef<any>(null);

  const t = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  // Get redirect path after login
  const getRedirectPath = () => {
    const path = sessionStorage.getItem('redirect_after_login');
    sessionStorage.removeItem('redirect_after_login');
    return path || '/';
  };

  // Countdown timer for SMS code
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRedirectPath());
    }
  }, [isAuthenticated, navigate]);

  const handleSendCode = async (phone?: string) => {
    const phoneNumber = phone || smsPhone;
    if (!phoneNumber || phoneNumber.length < 8) {
      Toast.show({ icon: 'fail', content: t('enterPhone') });
      return;
    }

    setIsSending(true);
    try {
      const response = await authApi.sendSmsCode(phoneNumber);
      Toast.show({ icon: 'success', content: t('codeSent') });
      setCountdown(60);

      // In development, show the OTP in console for testing
      if (response.data.devOtp) {
        console.log('[DEV] OTP Code:', response.data.devOtp);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('networkError');
      if (message.includes('Too many') || message.includes('limit')) {
        Toast.show({ icon: 'fail', content: t('tooManyRequests') });
      } else {
        Toast.show({ icon: 'fail', content: message });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSmsLogin = async (values: { phone: string; code: string }) => {
    Toast.show({ icon: 'loading', content: t('loggingIn'), duration: 0 });

    try {
      // Try real API first
      const response = await authApi.verifySmsCode(values.phone, values.code);
      Toast.clear();

      const isDemo = values.phone.replace(/\s/g, '') === DEMO_ACCOUNT.phone;

      setToken(response.data.accessToken);
      setUser({
        id: isDemo ? 'demo_001' : 'member_' + Date.now(),
        name: isDemo ? '陳小明' : '新會員',
        nameEn: isDemo ? 'Chan Siu Ming' : 'New Member',
        phone: values.phone,
        email: isDemo ? 'demo@linkmall.hk' : '',
        cardNo: 'LM-' + Date.now().toString().slice(-8),
        tier: isDemo ? 'gold' : 'standard',
        tierName: isDemo ? '金卡會員' : '普通會員',
        stampBalance: isDemo ? 2580 : 1000, // New members get 1000 bonus
        avatar: null,
        birthday: isDemo ? '1990-05-15' : null,
      });

      Toast.show({ icon: 'success', content: t('loginSuccess') });
      navigate(getRedirectPath());
    } catch (error: any) {
      Toast.clear();
      const message = error.response?.data?.message || '';

      if (message.includes('expired')) {
        Toast.show({ icon: 'fail', content: t('codeExpired') });
      } else if (message.includes('Invalid')) {
        Toast.show({ icon: 'fail', content: t('invalidCode') });
      } else {
        // Fallback to mock login for demo/development
        const isDemo = values.phone.replace(/\s/g, '') === DEMO_ACCOUNT.phone;

        setToken('token-' + Date.now());
        setUser({
          id: isDemo ? 'demo_001' : 'member_' + Date.now(),
          name: isDemo ? '陳小明' : '新會員',
          nameEn: isDemo ? 'Chan Siu Ming' : 'New Member',
          phone: values.phone,
          email: isDemo ? 'demo@linkmall.hk' : '',
          cardNo: 'LM-' + Date.now().toString().slice(-8),
          tier: isDemo ? 'gold' : 'standard',
          tierName: isDemo ? '金卡會員' : '普通會員',
          stampBalance: isDemo ? 2580 : 1000,
          avatar: null,
          birthday: isDemo ? '1990-05-15' : null,
        });

        Toast.show({ icon: 'success', content: t('loginSuccess') });
        navigate(getRedirectPath());
      }
    }
  };

  const handlePasswordLogin = async (values: { phone: string; password: string }) => {
    Toast.show({ icon: 'loading', content: t('loggingIn') });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const phone = values.phone.replace(/\s/g, '');

    // Check demo account credentials
    if (phone === DEMO_ACCOUNT.phone && values.password === DEMO_ACCOUNT.password) {
      setToken('demo-token-' + Date.now());
      setUser({
        id: 'demo_001',
        name: '陳小明',
        nameEn: 'Chan Siu Ming',
        phone: values.phone,
        email: 'demo@linkmall.hk',
        cardNo: 'LM-2024-0088',
        tier: 'gold',
        tierName: '金卡會員',
        stampBalance: 2580,
        avatar: null,
        birthday: '1990-05-15',
      });
      Toast.show({ icon: 'success', content: t('loginSuccess') });
      navigate(getRedirectPath());
    } else {
      Toast.show({ icon: 'fail', content: t('invalidCredentials') });
    }
  };

  const handleDemoLogin = () => {
    setToken('demo-token-' + Date.now());
    setUser({
      id: 'demo_001',
      name: '陳小明',
      nameEn: 'Chan Siu Ming',
      phone: '+852 9123 4567',
      email: 'demo@linkmall.hk',
      cardNo: 'LM-2024-0088',
      tier: 'gold',
      tierName: '金卡會員',
      stampBalance: 2580,
      avatar: null,
      birthday: '1990-05-15',
    });
    Toast.show({ icon: 'success', content: t('loginSuccess') });
    navigate(getRedirectPath());
  };

  const handleRegister = async () => {
    const { name, phone, code, password, confirmPassword } = registerForm;

    if (!name || !phone || !code || !password) {
      Toast.show({ icon: 'fail', content: t('enterName') });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ icon: 'fail', content: t('passwordMismatch') });
      return;
    }

    Toast.show({ icon: 'loading', content: t('loggingIn') });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create new member with 1000 welcome stamps
    setToken('token-' + Date.now());
    setUser({
      id: 'member_' + Date.now(),
      name: name,
      nameEn: '',
      phone: phone,
      email: '',
      cardNo: 'LM-' + Date.now().toString().slice(-8),
      tier: 'standard',
      tierName: '普通會員',
      stampBalance: 1000, // Welcome bonus!
      avatar: null,
      birthday: null,
      isNewMember: true,
    });

    // Show welcome bonus dialog
    Dialog.alert({
      title: t('registerSuccess'),
      content: (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: PRIMARY }}>
            {t('welcomeBonus')}
          </div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            {locale === 'en' ? 'Start earning more stamps by shopping!' : '開始購物賺取更多印花吧！'}
          </div>
        </div>
      ),
      confirmText: locale === 'en' ? 'Start' : '開始使用',
      onConfirm: () => navigate('/'),
    });
  };

  // Registration form
  if (showRegister) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #004D36 100%)`,
            padding: '40px 16px 60px',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Link Mall</div>
          <div style={{ fontSize: 14, opacity: 0.85 }}>{t('registerTitle')}</div>
        </div>

        {/* Registration Card */}
        <div style={{ margin: '-30px 16px 0', position: 'relative', zIndex: 1 }}>
          <Card style={{ borderRadius: 16, padding: '24px 16px' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{t('name')}</div>
              <Input
                placeholder={t('enterName')}
                value={registerForm.name}
                onChange={(v) => setRegisterForm({ ...registerForm, name: v })}
                style={{ '--font-size': '16px' } as React.CSSProperties}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{t('phoneNumber')}</div>
              <Input
                placeholder={t('enterPhone')}
                type="tel"
                value={registerForm.phone}
                onChange={(v) => setRegisterForm({ ...registerForm, phone: v })}
                style={{ '--font-size': '16px' } as React.CSSProperties}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{t('verifyCode')}</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Input
                  placeholder={t('enterCode')}
                  type="number"
                  maxLength={6}
                  value={registerForm.code}
                  onChange={(v) => setRegisterForm({ ...registerForm, code: v })}
                  style={{ flex: 1, '--font-size': '16px' } as React.CSSProperties}
                />
                <Button
                  size="small"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  style={{
                    '--background-color': countdown > 0 ? '#ccc' : PRIMARY,
                    '--text-color': '#fff',
                    minWidth: 100,
                  } as React.CSSProperties}
                >
                  {countdown > 0 ? `${countdown}s` : t('sendCode')}
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{t('password')}</div>
              <div style={{ position: 'relative' }}>
                <Input
                  placeholder={t('enterPassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={registerForm.password}
                  onChange={(v) => setRegisterForm({ ...registerForm, password: v })}
                  style={{ '--font-size': '16px' } as React.CSSProperties}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOutline fontSize={20} /> : <EyeInvisibleOutline fontSize={20} />}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{t('confirmPassword')}</div>
              <Input
                placeholder={t('enterConfirmPassword')}
                type="password"
                value={registerForm.confirmPassword}
                onChange={(v) => setRegisterForm({ ...registerForm, confirmPassword: v })}
                style={{ '--font-size': '16px' } as React.CSSProperties}
              />
            </div>

            {/* Welcome bonus info */}
            <div
              style={{
                background: `linear-gradient(135deg, ${PRIMARY}15 0%, ${PRIMARY}08 100%)`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 28 }}>🎁</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>{t('welcomeBonus')}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {locale === 'en' ? 'Register now and get bonus stamps!' : '立即註冊獲得迎新印花！'}
                </div>
              </div>
            </div>

            <Button
              block
              color="primary"
              onClick={handleRegister}
              style={{ '--background-color': PRIMARY, marginBottom: 16 } as React.CSSProperties}
            >
              {t('register')}
            </Button>

            <div
              onClick={() => setShowRegister(false)}
              style={{ textAlign: 'center', color: PRIMARY, fontSize: 14, cursor: 'pointer' }}
            >
              {t('alreadyHaveAccount')}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #004D36 100%)`,
          padding: '40px 16px 60px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Link Mall</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>{t('title')}</div>
      </div>

      {/* Login Card */}
      <div style={{ margin: '-30px 16px 0', position: 'relative', zIndex: 1 }}>
        <Card style={{ borderRadius: 16, padding: '8px 0' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* SMS Login Tab - Default */}
            <Tabs.Tab title={t('smsLogin')} key="sms">
              <div style={{ padding: '24px 16px' }}>
                <Form
                  ref={formRef}
                  onFinish={handleSmsLogin}
                  footer={
                    <Button
                      block
                      type="submit"
                      color="primary"
                      style={{ '--background-color': PRIMARY, marginTop: 16 } as React.CSSProperties}
                    >
                      {t('login')}
                    </Button>
                  }
                >
                  <Form.Item
                    name="phone"
                    label={t('phoneNumber')}
                    rules={[{ required: true, message: t('enterPhone') }]}
                  >
                    <Input
                      placeholder={t('enterPhone')}
                      type="tel"
                      onChange={(v) => setSmsPhone(v)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="code"
                    label={t('verifyCode')}
                    extra={
                      <Button
                        size="small"
                        fill="none"
                        disabled={countdown > 0 || isSending}
                        onClick={() => handleSendCode()}
                        style={{ color: (countdown > 0 || isSending) ? '#999' : PRIMARY }}
                      >
                        {isSending ? t('sendingCode') : countdown > 0 ? `${t('resendIn')} ${countdown}s` : t('sendCode')}
                      </Button>
                    }
                  >
                    <Input placeholder={t('enterCode')} type="number" maxLength={6} />
                  </Form.Item>
                </Form>
              </div>
            </Tabs.Tab>

            {/* Password Login Tab */}
            <Tabs.Tab title={t('passwordLogin')} key="password">
              <div style={{ padding: '24px 16px' }}>
                <Form
                  onFinish={handlePasswordLogin}
                  footer={
                    <>
                      <Button
                        block
                        type="submit"
                        color="primary"
                        style={{ '--background-color': PRIMARY, marginTop: 16 } as React.CSSProperties}
                      >
                        {t('login')}
                      </Button>
                      <div style={{ textAlign: 'right', marginTop: 12 }}>
                        <span style={{ color: PRIMARY, fontSize: 13, cursor: 'pointer' }}>
                          {t('forgotPassword')}
                        </span>
                      </div>
                    </>
                  }
                >
                  <Form.Item
                    name="phone"
                    label={t('phoneNumber')}
                    rules={[{ required: true, message: t('enterPhone') }]}
                  >
                    <Input placeholder={t('enterPhone')} type="tel" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label={t('password')}
                    rules={[{ required: true, message: t('enterPassword') }]}
                  >
                    <div style={{ position: 'relative' }}>
                      <Input
                        placeholder={t('enterPassword')}
                        type={showPassword ? 'text' : 'password'}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          padding: 8,
                        }}
                      >
                        {showPassword ? <EyeOutline fontSize={20} /> : <EyeInvisibleOutline fontSize={20} />}
                      </span>
                    </div>
                  </Form.Item>
                </Form>

                {/* Demo account hint */}
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: '#f0f9f6',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#666',
                    textAlign: 'center',
                  }}
                >
                  💡 {t('demoHint')}
                </div>
              </div>
            </Tabs.Tab>
          </Tabs>

          {/* Demo Login & Register */}
          <div style={{ padding: '0 16px 24px', borderTop: '1px solid #f0f0f0' }}>
            <Button
              block
              onClick={handleDemoLogin}
              style={{
                '--border-color': PRIMARY,
                '--text-color': PRIMARY,
                marginTop: 16,
              } as React.CSSProperties}
            >
              {t('demoLogin')}
            </Button>

            <Button
              block
              fill="none"
              onClick={() => setShowRegister(true)}
              style={{ color: '#666', marginTop: 12 }}
            >
              {t('register')} 🎁
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#999' }}>
          {t('agreeTerms')}
          <span style={{ color: PRIMARY }}> {t('termsOfService')} </span>
          {t('and')}
          <span style={{ color: PRIMARY }}> {t('privacyPolicy')}</span>
        </div>
      </div>
    </div>
  );
}
