import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Form, Toast, Tabs, Card } from 'antd-mobile';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../store/auth';

const PRIMARY = '#00694B';

export default function LoginPage() {
  const navigate = useNavigate();
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
    Toast.show({ icon: 'loading', content: '登入中...' });

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

    Toast.show({ icon: 'success', content: '登入成功' });
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
    Toast.show({ icon: 'success', content: '登入成功' });
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
            <Tabs.Tab title="掃碼登入" key="qr">
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
                      <div>二維碼已過期</div>
                      <Button
                        size="small"
                        color="primary"
                        style={{ marginTop: 12, '--background-color': PRIMARY } as React.CSSProperties}
                        onClick={handleRefreshQR}
                      >
                        刷新二維碼
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
                        請使用 Link Mall APP 掃描登入
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        二維碼將在 {formatTime(countdown)} 後過期
                      </div>
                    </>
                  )}
                  {qrStatus === 'scanned' && (
                    <div style={{ color: PRIMARY, fontWeight: 500 }}>
                      ✓ 已掃描，請在手機上確認登入
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    block
                    onClick={handleDemoLogin}
                    style={{ '--border-color': PRIMARY, '--text-color': PRIMARY } as React.CSSProperties}
                  >
                    演示登入 (Demo)
                  </Button>
                </div>
              </div>
            </Tabs.Tab>

            <Tabs.Tab title="手機號登入" key="phone">
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
                      獲取驗證碼並登入
                    </Button>
                  }
                >
                  <Form.Item
                    name="phone"
                    label="手機號碼"
                    rules={[{ required: true, message: '請輸入手機號碼' }]}
                  >
                    <Input placeholder="請輸入手機號碼" type="tel" />
                  </Form.Item>
                  <Form.Item
                    name="code"
                    label="驗證碼"
                    extra={
                      <Button size="small" fill="none" style={{ color: PRIMARY }}>
                        發送驗證碼
                      </Button>
                    }
                  >
                    <Input placeholder="請輸入驗證碼" type="number" maxLength={6} />
                  </Form.Item>
                </Form>

                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Button
                    fill="none"
                    onClick={handleDemoLogin}
                    style={{ color: '#999', fontSize: 13 }}
                  >
                    演示登入 (Demo)
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
          登入即表示您同意我們的
          <span style={{ color: PRIMARY }}> 服務條款 </span>
          和
          <span style={{ color: PRIMARY }}> 私隱政策</span>
        </div>
      </div>
    </div>
  );
}
