import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Typography,
  Tabs,
  Statistic,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  QrcodeOutlined,
  PlusOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CopyOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store/app';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface QRCode {
  id: string;
  code: string;
  type: 'merchant_payment' | 'campaign' | 'checkin' | 'coupon';
  name: string;
  description: string;
  mallId: string;
  mallName: string;
  merchantId?: string;
  merchantName?: string;
  stamps: number;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'expired' | 'disabled';
  startDate: string;
  endDate: string;
  createdAt: string;
}

const qrTypes = [
  { value: 'merchant_payment', label: '商戶收款碼' },
  { value: 'campaign', label: '活動碼' },
  { value: 'checkin', label: '簽到碼' },
  { value: 'coupon', label: '優惠券碼' },
];

const malls = [
  { id: 'mall_001', name: '又一城' },
  { id: 'mall_002', name: '荷里活廣場' },
  { id: 'mall_003', name: '大埔超級城' },
];

const mockQRCodes: QRCode[] = [
  {
    id: 'qr_001',
    code: 'LM-PAY-FW-001',
    type: 'merchant_payment',
    name: '太平洋咖啡收款碼',
    description: '又一城太平洋咖啡商戶收款',
    mallId: 'mall_001',
    mallName: '又一城',
    merchantId: 'merch_001',
    merchantName: '太平洋咖啡',
    stamps: 1,
    maxUses: 0,
    usedCount: 1523,
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01',
  },
  {
    id: 'qr_002',
    code: 'LM-CNY-2024',
    type: 'campaign',
    name: '新春三倍印花活動',
    description: '農曆新年期間掃碼獲取三倍印花',
    mallId: 'mall_001',
    mallName: '又一城',
    stamps: 30,
    maxUses: 10000,
    usedCount: 3567,
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    createdAt: '2024-01-25',
  },
  {
    id: 'qr_003',
    code: 'LM-CHECKIN-HP',
    type: 'checkin',
    name: '荷里活廣場每日簽到',
    description: '每日簽到獲取5印花',
    mallId: 'mall_002',
    mallName: '荷里活廣場',
    stamps: 5,
    maxUses: 0,
    usedCount: 8920,
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01',
  },
  {
    id: 'qr_004',
    code: 'LM-COUPON-50OFF',
    type: 'coupon',
    name: 'HK$50優惠券',
    description: '消費滿$200減$50',
    mallId: 'mall_003',
    mallName: '大埔超級城',
    stamps: 0,
    maxUses: 500,
    usedCount: 500,
    status: 'expired',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    createdAt: '2023-12-25',
  },
];

const QRCodeManagement: React.FC = () => {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [qrCodes, setQRCodes] = useState<QRCode[]>(mockQRCodes);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: '營運管理', path: '/operations' },
      { title: '二維碼管理' },
    ]);
  }, [setBreadcrumbs]);

  const filteredQRCodes = qrCodes.filter((qr) => {
    const matchSearch =
      !searchText ||
      qr.code.toLowerCase().includes(searchText.toLowerCase()) ||
      qr.name.includes(searchText);
    const matchTab = activeTab === 'all' || qr.type === activeTab;
    return matchSearch && matchTab;
  });

  const handleAdd = () => {
    setSelectedQR(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handlePreview = (record: QRCode) => {
    setSelectedQR(record);
    setPreviewVisible(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success('已複製到剪貼板');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mallName = malls.find((m) => m.id === values.mallId)?.name || '';
      const code = `LM-${values.type.toUpperCase().slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`;

      const qrData: QRCode = {
        id: `qr_${Date.now()}`,
        code,
        ...values,
        mallName,
        usedCount: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setQRCodes([...qrCodes, qrData]);
      message.success('二維碼已創建');

      setModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getTypeTag = (type: QRCode['type']) => {
    const config = {
      merchant_payment: { color: 'blue', text: '商戶收款' },
      campaign: { color: 'gold', text: '活動' },
      checkin: { color: 'green', text: '簽到' },
      coupon: { color: 'purple', text: '優惠券' },
    };
    return <Tag color={config[type].color}>{config[type].text}</Tag>;
  };

  const getStatusTag = (status: QRCode['status']) => {
    const config = {
      active: { color: 'green', text: '有效' },
      expired: { color: 'default', text: '已過期' },
      disabled: { color: 'red', text: '已停用' },
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const columns: ColumnsType<QRCode> = [
    {
      title: '二維碼',
      key: 'qr',
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 48,
              height: 48,
              background: '#f5f5f5',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrcodeOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          </div>
          <Space direction="vertical" size={0}>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }} copyable={{ text: record.code }}>
              {record.code}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: getTypeTag,
    },
    {
      title: '商場',
      dataIndex: 'mallName',
      key: 'mallName',
    },
    {
      title: '印花',
      dataIndex: 'stamps',
      key: 'stamps',
      render: (v) =>
        v > 0 ? (
          <Text style={{ color: '#C4A962' }}>+{v}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '使用次數',
      key: 'usage',
      render: (_, record) => (
        <Text>
          {record.usedCount.toLocaleString()}
          {record.maxUses > 0 && ` / ${record.maxUses.toLocaleString()}`}
        </Text>
      ),
    },
    {
      title: '有效期',
      key: 'validity',
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.startDate} ~ {record.endDate}
        </Text>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
            預覽
          </Button>
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleCopyCode(record.code)}
          >
            複製
          </Button>
          <Button type="link" icon={<DownloadOutlined />}>
            下載
          </Button>
        </Space>
      ),
    },
  ];

  const activeCount = qrCodes.filter((q) => q.status === 'active').length;
  const totalScans = qrCodes.reduce((sum, q) => sum + q.usedCount, 0);
  const campaignCount = qrCodes.filter((q) => q.type === 'campaign').length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="二維碼總數"
              value={qrCodes.length}
              prefix={<QrcodeOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="有效二維碼"
              value={activeCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總掃描次數"
              value={totalScans}
              valueStyle={{ color: '#C4A962' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="活動碼數量" value={campaignCount} />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>二維碼列表</Title>}
        extra={
          <Space>
            <Button icon={<PrinterOutlined />}>批量打印</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              創建二維碼
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: '全部' },
            ...qrTypes.map((t) => ({ key: t.value, label: t.label })),
          ]}
        />

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="搜尋二維碼名稱或編號"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredQRCodes}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="創建二維碼"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="類型"
                rules={[{ required: true, message: '請選擇類型' }]}
              >
                <Select placeholder="選擇類型">
                  {qrTypes.map((t) => (
                    <Select.Option key={t.value} value={t.value}>
                      {t.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mallId"
                label="所屬商場"
                rules={[{ required: true, message: '請選擇商場' }]}
              >
                <Select placeholder="選擇商場">
                  {malls.map((m) => (
                    <Select.Option key={m.id} value={m.id}>
                      {m.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="name"
            label="名稱"
            rules={[{ required: true, message: '請輸入名稱' }]}
          >
            <Input placeholder="二維碼名稱" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="二維碼描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stamps" label="贈送印花">
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxUses" label="最大使用次數 (0為無限)">
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="開始日期"
                rules={[{ required: true, message: '請選擇開始日期' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="結束日期"
                rules={[{ required: true, message: '請選擇結束日期' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="二維碼預覽"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="copy" onClick={() => selectedQR && handleCopyCode(selectedQR.code)}>
            複製編號
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下載二維碼
          </Button>,
        ]}
        width={400}
      >
        {selectedQR && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div
              style={{
                width: 200,
                height: 200,
                margin: '0 auto',
                background: '#f5f5f5',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrcodeOutlined style={{ fontSize: 120, color: '#1677ff' }} />
            </div>
            <div style={{ marginTop: 16 }}>
              <Title level={5}>{selectedQR.name}</Title>
              <Text type="secondary">{selectedQR.code}</Text>
            </div>
            <div style={{ marginTop: 12 }}>
              {getTypeTag(selectedQR.type)}
              {getStatusTag(selectedQR.status)}
            </div>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">
                {selectedQR.mallName} · 使用次數: {selectedQR.usedCount.toLocaleString()}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QRCodeManagement;
