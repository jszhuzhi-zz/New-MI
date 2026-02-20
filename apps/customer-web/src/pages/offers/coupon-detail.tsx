import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider, Toast, Modal, Input, SpinLoading } from 'antd-mobile';
import { ClockCircleOutline, LocationFill, CheckCircleFill, CloseCircleFill } from 'antd-mobile-icons';
import { useSettingsStore } from '../../store/settings';

const GOLD = '#C4A962';

interface Coupon {
  id: string;
  title: string;
  merchant: string;
  mall: string;
  expire: string;
  status: 'unused' | 'used' | 'expired';
  stampCost: number;
  desc: string;
  fullDesc: string;
  rules: string[];
  code: string;
  usedAt?: string;
  usedMerchant?: string;
}

// Simple QR Code component using a data matrix pattern
const QRCodeDisplay: React.FC<{ value: string; size?: number; isActive?: boolean }> = ({
  value,
  size = 180,
  isActive = true
}) => {
  // Generate a deterministic pattern based on the value
  const generatePattern = (str: string) => {
    const pattern: boolean[][] = [];
    const gridSize = 25;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }

    for (let y = 0; y < gridSize; y++) {
      pattern[y] = [];
      for (let x = 0; x < gridSize; x++) {
        // Position detection patterns (corners)
        const isCornerPattern =
          (x < 7 && y < 7) ||
          (x >= gridSize - 7 && y < 7) ||
          (x < 7 && y >= gridSize - 7);

        if (isCornerPattern) {
          // Draw finder patterns
          const inOuter =
            (x < 7 && y < 7 && (x === 0 || x === 6 || y === 0 || y === 6)) ||
            (x >= gridSize - 7 && y < 7 && (x === gridSize - 1 || x === gridSize - 7 || y === 0 || y === 6)) ||
            (x < 7 && y >= gridSize - 7 && (x === 0 || x === 6 || y === gridSize - 1 || y === gridSize - 7));
          const inInner =
            (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
            (x >= gridSize - 5 && x <= gridSize - 3 && y >= 2 && y <= 4) ||
            (x >= 2 && x <= 4 && y >= gridSize - 5 && y <= gridSize - 3);
          pattern[y][x] = inOuter || inInner;
        } else {
          // Data area - use hash to generate pattern
          const seed = (hash * (x + 1) * (y + 1)) % 100;
          pattern[y][x] = seed > 50;
        }
      }
    }
    return pattern;
  };

  const pattern = generatePattern(value);
  const cellSize = size / 25;

  return (
    <div style={{
      width: size,
      height: size,
      padding: 8,
      background: '#fff',
      borderRadius: 8,
      border: `2px solid ${isActive ? colors.primary : '#ccc'}`,
    }}>
      <svg width={size - 16} height={size - 16} viewBox="0 0 25 25">
        {pattern.map((row, y) =>
          row.map((cell, x) => (
            cell && (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={isActive ? '#000' : '#999'}
              />
            )
          ))
        )}
      </svg>
    </div>
  );
};

const couponData: Record<string, Coupon> = {
  cp1: {
    id: 'cp1',
    title: '星巴克 HK$50 現金券',
    merchant: 'Starbucks',
    mall: '又一城 Festival Walk',
    expire: '2026-03-31',
    status: 'unused',
    stampCost: 200,
    code: 'LR-CP-20260208-001',
    desc: '可於又一城 Starbucks 門店使用，不設最低消費。',
    fullDesc: '憑此優惠券可於又一城 Festival Walk 之 Starbucks 門店消費時抵扣 HK$50。優惠券適用於所有飲品及食品，不設最低消費要求。請於付款前向店員出示此二維碼進行核銷。',
    rules: [
      '每次消費只可使用一張優惠券',
      '不可與其他優惠同時使用',
      '不可兌換現金或找續',
      '優惠券到期後自動作廢',
      '僅適用於又一城 Starbucks 門店（G樓 G-G12）',
      '如有任何爭議，領展保留最終決定權',
    ],
  },
  cp2: {
    id: 'cp2',
    title: '免費泊車 3 小時',
    merchant: '又一城停車場',
    mall: '又一城 Festival Walk',
    expire: '2026-02-28',
    status: 'unused',
    stampCost: 100,
    code: 'LR-PK-20260208-002',
    desc: '於又一城停車場享免費泊車3小時',
    fullDesc: '憑此優惠券可於又一城停車場享有免費泊車3小時優惠。請於離場前在停車場繳費機掃描此二維碼使用。超出3小時部分將按正常收費計算。',
    rules: [
      '每次泊車只可使用一張優惠券',
      '超出3小時部分按正常收費',
      '適用於又一城停車場 B1-B3 層',
      '請於繳費機掃描二維碼使用',
      '優惠券到期後自動作廢',
      '不可與其他泊車優惠同時使用',
    ],
  },
  cp3: {
    id: 'cp3',
    title: 'Pacific Coffee 買一送一',
    merchant: 'Pacific Coffee',
    mall: '又一城 Festival Walk',
    expire: '2026-03-15',
    status: 'unused',
    stampCost: 150,
    code: 'LR-PC-20260208-003',
    desc: '購買任何飲品即可免費獲得同款一杯',
    fullDesc: '憑此優惠券於又一城 Pacific Coffee 購買任何飲品，即可免費獲得同款飲品一杯。贈送飲品以較低價格者為準。',
    rules: [
      '贈送飲品為同款或價格較低之飲品',
      '每次消費只可使用一張優惠券',
      '不適用於外賣平台訂單',
      '優惠券到期後自動作廢',
    ],
  },
  cp4: {
    id: 'cp4',
    title: 'UNIQLO HK$100 折扣',
    merchant: 'UNIQLO',
    mall: '又一城 Festival Walk',
    expire: '2026-01-31',
    status: 'expired',
    stampCost: 300,
    code: 'LR-UQ-20260108-004',
    desc: '消費滿HK$500可減HK$100',
    fullDesc: '憑此優惠券於又一城 UNIQLO 消費滿 HK$500，即可減免 HK$100。',
    rules: ['需消費滿HK$500', '每次消費限用一張', '已過期'],
  },
  cp5: {
    id: 'cp5',
    title: 'Genki Sushi 9折優惠',
    merchant: 'Genki Sushi',
    mall: '又一城 Festival Walk',
    expire: '2026-02-01',
    status: 'used',
    stampCost: 100,
    code: 'LR-GS-20260201-005',
    desc: '全單9折優惠',
    fullDesc: '憑此優惠券於又一城 Genki Sushi 享全單9折優惠。',
    rules: ['不適用於外賣', '每次消費限用一張'],
    usedAt: '2026-02-01 19:32',
    usedMerchant: 'Genki Sushi (又一城 L1-108)',
  },
};

const defaultCoupon: Coupon = {
  id: 'default',
  title: '優惠券詳情',
  merchant: '指定商戶',
  mall: '領展商場',
  expire: '2026-12-31',
  status: 'unused',
  stampCost: 0,
  code: 'LR-XX-00000000-000',
  desc: '請按照使用規則於指定商戶出示此優惠券。',
  fullDesc: '請按照使用規則於指定商戶出示此優惠券。',
  rules: ['請出示優惠券QR碼予商戶工作人員掃描', '每次消費只可使用一張', '領展保留最終決定權'],
};

const statusConfig: Record<string, { text: string; color: string; bgColor: string }> = {
  unused: { text: '未使用', color: '#52c41a', bgColor: '#f6ffed' },
  used: { text: '已使用', color: '#999', bgColor: '#f5f5f5' },
  expired: { text: '已過期', color: '#ff4d4f', bgColor: '#fff2f0' },
};

export default function CouponDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [coupon, setCoupon] = useState<Coupon>(couponData[id || ''] || defaultCoupon);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [qrRefreshKey, setQrRefreshKey] = useState(0);
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const status = statusConfig[coupon.status] || statusConfig.unused;
  const isActive = coupon.status === 'unused';

  // Auto refresh QR code every 60 seconds for security
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setQrRefreshKey((k) => k + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, [isActive]);

  // Calculate days until expiry
  const daysUntilExpiry = Math.ceil(
    (new Date(coupon.expire).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleUse = () => {
    setShowVerifyModal(true);
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      Toast.show({ content: '請輸入6位數核銷碼', icon: 'fail' });
      return;
    }

    setVerifying(true);

    // Simulate verification API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Demo: any 6-digit code works
    setCoupon({
      ...coupon,
      status: 'used',
      usedAt: new Date().toLocaleString('zh-TW'),
      usedMerchant: `${coupon.merchant} (${coupon.mall})`,
    });

    setVerifying(false);
    setShowVerifyModal(false);

    Modal.alert({
      title: '核銷成功！',
      content: (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <CheckCircleFill fontSize={48} color={colors.primary} />
          <div style={{ marginTop: 12, fontSize: 16, color: '#333' }}>
            優惠券已成功使用
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: '#999' }}>
            {coupon.title}
          </div>
        </div>
      ),
      confirmText: '完成',
    });
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: isActive ? 80 : 16 }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
        優惠券詳情
      </NavBar>

      {/* Header Card */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
          {/* Status Banner */}
          <div style={{
            background: isActive
              ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
              : status.bgColor,
            margin: '-12px -12px 0', padding: '20px', color: isActive ? '#fff' : status.color,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{coupon.title}</div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>{coupon.merchant}</div>
              </div>
              <Tag style={{
                '--background-color': isActive ? 'rgba(255,255,255,0.2)' : status.bgColor,
                '--text-color': isActive ? '#fff' : status.color,
                '--border-color': isActive ? 'transparent' : status.color,
              } as React.CSSProperties}>
                {status.text}
              </Tag>
            </div>
          </div>

          {/* QR Code Section */}
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            {isActive ? (
              <>
                <QRCodeDisplay
                  value={`${coupon.code}-${qrRefreshKey}`}
                  size={200}
                  isActive={true}
                />
                <div style={{
                  marginTop: 12, fontSize: 18, fontWeight: 600, letterSpacing: 2,
                  fontFamily: 'monospace', color: '#333'
                }}>
                  {coupon.code}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                  出示此二維碼予商戶掃描核銷
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  marginTop: 12, padding: '6px 12px', borderRadius: 16,
                  background: daysUntilExpiry <= 7 ? '#fff7e6' : '#f6ffed',
                  fontSize: 12, color: daysUntilExpiry <= 7 ? '#fa8c16' : '#52c41a'
                }}>
                  <ClockCircleOutline fontSize={14} />
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} 天後到期` : '今日到期'}
                </div>
              </>
            ) : coupon.status === 'used' ? (
              <div style={{ padding: '20px 0' }}>
                <CheckCircleFill fontSize={64} color="#52c41a" />
                <div style={{ marginTop: 16, fontSize: 16, fontWeight: 500, color: '#333' }}>
                  優惠券已使用
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>
                  使用時間：{coupon.usedAt}
                </div>
                <div style={{ fontSize: 13, color: '#999' }}>
                  使用地點：{coupon.usedMerchant}
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px 0' }}>
                <CloseCircleFill fontSize={64} color="#ff4d4f" />
                <div style={{ marginTop: 16, fontSize: 16, fontWeight: 500, color: '#333' }}>
                  優惠券已過期
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>
                  過期日期：{coupon.expire}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Details */}
      <div style={{ padding: '0 16px' }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: 16 }}>
            {coupon.fullDesc}
          </div>
          <Divider />
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            <List.Item extra={coupon.merchant} prefix={<span style={{ fontSize: 16 }}>🏪</span>}>
              適用商戶
            </List.Item>
            <List.Item extra={coupon.mall} prefix={<span style={{ fontSize: 16 }}>📍</span>}>
              所屬商場
            </List.Item>
            <List.Item
              extra={<span style={{ color: daysUntilExpiry <= 7 && isActive ? '#fa8c16' : undefined }}>{coupon.expire}</span>}
              prefix={<span style={{ fontSize: 16 }}>📅</span>}
            >
              有效期至
            </List.Item>
            <List.Item extra={`${coupon.stampCost} 印花`} prefix={<span style={{ fontSize: 16 }}>⭐</span>}>
              兌換花費
            </List.Item>
          </List>
        </Card>
      </div>

      {/* Rules */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>使用規則</div>
          {coupon.rules.map((rule, i) => (
            <div key={i} style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 8, lineHeight: 1.5 }}>
              <span style={{ color: colors.primary }}>•</span>
              <span>{rule}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Fixed Bottom Button */}
      {isActive && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0',
        }}>
          <Button
            block
            color="primary"
            size="large"
            onClick={handleUse}
            style={{
              '--background-color': colors.primary,
              '--border-color': colors.primary,
              borderRadius: 12,
              fontWeight: 600
            } as React.CSSProperties}
          >
            商戶核銷
          </Button>
        </div>
      )}

      {/* Verification Modal */}
      <Modal
        visible={showVerifyModal}
        title="核銷優惠券"
        content={
          <div style={{ padding: '16px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                請商戶輸入6位數核銷碼
              </div>
              <Input
                placeholder="000000"
                value={verifyCode}
                onChange={setVerifyCode}
                maxLength={6}
                style={{
                  '--font-size': '24px',
                  '--text-align': 'center',
                  letterSpacing: 8,
                  fontFamily: 'monospace',
                } as React.CSSProperties}
              />
            </div>
            <div style={{
              background: '#f5f5f5', borderRadius: 8, padding: 12,
              fontSize: 12, color: '#999', textAlign: 'center'
            }}>
              核銷碼由商戶提供，輸入後優惠券將立即失效
            </div>
          </div>
        }
        closeOnAction
        onClose={() => {
          setShowVerifyModal(false);
          setVerifyCode('');
        }}
        actions={[
          {
            key: 'cancel',
            text: '取消',
          },
          {
            key: 'confirm',
            text: verifying ? '核銷中...' : '確認核銷',
            primary: true,
            disabled: verifying || verifyCode.length !== 6,
            onClick: handleVerify,
          },
        ]}
      />
    </div>
  );
}
