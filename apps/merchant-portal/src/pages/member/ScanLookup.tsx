import React, { useState } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  ScanOutlined,
  CreditCardOutlined,
  GiftOutlined,
  HistoryOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import MemberCard from '../../components/MemberCard';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '扫码查询', 'zh-TW': '掃碼查詢', en: 'Scan QR Lookup' },
  scanBtn: { 'zh-CN': '扫描会员二维码', 'zh-TW': '掃描會員二維碼', en: 'Scan Member QR Code' },
  scanning: { 'zh-CN': '正在扫描...', 'zh-TW': '正在掃描...', en: 'Scanning...' },
  memberInfo: { 'zh-CN': '会员信息', 'zh-TW': '會員信息', en: 'Member Information' },
  recentStamps: { 'zh-CN': '近期印花记录', 'zh-TW': '近期印花記錄', en: 'Recent Stamp History' },
  issueStamp: { 'zh-CN': '为该会员发放印花', 'zh-TW': '為該會員發放印花', en: 'Issue Stamps to Member' },
  noMember: { 'zh-CN': '请扫描会员二维码开始查询', 'zh-TW': '請掃描會員二維碼開始查詢', en: 'Scan a member QR code to start' },
  date: { 'zh-CN': '日期', 'zh-TW': '日期', en: 'Date' },
  shop: { 'zh-CN': '商户', 'zh-TW': '商戶', en: 'Shop' },
  amount: { 'zh-CN': '金额', 'zh-TW': '金額', en: 'Amount' },
  stamps: { 'zh-CN': '印花', 'zh-TW': '印花', en: 'Stamps' },
  type: { 'zh-CN': '类型', 'zh-TW': '類型', en: 'Type' },
  earn: { 'zh-CN': '获得', 'zh-TW': '獲得', en: 'Earned' },
  redeem: { 'zh-CN': '兑换', 'zh-TW': '兌換', en: 'Redeemed' },
  memberFound: { 'zh-CN': '已找到会员信息', 'zh-TW': '已找到會員信息', en: 'Member found' },
  scanHint: { 'zh-CN': '将会员出示的二维码对准扫描框', 'zh-TW': '將會員出示的二維碼對準掃描框', en: 'Align the member QR code with the scanner' },
};

const mockMember = {
  id: 'member-001',
  name: '王小明',
  phone: '138****8001',
  tier: 'gold' as const,
  memberNo: 'LR20240001',
  stampBalance: 128,
  totalStamps: 560,
  joinDate: '2024-03-15',
  lastVisit: '2025-01-18',
  status: 'active' as const,
};

interface StampRecord {
  id: string;
  date: string;
  shop: string;
  amount: number;
  stamps: number;
  type: 'earn' | 'redeem';
}

const mockStampHistory: StampRecord[] = [
  { id: '1', date: '2025-01-20', shop: '优品生活馆', amount: 580, stamps: 5, type: 'earn' },
  { id: '2', date: '2025-01-18', shop: '美食广场', amount: 0, stamps: -20, type: 'redeem' },
  { id: '3', date: '2025-01-15', shop: '优品生活馆', amount: 1200, stamps: 12, type: 'earn' },
  { id: '4', date: '2025-01-12', shop: '时尚服饰', amount: 890, stamps: 8, type: 'earn' },
  { id: '5', date: '2025-01-08', shop: '优品生活馆', amount: 450, stamps: 4, type: 'earn' },
];

const ScanLookup: React.FC = () => {
  const { locale } = useLocale();
  const navigate = useNavigate();
  const [member, setMember] = useState<typeof mockMember | null>(null);
  const [scanning, setScanning] = useState(false);

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setMember(mockMember);
      message.success(getLabel('memberFound'));
    }, 2000);
  };

  const columns: ColumnsType<StampRecord> = [
    { title: getLabel('date'), dataIndex: 'date', key: 'date', width: 120 },
    { title: getLabel('shop'), dataIndex: 'shop', key: 'shop', width: 150 },
    {
      title: getLabel('amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (val) => val > 0 ? `HK$ ${val.toFixed(2)}` : '-',
    },
    {
      title: getLabel('stamps'),
      dataIndex: 'stamps',
      key: 'stamps',
      width: 100,
      align: 'center',
      render: (val) => (
        <Text strong style={{ color: val > 0 ? '#52c41a' : '#ff4d4f' }}>
          {val > 0 ? `+${val}` : val}
        </Text>
      ),
    },
    {
      title: getLabel('type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'earn' ? 'green' : 'orange'}>
          {getLabel(type)}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>
        <ScanOutlined style={{ marginRight: 8 }} />
        {getLabel('title')}
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          {/* Scan Area */}
          <Card
            bordered={false}
            style={{
              borderRadius: 8,
              textAlign: 'center',
              minHeight: 200,
              marginBottom: 16,
            }}
          >
            {scanning ? (
              <Spin size="large" tip={getLabel('scanning')}>
                <div style={{ padding: 60 }} />
              </Spin>
            ) : (
              <Space direction="vertical" size="large" style={{ padding: '20px 0' }}>
                <ScanOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                <Button
                  type="primary"
                  size="large"
                  icon={<ScanOutlined />}
                  onClick={handleScan}
                >
                  {getLabel('scanBtn')}
                </Button>
                <Text type="secondary">{getLabel('scanHint')}</Text>
              </Space>
            )}
          </Card>

          {/* Member Info */}
          {member ? (
            <div>
              <MemberCard member={member} />
              <Button
                type="primary"
                icon={<SendOutlined />}
                block
                size="large"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/stamp/issue')}
              >
                {getLabel('issueStamp')}
              </Button>
            </div>
          ) : (
            <Card bordered={false} style={{ borderRadius: 8 }}>
              <Empty description={getLabel('noMember')} />
            </Card>
          )}
        </Col>

        <Col xs={24} md={14}>
          {/* Recent Stamp History */}
          <Card
            title={
              <Space>
                <HistoryOutlined />
                {getLabel('recentStamps')}
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            {member ? (
              <Table
                columns={columns}
                dataSource={mockStampHistory}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description={getLabel('noMember')} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ScanLookup;
