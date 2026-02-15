import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, NavBar, Tabs, Button, Toast, Dialog, ImageUploader } from 'antd-mobile';
import { QRCodeSVG } from 'qrcode.react';
import { ScanCodeOutline, ReceivePaymentOutline, PictureOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useLocale } from '../../hooks/useLocale';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const recentRecords = [
  { id: 1, merchant: 'Pacific Coffee', mall: '又一城', stamps: '+25', time: '今天 14:32', type: 'earn' },
  { id: 2, merchant: 'UNIQLO', mall: '荷里活廣場', stamps: '+45', time: '昨天 16:08', type: 'earn' },
  { id: 3, merchant: '星巴克', mall: '又一城', stamps: '+18', time: '01/28 11:20', type: 'earn' },
  { id: 4, merchant: 'HK$50禮券', mall: '印花兌換', stamps: '-500', time: '01/25 09:30', type: 'redeem' },
];

type CollectMethod = 'qrcode' | 'scan' | 'photo';

export default function ScanPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const user = useAuthStore((s) => s.user);
  const [activeMethod, setActiveMethod] = useState<CollectMethod>('qrcode');
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const memberQRValue = JSON.stringify({
    type: 'MEMBER',
    memberId: user?.id || 'demo-user',
    cardNo: user?.cardNo || 'LM-2024-0088',
    tier: user?.tierName || 'Gold',
    timestamp: Date.now(),
  });

  // Start camera for scanning receipt QR code
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanning(true);

      // Simulate scan detection after 3 seconds
      setTimeout(() => {
        stopScanner();
        simulateStampEarn(t('customerApp.scanReceipt'));
      }, 3000);
    } catch (err) {
      Toast.show({ icon: 'fail', content: t('customerApp.cameraFailed') });
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  // Handle photo upload for AI recognition
  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    Toast.show({ icon: 'loading', content: t('customerApp.aiProcessing'), duration: 0 });

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    Toast.clear();
    setProcessing(false);

    simulateStampEarn(t('customerApp.photoRecognition'));
  };

  const simulateStampEarn = (method: string) => {
    const stamps = Math.floor(Math.random() * 50) + 10;
    Dialog.alert({
      title: t('customerApp.stampSuccess'),
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ color: '#666', marginBottom: 8 }}>{t('customerApp.earnedVia', { method })}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: PRIMARY }}>+{stamps}</div>
          <div style={{ fontSize: 14, color: GOLD }}>{t('customerApp.stamps')}</div>
        </div>
      ),
      confirmText: t('customerApp.great'),
    });
  };

  const methods = [
    {
      key: 'qrcode' as CollectMethod,
      icon: <ReceivePaymentOutline fontSize={24} />,
      title: t('customerApp.showMemberCode'),
      desc: t('customerApp.forMerchantScan'),
    },
    {
      key: 'scan' as CollectMethod,
      icon: <ScanCodeOutline fontSize={24} />,
      title: t('customerApp.scanReceipt'),
      desc: t('customerApp.scanReceiptQR'),
    },
    {
      key: 'photo' as CollectMethod,
      icon: <PictureOutline fontSize={24} />,
      title: t('customerApp.photoRecognition'),
      desc: t('customerApp.aiRecognition'),
    },
  ];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 80 }}>
      <NavBar
        onBack={() => navigate(-1)}
        style={{
          '--height': '44px',
          background: PRIMARY,
          color: '#fff',
        } as React.CSSProperties}
      >
        {t('customerApp.stampCollection')}
      </NavBar>

      {/* Method Selection */}
      <div style={{ padding: 16 }}>
        <div style={{
          display: 'flex',
          gap: 10,
          background: '#fff',
          borderRadius: 12,
          padding: 12,
        }}>
          {methods.map((m) => (
            <div
              key={m.key}
              onClick={() => {
                if (scanning) stopScanner();
                setActiveMethod(m.key);
              }}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: 10,
                textAlign: 'center',
                cursor: 'pointer',
                background: activeMethod === m.key ? `${PRIMARY}10` : 'transparent',
                border: activeMethod === m.key ? `2px solid ${PRIMARY}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ color: activeMethod === m.key ? PRIMARY : '#999' }}>
                {m.icon}
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: activeMethod === m.key ? PRIMARY : '#333',
                marginTop: 6,
              }}>
                {m.title}
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content based on selected method */}
      <div style={{ padding: '0 16px' }}>
        <Card style={{ borderRadius: 16 }}>
          {/* Method 1: Show QR Code */}
          {activeMethod === 'qrcode' && (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{
                display: 'inline-block',
                padding: 16,
                background: '#fff',
                borderRadius: 12,
                border: `3px solid ${PRIMARY}`,
                boxShadow: '0 4px 20px rgba(0,105,75,0.15)',
              }}>
                <QRCodeSVG
                  value={memberQRValue}
                  size={180}
                  level="H"
                  fgColor={PRIMARY}
                />
              </div>

              <div style={{
                marginTop: 16,
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 2,
                color: '#333',
              }}>
                {user?.cardNo || 'LM-2024-0088'}
              </div>

              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8 }}>
                <Tag
                  style={{
                    '--background-color': GOLD,
                    '--text-color': '#fff',
                    '--border-color': GOLD,
                  } as React.CSSProperties}
                >
                  {user?.tierName || t('customerApp.goldTier')}
                </Tag>
                <Tag color="primary" fill="outline">
                  {(user?.stampBalance || 2580).toLocaleString()} {t('customerApp.stamps')}
                </Tag>
              </div>

              <div style={{
                marginTop: 20,
                padding: 12,
                background: '#f9f9f9',
                borderRadius: 8,
                fontSize: 13,
                color: '#666',
              }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{t('customerApp.showCodeForScan')}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{t('customerApp.merchantWillScan')}</div>
              </div>
            </div>
          )}

          {/* Method 2: Scan Receipt QR */}
          {activeMethod === 'scan' && (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              {scanning ? (
                <div>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        maxWidth: 260,
                        height: 260,
                        objectFit: 'cover',
                        borderRadius: 12,
                        background: '#000',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 180,
                      height: 180,
                      border: `3px solid ${PRIMARY}`,
                      borderRadius: 12,
                    }} />
                  </div>
                  <div style={{ marginTop: 16, color: '#666' }}>
                    {t('customerApp.scanning')}
                  </div>
                  <Button
                    style={{ marginTop: 16 }}
                    onClick={stopScanner}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    background: `${PRIMARY}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    <ScanCodeOutline fontSize={56} color={PRIMARY} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
                    {t('customerApp.scanReceiptQR')}
                  </div>
                  <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
                    {t('customerApp.pointCameraToQR')}
                  </div>
                  <Button
                    color="primary"
                    size="large"
                    onClick={startScanner}
                    style={{
                      '--background-color': PRIMARY,
                      '--border-color': PRIMARY,
                      width: 200,
                    } as React.CSSProperties}
                  >
                    {t('customerApp.startScan')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Method 3: Photo AI Recognition */}
          {activeMethod === 'photo' && (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                background: `${PRIMARY}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <PictureOutline fontSize={56} color={PRIMARY} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
                {t('customerApp.photoRecognition')}
              </div>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
                {t('customerApp.photoRecognitionDesc')}
              </div>
              <div style={{
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                fontSize: 12,
                color: '#d48806',
              }}>
                {t('customerApp.ensureReceiptClear')}
              </div>
              <Button
                color="primary"
                size="large"
                onClick={handlePhotoCapture}
                loading={processing}
                style={{
                  '--background-color': PRIMARY,
                  '--border-color': PRIMARY,
                  width: 200,
                } as React.CSSProperties}
              >
                {t('customerApp.takePhotoOrSelect')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Stamp Balance Summary */}
      <div style={{ padding: '16px' }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY }}>
                {(user?.stampBalance || 2580).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{t('customerApp.availableStamps')}</div>
            </div>
            <div style={{ width: 1, background: '#f0f0f0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>
                1,250
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{t('customerApp.monthlyEarnedStamps')}</div>
            </div>
            <div style={{ width: 1, background: '#f0f0f0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#666' }}>
                12
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{t('customerApp.transactions')}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Records */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{t('customerApp.recentRecords')}</span>
          <span
            style={{ fontSize: 12, color: PRIMARY, cursor: 'pointer' }}
            onClick={() => navigate('/stamp')}
          >
            {t('customerApp.viewAll')}
          </span>
        </div>
        <Card style={{ borderRadius: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            {recentRecords.map((record, i) => (
              <List.Item
                key={record.id}
                style={{ borderBottom: i < recentRecords.length - 1 ? '1px solid #f5f5f5' : 'none' }}
                description={<span style={{ fontSize: 12 }}>{record.mall} · {record.time}</span>}
                extra={
                  <span style={{
                    color: record.type === 'earn' ? PRIMARY : '#ff6b6b',
                    fontWeight: 600,
                  }}>
                    {record.stamps}
                  </span>
                }
              >
                <span style={{ fontWeight: 500 }}>{record.merchant}</span>
              </List.Item>
            ))}
          </List>
        </Card>
      </div>
    </div>
  );
}
