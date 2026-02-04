import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Badge, Card, Dialog, Toast } from 'antd-mobile';
import {
  RightOutline,
  SetOutline,
  MessageOutline,
  HeartOutline,
  StarOutline,
  InformationCircleOutline,
  CloseCircleOutline,
  GlobalOutline,
  EditSOutline,
} from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Profile Header */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, #004D36)`, padding: '28px 20px 32px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
            陳
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name || '陳小明'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ background: GOLD, color: '#fff', fontSize: 11, padding: '2px 10px', borderRadius: 10, fontWeight: 600 }}>
                🥇 Gold 金卡
              </span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>{user?.cardNo || 'LM-2024-0088'}</span>
            </div>
          </div>
          <EditSOutline fontSize={20} style={{ opacity: 0.7 }} />
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', marginTop: 24, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 0' }}>
          {[
            { label: '印花', value: '2,580', color: GOLD },
            { label: '優惠券', value: '5' },
            { label: '收藏', value: '12' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color || '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div style={{ padding: '12px 16px' }}>
        <Card style={{ marginBottom: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as any}>
            <List.Item
              prefix={<StarOutline color={GOLD} />}
              onClick={() => navigate('/tier')}
              arrow={<RightOutline />}
            >
              我的等級
            </List.Item>
            <List.Item
              prefix={<MessageOutline color={PRIMARY} />}
              onClick={() => Toast.show('消息中心')}
              arrow={<RightOutline />}
              extra={<Badge content="3" />}
            >
              消息中心
            </List.Item>
            <List.Item
              prefix={<HeartOutline color="#E91E63" />}
              onClick={() => Toast.show('收藏商鋪')}
              arrow={<RightOutline />}
            >
              收藏商鋪
            </List.Item>
          </List>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as any}>
            <List.Item
              prefix={<GlobalOutline color={PRIMARY} />}
              onClick={() => navigate('/settings')}
              arrow={<RightOutline />}
            >
              語言設置
            </List.Item>
            <List.Item
              prefix={<SetOutline color="#666" />}
              onClick={() => Toast.show('意見反饋')}
              arrow={<RightOutline />}
            >
              意見反饋
            </List.Item>
            <List.Item
              prefix={<InformationCircleOutline color="#666" />}
              onClick={() => Toast.show('關於 Link Mall v1.0.0')}
              arrow={<RightOutline />}
            >
              關於我們
            </List.Item>
          </List>
        </Card>

        <Card>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as any}>
            <List.Item
              prefix={<CloseCircleOutline color="#E53935" />}
              onClick={() => {
                Dialog.confirm({
                  content: '確定要退出登入嗎？',
                  confirmText: '退出',
                  cancelText: '取消',
                  onConfirm: () => {
                    logout();
                    Toast.show('已退出登入');
                  },
                });
              }}
            >
              <span style={{ color: '#E53935' }}>退出登入</span>
            </List.Item>
          </List>
        </Card>
      </div>
    </div>
  );
}
