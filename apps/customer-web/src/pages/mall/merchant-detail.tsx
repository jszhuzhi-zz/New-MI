import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Toast } from 'antd-mobile';

const PRIMARY = '#00694B';

export default function MerchantDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>商戶詳情</NavBar>
      <div style={{ height: 180, background: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 40 }}>
        ☕
      </div>
      <div style={{ padding: 16 }}>
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Pacific Coffee</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Tag color="primary" fill="outline">餐飲</Tag>
            <Tag color="success">印花商戶</Tag>
          </div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 12, lineHeight: 1.8 }}>
            Pacific Coffee Company 是香港最大的本地咖啡連鎖店，
            提供優質咖啡及各式飲品、輕食。舒適的環境讓您享受悠閒時光。
          </div>
        </Card>
        <Card title="商戶資訊" style={{ marginBottom: 12 }}>
          <List style={{ '--border-top': 'none' } as any}>
            <List.Item extra="又一城 Festival Walk">所屬商場</List.Item>
            <List.Item extra="1F A12">位置</List.Item>
            <List.Item extra="08:00 - 22:00">營業時間 (平日)</List.Item>
            <List.Item extra="09:00 - 22:00">營業時間 (週末)</List.Item>
            <List.Item extra="+852 2345 6789">聯絡電話</List.Item>
            <List.Item extra="每HK$10 = 1印花">印花規則</List.Item>
          </List>
        </Card>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button block style={{ flex: 1, borderRadius: 12 }} onClick={() => Toast.show('已收藏')}>
            ❤️ 收藏
          </Button>
          <Button block color="primary" style={{ flex: 2, '--background-color': PRIMARY, borderRadius: 12, fontWeight: 600 } as any} onClick={() => navigate('/scan')}>
            📷 掃碼換印花
          </Button>
        </div>
      </div>
    </div>
  );
}
