import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Typography, Badge, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';
import DataSyncIndicator from '../../components/DataSyncIndicator';
import type { DataSyncMode } from '@link-reit/types';

const { Title } = Typography;

interface ProjectRow {
  id: string;
  name: { 'zh-CN': string; 'zh-TW': string; en: string };
  code: string;
  type: string;
  status: 'active' | 'inactive';
  memberCount: number;
  merchantCount: number;
  stampIssued: number;
  dataSyncMode: DataSyncMode;
  city: string;
  contactPhone: string;
}

const mockProjects: ProjectRow[] = [
  {
    id: 'proj-001',
    name: { 'zh-CN': 'T Town', 'zh-TW': 'T Town', en: 'T Town' },
    code: 'TTOWN',
    type: 'shopping-mall',
    status: 'active',
    memberCount: 32500,
    merchantCount: 185,
    stampIssued: 1250000,
    dataSyncMode: 'group-sync',
    city: 'Tuen Mun',
    contactPhone: '+852 2450 7233',
  },
  {
    id: 'proj-002',
    name: { 'zh-CN': 'LOHAS Park', 'zh-TW': 'LOHAS Park', en: 'LOHAS Park' },
    code: 'LOHAS',
    type: 'shopping-mall',
    status: 'active',
    memberCount: 28100,
    merchantCount: 142,
    stampIssued: 980000,
    dataSyncMode: 'group-sync',
    city: 'Tseung Kwan O',
    contactPhone: '+852 3514 4886',
  },
  {
    id: 'proj-003',
    name: { 'zh-CN': '庙街商场', 'zh-TW': '廟街商場', en: 'Temple Mall' },
    code: 'TEMPLE',
    type: 'shopping-mall',
    status: 'active',
    memberCount: 24300,
    merchantCount: 120,
    stampIssued: 720000,
    dataSyncMode: 'local',
    city: 'Wong Tai Sin',
    contactPhone: '+852 2328 0831',
  },
  {
    id: 'proj-004',
    name: { 'zh-CN': 'Maritime Bay', 'zh-TW': 'Maritime Bay', en: 'Maritime Bay' },
    code: 'MARITIME',
    type: 'shopping-mall',
    status: 'active',
    memberCount: 21800,
    merchantCount: 98,
    stampIssued: 650000,
    dataSyncMode: 'group-sync',
    city: 'Tsing Yi',
    contactPhone: '+852 2432 5005',
  },
  {
    id: 'proj-005',
    name: { 'zh-CN': 'TKO Gateway', 'zh-TW': 'TKO Gateway', en: 'TKO Gateway' },
    code: 'TKOGATE',
    type: 'shopping-mall',
    status: 'active',
    memberCount: 19500,
    merchantCount: 88,
    stampIssued: 580000,
    dataSyncMode: 'group-sync',
    city: 'Tseung Kwan O',
    contactPhone: '+852 2623 0338',
  },
  {
    id: 'proj-006',
    name: { 'zh-CN': '赤柱广场', 'zh-TW': '赤柱廣場', en: 'Stanley Plaza' },
    code: 'STANLEY',
    type: 'retail-park',
    status: 'active',
    memberCount: 16200,
    merchantCount: 62,
    stampIssued: 420000,
    dataSyncMode: 'local',
    city: 'Stanley',
    contactPhone: '+852 2813 1233',
  },
  {
    id: 'proj-007',
    name: { 'zh-CN': '乐富广场', 'zh-TW': '樂富廣場', en: 'Lok Fu Place' },
    code: 'LOKFU',
    type: 'shopping-mall',
    status: 'inactive',
    memberCount: 12400,
    merchantCount: 75,
    stampIssued: 310000,
    dataSyncMode: 'local',
    city: 'Lok Fu',
    contactPhone: '+852 2336 3093',
  },
];

const ProjectList: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('organization.architecture'), path: '/organization/group' },
      { title: t('organization.projectList') },
    ]);
  }, [setBreadcrumbs, t]);

  const langKey = locale as 'zh-CN' | 'zh-TW' | 'en';

  const filteredProjects = mockProjects.filter((p) => {
    const matchesSearch =
      !searchText ||
      p.name[langKey].toLowerCase().includes(searchText.toLowerCase()) ||
      p.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<ProjectRow> = [
    {
      title: t('organization.project') + ' Code',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: t('organization.project'),
      key: 'name',
      render: (_, record) => record.name[langKey],
      sorter: (a, b) => a.name[langKey].localeCompare(b.name[langKey]),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'shopping-mall' ? 'blue' : type === 'retail-park' ? 'green' : 'purple'}>
          {type}
        </Tag>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status === 'active' ? t('common.active') : t('common.inactive')} />
      ),
    },
    {
      title: t('member.member'),
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      sorter: (a, b) => a.memberCount - b.memberCount,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: t('merchant.merchant'),
      dataIndex: 'merchantCount',
      key: 'merchantCount',
      width: 100,
      sorter: (a, b) => a.merchantCount - b.merchantCount,
    },
    {
      title: t('stamp.stamp') + ' Issued',
      dataIndex: 'stampIssued',
      key: 'stampIssued',
      width: 130,
      sorter: (a, b) => a.stampIssued - b.stampIssued,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: t('system.dataSyncMode'),
      dataIndex: 'dataSyncMode',
      key: 'dataSyncMode',
      width: 130,
      render: (mode: DataSyncMode) => <DataSyncIndicator mode={mode} />,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      render: () => (
        <Tooltip title={t('common.details')}>
          <Button type="link" icon={<EyeOutlined />} size="small">
            {t('common.details')}
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('organization.projectList')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('common.add')} {t('organization.project')}
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder={t('common.search')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder={t('common.status')}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            allowClear
            options={[
              { label: t('common.active'), value: 'active' },
              { label: t('common.inactive'), value: 'inactive' },
            ]}
          />
          <Button icon={<ReloadOutlined />}>{t('common.reset')}</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          pagination={{
            total: filteredProjects.length,
            pageSize: 10,
            showTotal: (total) => t('common.total', { total }),
            showSizeChanger: true,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
};

export default ProjectList;
