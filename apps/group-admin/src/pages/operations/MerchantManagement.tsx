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
  Popconfirm,
  Row,
  Col,
  Typography,
  Avatar,
  Tabs,
  Switch,
  InputNumber,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  UploadOutlined,
  SearchOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store/app';
import { useLocale } from '../../hooks/useLocale';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface Merchant {
  id: string;
  name: string;
  nameTW: string;
  nameEN: string;
  mallId: string;
  mallName: string;
  floor: string;
  unit: string;
  category: string;
  logo: string;
  phone: string;
  openingHours: string;
  stampEnabled: boolean;
  stampRate: number; // stamps per $1
  status: 'active' | 'inactive';
  createdAt: string;
}

const categories = ['餐飲', '時裝', '生活', '美容', '娛樂', '超市', '電器', '其他'];
const malls = [
  { id: 'mall_001', name: '又一城' },
  { id: 'mall_002', name: '荷里活廣場' },
  { id: 'mall_003', name: '大埔超級城' },
  { id: 'mall_004', name: '西九龍中心' },
];

const mockMerchants: Merchant[] = [
  {
    id: 'merch_001',
    name: 'Pacific Coffee',
    nameTW: '太平洋咖啡',
    nameEN: 'Pacific Coffee',
    mallId: 'mall_001',
    mallName: '又一城',
    floor: 'LG1',
    unit: 'L1-15',
    category: '餐飲',
    logo: '☕',
    phone: '+852 2123 4567',
    openingHours: '08:00 - 22:00',
    stampEnabled: true,
    stampRate: 1,
    status: 'active',
    createdAt: '2023-01-15',
  },
  {
    id: 'merch_002',
    name: 'UNIQLO',
    nameTW: '優衣庫',
    nameEN: 'UNIQLO',
    mallId: 'mall_001',
    mallName: '又一城',
    floor: '1',
    unit: '135-140',
    category: '時裝',
    logo: '👔',
    phone: '+852 2234 5678',
    openingHours: '10:00 - 22:00',
    stampEnabled: true,
    stampRate: 2,
    status: 'active',
    createdAt: '2023-02-20',
  },
  {
    id: 'merch_003',
    name: 'AEON',
    nameTW: '永旺',
    nameEN: 'AEON',
    mallId: 'mall_002',
    mallName: '荷里活廣場',
    floor: 'B',
    unit: 'B01-B50',
    category: '超市',
    logo: '🛒',
    phone: '+852 2345 6789',
    openingHours: '09:00 - 22:00',
    stampEnabled: true,
    stampRate: 1,
    status: 'active',
    createdAt: '2023-03-10',
  },
  {
    id: 'merch_004',
    name: 'Apple Store',
    nameTW: 'Apple 專賣店',
    nameEN: 'Apple Store',
    mallId: 'mall_001',
    mallName: '又一城',
    floor: 'G',
    unit: 'G01-G10',
    category: '電器',
    logo: '🍎',
    phone: '+852 2456 7890',
    openingHours: '10:00 - 21:00',
    stampEnabled: true,
    stampRate: 3,
    status: 'active',
    createdAt: '2023-04-05',
  },
  {
    id: 'merch_005',
    name: 'Sasa',
    nameTW: '莎莎',
    nameEN: 'Sasa',
    mallId: 'mall_003',
    mallName: '大埔超級城',
    floor: '1',
    unit: '108',
    category: '美容',
    logo: '💄',
    phone: '+852 2567 8901',
    openingHours: '10:00 - 22:00',
    stampEnabled: true,
    stampRate: 2,
    status: 'active',
    createdAt: '2023-05-15',
  },
];

const MerchantManagement: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedMall, setSelectedMall] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('customerApp.operationsManagement'), path: '/operations' },
      { title: t('customerApp.merchantManagement') },
    ]);
  }, [setBreadcrumbs, t]);

  const filteredMerchants = merchants.filter((m) => {
    const matchSearch =
      !searchText ||
      m.name.toLowerCase().includes(searchText.toLowerCase()) ||
      m.nameTW.includes(searchText);
    const matchMall = !selectedMall || m.mallId === selectedMall;
    const matchCategory = !selectedCategory || m.category === selectedCategory;
    return matchSearch && matchMall && matchCategory;
  });

  const handleAdd = () => {
    setEditingMerchant(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Merchant) => {
    setEditingMerchant(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setMerchants(merchants.filter((m) => m.id !== id));
    message.success(t('customerApp.merchantDeleted'));
  };

  const handleToggleStamp = (id: string, enabled: boolean) => {
    setMerchants(
      merchants.map((m) => (m.id === id ? { ...m, stampEnabled: enabled } : m))
    );
    message.success(enabled ? t('customerApp.stampEnabledMsg') : t('customerApp.stampDisabledMsg'));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mallName = malls.find((m) => m.id === values.mallId)?.name || '';

      const merchantData: Merchant = {
        id: editingMerchant?.id || `merch_${Date.now()}`,
        ...values,
        mallName,
        logo: values.logo || '🏪',
        createdAt: editingMerchant?.createdAt || new Date().toISOString().split('T')[0],
      };

      if (editingMerchant) {
        setMerchants(merchants.map((m) => (m.id === editingMerchant.id ? merchantData : m)));
        message.success(t('customerApp.merchantUpdated'));
      } else {
        setMerchants([...merchants, merchantData]);
        message.success(t('customerApp.merchantAdded'));
      }

      setModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleGenerateQR = (merchant: Merchant) => {
    Modal.info({
      title: t('customerApp.merchantQRCode'),
      content: (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div
            style={{
              width: 200,
              height: 200,
              margin: '0 auto',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              fontSize: 14,
              color: '#666',
            }}
          >
            <QrcodeOutlined style={{ fontSize: 80, color: '#1677ff' }} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Text strong>{merchant.nameTW}</Text>
            <br />
            <Text type="secondary">{merchant.mallName} · {merchant.floor}F</Text>
          </div>
          <div style={{ marginTop: 12 }}>
            <Button type="primary">{t('customerApp.downloadQRCode')}</Button>
          </div>
        </div>
      ),
      okText: t('common.confirm'),
      width: 360,
    });
  };

  const columns: ColumnsType<Merchant> = [
    {
      title: t('merchant.merchant'),
      key: 'merchant',
      render: (_, record) => (
        <Space>
          <Avatar size={40} style={{ background: '#f0f0f0', fontSize: 20 }}>
            {record.logo}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{record.nameTW}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.nameEN}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: t('customerApp.belongsToMall'),
      dataIndex: 'mallName',
      key: 'mallName',
    },
    {
      title: t('customerApp.location'),
      key: 'location',
      render: (_, record) => (
        <Text>
          {record.floor}F {record.unit}
        </Text>
      ),
    },
    {
      title: t('customerApp.category'),
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag>{cat}</Tag>,
    },
    {
      title: t('stamp.stamp'),
      key: 'stamp',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Switch
            size="small"
            checked={record.stampEnabled}
            onChange={(checked) => handleToggleStamp(record.id, checked)}
          />
          {record.stampEnabled && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              ${1}/{record.stampRate} {t('stamp.stamp')}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? t('customerApp.inBusiness') : t('customerApp.outOfBusiness')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<QrcodeOutlined />}
            onClick={() => handleGenerateQR(record)}
          >
            {t('customerApp.qrCode')}
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('customerApp.confirmDeleteMerchant')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>{t('customerApp.merchantList')}</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('customerApp.addMerchant')}
          </Button>
        }
      >
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder={t('customerApp.searchMerchantName')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder={t('customerApp.selectMall')}
              style={{ width: '100%' }}
              allowClear
              value={selectedMall || undefined}
              onChange={setSelectedMall}
            >
              {malls.map((m) => (
                <Select.Option key={m.id} value={m.id}>
                  {m.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder={t('customerApp.selectCategory')}
              style={{ width: '100%' }}
              allowClear
              value={selectedCategory || undefined}
              onChange={setSelectedCategory}
            >
              {categories.map((c) => (
                <Select.Option key={c} value={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredMerchants}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingMerchant ? t('customerApp.editMerchant') : t('customerApp.addMerchant')}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nameTW"
                label={t('customerApp.merchantNameCN')}
                rules={[{ required: true, message: t('customerApp.enterMerchantNameCN') }]}
              >
                <Input placeholder="例如：太平洋咖啡" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nameEN"
                label={t('customerApp.merchantNameEN')}
                rules={[{ required: true, message: t('customerApp.enterMerchantNameEN') }]}
              >
                <Input placeholder="e.g., Pacific Coffee" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                name="category"
                label={t('customerApp.category')}
                rules={[{ required: true, message: t('customerApp.selectCategory') }]}
              >
                <Select placeholder={t('customerApp.selectCategory')}>
                  {categories.map((c) => (
                    <Select.Option key={c} value={c}>
                      {c}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="floor"
                label={t('customerApp.floor')}
                rules={[{ required: true, message: t('customerApp.floor') }]}
              >
                <Input placeholder="例如：G" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label={t('customerApp.unit')}>
                <Input placeholder="例如：G01-G10" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="logo" label={t('customerApp.icon')}>
                <Input placeholder="例如：☕" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label={t('customerApp.contactPhone')}>
                <Input placeholder="+852 XXXX XXXX" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="openingHours" label={t('customerApp.openingHours')}>
                <Input placeholder="例如：10:00 - 22:00" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stampEnabled"
                label={t('customerApp.enableStamp')}
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="stampRate" label={t('customerApp.stampRate')}>
                <InputNumber min={1} max={10} placeholder="1" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label={t('common.status')}
                rules={[{ required: true, message: t('customerApp.selectStatus') }]}
              >
                <Select placeholder={t('customerApp.selectStatus')}>
                  <Select.Option value="active">{t('customerApp.inBusiness')}</Select.Option>
                  <Select.Option value="inactive">{t('customerApp.outOfBusiness')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MerchantManagement;
