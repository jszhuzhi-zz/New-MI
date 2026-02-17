import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Modal, Form, Select, DatePicker,
  InputNumber, message, Tooltip, Badge, Statistic, Row, Col, Switch, Popconfirm
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  GiftOutlined, SearchOutlined, CopyOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { RangePicker } = DatePicker;

interface Coupon {
  id: string;
  code: string;
  name: string;
  nameTW: string;
  nameEN: string;
  type: 'cash' | 'discount' | 'free_item' | 'parking';
  value: number;
  minSpend: number;
  totalQuantity: number;
  usedQuantity: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'depleted';
  targetMalls: string[];
  targetCategories: string[];
  perUserLimit: number;
  createdAt: string;
}

const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'CNY2026',
    name: '新春現金券',
    nameTW: '新春現金券',
    nameEN: 'CNY Cash Voucher',
    type: 'cash',
    value: 50,
    minSpend: 300,
    totalQuantity: 5000,
    usedQuantity: 3250,
    startDate: '2026-01-28',
    endDate: '2026-02-11',
    status: 'expired',
    targetMalls: ['全部商場'],
    targetCategories: ['全部'],
    perUserLimit: 3,
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    code: 'SPRING15',
    name: '春季85折',
    nameTW: '春季85折',
    nameEN: 'Spring 15% Off',
    type: 'discount',
    value: 15,
    minSpend: 500,
    totalQuantity: 3000,
    usedQuantity: 1520,
    startDate: '2026-02-15',
    endDate: '2026-03-31',
    status: 'active',
    targetMalls: ['荃灣廣場', '樂富廣場'],
    targetCategories: ['時裝'],
    perUserLimit: 2,
    createdAt: '2026-02-01',
  },
  {
    id: '3',
    code: 'FREECOFFEE',
    name: '免費咖啡券',
    nameTW: '免費咖啡券',
    nameEN: 'Free Coffee Voucher',
    type: 'free_item',
    value: 1,
    minSpend: 200,
    totalQuantity: 1000,
    usedQuantity: 680,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'active',
    targetMalls: ['全部商場'],
    targetCategories: ['餐飲'],
    perUserLimit: 1,
    createdAt: '2026-01-25',
  },
  {
    id: '4',
    code: 'PARKING3H',
    name: '三小時免費泊車',
    nameTW: '三小時免費泊車',
    nameEN: '3 Hours Free Parking',
    type: 'parking',
    value: 3,
    minSpend: 500,
    totalQuantity: 2000,
    usedQuantity: 0,
    startDate: '2026-03-01',
    endDate: '2026-06-30',
    status: 'scheduled',
    targetMalls: ['又一城', 'T.O.P'],
    targetCategories: ['全部'],
    perUserLimit: 5,
    createdAt: '2026-02-15',
  },
];

const malls = ['荃灣廣場', '樂富廣場', '又一城', 'T.O.P', '赤柱廣場'];
const categories = ['全部', '餐飲', '時裝', '娛樂', '美容', '電子產品'];

export default function CouponManagement() {
  const { locale } = useLocale();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const labels: Record<string, Record<string, string>> = {
    title: { 'zh-TW': '優惠券管理', 'zh-CN': '优惠券管理', en: 'Coupon Management' },
    addCoupon: { 'zh-TW': '新增優惠券', 'zh-CN': '新增优惠券', en: 'Add Coupon' },
    editCoupon: { 'zh-TW': '編輯優惠券', 'zh-CN': '编辑优惠券', en: 'Edit Coupon' },
    couponCode: { 'zh-TW': '優惠碼', 'zh-CN': '优惠码', en: 'Coupon Code' },
    name: { 'zh-TW': '名稱', 'zh-CN': '名称', en: 'Name' },
    nameTW: { 'zh-TW': '繁體中文名稱', 'zh-CN': '繁体中文名称', en: 'Traditional Chinese Name' },
    nameEN: { 'zh-TW': '英文名稱', 'zh-CN': '英文名称', en: 'English Name' },
    type: { 'zh-TW': '類型', 'zh-CN': '类型', en: 'Type' },
    cash: { 'zh-TW': '現金券', 'zh-CN': '现金券', en: 'Cash Voucher' },
    discount: { 'zh-TW': '折扣券', 'zh-CN': '折扣券', en: 'Discount' },
    free_item: { 'zh-TW': '免費禮品', 'zh-CN': '免费礼品', en: 'Free Item' },
    parking: { 'zh-TW': '泊車券', 'zh-CN': '泊车券', en: 'Parking Voucher' },
    value: { 'zh-TW': '面值', 'zh-CN': '面值', en: 'Value' },
    minSpend: { 'zh-TW': '最低消費', 'zh-CN': '最低消费', en: 'Min. Spend' },
    quantity: { 'zh-TW': '數量', 'zh-CN': '数量', en: 'Quantity' },
    used: { 'zh-TW': '已使用', 'zh-CN': '已使用', en: 'Used' },
    remaining: { 'zh-TW': '剩餘', 'zh-CN': '剩余', en: 'Remaining' },
    dateRange: { 'zh-TW': '有效期', 'zh-CN': '有效期', en: 'Validity' },
    status: { 'zh-TW': '狀態', 'zh-CN': '状态', en: 'Status' },
    active: { 'zh-TW': '進行中', 'zh-CN': '进行中', en: 'Active' },
    scheduled: { 'zh-TW': '已排程', 'zh-CN': '已排程', en: 'Scheduled' },
    expired: { 'zh-TW': '已過期', 'zh-CN': '已过期', en: 'Expired' },
    depleted: { 'zh-TW': '已用完', 'zh-CN': '已用完', en: 'Depleted' },
    targetMalls: { 'zh-TW': '適用商場', 'zh-CN': '适用商场', en: 'Target Malls' },
    targetCategories: { 'zh-TW': '適用類別', 'zh-CN': '适用类别', en: 'Target Categories' },
    perUserLimit: { 'zh-TW': '每人限領', 'zh-CN': '每人限领', en: 'Per User Limit' },
    actions: { 'zh-TW': '操作', 'zh-CN': '操作', en: 'Actions' },
    save: { 'zh-TW': '保存', 'zh-CN': '保存', en: 'Save' },
    cancel: { 'zh-TW': '取消', 'zh-CN': '取消', en: 'Cancel' },
    delete: { 'zh-TW': '刪除', 'zh-CN': '删除', en: 'Delete' },
    confirmDelete: { 'zh-TW': '確定刪除此優惠券？', 'zh-CN': '确定删除此优惠券？', en: 'Delete this coupon?' },
    saveSuccess: { 'zh-TW': '保存成功', 'zh-CN': '保存成功', en: 'Saved successfully' },
    totalCoupons: { 'zh-TW': '總優惠券', 'zh-CN': '总优惠券', en: 'Total Coupons' },
    activeCoupons: { 'zh-TW': '進行中', 'zh-CN': '进行中', en: 'Active' },
    totalRedeemed: { 'zh-TW': '已兌換', 'zh-CN': '已兑换', en: 'Total Redeemed' },
    search: { 'zh-TW': '搜索優惠券', 'zh-CN': '搜索优惠券', en: 'Search coupons' },
    copyCode: { 'zh-TW': '複製優惠碼', 'zh-CN': '复制优惠码', en: 'Copy Code' },
    copied: { 'zh-TW': '已複製', 'zh-CN': '已复制', en: 'Copied' },
    allMalls: { 'zh-TW': '全部商場', 'zh-CN': '全部商场', en: 'All Malls' },
    times: { 'zh-TW': '次', 'zh-CN': '次', en: 'times' },
    hours: { 'zh-TW': '小時', 'zh-CN': '小时', en: 'hours' },
  };

  const tl = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success(tl('copied'));
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.setFieldsValue(coupon);
    setIsModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Saving coupon:', values);
      message.success(tl('saveSuccess'));
      setIsModalVisible(false);
    });
  };

  const filteredCoupons = mockCoupons.filter(c =>
    !searchText ||
    c.code.toLowerCase().includes(searchText.toLowerCase()) ||
    c.nameTW.includes(searchText) ||
    c.nameEN.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'cash': return `HK$${value}`;
      case 'discount': return `${value}% OFF`;
      case 'free_item': return `${value} ${locale === 'en' ? 'item(s)' : '件'}`;
      case 'parking': return `${value} ${tl('hours')}`;
      default: return value;
    }
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: tl('couponCode'),
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code) => (
        <Space>
          <Tag color="blue" style={{ fontFamily: 'monospace' }}>{code}</Tag>
          <Tooltip title={tl('copyCode')}>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyCode(code)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: tl('name'),
      key: 'name',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.nameTW}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.nameEN}</div>
        </div>
      ),
    },
    {
      title: tl('type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const colors: Record<string, string> = {
          cash: 'gold',
          discount: 'green',
          free_item: 'purple',
          parking: 'blue',
        };
        return <Tag color={colors[type]}>{tl(type)}</Tag>;
      },
    },
    {
      title: tl('value'),
      key: 'value',
      width: 100,
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: '#00694B' }}>
          {formatValue(record.type, record.value)}
        </span>
      ),
    },
    {
      title: tl('minSpend'),
      dataIndex: 'minSpend',
      key: 'minSpend',
      width: 100,
      render: (val) => `HK$${val}`,
    },
    {
      title: `${tl('used')} / ${tl('quantity')}`,
      key: 'usage',
      width: 120,
      render: (_, record) => (
        <span>
          <span style={{ color: '#1890ff' }}>{record.usedQuantity.toLocaleString()}</span>
          {' / '}
          {record.totalQuantity.toLocaleString()}
        </span>
      ),
    },
    {
      title: tl('dateRange'),
      key: 'dateRange',
      width: 160,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: 12 }}>{record.startDate}</span>
          <span style={{ fontSize: 12 }}>~ {record.endDate}</span>
        </Space>
      ),
    },
    {
      title: tl('status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors: Record<string, string> = {
          active: 'success',
          scheduled: 'processing',
          expired: 'default',
          depleted: 'error',
        };
        return <Badge status={colors[status] as any} text={tl(status)} />;
      },
    },
    {
      title: tl('actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title={tl('editCoupon')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm title={tl('confirmDelete')}>
            <Tooltip title={tl('delete')}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeCoupons = mockCoupons.filter(c => c.status === 'active').length;
  const totalRedeemed = mockCoupons.reduce((sum, c) => sum + c.usedQuantity, 0);

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={tl('totalCoupons')}
              value={mockCoupons.length}
              prefix={<GiftOutline />}
              valueStyle={{ color: '#00694B' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={tl('activeCoupons')}
              value={activeCoupons}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={tl('totalRedeemed')}
              value={totalRedeemed}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Coupon Table */}
      <Card
        title={tl('title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {tl('addCoupon')}
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder={tl('search')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredCoupons}
          rowKey="id"
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Coupon Modal */}
      <Modal
        title={editingCoupon ? tl('editCoupon') : tl('addCoupon')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okText={tl('save')}
        cancelText={tl('cancel')}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label={tl('couponCode')} rules={[{ required: true }]}>
                <Input style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nameTW" label={tl('nameTW')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nameEN" label={tl('nameEN')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label={tl('type')} rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="cash">{tl('cash')}</Select.Option>
                  <Select.Option value="discount">{tl('discount')}</Select.Option>
                  <Select.Option value="free_item">{tl('free_item')}</Select.Option>
                  <Select.Option value="parking">{tl('parking')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="value" label={tl('value')} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minSpend" label={tl('minSpend')}>
                <InputNumber style={{ width: '100%' }} min={0} prefix="HK$" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="totalQuantity" label={tl('quantity')} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="perUserLimit" label={tl('perUserLimit')}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateRange" label={tl('dateRange')} rules={[{ required: true }]}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="targetMalls" label={tl('targetMalls')}>
                <Select mode="multiple" placeholder={tl('allMalls')}>
                  {malls.map(mall => <Select.Option key={mall} value={mall}>{mall}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetCategories" label={tl('targetCategories')}>
                <Select mode="multiple">
                  {categories.map(cat => <Select.Option key={cat} value={cat}>{cat}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

// Fix missing icon
const GiftOutline = () => <GiftOutlined />;
