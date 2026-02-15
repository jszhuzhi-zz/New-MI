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
import { useLocale } from '../../hooks/useLocale';
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
  const { t } = useLocale();
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
      { title: t('customerApp.operationsManagement'), path: '/operations' },
      { title: t('customerApp.qrCodeManagement') },
    ]);
  }, [setBreadcrumbs, t]);

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
    message.success(t('customerApp.copiedToClipboard'));
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
      message.success(t('customerApp.qrCodeCreated'));

      setModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getTypeTag = (type: QRCode['type']) => {
    const config = {
      merchant_payment: { color: 'blue', text: t('customerApp.merchantPayment') },
      campaign: { color: 'gold', text: t('customerApp.campaignCode') },
      checkin: { color: 'green', text: t('customerApp.checkinCode') },
      coupon: { color: 'purple', text: t('customerApp.couponCode') },
    };
    return <Tag color={config[type].color}>{config[type].text}</Tag>;
  };

  const getStatusTag = (status: QRCode['status']) => {
    const config = {
      active: { color: 'green', text: t('customerApp.valid') },
      expired: { color: 'default', text: t('customerApp.expiredStatus') },
      disabled: { color: 'red', text: t('customerApp.disabled') },
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const columns: ColumnsType<QRCode> = [
    {
      title: t('customerApp.qrCode'),
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
      title: t('customerApp.qrCodeType'),
      dataIndex: 'type',
      key: 'type',
      render: getTypeTag,
    },
    {
      title: t('customerApp.mall'),
      dataIndex: 'mallName',
      key: 'mallName',
    },
    {
      title: t('stamp.stamp'),
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
      title: t('customerApp.usageCount'),
      key: 'usage',
      render: (_, record) => (
        <Text>
          {record.usedCount.toLocaleString()}
          {record.maxUses > 0 && ` / ${record.maxUses.toLocaleString()}`}
        </Text>
      ),
    },
    {
      title: t('customerApp.validityPeriod'),
      key: 'validity',
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.startDate} ~ {record.endDate}
        </Text>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
            {t('customerApp.preview')}
          </Button>
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleCopyCode(record.code)}
          >
            {t('customerApp.copy')}
          </Button>
          <Button type="link" icon={<DownloadOutlined />}>
            {t('common.download')}
          </Button>
        </Space>
      ),
    },
  ];

  const activeCount = qrCodes.filter((q) => q.status === 'active').length;
  const totalScans = qrCodes.reduce((sum, q) => sum + q.usedCount, 0);
  const campaignCount = qrCodes.filter((q) => q.type === 'campaign').length;

  const qrTypeLabels = [
    { value: 'merchant_payment', label: t('customerApp.merchantPayment') },
    { value: 'campaign', label: t('customerApp.campaignCode') },
    { value: 'checkin', label: t('customerApp.checkinCode') },
    { value: 'coupon', label: t('customerApp.couponCode') },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('customerApp.totalQRCodes')}
              value={qrCodes.length}
              prefix={<QrcodeOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('customerApp.activeQRCodes')}
              value={activeCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('customerApp.totalScans')}
              value={totalScans}
              valueStyle={{ color: '#C4A962' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={t('customerApp.campaignQRCodes')} value={campaignCount} />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>{t('customerApp.qrCodeList')}</Title>}
        extra={
          <Space>
            <Button icon={<PrinterOutlined />}>{t('customerApp.batchPrint')}</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              {t('customerApp.createQRCode')}
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: t('common.all') },
            ...qrTypeLabels.map((qrType) => ({ key: qrType.value, label: qrType.label })),
          ]}
        />

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder={t('customerApp.searchQRCode')}
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
        title={t('customerApp.createQRCode')}
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
                label={t('customerApp.qrCodeType')}
                rules={[{ required: true, message: t('customerApp.selectType') }]}
              >
                <Select placeholder={t('customerApp.selectType')}>
                  {qrTypes.map((qrType) => (
                    <Select.Option key={qrType.value} value={qrType.value}>
                      {qrType.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mallId"
                label={t('customerApp.belongsToMall')}
                rules={[{ required: true, message: t('customerApp.selectMall') }]}
              >
                <Select placeholder={t('customerApp.selectMall')}>
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
            label={t('customerApp.qrCodeNameLabel')}
            rules={[{ required: true, message: t('customerApp.enterQRCodeName') }]}
          >
            <Input placeholder={t('customerApp.enterQRCodeName')} />
          </Form.Item>

          <Form.Item name="description" label={t('customerApp.qrCodeDescriptionLabel')}>
            <Input.TextArea rows={2} placeholder={t('customerApp.description')} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stamps" label={t('customerApp.grantStamps')}>
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxUses" label={t('customerApp.maxUses')}>
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label={t('customerApp.startDate')}
                rules={[{ required: true, message: t('customerApp.startDate') }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label={t('customerApp.endDate')}
                rules={[{ required: true, message: t('customerApp.endDate') }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={t('customerApp.qrCodePreview')}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="copy" onClick={() => selectedQR && handleCopyCode(selectedQR.code)}>
            {t('customerApp.copyCode')}
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            {t('customerApp.downloadQRCode')}
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
                {selectedQR.mallName} · {t('customerApp.usageCount')}: {selectedQR.usedCount.toLocaleString()}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QRCodeManagement;
