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
  Statistic,
  Typography,
  Tabs,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store/app';
import { useLocale } from '../../hooks/useLocale';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Mall {
  id: string;
  name: string;
  nameTW: string;
  nameEN: string;
  region: string;
  address: string;
  floors: string[];
  merchantCount: number;
  memberCount: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  openingHours: string;
  contactPhone: string;
  contactEmail: string;
}

const regions = ['九龍', '香港島', '新界'];

const mockMalls: Mall[] = [
  {
    id: 'mall_001',
    name: 'Festival Walk',
    nameTW: '又一城',
    nameEN: 'Festival Walk',
    region: '九龍',
    address: '九龍塘達之路80號',
    floors: ['LG2', 'LG1', 'G', '1', '2', '3'],
    merchantCount: 45,
    memberCount: 15280,
    status: 'active',
    createdAt: '2020-01-15',
    openingHours: '10:00 - 22:00',
    contactPhone: '+852 2844 2222',
    contactEmail: 'info@festivalwalk.com.hk',
  },
  {
    id: 'mall_002',
    name: 'Hollywood Plaza',
    nameTW: '荷里活廣場',
    nameEN: 'Hollywood Plaza',
    region: '九龍',
    address: '九龍鑽石山龍蟠街3號',
    floors: ['B', 'G', '1', '2', '3'],
    merchantCount: 38,
    memberCount: 12450,
    status: 'active',
    createdAt: '2020-03-20',
    openingHours: '10:00 - 22:00',
    contactPhone: '+852 2327 8888',
    contactEmail: 'info@hollywoodplaza.com.hk',
  },
  {
    id: 'mall_003',
    name: 'Tai Po Mega Mall',
    nameTW: '大埔超級城',
    nameEN: 'Tai Po Mega Mall',
    region: '新界',
    address: '大埔安邦路8-10號',
    floors: ['G', '1', '2', '3', '4'],
    merchantCount: 52,
    memberCount: 18920,
    status: 'active',
    createdAt: '2019-08-10',
    openingHours: '10:00 - 22:00',
    contactPhone: '+852 2665 6868',
    contactEmail: 'info@tpmc.com.hk',
  },
  {
    id: 'mall_004',
    name: 'Dragon Centre',
    nameTW: '西九龍中心',
    nameEN: 'Dragon Centre',
    region: '九龍',
    address: '深水埗欽州街37K號',
    floors: ['B', 'G', '1', '2', '3', '4', '5', '6', '7', '8'],
    merchantCount: 68,
    memberCount: 22150,
    status: 'maintenance',
    createdAt: '2018-11-05',
    openingHours: '10:00 - 22:00',
    contactPhone: '+852 2360 0982',
    contactEmail: 'info@dragoncentre.com.hk',
  },
];

const MallManagement: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [malls, setMalls] = useState<Mall[]>(mockMalls);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMall, setEditingMall] = useState<Mall | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('customerApp.operationsManagement'), path: '/operations' },
      { title: t('customerApp.mallManagement') },
    ]);
  }, [setBreadcrumbs, t]);

  const handleAdd = () => {
    setEditingMall(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Mall) => {
    setEditingMall(record);
    form.setFieldsValue({
      ...record,
      floors: record.floors.join(', '),
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setMalls(malls.filter((m) => m.id !== id));
    message.success(t('customerApp.mallDeleted'));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mallData: Mall = {
        id: editingMall?.id || `mall_${Date.now()}`,
        ...values,
        floors: values.floors.split(',').map((f: string) => f.trim()),
        merchantCount: editingMall?.merchantCount || 0,
        memberCount: editingMall?.memberCount || 0,
        createdAt: editingMall?.createdAt || new Date().toISOString().split('T')[0],
      };

      if (editingMall) {
        setMalls(malls.map((m) => (m.id === editingMall.id ? mallData : m)));
        message.success(t('customerApp.mallUpdated'));
      } else {
        setMalls([...malls, mallData]);
        message.success(t('customerApp.mallAdded'));
      }

      setModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getStatusTag = (status: Mall['status']) => {
    const config = {
      active: { color: 'green', text: t('customerApp.operating') },
      inactive: { color: 'default', text: t('customerApp.closed') },
      maintenance: { color: 'orange', text: t('customerApp.maintenance') },
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const columns: ColumnsType<Mall> = [
    {
      title: t('customerApp.mallName'),
      key: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.nameTW}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.nameEN}
          </Text>
        </Space>
      ),
    },
    {
      title: t('customerApp.region'),
      dataIndex: 'region',
      key: 'region',
      filters: regions.map((r) => ({ text: r, value: r })),
      onFilter: (value, record) => record.region === value,
    },
    {
      title: t('customerApp.address'),
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: t('customerApp.floors'),
      key: 'floors',
      render: (_, record) => <Text>{t('customerApp.floorCount', { count: record.floors.length })}</Text>,
    },
    {
      title: t('customerApp.merchantCount'),
      dataIndex: 'merchantCount',
      key: 'merchantCount',
      sorter: (a, b) => a.merchantCount - b.merchantCount,
    },
    {
      title: t('customerApp.memberCount'),
      dataIndex: 'memberCount',
      key: 'memberCount',
      sorter: (a, b) => a.memberCount - b.memberCount,
      render: (v) => v.toLocaleString(),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      filters: [
        { text: t('customerApp.operating'), value: 'active' },
        { text: t('customerApp.closed'), value: 'inactive' },
        { text: t('customerApp.maintenance'), value: 'maintenance' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('customerApp.confirmDeleteMall')}
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

  const totalMerchants = malls.reduce((sum, m) => sum + m.merchantCount, 0);
  const totalMembers = malls.reduce((sum, m) => sum + m.memberCount, 0);
  const activeMalls = malls.filter((m) => m.status === 'active').length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('customerApp.totalMalls')}
              value={malls.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('customerApp.activeMalls')}
              value={activeMalls}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('customerApp.totalMerchants')}
              value={totalMerchants}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('customerApp.totalMembers')}
              value={totalMembers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>{t('customerApp.mallList')}</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('customerApp.addMall')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={malls}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingMall ? t('customerApp.editMall') : t('customerApp.addMall')}
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
                label={t('customerApp.mallNameCN')}
                rules={[{ required: true, message: t('customerApp.enterMallNameCN') }]}
              >
                <Input placeholder="例如：又一城" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nameEN"
                label={t('customerApp.mallNameEN')}
                rules={[{ required: true, message: t('customerApp.enterMallNameEN') }]}
              >
                <Input placeholder="e.g., Festival Walk" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="region"
                label={t('customerApp.region')}
                rules={[{ required: true, message: t('customerApp.selectRegion') }]}
              >
                <Select placeholder={t('customerApp.selectRegion')}>
                  {regions.map((r) => (
                    <Select.Option key={r} value={r}>
                      {r}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label={t('common.status')}
                rules={[{ required: true, message: t('customerApp.selectStatus') }]}
              >
                <Select placeholder={t('customerApp.selectStatus')}>
                  <Select.Option value="active">{t('customerApp.operating')}</Select.Option>
                  <Select.Option value="inactive">{t('customerApp.closed')}</Select.Option>
                  <Select.Option value="maintenance">{t('customerApp.maintenance')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label={t('customerApp.address')}
            rules={[{ required: true, message: t('customerApp.enterAddress') }]}
          >
            <Input placeholder={t('customerApp.enterAddress')} />
          </Form.Item>

          <Form.Item
            name="floors"
            label={t('customerApp.floorsCommaSeparated')}
            rules={[{ required: true, message: t('customerApp.enterFloors') }]}
          >
            <Input placeholder="例如：B, G, 1, 2, 3" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="openingHours" label={t('customerApp.openingHours')}>
                <Input placeholder="例如：10:00 - 22:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPhone" label={t('customerApp.contactPhone')}>
                <Input placeholder="+852 XXXX XXXX" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="contactEmail" label={t('customerApp.contactEmail')}>
            <Input placeholder="example@mall.com.hk" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MallManagement;
