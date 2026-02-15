import React, { useState, useRef } from 'react';
import { Button, Toast, Card, List, Tag, Modal, Result, Input } from 'antd-mobile';
import { ScanCodeOutline, CheckCircleFill } from 'antd-mobile-icons';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../store/auth';
import { merchants } from '../../data/malls';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

interface ScanResult {
  type: 'STAMP' | 'COUPON' | 'LOGIN' | 'UNKNOWN';
  merchantId?: string;
  merchantName?: string;
  amount?: number;
  stamps?: number;
  transactionId?: string;
}

const recentScans = [
  { id: 1, merchant: 'Pacific Coffee', mall: '又一城', stamps: '+25', time: '今天 14:32', amount: 68 },
  { id: 2, merchant: 'UNIQLO', mall: '荷里活廣場', stamps: '+45', time: '昨天 16:08', amount: 450 },
  { id: 3, merchant: '星巴克', mall: '又一城', stamps: '+18', time: '01/28 11:20', amount: 52 },
];

export default function ScanPage() {
  const user = useAuthStore((s) => s.user);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowScanner(true);

      // Demo: simulate scan
      setTimeout(() => {
        handleScanComplete({
          type: 'STAMP',
          merchantId: 'fw-starbucks',
          merchantName: '星巴克 Starbucks',
          amount: 88,
          stamps: 44,
          transactionId: `TXN-${Date.now()}`,
        });
      }, 3000);
    } catch {
      Toast.show({ icon: 'fail', content: '無法啟動相機' });
      setShowManualInput(true);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowScanner(false);
  };

  const handleScanComplete = (result: ScanResult) => {
    stopScanner();
    setScanResult(result);
    setShowResult(true);
  };

  const handleManualSubmit = () => {
    if (!manualCode || manualCode.length < 6) {
      Toast.show({ icon: 'fail', content: '請輸入有效的交易碼' });
      return;
    }
    const amount = parseInt(manualCode.slice(-3)) || 100;
    handleScanComplete({
      type: 'STAMP',
      merchantName: '商戶消費',
      amount,
      stamps: Math.floor(amount / 2),
      transactionId: `TXN-${Date.now()}`,
    });
    setShowManualInput(false);
    setManualCode('');
  };

  const confirmRedemption = () => {
    Toast.show({ icon: 'success', content: `成功獲得 ${scanResult?.stamps} 印花！` });
    setShowResult(false);
    setScanResult(null);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 20 }}>
      {/* Simplified Header */}
      <div style={{
        background: PRIMARY,
        padding: '16px',
        color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>掃碼</div>
      </div>

      {/* Scan Area */}
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div
          onClick={startScanner}
          style={{
            width: 120, height: 120, margin: '0 auto', borderRadius: 60,
            background: PRIMARY,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,105,75,0.3)',
          }}
        >
          <ScanCodeOutline fontSize={44} color="#fff" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, marginTop: 16, color: '#333' }}>
          點擊掃描收據二維碼
        </div>
        <Button
          fill="none"
          size="small"
          style={{ color: '#999', marginTop: 8, fontSize: 13 }}
          onClick={() => setShowManualInput(true)}
        >
          或手動輸入交易碼
        </Button>
      </div>

      {/* Member QR Code */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>我的會員碼</div>
            <div style={{
              display: 'inline-block', padding: 10,
              background: '#fff', borderRadius: 8,
              border: `2px solid ${PRIMARY}`,
            }}>
              <QRCodeSVG
                value={JSON.stringify({
                  type: 'MEMBER',
                  memberId: user?.id,
                  cardNo: user?.cardNo,
                })}
                size={120}
                level="M"
                fgColor={PRIMARY}
              />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10, letterSpacing: 1.5, color: '#333' }}>
              {user?.cardNo || 'LM-2024-0088'}
            </div>
            <Tag color="primary" fill="outline" style={{ marginTop: 6, fontSize: 11 }}>
              {user?.tierName || '金卡會員'}
            </Tag>
          </div>
        </Card>
      </div>

      {/* Recent Records */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: '#333' }}>
          最近記錄
        </div>
        <Card style={{ borderRadius: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            {recentScans.map((s, i) => (
              <List.Item
                key={s.id}
                style={{ borderBottom: i < recentScans.length - 1 ? '1px solid #f5f5f5' : 'none' }}
                description={<span style={{ fontSize: 12 }}>{s.mall} · {s.time}</span>}
                extra={<span style={{ color: PRIMARY, fontWeight: 600 }}>{s.stamps}</span>}
              >
                <span style={{ fontWeight: 500 }}>{s.merchant}</span>
              </List.Item>
            ))}
          </List>
        </Card>
      </div>

      {/* Scanner Modal */}
      <Modal
        visible={showScanner}
        content={
          <div style={{ textAlign: 'center' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%', maxWidth: 280, height: 280,
                objectFit: 'cover', borderRadius: 12, background: '#000',
              }}
            />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 180, height: 180,
              border: `2px solid ${PRIMARY}`, borderRadius: 12,
            }} />
            <div style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
              將二維碼放入框內
            </div>
          </div>
        }
        closeOnAction
        onClose={stopScanner}
        actions={[{ key: 'cancel', text: '取消' }]}
      />

      {/* Manual Input */}
      <Modal
        visible={showManualInput}
        title="輸入交易碼"
        content={
          <div style={{ padding: '12px 0' }}>
            <Input
              placeholder="請輸入收據上的交易碼"
              value={manualCode}
              onChange={setManualCode}
              clearable
            />
          </div>
        }
        closeOnAction
        onClose={() => { setShowManualInput(false); setManualCode(''); }}
        actions={[
          { key: 'cancel', text: '取消' },
          { key: 'confirm', text: '確認', primary: true, onClick: handleManualSubmit },
        ]}
      />

      {/* Result Modal */}
      <Modal
        visible={showResult}
        content={
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircleFill style={{ fontSize: 56, color: PRIMARY }} />
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12, color: '#333' }}>
              掃描成功
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
              {scanResult?.merchantName}
            </div>
            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 14, color: '#999' }}>獲得印花 </span>
              <span style={{ fontSize: 32, fontWeight: 700, color: GOLD }}>+{scanResult?.stamps}</span>
            </div>
            <div style={{ fontSize: 12, color: '#bbb', marginTop: 8 }}>
              消費 HK${scanResult?.amount}
            </div>
          </div>
        }
        closeOnAction
        onClose={() => setShowResult(false)}
        actions={[{ key: 'ok', text: '確認', primary: true, onClick: confirmRedemption }]}
      />
    </div>
  );
}
