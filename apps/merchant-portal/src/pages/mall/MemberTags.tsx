import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Modal, Form, Select, message,
  Tooltip, Badge, Statistic, Row, Col, Progress, Popconfirm, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined,
  UserOutlined, SendOutlined, SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

interface MemberTag {
  id: string;
  name: string;
  color: string;
  description: string;
  memberCount: number;
  autoRule?: string;
  createdAt: string;
}

interface MarketingCampaign {
  id: string;
  name: string;
  targetTags: string[];
  targetCount: number;
  sentCount: number;
  openRate: number;
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
  scheduledAt?: string;
  sentAt?: string;
}

const mockTags: MemberTag[] = [
  { id: '1', name: 'VIP', color: 'gold', description: '年消費超過HK$50,000的會員', memberCount: 1250, autoRule: 'total_spent >= 50000', createdAt: '2024-01-15' },
  { id: '2', name: '高消費', color: 'purple', description: '單次消費超過HK$1,000', memberCount: 890, autoRule: 'max_transaction >= 1000', createdAt: '2024-02-20' },
  { id: '3', name: '新會員', color: 'green', description: '加入不超過30天的會員', memberCount: 456, autoRule: 'days_since_join <= 30', createdAt: '2024-03-01' },
  { id: '4', name: '美食愛好者', color: 'orange', description: '經常在餐飲商戶消費', memberCount: 2340, autoRule: 'food_transactions >= 10', createdAt: '2024-03-15' },
  { id: '5', name: '時尚達人', color: 'pink', description: '經常在時裝店消費', memberCount: 1680, autoRule: 'fashion_transactions >= 5', createdAt: '2024-04-01' },
  { id: '6', name: '電影愛好者', color: 'blue', description: '經常購買電影票', memberCount: 980, autoRule: 'cinema_transactions >= 3', createdAt: '2024-04-20' },
  { id: '7', name: '親子家庭', color: 'cyan', description: '有兒童相關消費記錄', memberCount: 1520, createdAt: '2024-05-10' },
  { id: '8', name: '長者', color: 'gray', description: '65歲以上會員', memberCount: 320, autoRule: 'age >= 65', createdAt: '2024-06-01' },
];

const mockCampaigns: MarketingCampaign[] = [
  { id: '1', name: '新春優惠推送', targetTags: ['VIP', '高消費'], targetCount: 2140, sentCount: 2140, openRate: 45.2, status: 'completed', sentAt: '2026-02-01' },
  { id: '2', name: '美食節活動通知', targetTags: ['美食愛好者'], targetCount: 2340, sentCount: 2340, openRate: 38.5, status: 'completed', sentAt: '2026-02-10' },
  { id: '3', name: '新會員歡迎禮', targetTags: ['新會員'], targetCount: 456, sentCount: 0, openRate: 0, status: 'scheduled', scheduledAt: '2026-02-20' },
  { id: '4', name: '電影周末優惠', targetTags: ['電影愛好者', 'VIP'], targetCount: 1230, sentCount: 0, openRate: 0, status: 'draft' },
];

export default function MemberTags() {
  const { locale } = useLocale();
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [isCampaignModalVisible, setIsCampaignModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<MemberTag | null>(null);
  const [tagForm] = Form.useForm();
  const [campaignForm] = Form.useForm();

  const labels: Record<string, Record<string, string>> = {
    title: { 'zh-TW': '會員標籤', 'zh-CN': '会员标签', en: 'Member Tags' },
    marketing: { 'zh-TW': '精準營銷', 'zh-CN': '精准营销', en: 'Targeted Marketing' },
    addTag: { 'zh-TW': '新增標籤', 'zh-CN': '新增标签', en: 'Add Tag' },
    editTag: { 'zh-TW': '編輯標籤', 'zh-CN': '编辑标签', en: 'Edit Tag' },
    tagName: { 'zh-TW': '標籤名稱', 'zh-CN': '标签名称', en: 'Tag Name' },
    description: { 'zh-TW': '描述', 'zh-CN': '描述', en: 'Description' },
    color: { 'zh-TW': '顏色', 'zh-CN': '颜色', en: 'Color' },
    autoRule: { 'zh-TW': '自動規則', 'zh-CN': '自动规则', en: 'Auto Rule' },
    memberCount: { 'zh-TW': '會員數量', 'zh-CN': '会员数量', en: 'Member Count' },
    createdAt: { 'zh-TW': '創建日期', 'zh-CN': '创建日期', en: 'Created At' },
    actions: { 'zh-TW': '操作', 'zh-CN': '操作', en: 'Actions' },
    save: { 'zh-TW': '保存', 'zh-CN': '保存', en: 'Save' },
    cancel: { 'zh-TW': '取消', 'zh-CN': '取消', en: 'Cancel' },
    delete: { 'zh-TW': '刪除', 'zh-CN': '删除', en: 'Delete' },
    confirmDelete: { 'zh-TW': '確定刪除此標籤？', 'zh-CN': '确定删除此标签？', en: 'Delete this tag?' },
    saveSuccess: { 'zh-TW': '保存成功', 'zh-CN': '保存成功', en: 'Saved successfully' },
    deleteSuccess: { 'zh-TW': '刪除成功', 'zh-CN': '删除成功', en: 'Deleted successfully' },
    createCampaign: { 'zh-TW': '創建營銷活動', 'zh-CN': '创建营销活动', en: 'Create Campaign' },
    campaignName: { 'zh-TW': '活動名稱', 'zh-CN': '活动名称', en: 'Campaign Name' },
    targetTags: { 'zh-TW': '目標標籤', 'zh-CN': '目标标签', en: 'Target Tags' },
    targetCount: { 'zh-TW': '目標人數', 'zh-CN': '目标人数', en: 'Target Count' },
    sentCount: { 'zh-TW': '已發送', 'zh-CN': '已发送', en: 'Sent' },
    openRate: { 'zh-TW': '打開率', 'zh-CN': '打开率', en: 'Open Rate' },
    status: { 'zh-TW': '狀態', 'zh-CN': '状态', en: 'Status' },
    draft: { 'zh-TW': '草稿', 'zh-CN': '草稿', en: 'Draft' },
    scheduled: { 'zh-TW': '已排程', 'zh-CN': '已排程', en: 'Scheduled' },
    sent: { 'zh-TW': '已發送', 'zh-CN': '已发送', en: 'Sent' },
    completed: { 'zh-TW': '已完成', 'zh-CN': '已完成', en: 'Completed' },
    send: { 'zh-TW': '發送', 'zh-CN': '发送', en: 'Send' },
    totalTags: { 'zh-TW': '總標籤數', 'zh-CN': '总标签数', en: 'Total Tags' },
    taggedMembers: { 'zh-TW': '已標記會員', 'zh-CN': '已标记会员', en: 'Tagged Members' },
    campaigns: { 'zh-TW': '營銷活動', 'zh-CN': '营销活动', en: 'Campaigns' },
    messageType: { 'zh-TW': '消息類型', 'zh-CN': '消息类型', en: 'Message Type' },
    pushNotification: { 'zh-TW': '推送通知', 'zh-CN': '推送通知', en: 'Push Notification' },
    sms: { 'zh-TW': '短信', 'zh-CN': '短信', en: 'SMS' },
    inAppMessage: { 'zh-TW': '應用內消息', 'zh-CN': '应用内消息', en: 'In-App Message' },
    messageContent: { 'zh-TW': '消息內容', 'zh-CN': '消息内容', en: 'Message Content' },
    scheduleTime: { 'zh-TW': '排程時間', 'zh-CN': '排程时间', en: 'Schedule Time' },
  };

  const tl = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  const handleAddTag = () => {
    setEditingTag(null);
    tagForm.resetFields();
    setIsTagModalVisible(true);
  };

  const handleEditTag = (tag: MemberTag) => {
    setEditingTag(tag);
    tagForm.setFieldsValue(tag);
    setIsTagModalVisible(true);
  };

  const handleSaveTag = () => {
    tagForm.validateFields().then(values => {
      console.log('Saving tag:', values);
      message.success(tl('saveSuccess'));
      setIsTagModalVisible(false);
    });
  };

  const handleDeleteTag = (id: string) => {
    console.log('Deleting tag:', id);
    message.success(tl('deleteSuccess'));
  };

  const handleCreateCampaign = () => {
    campaignForm.resetFields();
    setIsCampaignModalVisible(true);
  };

  const handleSaveCampaign = () => {
    campaignForm.validateFields().then(values => {
      console.log('Saving campaign:', values);
      message.success(tl('saveSuccess'));
      setIsCampaignModalVisible(false);
    });
  };

  const tagColumns: ColumnsType<MemberTag> = [
    {
      title: tl('tagName'),
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => <Tag color={record.color}>{name}</Tag>,
    },
    {
      title: tl('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: tl('memberCount'),
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count) => (
        <Space>
          <UserOutlined />
          <span style={{ fontWeight: 600 }}>{count.toLocaleString()}</span>
        </Space>
      ),
    },
    {
      title: tl('autoRule'),
      dataIndex: 'autoRule',
      key: 'autoRule',
      render: (rule) => rule ? (
        <Tag color="blue">{locale === 'en' ? 'Auto' : '自動'}</Tag>
      ) : (
        <Tag color="default">{locale === 'en' ? 'Manual' : '手動'}</Tag>
      ),
    },
    {
      title: tl('createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: tl('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={tl('editTag')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTag(record)}
            />
          </Tooltip>
          <Popconfirm
            title={tl('confirmDelete')}
            onConfirm={() => handleDeleteTag(record.id)}
          >
            <Tooltip title={tl('delete')}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const campaignColumns: ColumnsType<MarketingCampaign> = [
    {
      title: tl('campaignName'),
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: tl('targetTags'),
      dataIndex: 'targetTags',
      key: 'targetTags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
        </Space>
      ),
    },
    {
      title: tl('targetCount'),
      dataIndex: 'targetCount',
      key: 'targetCount',
      render: (count) => count.toLocaleString(),
    },
    {
      title: tl('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors: Record<string, string> = {
          draft: 'default',
          scheduled: 'processing',
          sent: 'success',
          completed: 'success',
        };
        return <Badge status={colors[status] as any} text={tl(status)} />;
      },
    },
    {
      title: tl('openRate'),
      dataIndex: 'openRate',
      key: 'openRate',
      render: (rate, record) => record.status === 'completed' ? (
        <Progress
          percent={rate}
          size="small"
          style={{ width: 100 }}
          format={(percent) => `${percent}%`}
        />
      ) : '-',
    },
    {
      title: tl('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'draft' && (
            <Button type="primary" size="small" icon={<SendOutlined />}>
              {tl('send')}
            </Button>
          )}
          <Button type="text" icon={<EditOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={tl('totalTags')}
              value={mockTags.length}
              prefix={<TagOutlined />}
              valueStyle={{ color: '#00694B' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={tl('taggedMembers')}
              value={9456}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={tl('campaigns')}
              value={mockCampaigns.length}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tags Table */}
      <Card
        title={tl('title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
            {tl('addTag')}
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={tagColumns}
          dataSource={mockTags}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Marketing Campaigns Table */}
      <Card
        title={tl('marketing')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCampaign}>
            {tl('createCampaign')}
          </Button>
        }
      >
        <Table
          columns={campaignColumns}
          dataSource={mockCampaigns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Tag Modal */}
      <Modal
        title={editingTag ? tl('editTag') : tl('addTag')}
        open={isTagModalVisible}
        onCancel={() => setIsTagModalVisible(false)}
        onOk={handleSaveTag}
        okText={tl('save')}
        cancelText={tl('cancel')}
      >
        <Form form={tagForm} layout="vertical">
          <Form.Item name="name" label={tl('tagName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={tl('description')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="color" label={tl('color')}>
            <Select>
              <Select.Option value="gold"><Tag color="gold">Gold</Tag></Select.Option>
              <Select.Option value="purple"><Tag color="purple">Purple</Tag></Select.Option>
              <Select.Option value="green"><Tag color="green">Green</Tag></Select.Option>
              <Select.Option value="orange"><Tag color="orange">Orange</Tag></Select.Option>
              <Select.Option value="pink"><Tag color="pink">Pink</Tag></Select.Option>
              <Select.Option value="blue"><Tag color="blue">Blue</Tag></Select.Option>
              <Select.Option value="cyan"><Tag color="cyan">Cyan</Tag></Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="autoRule" label={tl('autoRule')}>
            <Input placeholder="e.g., total_spent >= 50000" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Campaign Modal */}
      <Modal
        title={tl('createCampaign')}
        open={isCampaignModalVisible}
        onCancel={() => setIsCampaignModalVisible(false)}
        onOk={handleSaveCampaign}
        okText={tl('save')}
        cancelText={tl('cancel')}
        width={600}
      >
        <Form form={campaignForm} layout="vertical">
          <Form.Item name="name" label={tl('campaignName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="targetTags" label={tl('targetTags')} rules={[{ required: true }]}>
            <Select mode="multiple">
              {mockTags.map(tag => (
                <Select.Option key={tag.id} value={tag.name}>
                  <Tag color={tag.color}>{tag.name}</Tag> ({tag.memberCount.toLocaleString()})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="messageType" label={tl('messageType')} rules={[{ required: true }]}>
            <Select>
              <Select.Option value="push">{tl('pushNotification')}</Select.Option>
              <Select.Option value="sms">{tl('sms')}</Select.Option>
              <Select.Option value="inApp">{tl('inAppMessage')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label={tl('messageContent')} rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
