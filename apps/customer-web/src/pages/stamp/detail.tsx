import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Result } from 'antd-mobile';

const PRIMARY = '#00694B';

export default function StampDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
        印花詳情
      </NavBar>
      <div style={{ padding: 16 }}>
        <Card>
          <Result
            status="success"
            title="+25 印花"
            description="交易已完成"
          />
          <List>
            <List.Item extra="又一城 Pacific Coffee 消費">交易說明</List.Item>
            <List.Item extra="2026-02-03 14:32">交易時間</List.Item>
            <List.Item extra={`TX-${id || '20260203-001'}`}>交易編號</List.Item>
            <List.Item extra="HK$250.00">消費金額</List.Item>
            <List.Item extra={<Tag color="success">掃碼</Tag>}>來源</List.Item>
            <List.Item extra="每HK$10 = 1印花">適用規則</List.Item>
            <List.Item extra="又一城 Festival Walk">所屬商場</List.Item>
          </List>
        </Card>
      </div>
    </div>
  );
}
