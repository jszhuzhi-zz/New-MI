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
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [malls, setMalls] = useState<Mall[]>(mockMalls);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMall, setEditingMall] = useState<Mall | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: '營運管理', path: '/operations' },
      { title: '商場管理' },
    ]);
  }, [setBreadcrumbs]);

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
    message.success('商場已刪除');
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
        message.success('商場資料已更新');
      } else {
        setMalls([...malls, mallData]);
        message.success('商場已新增');
      }

      setModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getStatusTag = (status: Mall['status']) => {
    const config = {
      active: { color: 'green', text: '營運中' },
      inactive: { color: 'default', text: '已停用' },
      maintenance: { color: 'orange', text: '維護中' },
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const columns: ColumnsType<Mall> = [
    {
      title: '商場名稱',
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
      title: '地區',
      dataIndex: 'region',
      key: 'region',
      filters: regions.map((r) => ({ text: r, value: r })),
      onFilter: (value, record) => record.region === value,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '樓層',
      key: 'floors',
      render: (_, record) => <Text>{record.floors.length} 層</Text>,
    },
    {
      title: '商戶數',
      dataIndex: 'merchantCount',
      key: 'merchantCount',
      sorter: (a, b) => a.merchantCount - b.merchantCount,
    },
    {
      title: '會員數',
      dataIndex: 'memberCount',
      key: 'memberCount',
      sorter: (a, b) => a.memberCount - b.memberCount,
      render: (v) => v.toLocaleString(),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      filters: [
        { text: '營運中', value: 'active' },
        { text: '已停用', value: 'inactive' },
        { text: '維護中', value: 'maintenance' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除此商場嗎？"
            onConfirm={() => handleDelete(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              刪除
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
              title="商場總數"
              value={malls.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="營運中商場"
              value={activeMalls}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總商戶數"
              value={totalMerchants}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總會員數"
              value={totalMembers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>商場列表</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增商場
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
        title={editingMall ? '編輯商場' : '新增商場'}
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
                label="商場名稱 (中文)"
                rules={[{ required: true, message: '請輸入商場中文名稱' }]}
              >
                <Input placeholder="例如：又一城" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nameEN"
                label="商場名稱 (英文)"
                rules={[{ required: true, message: '請輸入商場英文名稱' }]}
              >
                <Input placeholder="e.g., Festival Walk" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="region"
                label="地區"
                rules={[{ required: true, message: '請選擇地區' }]}
              >
                <Select placeholder="選擇地區">
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
                label="狀態"
                rules={[{ required: true, message: '請選擇狀態' }]}
              >
                <Select placeholder="選擇狀態">
                  <Select.Option value="active">營運中</Select.Option>
                  <Select.Option value="inactive">已停用</Select.Option>
                  <Select.Option value="maintenance">維護中</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '請輸入地址' }]}
          >
            <Input placeholder="完整地址" />
          </Form.Item>

          <Form.Item
            name="floors"
            label="樓層 (以逗號分隔)"
            rules={[{ required: true, message: '請輸入樓層' }]}
          >
            <Input placeholder="例如：B, G, 1, 2, 3" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="openingHours" label="營業時間">
                <Input placeholder="例如：10:00 - 22:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPhone" label="聯繫電話">
                <Input placeholder="+852 XXXX XXXX" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="contactEmail" label="聯繫電郵">
            <Input placeholder="example@mall.com.hk" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MallManagement;
