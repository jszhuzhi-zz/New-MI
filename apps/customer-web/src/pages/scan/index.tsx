import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, NavBar, Tabs } from 'antd-mobile';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../store/auth';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const recentRecords = [
  { id: 1, merchant: 'Pacific Coffee', mall: '又一城', stamps: '+25', time: '今天 14:32', type: 'earn' },
  { id: 2, merchant: 'UNIQLO', mall: '荷里活廣場', stamps: '+45', time: '昨天 16:08', type: 'earn' },
  { id: 3, merchant: '星巴克', mall: '又一城', stamps: '+18', time: '01/28 11:20', type: 'earn' },
  { id: 4, merchant: 'HK$50禮券', mall: '印花兌換', stamps: '-500', time: '01/25 09:30', type: 'redeem' },
];

export default function ScanPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('member');

  const memberQRValue = JSON.stringify({
    type: 'MEMBER',
    memberId: user?.id || 'demo-user',
    cardNo: user?.cardNo || 'LM-2024-0088',
    tier: user?.tierName || 'Gold',
    timestamp: Date.now(),
  });

  const paymentQRValue = JSON.stringify({
    type: 'PAYMENT',
    memberId: user?.id || 'demo-user',
    cardNo: user?.cardNo || 'LM-2024-0088',
    action: 'EARN_STAMPS',
    timestamp: Date.now(),
  });

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
        我的二維碼
      </NavBar>

      {/* QR Code Display */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 16 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{
              '--title-font-size': '14px',
              '--active-title-color': PRIMARY,
              '--active-line-color': PRIMARY,
            } as React.CSSProperties}
          >
            <Tabs.Tab title="會員碼" key="member" />
            <Tabs.Tab title="付款碼" key="payment" />
          </Tabs>

          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            {/* QR Code */}
            <div style={{
              display: 'inline-block',
              padding: 16,
              background: '#fff',
              borderRadius: 12,
              border: `3px solid ${PRIMARY}`,
              boxShadow: '0 4px 20px rgba(0,105,75,0.15)',
            }}>
              <QRCodeSVG
                value={activeTab === 'member' ? memberQRValue : paymentQRValue}
                size={180}
                level="H"
                fgColor={PRIMARY}
                imageSettings={{
                  src: '',
                  height: 0,
                  width: 0,
                  excavate: false,
                }}
              />
            </div>

            {/* Card Number */}
            <div style={{
              marginTop: 16,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 2,
              color: '#333',
            }}>
              {user?.cardNo || 'LM-2024-0088'}
            </div>

            {/* Member Info */}
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <Tag
                style={{
                  '--background-color': GOLD,
                  '--text-color': '#fff',
                  '--border-color': GOLD,
                } as React.CSSProperties}
              >
                {user?.tierName || 'Gold 金卡會員'}
              </Tag>
              <Tag color="primary" fill="outline">
                {(user?.stampBalance || 2580).toLocaleString()} 印花
              </Tag>
            </div>

            {/* Instructions */}
            <div style={{
              marginTop: 20,
              padding: 12,
              background: '#f9f9f9',
              borderRadius: 8,
              fontSize: 13,
              color: '#666',
            }}>
              {activeTab === 'member' ? (
                <>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>出示此碼給商戶掃描</div>
                  <div style={{ fontSize: 12, color: '#999' }}>消費後即可獲得印花獎勵</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>出示付款碼完成交易</div>
                  <div style={{ fontSize: 12, color: '#999' }}>商戶掃描後自動累積印花</div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Stamp Balance Summary */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY }}>
                {(user?.stampBalance || 2580).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>可用印花</div>
            </div>
            <div style={{ width: 1, background: '#f0f0f0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>
                1,250
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>本月獲得</div>
            </div>
            <div style={{ width: 1, background: '#f0f0f0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#666' }}>
                12
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>交易次數</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Records */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>最近記錄</span>
          <span
            style={{ fontSize: 12, color: PRIMARY, cursor: 'pointer' }}
            onClick={() => navigate('/stamp')}
          >
            查看全部
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
