import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Modal, Form, Select, DatePicker,
  Descriptions, Tabs, Avatar, message, Tooltip, Badge, Statistic, Row, Col
} from 'antd';
import {
  SearchOutlined, UserOutlined, EditOutlined, HistoryOutlined,
  GiftOutlined, TagOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  memberNo: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  stampBalance: number;
  totalSpent: number;
  joinDate: string;
  lastVisit: string;
  tags: string[];
  status: 'active' | 'inactive';
  birthday?: string;
}

const mockMembers: Member[] = [
  { id: '1', name: '張小明', phone: '852-91234567', email: 'zhang@example.com', memberNo: 'LK20250001', tier: 'gold', stampBalance: 2580, totalSpent: 45000, joinDate: '2024-03-15', lastVisit: '2026-02-16', tags: ['VIP', '美食愛好者'], status: 'active', birthday: '1990-05-15' },
  { id: '2', name: '李雅婷', phone: '852-92345678', email: 'li@example.com', memberNo: 'LK20250002', tier: 'platinum', stampBalance: 5200, totalSpent: 120000, joinDate: '2023-08-20', lastVisit: '2026-02-17', tags: ['VIP', '時尚達人', '高消費'], status: 'active', birthday: '1985-11-20' },
  { id: '3', name: '王大華', phone: '852-93456789', email: 'wang@example.com', memberNo: 'LK20250003', tier: 'silver', stampBalance: 800, totalSpent: 15000, joinDate: '2025-01-10', lastVisit: '2026-02-10', tags: ['新會員'], status: 'active', birthday: '1995-03-08' },
  { id: '4', name: '陳美玲', phone: '852-94567890', email: 'chen@example.com', memberNo: 'LK20250004', tier: 'gold', stampBalance: 3100, totalSpent: 68000, joinDate: '2024-06-01', lastVisit: '2026-02-15', tags: ['VIP', '電影愛好者'], status: 'active', birthday: '1988-07-25' },
  { id: '5', name: '林志強', phone: '852-95678901', email: 'lin@example.com', memberNo: 'LK20250005', tier: 'bronze', stampBalance: 150, totalSpent: 3500, joinDate: '2025-12-01', lastVisit: '2026-01-20', tags: [], status: 'inactive', birthday: '2000-01-15' },
];

const allTags = ['VIP', '新會員', '高消費', '美食愛好者', '時尚達人', '電影愛好者', '親子家庭', '學生', '長者'];

const tierColors: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
};

const tierLabels: Record<string, Record<string, string>> = {
  bronze: { 'zh-TW': '銅卡會員', 'zh-CN': '铜卡会员', en: 'Bronze' },
  silver: { 'zh-TW': '銀卡會員', 'zh-CN': '银卡会员', en: 'Silver' },
  gold: { 'zh-TW': '金卡會員', 'zh-CN': '金卡会员', en: 'Gold' },
  platinum: { 'zh-TW': '白金會員', 'zh-CN': '白金会员', en: 'Platinum' },
};

export default function MemberManagement() {
  const { t, locale } = useLocale();
  const [searchText, setSearchText] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [form] = Form.useForm();

  const labels: Record<string, Record<string, string>> = {
    title: { 'zh-TW': '會員管理', 'zh-CN': '会员管理', en: 'Member Management' },
    search: { 'zh-TW': '搜索會員姓名、電話或會員號', 'zh-CN': '搜索会员姓名、电话或会员号', en: 'Search by name, phone or member no.' },
    name: { 'zh-TW': '姓名', 'zh-CN': '姓名', en: 'Name' },
    phone: { 'zh-TW': '電話', 'zh-CN': '电话', en: 'Phone' },
    email: { 'zh-TW': '電郵', 'zh-CN': '邮箱', en: 'Email' },
    memberNo: { 'zh-TW': '會員編號', 'zh-CN': '会员编号', en: 'Member No.' },
    tier: { 'zh-TW': '會員等級', 'zh-CN': '会员等级', en: 'Tier' },
    stamps: { 'zh-TW': '印花餘額', 'zh-CN': '印花余额', en: 'Stamp Balance' },
    totalSpent: { 'zh-TW': '累計消費', 'zh-CN': '累计消费', en: 'Total Spent' },
    joinDate: { 'zh-TW': '加入日期', 'zh-CN': '加入日期', en: 'Join Date' },
    lastVisit: { 'zh-TW': '最後到訪', 'zh-CN': '最后到访', en: 'Last Visit' },
    tags: { 'zh-TW': '標籤', 'zh-CN': '标签', en: 'Tags' },
    status: { 'zh-TW': '狀態', 'zh-CN': '状态', en: 'Status' },
    active: { 'zh-TW': '活躍', 'zh-CN': '活跃', en: 'Active' },
    inactive: { 'zh-TW': '不活躍', 'zh-CN': '不活跃', en: 'Inactive' },
    actions: { 'zh-TW': '操作', 'zh-CN': '操作', en: 'Actions' },
    viewDetails: { 'zh-TW': '查看詳情', 'zh-CN': '查看详情', en: 'View Details' },
    editMember: { 'zh-TW': '編輯會員', 'zh-CN': '编辑会员', en: 'Edit Member' },
    memberDetails: { 'zh-TW': '會員詳情', 'zh-CN': '会员详情', en: 'Member Details' },
    basicInfo: { 'zh-TW': '基本資料', 'zh-CN': '基本资料', en: 'Basic Info' },
    transactionHistory: { 'zh-TW': '交易記錄', 'zh-CN': '交易记录', en: 'Transaction History' },
    stampHistory: { 'zh-TW': '印花記錄', 'zh-CN': '印花记录', en: 'Stamp History' },
    birthday: { 'zh-TW': '生日', 'zh-CN': '生日', en: 'Birthday' },
    adjustStamps: { 'zh-TW': '調整印花', 'zh-CN': '调整印花', en: 'Adjust Stamps' },
    adjustTier: { 'zh-TW': '調整等級', 'zh-CN': '调整等级', en: 'Adjust Tier' },
    save: { 'zh-TW': '保存', 'zh-CN': '保存', en: 'Save' },
    cancel: { 'zh-TW': '取消', 'zh-CN': '取消', en: 'Cancel' },
    saveSuccess: { 'zh-TW': '保存成功', 'zh-CN': '保存成功', en: 'Saved successfully' },
    totalMembers: { 'zh-TW': '總會員數', 'zh-CN': '总会员数', en: 'Total Members' },
    activeMembers: { 'zh-TW': '活躍會員', 'zh-CN': '活跃会员', en: 'Active Members' },
    newThisMonth: { 'zh-TW': '本月新增', 'zh-CN': '本月新增', en: 'New This Month' },
  };

  const tl = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  const filteredMembers = mockMembers.filter(m =>
    m.name.includes(searchText) ||
    m.phone.includes(searchText) ||
    m.memberNo.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setIsDetailVisible(true);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    form.setFieldsValue({
      name: member.name,
      phone: member.phone,
      email: member.email,
      tier: member.tier,
      tags: member.tags,
      status: member.status,
    });
    setIsEditVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Saving member:', values);
      message.success(tl('saveSuccess'));
      setIsEditVisible(false);
    });
  };

  const columns: ColumnsType<Member> = [
    {
      title: tl('memberNo'),
      dataIndex: 'memberNo',
      key: 'memberNo',
      width: 140,
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: tl('name'),
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name, record) => (
        <Space>
          <Avatar style={{ background: tierColors[record.tier] }}>{name.charAt(0)}</Avatar>
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: tl('phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: tl('tier'),
      dataIndex: 'tier',
      key: 'tier',
      width: 100,
      render: (tier: string) => (
        <Tag color={tierColors[tier]} style={{ color: tier === 'gold' ? '#000' : '#fff' }}>
          {tierLabels[tier]?.[locale] || tier}
        </Tag>
      ),
    },
    {
      title: tl('stamps'),
      dataIndex: 'stampBalance',
      key: 'stampBalance',
      width: 100,
      render: (val) => <span style={{ color: '#00694B', fontWeight: 600 }}>{val.toLocaleString()}</span>,
    },
    {
      title: tl('totalSpent'),
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 120,
      render: (val) => `HK$${val.toLocaleString()}`,
    },
    {
      title: tl('tags'),
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
        </Space>
      ),
    },
    {
      title: tl('status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={tl(status)}
        />
      ),
    },
    {
      title: tl('lastVisit'),
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      width: 110,
    },
    {
      title: tl('actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title={tl('viewDetails')}>
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title={tl('editMember')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
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
              title={tl('totalMembers')}
              value={12580}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#00694B' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={tl('activeMembers')}
              value={8920}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={tl('newThisMonth')}
              value={156}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Member Table */}
      <Card title={tl('title')}>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder={tl('search')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} members` }}
        />
      </Card>

      {/* Member Details Modal */}
      <Modal
        title={tl('memberDetails')}
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedMember && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: tl('basicInfo'),
                children: (
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label={tl('memberNo')}>{selectedMember.memberNo}</Descriptions.Item>
                    <Descriptions.Item label={tl('name')}>{selectedMember.name}</Descriptions.Item>
                    <Descriptions.Item label={tl('phone')}>{selectedMember.phone}</Descriptions.Item>
                    <Descriptions.Item label={tl('email')}>{selectedMember.email}</Descriptions.Item>
                    <Descriptions.Item label={tl('tier')}>
                      <Tag color={tierColors[selectedMember.tier]}>
                        {tierLabels[selectedMember.tier]?.[locale]}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={tl('stamps')}>
                      <span style={{ color: '#00694B', fontWeight: 600 }}>
                        {selectedMember.stampBalance.toLocaleString()}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label={tl('totalSpent')}>
                      HK${selectedMember.totalSpent.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label={tl('birthday')}>{selectedMember.birthday}</Descriptions.Item>
                    <Descriptions.Item label={tl('joinDate')}>{selectedMember.joinDate}</Descriptions.Item>
                    <Descriptions.Item label={tl('lastVisit')}>{selectedMember.lastVisit}</Descriptions.Item>
                    <Descriptions.Item label={tl('tags')} span={2}>
                      <Space wrap>
                        {selectedMember.tags.map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'transactions',
                label: tl('transactionHistory'),
                children: (
                  <Table
                    columns={[
                      { title: 'Date', dataIndex: 'date', key: 'date' },
                      { title: 'Shop', dataIndex: 'shop', key: 'shop' },
                      { title: 'Amount', dataIndex: 'amount', key: 'amount' },
                      { title: 'Stamps', dataIndex: 'stamps', key: 'stamps' },
                    ]}
                    dataSource={[
                      { key: '1', date: '2026-02-16', shop: 'Starbucks', amount: 'HK$98', stamps: '+50' },
                      { key: '2', date: '2026-02-14', shop: 'UNIQLO', amount: 'HK$560', stamps: '+280' },
                      { key: '3', date: '2026-02-10', shop: 'Pacific Coffee', amount: 'HK$45', stamps: '+22' },
                    ]}
                    pagination={false}
                    size="small"
                  />
                ),
              },
              {
                key: 'stamps',
                label: tl('stampHistory'),
                children: (
                  <Table
                    columns={[
                      { title: 'Date', dataIndex: 'date', key: 'date' },
                      { title: 'Type', dataIndex: 'type', key: 'type' },
                      { title: 'Amount', dataIndex: 'amount', key: 'amount' },
                      { title: 'Balance', dataIndex: 'balance', key: 'balance' },
                    ]}
                    dataSource={[
                      { key: '1', date: '2026-02-16', type: 'Earned', amount: '+50', balance: '2,580' },
                      { key: '2', date: '2026-02-14', type: 'Earned', amount: '+280', balance: '2,530' },
                      { key: '3', date: '2026-02-12', type: 'Redeemed', amount: '-500', balance: '2,250' },
                    ]}
                    pagination={false}
                    size="small"
                  />
                ),
              },
            ]}
          />
        )}
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        title={tl('editMember')}
        open={isEditVisible}
        onCancel={() => setIsEditVisible(false)}
        onOk={handleSave}
        okText={tl('save')}
        cancelText={tl('cancel')}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label={tl('name')} rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={tl('phone')} rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label={tl('email')}>
            <Input prefix={<MailOutlined />} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tier" label={tl('tier')}>
                <Select>
                  <Select.Option value="bronze">{tierLabels.bronze[locale]}</Select.Option>
                  <Select.Option value="silver">{tierLabels.silver[locale]}</Select.Option>
                  <Select.Option value="gold">{tierLabels.gold[locale]}</Select.Option>
                  <Select.Option value="platinum">{tierLabels.platinum[locale]}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={tl('status')}>
                <Select>
                  <Select.Option value="active">{tl('active')}</Select.Option>
                  <Select.Option value="inactive">{tl('inactive')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label={tl('tags')}>
            <Select mode="multiple" placeholder="Select tags">
              {allTags.map(tag => <Select.Option key={tag} value={tag}>{tag}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
