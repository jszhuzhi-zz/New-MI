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
  InputNumber,
  Statistic,
  Progress,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store/app';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Gift {
  id: string;
  name: string;
  nameTW: string;
  nameEN: string;
  category: string;
  stamps: number;
  originalValue: number; // HKD
  description: string;
  image: string;
  totalStock: number;
  remainingStock: number;
  redemptions: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const categories = ['禮券', '生活', '娛樂', '體驗', '餐飲', '服務'];

const mockGifts: Gift[] = [
  {
    id: 'gift_001',
    name: 'HK$50 Mall Voucher',
    nameTW: 'HK$50商場禮券',
    nameEN: 'HK$50 Mall Voucher',
    category: '禮券',
    stamps: 500,
    originalValue: 50,
    description: '可於商場內任何商戶使用',
    image: '🎟️',
    totalStock: 500,
    remainingStock: 385,
    redemptions: 115,
    status: 'active',
    featured: false,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01',
  },
  {
    id: 'gift_002',
    name: 'HK$100 Mall Voucher',
    nameTW: 'HK$100商場禮券',
    nameEN: 'HK$100 Mall Voucher',
    category: '禮券',
    stamps: 950,
    originalValue: 100,
    description: '可於商場內任何商戶使用',
    image: '🎫',
    totalStock: 300,
    remainingStock: 186,
    redemptions: 114,
    status: 'active',
    featured: true,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01',
  },
  {
    id: 'gift_003',
    name: 'Movie Ticket x2',
    nameTW: '電影戲票兩張',
    nameEN: 'Movie Ticket x2',
    category: '娛樂',
    stamps: 600,
    originalValue: 200,
    description: '指定影院電影票兩張',
    image: '🎬',
    totalStock: 200,
    remainingStock: 45,
    redemptions: 155,
    status: 'active',
    featured: true,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    createdAt: '2024-01-01',
  },
  {
    id: 'gift_004',
    name: 'Parking Coupon x5',
    nameTW: '泊車券五張',
    nameEN: 'Parking Coupon x5',
    category: '服務',
    stamps: 400,
    originalValue: 150,
    description: '商場免費泊車三小時',
    image: '🅿️',
    totalStock: 1000,
    remainingStock: 0,
    redemptions: 1000,
    status: 'out_of_stock',
    featured: true,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01',
  },
  {
    id: 'gift_005',
    name: 'Spa Voucher',
    nameTW: 'SPA體驗券',
    nameEN: 'Spa Voucher',
    category: '體驗',
    stamps: 1500,
    originalValue: 500,
    description: '60分鐘水療體驗',
    image: '💆',
    totalStock: 50,
    remainingStock: 32,
    redemptions: 18,
    status: 'active',
    featured: false,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01',
  },
];

const GiftManagement: React.FC = () => {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [gifts, setGifts] = useState<Gift[]>(mockGifts);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: '營運管理', path: '/operations' },
      { title: '禮品管理' },
    ]);
  }, [setBreadcrumbs]);

  const filteredGifts = gifts.filter((g) => {
    const matchSearch =
      !searchText ||
      g.name.toLowerCase().includes(searchText.toLowerCase()) ||
      g.nameTW.includes(searchText);
    const matchCategory = !selectedCategory || g.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleAdd = () => {
    setEditingGift(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Gift) => {
    setEditingGift(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setGifts(gifts.filter((g) => g.id !== id));
    message.success('禮品已刪除');
  };

  const handleToggleFeatured = (id: string, featured: boolean) => {
    setGifts(gifts.map((g) => (g.id === id ? { ...g, featured } : g)));
    message.success(featured ? '已設為熱門' : '已取消熱門');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const giftData: Gift = {
        id: editingGift?.id || `gift_${Date.now()}`,
        ...values,
        image: values.image || '🎁',
        totalStock: values.totalStock || 100,
        remainingStock: editingGift?.remainingStock ?? values.totalStock ?? 100,
        redemptions: editingGift?.redemptions || 0,
        status: values.status || 'active',
        createdAt: editingGift?.createdAt || new Date().toISOString().split('T')[0],
      };

      if (editingGift) {
        setGifts(gifts.map((g) => (g.id === editingGift.id ? giftData : g)));
        message.success('禮品資料已更新');
      } else {
        setGifts([...gifts, giftData]);
        message.success('禮品已新增');
      }

      setModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getStatusTag = (status: Gift['status']) => {
    const config = {
      active: { color: 'green', text: '上架中' },
      inactive: { color: 'default', text: '已下架' },
      out_of_stock: { color: 'red', text: '已售罄' },
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const columns: ColumnsType<Gift> = [
    {
      title: '禮品',
      key: 'gift',
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
              fontSize: 24,
            }}
          >
            {record.image}
          </div>
          <Space direction="vertical" size={0}>
            <Space>
              <Text strong>{record.nameTW}</Text>
              {record.featured && <Tag color="gold">熱門</Tag>}
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.nameEN}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: '類別',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag>{cat}</Tag>,
    },
    {
      title: '所需印花',
      dataIndex: 'stamps',
      key: 'stamps',
      sorter: (a, b) => a.stamps - b.stamps,
      render: (v) => (
        <Text strong style={{ color: '#C4A962' }}>
          {v.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '原價值',
      dataIndex: 'originalValue',
      key: 'originalValue',
      render: (v) => <Text>HK${v}</Text>,
    },
    {
      title: '庫存',
      key: 'stock',
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ width: 100 }}>
          <Text>
            {record.remainingStock} / {record.totalStock}
          </Text>
          <Progress
            percent={Math.round((record.remainingStock / record.totalStock) * 100)}
            size="small"
            showInfo={false}
            strokeColor={record.remainingStock < 50 ? '#ff4d4f' : '#52c41a'}
          />
        </Space>
      ),
    },
    {
      title: '兌換次數',
      dataIndex: 'redemptions',
      key: 'redemptions',
      sorter: (a, b) => a.redemptions - b.redemptions,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: '熱門',
      key: 'featured',
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.featured}
          onChange={(checked) => handleToggleFeatured(record.id, checked)}
        />
      ),
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
            title="確定要刪除此禮品嗎？"
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

  const totalRedemptions = gifts.reduce((sum, g) => sum + g.redemptions, 0);
  const activeGifts = gifts.filter((g) => g.status === 'active').length;
  const lowStockGifts = gifts.filter((g) => g.remainingStock < 50 && g.status === 'active').length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="禮品總數"
              value={gifts.length}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="上架中"
              value={activeGifts}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總兌換次數"
              value={totalRedemptions}
              valueStyle={{ color: '#C4A962' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="低庫存警告"
              value={lowStockGifts}
              valueStyle={{ color: lowStockGifts > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>禮品列表</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增禮品
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="搜尋禮品名稱"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="選擇類別"
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
          dataSource={filteredGifts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingGift ? '編輯禮品' : '新增禮品'}
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
                label="禮品名稱 (中文)"
                rules={[{ required: true, message: '請輸入禮品中文名稱' }]}
              >
                <Input placeholder="例如：HK$50商場禮券" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nameEN"
                label="禮品名稱 (英文)"
                rules={[{ required: true, message: '請輸入禮品英文名稱' }]}
              >
                <Input placeholder="e.g., HK$50 Mall Voucher" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="category"
                label="類別"
                rules={[{ required: true, message: '請選擇類別' }]}
              >
                <Select placeholder="選擇類別">
                  {categories.map((c) => (
                    <Select.Option key={c} value={c}>
                      {c}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stamps"
                label="所需印花"
                rules={[{ required: true, message: '請輸入所需印花' }]}
              >
                <InputNumber min={1} placeholder="500" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="originalValue" label="原價值 (HKD)">
                <InputNumber min={0} placeholder="50" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="描述">
            <TextArea rows={2} placeholder="禮品描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="image" label="圖示">
                <Input placeholder="例如：🎟️" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="totalStock"
                label="總庫存"
                rules={[{ required: true, message: '請輸入總庫存' }]}
              >
                <InputNumber min={1} placeholder="100" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="狀態"
                rules={[{ required: true, message: '請選擇狀態' }]}
              >
                <Select placeholder="選擇狀態">
                  <Select.Option value="active">上架中</Select.Option>
                  <Select.Option value="inactive">已下架</Select.Option>
                  <Select.Option value="out_of_stock">已售罄</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="開始日期">
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="結束日期">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="featured" label="設為熱門" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GiftManagement;
