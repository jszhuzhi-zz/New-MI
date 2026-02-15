import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Form, Toast, Tabs, Card } from 'antd-mobile';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../store/auth';
import { useLocale } from '../../hooks/useLocale';

const PRIMARY = '#00694B';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { setToken, setUser, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('qr');
  const [qrSessionId, setQrSessionId] = useState('');
  const [qrStatus, setQrStatus] = useState<'pending' | 'scanned' | 'confirmed' | 'expired'>('pending');
  const [countdown, setCountdown] = useState(300);

  // Generate QR session
  useEffect(() => {
    const sessionId = `LM-LOGIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setQrSessionId(sessionId);
    setQrStatus('pending');
    setCountdown(300);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setQrStatus('expired');
      return;
    }
    const timer = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Simulate QR scan polling (in real app, this would poll backend)
  useEffect(() => {
    if (qrStatus !== 'pending') return;

    // Demo: Auto-confirm after 5 seconds for testing
    const demoTimer = setTimeout(() => {
      // In real app, this would be triggered by backend callback
    }, 5000);

    return () => clearTimeout(demoTimer);
  }, [qrSessionId, qrStatus]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneLogin = async (values: { phone: string; code: string }) => {
    Toast.show({ icon: 'loading', content: t('customerApp.loggingIn') });

    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000));

    setToken('demo-token-2026');
    setUser({
      id: 'member_001',
      name: '陳小明',
      nameEn: 'Chan Siu Ming',
      phone: values.phone,
      email: 'siuming@example.com',
      cardNo: 'LM-2024-0088',
      tier: 'gold',
      tierName: '金卡會員',
      stampBalance: 2580,
      avatar: null,
      birthday: null,
    });

    Toast.show({ icon: 'success', content: t('auth.loginSuccess') });
    navigate('/');
  };

  const handleRefreshQR = () => {
    const sessionId = `LM-LOGIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setQrSessionId(sessionId);
    setQrStatus('pending');
    setCountdown(300);
  };

  const handleDemoLogin = () => {
    setToken('demo-token-2026');
    setUser({
      id: 'member_001',
      name: '陳小明',
      nameEn: 'Chan Siu Ming',
      phone: '+852 9123 4567',
      email: 'siuming@example.com',
      cardNo: 'LM-2024-0088',
      tier: 'gold',
      tierName: '金卡會員',
      stampBalance: 2580,
      avatar: null,
      birthday: '1990-05-15',
    });
    Toast.show({ icon: 'success', content: t('auth.loginSuccess') });
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #004D36 100%)`,
        padding: '40px 16px 60px',
        color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Link Mall</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>領展會員計劃</div>
      </div>

      {/* Login Card */}
      <div style={{ margin: '-30px 16px 0', position: 'relative', zIndex: 1 }}>
        <Card style={{ borderRadius: 16, padding: '8px 0' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.Tab title={t('customerApp.qrLogin')} key="qr">
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-block',
                  padding: 16,
                  background: '#fff',
                  borderRadius: 12,
                  border: `2px solid ${qrStatus === 'expired' ? '#ff4d4f' : PRIMARY}`,
                }}>
                  {qrStatus === 'expired' ? (
                    <div style={{
                      width: 180, height: 180,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#999',
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>⏱️</div>
                      <div>{t('customerApp.qrExpired')}</div>
                      <Button
                        size="small"
                        color="primary"
                        style={{ marginTop: 12, '--background-color': PRIMARY } as React.CSSProperties}
                        onClick={handleRefreshQR}
                      >
                        {t('customerApp.refreshQR')}
                      </Button>
                    </div>
                  ) : (
                    <QRCodeSVG
                      value={JSON.stringify({
                        type: 'LOGIN',
                        sessionId: qrSessionId,
                        timestamp: Date.now(),
                      })}
                      size={180}
                      level="M"
                      fgColor={PRIMARY}
                    />
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  {qrStatus === 'pending' && (
                    <>
                      <div style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>
                        {t('customerApp.scanToLogin')}
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {t('customerApp.qrExpireIn', { time: formatTime(countdown) })}
                      </div>
                    </>
                  )}
                  {qrStatus === 'scanned' && (
                    <div style={{ color: PRIMARY, fontWeight: 500 }}>
                      ✓ {t('customerApp.qrScanned')}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    block
                    onClick={handleDemoLogin}
                    style={{ '--border-color': PRIMARY, '--text-color': PRIMARY } as React.CSSProperties}
                  >
                    {t('customerApp.demoLogin')}
                  </Button>
                </div>
              </div>
            </Tabs.Tab>

            <Tabs.Tab title={t('customerApp.phoneLogin')} key="phone">
              <div style={{ padding: '24px 16px' }}>
                <Form
                  onFinish={handlePhoneLogin}
                  footer={
                    <Button
                      block
                      type="submit"
                      color="primary"
                      style={{ '--background-color': PRIMARY, marginTop: 16 } as React.CSSProperties}
                    >
                      {t('customerApp.getCodeAndLogin')}
                    </Button>
                  }
                >
                  <Form.Item
                    name="phone"
                    label={t('customerApp.phoneNumber')}
                    rules={[{ required: true, message: t('customerApp.enterPhone') }]}
                  >
                    <Input placeholder={t('customerApp.enterPhone')} type="tel" />
                  </Form.Item>
                  <Form.Item
                    name="code"
                    label={t('customerApp.verifyCode')}
                    extra={
                      <Button size="small" fill="none" style={{ color: PRIMARY }}>
                        {t('customerApp.sendVerifyCode')}
                      </Button>
                    }
                  >
                    <Input placeholder={t('customerApp.enterCode')} type="number" maxLength={6} />
                  </Form.Item>
                </Form>

                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Button
                    fill="none"
                    onClick={handleDemoLogin}
                    style={{ color: '#999', fontSize: 13 }}
                  >
                    {t('customerApp.demoLogin')}
                  </Button>
                </div>
              </div>
            </Tabs.Tab>
          </Tabs>
        </Card>
      </div>

      {/* Footer */}
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#999' }}>
          {t('customerApp.agreeTerms')}
          <span style={{ color: PRIMARY }}> {t('customerApp.termsOfService')} </span>
          {t('customerApp.and')}
          <span style={{ color: PRIMARY }}> {t('customerApp.privacyPolicy')}</span>
        </div>
      </div>
    </div>
  );
}
