import React from 'react';
import { Row, Col, Card, Statistic, Button, Space, Typography, List, Tag, theme } from 'antd';
import {
  GiftOutlined,
  TeamOutlined,
  CreditCardOutlined,
  ScanOutlined,
  SendOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

const labels: Record<string, Record<string, string>> = {
  welcome: { 'zh-CN': '欢迎回来', 'zh-TW': '歡迎回來', en: 'Welcome back' },
  todayOverview: { 'zh-CN': '今日概览', 'zh-TW': '今日概覽', en: "Today's Overview" },
  stampsIssued: { 'zh-CN': '今日发放印花', 'zh-TW': '今日發放印花', en: 'Stamps Issued Today' },
  stampsRedeemed: { 'zh-CN': '今日兑换印花', 'zh-TW': '今日兌換印花', en: 'Stamps Redeemed' },
  memberVisits: { 'zh-CN': '今日到访会员', 'zh-TW': '今日到訪會員', en: 'Member Visits' },
  activeCoupons: { 'zh-CN': '待核销优惠券', 'zh-TW': '待核銷優惠券', en: 'Active Coupons' },
  quickActions: { 'zh-CN': '快捷操作', 'zh-TW': '快捷操作', en: 'Quick Actions' },
  issueStamp: { 'zh-CN': '发放印花', 'zh-TW': '發放印花', en: 'Issue Stamps' },
  scanMember: { 'zh-CN': '扫码查询', 'zh-TW': '掃碼查詢', en: 'Scan Member' },
  verifyCoupon: { 'zh-CN': '核销优惠券', 'zh-TW': '核銷優惠券', en: 'Verify Coupon' },
  recentTransactions: { 'zh-CN': '最近交易', 'zh-TW': '最近交易', en: 'Recent Transactions' },
  viewAll: { 'zh-CN': '查看全部', 'zh-TW': '查看全部', en: 'View All' },
  compared: { 'zh-CN': '较昨日', 'zh-TW': '較昨日', en: 'vs yesterday' },
  stampIssue: { 'zh-CN': '印花发放', 'zh-TW': '印花發放', en: 'Stamp Issue' },
  couponRedeem: { 'zh-CN': '优惠券核销', 'zh-TW': '優惠券核銷', en: 'Coupon Redeem' },
  completed: { 'zh-CN': '已完成', 'zh-TW': '已完成', en: 'Completed' },
  pending: { 'zh-CN': '处理中', 'zh-TW': '處理中', en: 'Pending' },
};

interface RecentTransaction {
  id: string;
  type: 'stamp_issue' | 'coupon_redeem';
  memberName: string;
  amount: number;
  stamps?: number;
  time: string;
  status: 'completed' | 'pending';
}

const mockTransactions: RecentTransaction[] = [
  { id: '1', type: 'stamp_issue', memberName: '王小明', amount: 580, stamps: 5, time: '14:32', status: 'completed' },
  { id: '2', type: 'coupon_redeem', memberName: '李芳', amount: 0, time: '14:15', status: 'completed' },
  { id: '3', type: 'stamp_issue', memberName: '陈大海', amount: 1200, stamps: 12, time: '13:48', status: 'completed' },
  { id: '4', type: 'stamp_issue', memberName: '张丽', amount: 320, stamps: 3, time: '13:22', status: 'pending' },
  { id: '5', type: 'coupon_redeem', memberName: '赵强', amount: 0, time: '12:50', status: 'completed' },
  { id: '6', type: 'stamp_issue', memberName: '刘敏', amount: 890, stamps: 8, time: '12:15', status: 'completed' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const { user } = useAuth();
  const { token: themeToken } = theme.useToken();

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {getLabel('welcome')}, {user?.displayName}
        </Title>
        <Text type="secondary">{user?.shopName} - {user?.mallName}</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('stampsIssued')}
              value={156}
              prefix={<GiftOutlined style={{ color: themeToken.colorPrimary }} />}
              suffix={
                <Text style={{ fontSize: 12, color: themeToken.colorSuccess }}>
                  <ArrowUpOutlined /> 12%
                </Text>
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>{getLabel('compared')}</Text>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('stampsRedeemed')}
              value={42}
              prefix={<CreditCardOutlined style={{ color: '#fa8c16' }} />}
              suffix={
                <Text style={{ fontSize: 12, color: '#cf1322' }}>
                  <ArrowDownOutlined /> 5%
                </Text>
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>{getLabel('compared')}</Text>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('memberVisits')}
              value={89}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              suffix={
                <Text style={{ fontSize: 12, color: themeToken.colorSuccess }}>
                  <ArrowUpOutlined /> 8%
                </Text>
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>{getLabel('compared')}</Text>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('activeCoupons')}
              value={23}
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Quick Actions */}
        <Col xs={24} md={8}>
          <Card
            title={getLabel('quickActions')}
            bordered={false}
            style={{ borderRadius: 8, height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="large"
                block
                onClick={() => navigate('/stamp/issue')}
              >
                {getLabel('issueStamp')}
              </Button>
              <Button
                icon={<ScanOutlined />}
                size="large"
                block
                onClick={() => navigate('/member/scan')}
              >
                {getLabel('scanMember')}
              </Button>
              <Button
                icon={<CheckCircleOutlined />}
                size="large"
                block
                onClick={() => navigate('/coupon/verification')}
              >
                {getLabel('verifyCoupon')}
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Recent Transactions */}
        <Col xs={24} md={16}>
          <Card
            title={getLabel('recentTransactions')}
            bordered={false}
            style={{ borderRadius: 8 }}
            extra={
              <Button type="link" onClick={() => navigate('/stamp/transactions')}>
                {getLabel('viewAll')}
              </Button>
            }
          >
            <List
              dataSource={mockTransactions}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Space direction="vertical" align="end" size={0}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {item.time}
                      </Text>
                      <Tag
                        color={item.status === 'completed' ? 'green' : 'processing'}
                        style={{ fontSize: 11 }}
                      >
                        {getLabel(item.status)}
                      </Tag>
                    </Space>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      item.type === 'stamp_issue' ? (
                        <GiftOutlined style={{ fontSize: 20, color: themeToken.colorPrimary }} />
                      ) : (
                        <CheckCircleOutlined style={{ fontSize: 20, color: '#722ed1' }} />
                      )
                    }
                    title={
                      <Space>
                        <Text>{item.memberName}</Text>
                        <Tag color={item.type === 'stamp_issue' ? 'blue' : 'purple'}>
                          {getLabel(item.type === 'stamp_issue' ? 'stampIssue' : 'couponRedeem')}
                        </Tag>
                      </Space>
                    }
                    description={
                      item.type === 'stamp_issue'
                        ? `HK$ ${item.amount} | +${item.stamps} ${locale === 'en' ? 'stamps' : '印花'}`
                        : getLabel('couponRedeem')
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
