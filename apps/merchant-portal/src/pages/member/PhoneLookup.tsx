import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Empty,
  message,
  Descriptions,
} from 'antd';
import {
  PhoneOutlined,
  SearchOutlined,
  SendOutlined,
  HistoryOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import MemberCard from '../../components/MemberCard';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '手机号查询', 'zh-TW': '手機號查詢', en: 'Phone Number Lookup' },
  placeholder: { 'zh-CN': '请输入会员手机号', 'zh-TW': '請輸入會員手機號', en: 'Enter member phone number' },
  search: { 'zh-CN': '查询', 'zh-TW': '查詢', en: 'Search' },
  memberInfo: { 'zh-CN': '会员信息', 'zh-TW': '會員信息', en: 'Member Information' },
  recentVisits: { 'zh-CN': '在本店消费记录', 'zh-TW': '在本店消費記錄', en: 'Visit History at Our Shop' },
  issueStamp: { 'zh-CN': '为该会员发放印花', 'zh-TW': '為該會員發放印花', en: 'Issue Stamps to Member' },
  noMember: { 'zh-CN': '请输入手机号查询会员', 'zh-TW': '請輸入手機號查詢會員', en: 'Enter phone number to search' },
  notFound: { 'zh-CN': '未找到该手机号对应的会员', 'zh-TW': '未找到該手機號對應的會員', en: 'No member found with this phone number' },
  memberFound: { 'zh-CN': '已找到会员', 'zh-TW': '已找到會員', en: 'Member found' },
  date: { 'zh-CN': '日期', 'zh-TW': '日期', en: 'Date' },
  amount: { 'zh-CN': '消费金额', 'zh-TW': '消費金額', en: 'Amount' },
  stamps: { 'zh-CN': '获得印花', 'zh-TW': '獲得印花', en: 'Stamps Earned' },
  operator: { 'zh-CN': '操作员', 'zh-TW': '操作員', en: 'Operator' },
  totalVisits: { 'zh-CN': '总到访次数', 'zh-TW': '總到訪次數', en: 'Total Visits' },
  totalSpend: { 'zh-CN': '总消费金额', 'zh-TW': '總消費金額', en: 'Total Spend' },
  avgSpend: { 'zh-CN': '平均消费', 'zh-TW': '平均消費', en: 'Average Spend' },
  phoneRequired: { 'zh-CN': '请输入手机号', 'zh-TW': '請輸入手機號', en: 'Please enter phone number' },
  hint: { 'zh-CN': '支持大陆 (+86) 和香港 (+852) 手机号', 'zh-TW': '支持大陸 (+86) 和香港 (+852) 手機號', en: 'Supports Mainland (+86) and HK (+852) numbers' },
};

const mockMember = {
  id: 'member-002',
  name: '李芳',
  phone: '139****2345',
  tier: 'silver' as const,
  memberNo: 'LR20240015',
  stampBalance: 56,
  totalStamps: 234,
  joinDate: '2024-06-20',
  lastVisit: '2025-01-19',
  status: 'active' as const,
};

interface VisitRecord {
  id: string;
  date: string;
  amount: number;
  stamps: number;
  operator: string;
}

const mockVisits: VisitRecord[] = [
  { id: '1', date: '2025-01-19 14:15', amount: 1200, stamps: 12, operator: '张伟' },
  { id: '2', date: '2025-01-10 11:30', amount: 680, stamps: 6, operator: '李娜' },
  { id: '3', date: '2024-12-25 16:45', amount: 2300, stamps: 23, operator: '张伟' },
  { id: '4', date: '2024-12-18 13:20', amount: 450, stamps: 4, operator: '张伟' },
  { id: '5', date: '2024-12-05 10:10', amount: 890, stamps: 8, operator: '李娜' },
];

const PhoneLookup: React.FC = () => {
  const { locale } = useLocale();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [member, setMember] = useState<typeof mockMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const handleSearch = async () => {
    if (!phone.trim()) {
      message.warning(getLabel('phoneRequired'));
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (phone.includes('000')) {
        setMember(null);
      } else {
        setMember(mockMember);
        message.success(getLabel('memberFound'));
      }
    } finally {
      setLoading(false);
    }
  };

  const totalSpend = mockVisits.reduce((sum, v) => sum + v.amount, 0);
  const avgSpend = mockVisits.length > 0 ? totalSpend / mockVisits.length : 0;

  const columns: ColumnsType<VisitRecord> = [
    { title: getLabel('date'), dataIndex: 'date', key: 'date', width: 160 },
    {
      title: getLabel('amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (val) => `HK$ ${val.toFixed(2)}`,
    },
    {
      title: getLabel('stamps'),
      dataIndex: 'stamps',
      key: 'stamps',
      width: 100,
      align: 'center',
      render: (val) => (
        <Text strong style={{ color: '#52c41a' }}>+{val}</Text>
      ),
    },
    { title: getLabel('operator'), dataIndex: 'operator', key: 'operator', width: 100 },
  ];

  return (
    <div>
      <Title level={4}>
        <PhoneOutlined style={{ marginRight: 8 }} />
        {getLabel('title')}
      </Title>

      {/* Search Bar */}
      <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Space.Compact style={{ width: '100%' }} size="large">
            <Input
              prefix={<PhoneOutlined />}
              placeholder={getLabel('placeholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onPressEnter={handleSearch}
              maxLength={15}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleSearch}
            >
              {getLabel('search')}
            </Button>
          </Space.Compact>
          <Text type="secondary" style={{ fontSize: 12 }}>{getLabel('hint')}</Text>
        </Space>
      </Card>

      {/* Results */}
      {searched && !member && !loading && (
        <Card bordered={false} style={{ borderRadius: 8 }}>
          <Empty
            image={<UserOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
            description={getLabel('notFound')}
          />
        </Card>
      )}

      {member && (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <MemberCard member={member} />

            {/* Visit Summary */}
            <Card
              bordered={false}
              size="small"
              style={{ borderRadius: 8, marginTop: 16 }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label={getLabel('totalVisits')}>
                  <Text strong>{mockVisits.length}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('totalSpend')}>
                  <Text strong>HK$ {totalSpend.toFixed(2)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('avgSpend')}>
                  <Text strong>HK$ {avgSpend.toFixed(2)}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

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
          </Col>

          <Col xs={24} md={14}>
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  {getLabel('recentVisits')}
                </Space>
              }
              bordered={false}
              style={{ borderRadius: 8 }}
            >
              <Table
                columns={columns}
                dataSource={mockVisits}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      )}

      {!searched && (
        <Card bordered={false} style={{ borderRadius: 8 }}>
          <Empty description={getLabel('noMember')} />
        </Card>
      )}
    </div>
  );
};

export default PhoneLookup;
