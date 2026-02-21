import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Modal, Form, Select, DatePicker,
  message, Tooltip, Badge, Statistic, Row, Col, Upload, Switch, Tabs
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CalendarOutlined, GiftOutlined, SearchOutlined, UploadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { RangePicker } = DatePicker;

interface Campaign {
  id: string;
  name: string;
  nameTW: string;
  nameEN: string;
  description: string;
  type: 'stamp_multiplier' | 'discount' | 'gift' | 'event';
  multiplier?: number;
  discountRate?: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'scheduled' | 'ended';
  targetMalls: string[];
  targetMerchants: string[];
  participantCount: number;
  image?: string;
  createdAt: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: '新春三倍印花',
    nameTW: '新春三倍印花',
    nameEN: 'Triple Stamps for CNY',
    description: '農曆新年期間全場消費三倍印花',
    type: 'stamp_multiplier',
    multiplier: 3,
    startDate: '2026-01-28',
    endDate: '2026-02-11',
    status: 'ended',
    targetMalls: ['全部商場'],
    targetMerchants: ['全部商戶'],
    participantCount: 8560,
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: '春季美食節',
    nameTW: '春季美食節',
    nameEN: 'Spring Food Festival',
    description: '指定餐飲商戶消費滿$200減$30',
    type: 'discount',
    discountRate: 15,
    startDate: '2026-02-15',
    endDate: '2026-03-31',
    status: 'active',
    targetMalls: ['荃灣廣場', '樂富廣場'],
    targetMerchants: ['餐飲類'],
    participantCount: 3240,
    createdAt: '2026-02-01',
  },
  {
    id: '3',
    name: '會員生日雙倍賞',
    nameTW: '會員生日雙倍賞',
    nameEN: 'Birthday Double Rewards',
    description: '會員生日月份享雙倍印花',
    type: 'stamp_multiplier',
    multiplier: 2,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active',
    targetMalls: ['全部商場'],
    targetMerchants: ['全部商戶'],
    participantCount: 12500,
    createdAt: '2025-12-20',
  },
  {
    id: '4',
    name: '復活節親子活動',
    nameTW: '復活節親子活動',
    nameEN: 'Easter Family Event',
    description: '復活節期間舉辦親子活動',
    type: 'event',
    startDate: '2026-04-05',
    endDate: '2026-04-15',
    status: 'scheduled',
    targetMalls: ['又一城', 'T.O.P'],
    targetMerchants: [],
    participantCount: 0,
    createdAt: '2026-02-10',
  },
];

const malls = ['荃灣廣場', '樂富廣場', '又一城', 'T.O.P', '赤柱廣場'];

export default function CampaignManagement() {
  const { locale } = useLocale();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  const labels: Record<string, Record<string, string>> = {
    title: { 'zh-TW': '活動管理', 'zh-CN': '活动管理', en: 'Campaign Management' },
    addCampaign: { 'zh-TW': '新增活動', 'zh-CN': '新增活动', en: 'Add Campaign' },
    editCampaign: { 'zh-TW': '編輯活動', 'zh-CN': '编辑活动', en: 'Edit Campaign' },
    name: { 'zh-TW': '活動名稱', 'zh-CN': '活动名称', en: 'Campaign Name' },
    nameTW: { 'zh-TW': '繁體中文名稱', 'zh-CN': '繁体中文名称', en: 'Traditional Chinese Name' },
    nameEN: { 'zh-TW': '英文名稱', 'zh-CN': '英文名称', en: 'English Name' },
    description: { 'zh-TW': '描述', 'zh-CN': '描述', en: 'Description' },
    type: { 'zh-TW': '活動類型', 'zh-CN': '活动类型', en: 'Campaign Type' },
    stampMultiplier: { 'zh-TW': '印花倍數', 'zh-CN': '印花倍数', en: 'Stamp Multiplier' },
    discount: { 'zh-TW': '折扣優惠', 'zh-CN': '折扣优惠', en: 'Discount' },
    gift: { 'zh-TW': '禮品活動', 'zh-CN': '礼品活动', en: 'Gift Campaign' },
    event: { 'zh-TW': '活動推廣', 'zh-CN': '活动推广', en: 'Event Promotion' },
    multiplier: { 'zh-TW': '倍數', 'zh-CN': '倍数', en: 'Multiplier' },
    discountRate: { 'zh-TW': '折扣比例', 'zh-CN': '折扣比例', en: 'Discount Rate' },
    dateRange: { 'zh-TW': '活動日期', 'zh-CN': '活动日期', en: 'Date Range' },
    targetMalls: { 'zh-TW': '適用商場', 'zh-CN': '适用商场', en: 'Target Malls' },
    targetMerchants: { 'zh-TW': '適用商戶', 'zh-CN': '适用商户', en: 'Target Merchants' },
    status: { 'zh-TW': '狀態', 'zh-CN': '状态', en: 'Status' },
    draft: { 'zh-TW': '草稿', 'zh-CN': '草稿', en: 'Draft' },
    active: { 'zh-TW': '進行中', 'zh-CN': '进行中', en: 'Active' },
    scheduled: { 'zh-TW': '已排程', 'zh-CN': '已排程', en: 'Scheduled' },
    ended: { 'zh-TW': '已結束', 'zh-CN': '已结束', en: 'Ended' },
    all: { 'zh-TW': '全部', 'zh-CN': '全部', en: 'All' },
    participants: { 'zh-TW': '參與人數', 'zh-CN': '参与人数', en: 'Participants' },
    actions: { 'zh-TW': '操作', 'zh-CN': '操作', en: 'Actions' },
    save: { 'zh-TW': '保存', 'zh-CN': '保存', en: 'Save' },
    cancel: { 'zh-TW': '取消', 'zh-CN': '取消', en: 'Cancel' },
    saveSuccess: { 'zh-TW': '保存成功', 'zh-CN': '保存成功', en: 'Saved successfully' },
    totalCampaigns: { 'zh-TW': '總活動數', 'zh-CN': '总活动数', en: 'Total Campaigns' },
    activeCampaigns: { 'zh-TW': '進行中活動', 'zh-CN': '进行中活动', en: 'Active Campaigns' },
    totalParticipants: { 'zh-TW': '總參與人數', 'zh-CN': '总参与人数', en: 'Total Participants' },
    search: { 'zh-TW': '搜索活動', 'zh-CN': '搜索活动', en: 'Search campaigns' },
    coverImage: { 'zh-TW': '封面圖片', 'zh-CN': '封面图片', en: 'Cover Image' },
    uploadImage: { 'zh-TW': '上傳圖片', 'zh-CN': '上传图片', en: 'Upload Image' },
    allMalls: { 'zh-TW': '全部商場', 'zh-CN': '全部商场', en: 'All Malls' },
    allMerchants: { 'zh-TW': '全部商戶', 'zh-CN': '全部商户', en: 'All Merchants' },
    publish: { 'zh-TW': '發布', 'zh-CN': '发布', en: 'Publish' },
    preview: { 'zh-TW': '預覽', 'zh-CN': '预览', en: 'Preview' },
  };

  const tl = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  const typeLabels: Record<string, Record<string, string>> = {
    stamp_multiplier: { 'zh-TW': '印花倍數', 'zh-CN': '印花倍数', en: 'Stamp Multiplier' },
    discount: { 'zh-TW': '折扣優惠', 'zh-CN': '折扣优惠', en: 'Discount' },
    gift: { 'zh-TW': '禮品活動', 'zh-CN': '礼品活动', en: 'Gift' },
    event: { 'zh-TW': '活動推廣', 'zh-CN': '活动推广', en: 'Event' },
  };

  const filteredCampaigns = mockCampaigns.filter(c => {
    const matchSearch = !searchText ||
      c.name.includes(searchText) ||
      c.nameTW.includes(searchText) ||
      c.nameEN.toLowerCase().includes(searchText.toLowerCase());
    const matchTab = activeTab === 'all' || c.status === activeTab;
    return matchSearch && matchTab;
  });

  const handleAdd = () => {
    setEditingCampaign(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    form.setFieldsValue({
      ...campaign,
    });
    setIsModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Saving campaign:', values);
      message.success(tl('saveSuccess'));
      setIsModalVisible(false);
    });
  };

  const columns: ColumnsType<Campaign> = [
    {
      title: tl('name'),
      key: 'name',
      width: 200,
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
      width: 120,
      render: (type, record) => {
        const colors: Record<string, string> = {
          stamp_multiplier: 'gold',
          discount: 'green',
          gift: 'purple',
          event: 'blue',
        };
        return (
          <Tag color={colors[type]}>
            {typeLabels[type]?.[locale]}
            {type === 'stamp_multiplier' && record.multiplier && ` ${record.multiplier}x`}
            {type === 'discount' && record.discountRate && ` ${record.discountRate}%`}
          </Tag>
        );
      },
    },
    {
      title: tl('dateRange'),
      key: 'dateRange',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: 12 }}>{record.startDate}</span>
          <span style={{ fontSize: 12 }}>~ {record.endDate}</span>
        </Space>
      ),
    },
    {
      title: tl('targetMalls'),
      dataIndex: 'targetMalls',
      key: 'targetMalls',
      width: 150,
      render: (malls: string[]) => (
        <Tooltip title={malls.join(', ')}>
          <span>{malls[0]}{malls.length > 1 && ` +${malls.length - 1}`}</span>
        </Tooltip>
      ),
    },
    {
      title: tl('status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors: Record<string, string> = {
          draft: 'default',
          active: 'success',
          scheduled: 'processing',
          ended: 'default',
        };
        return <Badge status={colors[status] as any} text={tl(status)} />;
      },
    },
    {
      title: tl('participants'),
      dataIndex: 'participantCount',
      key: 'participantCount',
      width: 100,
      render: (count) => count.toLocaleString(),
    },
    {
      title: tl('actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title={tl('preview')}>
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title={tl('editCampaign')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Button type="primary" size="small">
              {tl('publish')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const activeCampaigns = mockCampaigns.filter(c => c.status === 'active').length;
  const totalParticipants = mockCampaigns.reduce((sum, c) => sum + c.participantCount, 0);

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={tl('totalCampaigns')}
              value={mockCampaigns.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#00694B' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={tl('activeCampaigns')}
              value={activeCampaigns}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={tl('totalParticipants')}
              value={totalParticipants}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Campaign Table */}
      <Card
        title={tl('title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {tl('addCampaign')}
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder={tl('search')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: tl('all') },
              { key: 'active', label: tl('active') },
              { key: 'scheduled', label: tl('scheduled') },
              { key: 'ended', label: tl('ended') },
              { key: 'draft', label: tl('draft') },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredCampaigns}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Campaign Modal */}
      <Modal
        title={editingCampaign ? tl('editCampaign') : tl('addCampaign')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okText={tl('save')}
        cancelText={tl('cancel')}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nameTW" label={tl('nameTW')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nameEN" label={tl('nameEN')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label={tl('description')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label={tl('type')} rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="stamp_multiplier">{tl('stampMultiplier')}</Select.Option>
                  <Select.Option value="discount">{tl('discount')}</Select.Option>
                  <Select.Option value="gift">{tl('gift')}</Select.Option>
                  <Select.Option value="event">{tl('event')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.type !== curr.type}
              >
                {({ getFieldValue }) => {
                  const type = getFieldValue('type');
                  if (type === 'stamp_multiplier') {
                    return (
                      <Form.Item name="multiplier" label={tl('multiplier')}>
                        <Select>
                          <Select.Option value={2}>2x</Select.Option>
                          <Select.Option value={3}>3x</Select.Option>
                          <Select.Option value={5}>5x</Select.Option>
                        </Select>
                      </Form.Item>
                    );
                  }
                  if (type === 'discount') {
                    return (
                      <Form.Item name="discountRate" label={tl('discountRate')}>
                        <Select>
                          <Select.Option value={10}>10%</Select.Option>
                          <Select.Option value={15}>15%</Select.Option>
                          <Select.Option value={20}>20%</Select.Option>
                          <Select.Option value={30}>30%</Select.Option>
                        </Select>
                      </Form.Item>
                    );
                  }
                  return null;
                }}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="dateRange" label={tl('dateRange')} rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="targetMalls" label={tl('targetMalls')}>
                <Select mode="multiple" placeholder={tl('allMalls')}>
                  {malls.map(mall => <Select.Option key={mall} value={mall}>{mall}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetMerchants" label={tl('targetMerchants')}>
                <Select mode="multiple" placeholder={tl('allMerchants')}>
                  <Select.Option value="餐飲類">餐飲類</Select.Option>
                  <Select.Option value="時裝類">時裝類</Select.Option>
                  <Select.Option value="娛樂類">娛樂類</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="image" label={tl('coverImage')}>
            <Upload listType="picture-card">
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>{tl('uploadImage')}</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
