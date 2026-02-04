import React from 'react';
import { Button, Toast, Card, List, Tag } from 'antd-mobile';
import { ScanCodeOutline } from 'antd-mobile-icons';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const recentScans = [
  { id: 1, merchant: 'Pacific Coffee (又一城)', stamps: '+25', time: '今天 14:32' },
  { id: 2, merchant: 'UNIQLO (T Town)', stamps: '+45', time: '昨天 16:08' },
  { id: 3, merchant: 'Page One (又一城)', stamps: '+18', time: '01/28 11:20' },
];

export default function ScanPage() {
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: PRIMARY, padding: '20px 16px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>掃碼換印花</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>掃描商戶收據或出示會員碼</div>
      </div>

      {/* Scan Button */}
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div
          onClick={() => Toast.show({ content: '掃碼功能需要在APP中使用', icon: 'fail' })}
          style={{
            width: 140, height: 140, margin: '0 auto', borderRadius: 70,
            background: `linear-gradient(135deg, ${PRIMARY}, #004D36)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
            boxShadow: `0 8px 24px rgba(0,105,75,0.35)`,
          }}
        >
          <ScanCodeOutline fontSize={48} />
          <span style={{ fontSize: 14, marginTop: 8, fontWeight: 600 }}>掃描收據</span>
        </div>
        <div style={{ fontSize: 13, color: '#999', marginTop: 16 }}>
          掃描商戶收據上的二維碼即可獲取印花
        </div>
      </div>

      {/* My QR Code */}
      <div style={{ padding: '0 16px' }}>
        <Card title="我的會員碼" style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: 180, height: 180, margin: '0 auto', borderRadius: 12,
                background: '#fff', border: `3px solid ${PRIMARY}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 11, color: PRIMARY, fontWeight: 700 }}>Link Mall</div>
              <div style={{ width: 120, height: 120, background: '#f0f0f0', margin: '8px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#999', borderRadius: 4,
              }}>
                [QR Code]
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, letterSpacing: 2 }}>
              LM-2024-0088
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              出示此碼讓商戶掃描
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Scans */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card title="最近掃碼記錄">
          <List style={{ '--border-top': 'none' } as any}>
            {recentScans.map((s) => (
              <List.Item
                key={s.id}
                description={s.time}
                extra={<Tag color="success" style={{ fontWeight: 700 }}>{s.stamps}</Tag>}
              >
                {s.merchant}
              </List.Item>
            ))}
          </List>
        </Card>
      </div>
    </div>
  );
}
