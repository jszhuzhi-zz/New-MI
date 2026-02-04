import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Typography, Badge, Tooltip, Avatar, Drawer, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined, ExportOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';
import MemberTierTag from '../../components/MemberTierTag';
import StampBadge from '../../components/StampBadge';

const { Title } = Typography;

interface MemberCardRow {
  id: string;
  cardNo: string;
  memberName: string;
  phone: string;
  email: string;
  tier: string;
  tierLevel: number;
  status: 'active' | 'expired' | 'suspended';
  stampBalance: number;
  lifetimeStamps: number;
  project: string;
  registeredAt: string;
  lastActiveAt: string;
  listStatus: 'none' | 'whitelist' | 'blacklist';
}

const mockMembers: MemberCardRow[] = [
  { id: 'M001', cardNo: 'LR000000001234', memberName: 'Chan Tai Man', phone: '+852 9123 4567', email: 'chan.taiman@gmail.com', tier: 'Gold', tierLevel: 3, status: 'active', stampBalance: 2450, lifetimeStamps: 12800, project: 'T Town', registeredAt: '2024-03-15', lastActiveAt: '2026-02-03', listStatus: 'none' },
  { id: 'M002', cardNo: 'LR000000001235', memberName: 'Wong Siu Ming', phone: '+852 9234 5678', email: 'wongsiuMing@outlook.com', tier: 'Platinum', tierLevel: 4, status: 'active', stampBalance: 8920, lifetimeStamps: 45200, project: 'LOHAS Park', registeredAt: '2023-06-20', lastActiveAt: '2026-02-04', listStatus: 'whitelist' },
  { id: 'M003', cardNo: 'LR000000001236', memberName: 'Li Ka Yan', phone: '+852 9345 6789', email: 'likayan@yahoo.com', tier: 'Silver', tierLevel: 2, status: 'active', stampBalance: 780, lifetimeStamps: 5400, project: 'Temple Mall', registeredAt: '2025-01-10', lastActiveAt: '2026-01-28', listStatus: 'none' },
  { id: 'M004', cardNo: 'LR000000001237', memberName: 'Cheung Mei Ling', phone: '+852 9456 7890', email: 'cheungml@gmail.com', tier: 'Diamond', tierLevel: 5, status: 'active', stampBalance: 15600, lifetimeStamps: 89000, project: 'Maritime Bay', registeredAt: '2022-11-05', lastActiveAt: '2026-02-04', listStatus: 'none' },
  { id: 'M005', cardNo: 'LR000000001238', memberName: 'Ng Wai Kit', phone: '+852 9567 8901', email: 'ngwaikit@hotmail.com', tier: 'Bronze', tierLevel: 1, status: 'suspended', stampBalance: 120, lifetimeStamps: 320, project: 'TKO Gateway', registeredAt: '2025-09-22', lastActiveAt: '2025-12-15', listStatus: 'blacklist' },
  { id: 'M006', cardNo: 'LR000000001239', memberName: 'Lam Hoi Yee', phone: '+852 9678 9012', email: 'lamhoiyee@gmail.com', tier: 'Gold', tierLevel: 3, status: 'active', stampBalance: 3200, lifetimeStamps: 18900, project: 'Stanley Plaza', registeredAt: '2024-07-14', lastActiveAt: '2026-02-02', listStatus: 'none' },
  { id: 'M007', cardNo: 'LR000000001240', memberName: 'Yip Chi Hung', phone: '+852 9789 0123', email: 'yipchihung@gmail.com', tier: 'Silver', tierLevel: 2, status: 'expired', stampBalance: 0, lifetimeStamps: 2100, project: 'Lok Fu Place', registeredAt: '2024-01-08', lastActiveAt: '2025-06-30', listStatus: 'none' },
  { id: 'M008', cardNo: 'LR000000001241', memberName: 'Ho Wing Sze', phone: '+852 9890 1234', email: 'howingsze@outlook.com', tier: 'Gold', tierLevel: 3, status: 'active', stampBalance: 4100, lifetimeStamps: 22400, project: 'T Town', registeredAt: '2023-12-01', lastActiveAt: '2026-02-03', listStatus: 'none' },
];

const MemberCardList: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [searchText, setSearchText] = useState('');
  const [projectFilter, setProjectFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberCardRow | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { title: t('member.memberManagement'), path: '/member/cards' },
      { title: t('member.memberCard') },
    ]);
  }, [setBreadcrumbs, t]);

  const filteredMembers = mockMembers.filter((m) => {
    const matchesSearch =
      !searchText ||
      m.memberName.toLowerCase().includes(searchText.toLowerCase()) ||
      m.cardNo.includes(searchText) ||
      m.phone.includes(searchText);
    const matchesProject = !projectFilter || m.project === projectFilter;
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const handleViewMember = (record: MemberCardRow) => {
    setSelectedMember(record);
    setDrawerVisible(true);
  };

  const columns: ColumnsType<MemberCardRow> = [
    {
      title: t('member.memberCardNo'),
      dataIndex: 'cardNo',
      key: 'cardNo',
      width: 160,
      fixed: 'left',
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: t('member.displayName'),
      dataIndex: 'memberName',
      key: 'memberName',
      width: 150,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {name}
        </Space>
      ),
    },
    {
      title: t('member.memberTier'),
      key: 'tier',
      width: 120,
      render: (_, record) => <MemberTierTag tier={record.tier} level={record.tierLevel} />,
      sorter: (a, b) => a.tierLevel - b.tierLevel,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { active: 'green', expired: 'default', suspended: 'red' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: t('member.stampBalance'),
      dataIndex: 'stampBalance',
      key: 'stampBalance',
      width: 130,
      sorter: (a, b) => a.stampBalance - b.stampBalance,
      render: (val: number) => <StampBadge count={val} size="small" />,
    },
    {
      title: t('member.lifetimeStamps'),
      dataIndex: 'lifetimeStamps',
      key: 'lifetimeStamps',
      width: 130,
      sorter: (a, b) => a.lifetimeStamps - b.lifetimeStamps,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: t('organization.project'),
      dataIndex: 'project',
      key: 'project',
      width: 120,
    },
    {
      title: t('member.specialList'),
      dataIndex: 'listStatus',
      key: 'listStatus',
      width: 100,
      render: (status: string) => {
        if (status === 'whitelist') return <Tag color="green">{t('member.whitelist')}</Tag>;
        if (status === 'blacklist') return <Tag color="red">{t('member.blacklist')}</Tag>;
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
    {
      title: t('member.lastActive'),
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      width: 120,
      sorter: (a, b) => a.lastActiveAt.localeCompare(b.lastActiveAt),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} size="small" onClick={() => handleViewMember(record)}>
          {t('common.details')}
        </Button>
      ),
    },
  ];

  const projects = [...new Set(mockMembers.map((m) => m.project))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('member.memberCard')}
        </Title>
        <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder={t('member.memberSearch')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder={t('organization.project')}
            value={projectFilter}
            onChange={setProjectFilter}
            style={{ width: 160 }}
            allowClear
            options={projects.map((p) => ({ label: p, value: p }))}
          />
          <Select
            placeholder={t('common.status')}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            allowClear
            options={[
              { label: t('common.active'), value: 'active' },
              { label: 'Expired', value: 'expired' },
              { label: 'Suspended', value: 'suspended' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setProjectFilter(undefined); setStatusFilter(undefined); }}>
            {t('common.reset')}
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          pagination={{
            total: filteredMembers.length,
            pageSize: 10,
            showTotal: (total) => t('common.total', { total }),
            showSizeChanger: true,
          }}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      <Drawer
        title={t('member.memberProfile')}
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedMember && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label={t('member.memberCardNo')} span={2}>
              {selectedMember.cardNo}
            </Descriptions.Item>
            <Descriptions.Item label={t('member.displayName')}>
              {selectedMember.memberName}
            </Descriptions.Item>
            <Descriptions.Item label={t('member.memberTier')}>
              <MemberTierTag tier={selectedMember.tier} level={selectedMember.tierLevel} />
            </Descriptions.Item>
            <Descriptions.Item label={t('member.phone')}>
              {selectedMember.phone}
            </Descriptions.Item>
            <Descriptions.Item label={t('member.email')}>
              {selectedMember.email}
            </Descriptions.Item>
            <Descriptions.Item label={t('member.stampBalance')}>
              <StampBadge count={selectedMember.stampBalance} />
            </Descriptions.Item>
            <Descriptions.Item label={t('member.lifetimeStamps')}>
              {selectedMember.lifetimeStamps.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label={t('organization.project')}>
              {selectedMember.project}
            </Descriptions.Item>
            <Descriptions.Item label={t('common.status')}>
              <Tag color={selectedMember.status === 'active' ? 'green' : selectedMember.status === 'suspended' ? 'red' : 'default'}>
                {selectedMember.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('member.registration')}>
              {selectedMember.registeredAt}
            </Descriptions.Item>
            <Descriptions.Item label={t('member.lastActive')}>
              {selectedMember.lastActiveAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default MemberCardList;
