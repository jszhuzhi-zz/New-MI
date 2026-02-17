import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Tooltip,
  Empty,
  Badge,
  Image,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text, Paragraph } = Typography;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '优惠活动管理', 'zh-TW': '優惠活動管理', en: 'Offer Management' },
  newOffer: { 'zh-CN': '发布新优惠', 'zh-TW': '發布新優惠', en: 'New Offer' },
  search: { 'zh-CN': '搜索优惠活动', 'zh-TW': '搜索優惠活動', en: 'Search offers' },
  allStatus: { 'zh-CN': '全部状态', 'zh-TW': '全部狀態', en: 'All Status' },
  pending: { 'zh-CN': '待审核', 'zh-TW': '待審核', en: 'Pending' },
  approved: { 'zh-CN': '已通过', 'zh-TW': '已通過', en: 'Approved' },
  rejected: { 'zh-CN': '已拒绝', 'zh-TW': '已拒絕', en: 'Rejected' },
  expired: { 'zh-CN': '已过期', 'zh-TW': '已過期', en: 'Expired' },
  draft: { 'zh-CN': '草稿', 'zh-TW': '草稿', en: 'Draft' },
  offerName: { 'zh-CN': '活动名称', 'zh-TW': '活動名稱', en: 'Offer Name' },
  discount: { 'zh-CN': '优惠内容', 'zh-TW': '優惠內容', en: 'Discount' },
  validPeriod: { 'zh-CN': '有效期', 'zh-TW': '有效期', en: 'Valid Period' },
  status: { 'zh-CN': '状态', 'zh-TW': '狀態', en: 'Status' },
  createdAt: { 'zh-CN': '创建时间', 'zh-TW': '創建時間', en: 'Created' },
  actions: { 'zh-CN': '操作', 'zh-TW': '操作', en: 'Actions' },
  view: { 'zh-CN': '查看', 'zh-TW': '查看', en: 'View' },
  edit: { 'zh-CN': '编辑', 'zh-TW': '編輯', en: 'Edit' },
  delete: { 'zh-CN': '删除', 'zh-TW': '刪除', en: 'Delete' },
  deleteConfirm: { 'zh-CN': '确定删除此优惠活动？', 'zh-TW': '確定刪除此優惠活動？', en: 'Delete this offer?' },
  deleteSuccess: { 'zh-CN': '删除成功', 'zh-TW': '刪除成功', en: 'Deleted successfully' },
  rejectReason: { 'zh-CN': '拒绝原因', 'zh-TW': '拒絕原因', en: 'Reject Reason' },
  noOffers: { 'zh-CN': '暂无优惠活动', 'zh-TW': '暫無優惠活動', en: 'No offers yet' },
  noOffersDesc: { 'zh-CN': '点击"发布新优惠"创建您的第一个优惠活动', 'zh-TW': '點擊"發布新優惠"創建您的第一個優惠活動', en: 'Click "New Offer" to create your first offer' },
  pendingTip: { 'zh-CN': '您的优惠正在等待商场审核', 'zh-TW': '您的優惠正在等待商場審核', en: 'Your offer is pending mall approval' },
  to: { 'zh-CN': '至', 'zh-TW': '至', en: 'to' },
};

interface Offer {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  discount: string;
  discountType: 'percentage' | 'fixed' | 'special';
  discountValue?: number;
  coverImage?: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

const OfferList: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  // Mock data
  const mockOffers: Offer[] = [
    {
      id: '1',
      title: locale === 'en' ? 'Summer Sale 30% Off' : '夏日特惠 7折优惠',
      titleEn: 'Summer Sale 30% Off',
      description: locale === 'en' ? 'Get 30% off on all summer items!' : '所有夏季商品享7折优惠！',
      discount: '30% OFF',
      discountType: 'percentage',
      discountValue: 30,
      coverImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300',
      startDate: '2026-02-01',
      endDate: '2026-03-31',
      status: 'approved',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-16T14:00:00Z',
    },
    {
      id: '2',
      title: locale === 'en' ? 'Buy 2 Get 1 Free' : '买二送一',
      titleEn: 'Buy 2 Get 1 Free',
      description: locale === 'en' ? 'Buy any 2 items and get the 3rd free!' : '购买任意2件商品，第3件免费！',
      discount: locale === 'en' ? 'Buy 2 Get 1' : '买2送1',
      discountType: 'special',
      startDate: '2026-02-15',
      endDate: '2026-04-15',
      status: 'pending',
      createdAt: '2026-02-10T09:00:00Z',
      updatedAt: '2026-02-10T09:00:00Z',
    },
    {
      id: '3',
      title: locale === 'en' ? 'Weekend Special HK$50 Off' : '周末特惠减HK$50',
      titleEn: 'Weekend Special HK$50 Off',
      description: locale === 'en' ? 'Spend HK$300 or more and get HK$50 off!' : '消费满HK$300立减HK$50！',
      discount: 'HK$50 OFF',
      discountType: 'fixed',
      discountValue: 50,
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      status: 'rejected',
      rejectReason: locale === 'en'
        ? 'Discount terms need clarification. Please specify if it can be combined with other offers.'
        : '优惠条款需要澄清，请说明是否可与其他优惠同时使用。',
      createdAt: '2026-01-25T11:00:00Z',
      updatedAt: '2026-01-26T15:00:00Z',
    },
    {
      id: '4',
      title: locale === 'en' ? 'New Year Special' : '新年特惠',
      titleEn: 'New Year Special',
      description: locale === 'en' ? 'Celebrate with 20% off!' : '新年庆祝8折优惠！',
      discount: '20% OFF',
      discountType: 'percentage',
      discountValue: 20,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      status: 'expired',
      createdAt: '2025-12-20T10:00:00Z',
      updatedAt: '2025-12-21T09:00:00Z',
    },
    {
      id: '5',
      title: locale === 'en' ? 'Spring Collection Preview' : '春季新品预览',
      titleEn: 'Spring Collection Preview',
      description: locale === 'en' ? 'Early bird discount for spring collection' : '春季新品早鸟优惠',
      discount: '15% OFF',
      discountType: 'percentage',
      discountValue: 15,
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      status: 'draft',
      createdAt: '2026-02-15T16:00:00Z',
      updatedAt: '2026-02-15T16:00:00Z',
    },
  ];

  const getStatusTag = (status: Offer['status']) => {
    const config: Record<typeof status, { color: string; icon: React.ReactNode }> = {
      draft: { color: 'default', icon: <EditOutlined /> },
      pending: { color: 'processing', icon: <ClockCircleOutlined /> },
      approved: { color: 'success', icon: <CheckCircleOutlined /> },
      rejected: { color: 'error', icon: <CloseCircleOutlined /> },
      expired: { color: 'default', icon: <ClockCircleOutlined /> },
    };
    return (
      <Tag color={config[status].color} icon={config[status].icon}>
        {getLabel(status)}
      </Tag>
    );
  };

  const handleDelete = (offer: Offer) => {
    Modal.confirm({
      title: getLabel('deleteConfirm'),
      icon: <ExclamationCircleOutlined />,
      okText: getLabel('delete'),
      okType: 'danger',
      cancelText: locale === 'en' ? 'Cancel' : '取消',
      onOk: () => {
        message.success(getLabel('deleteSuccess'));
      },
    });
  };

  const columns: ColumnsType<Offer> = [
    {
      title: getLabel('offerName'),
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (title: string, record) => (
        <Space>
          {record.coverImage && (
            <Image
              src={record.coverImage}
              width={60}
              height={40}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              preview={false}
            />
          )}
          <div>
            <Text strong style={{ display: 'block' }}>{title}</Text>
            {record.titleEn && locale !== 'en' && (
              <Text type="secondary" style={{ fontSize: 12 }}>{record.titleEn}</Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: getLabel('discount'),
      dataIndex: 'discount',
      key: 'discount',
      width: 120,
      render: (discount: string) => (
        <Tag color="blue" icon={<TagsOutlined />}>{discount}</Tag>
      ),
    },
    {
      title: getLabel('validPeriod'),
      key: 'validPeriod',
      width: 200,
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {dayjs(record.startDate).format('YYYY/MM/DD')} {getLabel('to')} {dayjs(record.endDate).format('YYYY/MM/DD')}
        </Text>
      ),
    },
    {
      title: getLabel('status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: Offer['status'], record) => (
        <Space direction="vertical" size={0}>
          {getStatusTag(status)}
          {status === 'rejected' && record.rejectReason && (
            <Tooltip title={record.rejectReason}>
              <Text type="danger" style={{ fontSize: 11, cursor: 'help' }}>
                {getLabel('rejectReason')}...
              </Text>
            </Tooltip>
          )}
          {status === 'pending' && (
            <Text type="warning" style={{ fontSize: 11 }}>
              {getLabel('pendingTip').substring(0, 15)}...
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: getLabel('createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {dayjs(date).format('YYYY/MM/DD')}
        </Text>
      ),
    },
    {
      title: getLabel('actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={getLabel('view')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => setPreviewOffer(record)}
            />
          </Tooltip>
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Tooltip title={getLabel('edit')}>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => navigate(`/offers/edit/${record.id}`)}
              />
            </Tooltip>
          )}
          {(record.status === 'draft' || record.status === 'rejected' || record.status === 'expired') && (
            <Tooltip title={getLabel('delete')}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filteredOffers = mockOffers.filter((offer) => {
    const matchSearch = !searchText ||
      offer.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (offer.titleEn && offer.titleEn.toLowerCase().includes(searchText.toLowerCase()));
    const matchStatus = !statusFilter || offer.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusOptions = [
    { value: '', label: getLabel('allStatus') },
    { value: 'draft', label: getLabel('draft') },
    { value: 'pending', label: getLabel('pending') },
    { value: 'approved', label: getLabel('approved') },
    { value: 'rejected', label: getLabel('rejected') },
    { value: 'expired', label: getLabel('expired') },
  ];

  // Count offers by status for badges
  const statusCounts = mockOffers.reduce((acc, offer) => {
    acc[offer.status] = (acc[offer.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            <TagsOutlined style={{ marginRight: 8 }} />
            {getLabel('title')}
          </Title>
          {statusCounts.pending > 0 && (
            <Badge count={statusCounts.pending} style={{ backgroundColor: '#1890ff' }} />
          )}
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/offers/create')}
        >
          {getLabel('newOffer')}
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder={getLabel('search')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        {filteredOffers.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredOffers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => locale === 'en' ? `Total ${total} offers` : `共 ${total} 条`,
            }}
          />
        ) : (
          <Empty
            description={
              <Space direction="vertical" size={4}>
                <Text>{getLabel('noOffers')}</Text>
                <Text type="secondary">{getLabel('noOffersDesc')}</Text>
              </Space>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/offers/create')}>
              {getLabel('newOffer')}
            </Button>
          </Empty>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        open={!!previewOffer}
        onCancel={() => setPreviewOffer(null)}
        footer={null}
        width={500}
        title={
          <Space>
            <TagsOutlined />
            {previewOffer?.title}
          </Space>
        }
      >
        {previewOffer && (
          <div>
            {previewOffer.coverImage && (
              <Image
                src={previewOffer.coverImage}
                style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
              />
            )}
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div>
                <Text type="secondary">{getLabel('discount')}:</Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>{previewOffer.discount}</Tag>
              </div>
              <div>
                <Text type="secondary">{getLabel('validPeriod')}:</Text>
                <Text style={{ marginLeft: 8 }}>
                  {dayjs(previewOffer.startDate).format('YYYY/MM/DD')} - {dayjs(previewOffer.endDate).format('YYYY/MM/DD')}
                </Text>
              </div>
              <div>
                <Text type="secondary">{getLabel('status')}:</Text>
                <span style={{ marginLeft: 8 }}>{getStatusTag(previewOffer.status)}</span>
              </div>
              {previewOffer.status === 'rejected' && previewOffer.rejectReason && (
                <div style={{ background: '#fff1f0', padding: 12, borderRadius: 6 }}>
                  <Text type="secondary">{getLabel('rejectReason')}:</Text>
                  <Paragraph style={{ margin: '8px 0 0' }} type="danger">
                    {previewOffer.rejectReason}
                  </Paragraph>
                </div>
              )}
              <div>
                <Text type="secondary">{locale === 'en' ? 'Description' : '描述'}:</Text>
                <Paragraph style={{ margin: '8px 0 0' }}>
                  {previewOffer.description}
                </Paragraph>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OfferList;
