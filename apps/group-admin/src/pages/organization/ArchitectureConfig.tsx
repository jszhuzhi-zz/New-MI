import React, { useEffect, useState } from 'react';
import { Card, Tree, Button, Modal, Form, Input, Select, Space, Typography, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title, Text } = Typography;

interface OrgNode {
  id: string;
  name: { 'zh-CN': string; 'zh-TW': string; en: string };
  code: string;
  type: 'region' | 'district' | 'department';
  status: 'active' | 'inactive';
  children?: OrgNode[];
}

const mockOrgTree: OrgNode[] = [
  {
    id: 'org-001',
    name: { 'zh-CN': '领展集团', 'zh-TW': '領展集團', en: 'Link REIT Group' },
    code: 'ROOT',
    type: 'region',
    status: 'active',
    children: [
      {
        id: 'org-002',
        name: { 'zh-CN': '香港区域', 'zh-TW': '香港區域', en: 'Hong Kong Region' },
        code: 'HK',
        type: 'region',
        status: 'active',
        children: [
          {
            id: 'org-003',
            name: { 'zh-CN': '新界东', 'zh-TW': '新界東', en: 'New Territories East' },
            code: 'NTE',
            type: 'district',
            status: 'active',
            children: [
              { id: 'org-006', name: { 'zh-CN': 'TKO Gateway', 'zh-TW': 'TKO Gateway', en: 'TKO Gateway' }, code: 'TKOGATE', type: 'department', status: 'active' },
              { id: 'org-007', name: { 'zh-CN': 'LOHAS Park', 'zh-TW': 'LOHAS Park', en: 'LOHAS Park' }, code: 'LOHAS', type: 'department', status: 'active' },
            ],
          },
          {
            id: 'org-004',
            name: { 'zh-CN': '新界西', 'zh-TW': '新界西', en: 'New Territories West' },
            code: 'NTW',
            type: 'district',
            status: 'active',
            children: [
              { id: 'org-008', name: { 'zh-CN': 'T Town', 'zh-TW': 'T Town', en: 'T Town' }, code: 'TTOWN', type: 'department', status: 'active' },
              { id: 'org-009', name: { 'zh-CN': 'Maritime Bay', 'zh-TW': 'Maritime Bay', en: 'Maritime Bay' }, code: 'MARITIME', type: 'department', status: 'active' },
            ],
          },
          {
            id: 'org-005',
            name: { 'zh-CN': '九龙', 'zh-TW': '九龍', en: 'Kowloon' },
            code: 'KLN',
            type: 'district',
            status: 'active',
            children: [
              { id: 'org-010', name: { 'zh-CN': '庙街商场', 'zh-TW': '廟街商場', en: 'Temple Mall' }, code: 'TEMPLE', type: 'department', status: 'active' },
              { id: 'org-011', name: { 'zh-CN': '乐富广场', 'zh-TW': '樂富廣場', en: 'Lok Fu Place' }, code: 'LOKFU', type: 'department', status: 'inactive' },
            ],
          },
        ],
      },
      {
        id: 'org-012',
        name: { 'zh-CN': '内地区域', 'zh-TW': '內地區域', en: 'Mainland China Region' },
        code: 'CN',
        type: 'region',
        status: 'active',
        children: [
          {
            id: 'org-013',
            name: { 'zh-CN': '华南区', 'zh-TW': '華南區', en: 'South China' },
            code: 'SC',
            type: 'district',
            status: 'active',
          },
        ],
      },
    ],
  },
];

const typeColorMap: Record<string, string> = {
  region: 'blue',
  district: 'green',
  department: 'orange',
};

const ArchitectureConfig: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<OrgNode | null>(null);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['org-001', 'org-002']);

  const langKey = locale as 'zh-CN' | 'zh-TW' | 'en';

  useEffect(() => {
    setBreadcrumbs([
      { title: t('organization.architecture'), path: '/organization/group' },
      { title: t('organization.architectureConfig') },
    ]);
  }, [setBreadcrumbs, t]);

  const convertToTreeData = (nodes: OrgNode[]): DataNode[] => {
    return nodes.map((node) => ({
      key: node.id,
      title: (
        <Space>
          <Text strong={node.type === 'region'}>{node.name[langKey]}</Text>
          <Tag color={typeColorMap[node.type]} style={{ fontSize: 11 }}>
            {node.type}
          </Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>
            [{node.code}]
          </Text>
          {node.status === 'inactive' && <Tag color="default">{t('common.inactive')}</Tag>}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setEditingNode(node);
              form.setFieldsValue({
                nameZhCN: node.name['zh-CN'],
                nameZhTW: node.name['zh-TW'],
                nameEn: node.name.en,
                code: node.code,
                type: node.type,
              });
              setModalVisible(true);
            }}
          />
          <Popconfirm title={t('common.confirm') + '?'} onConfirm={() => message.success(t('common.success'))}>
            <Button type="link" size="small" icon={<DeleteOutlined />} danger onClick={(e) => e.stopPropagation()} />
          </Popconfirm>
        </Space>
      ),
      children: node.children ? convertToTreeData(node.children) : undefined,
    }));
  };

  const treeData = convertToTreeData(mockOrgTree);

  const handleAddNode = () => {
    setEditingNode(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      message.success(t('common.success'));
      setModalVisible(false);
    } catch {
      // validation failed
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ApartmentOutlined style={{ marginRight: 8 }} />
          {t('organization.architectureConfig')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNode}>
          {t('common.add')} {t('organization.organizationUnit')}
        </Button>
      </div>

      <Card>
        <Tree
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          showLine={{ showLeafIcon: false }}
          blockNode
          defaultExpandAll
          style={{ padding: '8px 0' }}
        />
      </Card>

      <Modal
        title={editingNode ? t('common.edit') + ' ' + t('organization.organizationUnit') : t('common.add') + ' ' + t('organization.organizationUnit')}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Name (CN)" name="nameZhCN" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Name (TW)" name="nameZhTW" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Name (EN)" name="nameEn" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Code" name="code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Region', value: 'region' },
                { label: 'District', value: 'district' },
                { label: 'Department', value: 'department' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ArchitectureConfig;
