import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  DatePicker,
  Typography,
  Tooltip,
  Modal,
  Descriptions,
  Image,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  StopOutlined,
  GiftOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '印花交易记录', 'zh-TW': '印花交易記錄', en: 'Stamp Transaction Records' },
  transactionId: { 'zh-CN': '交易编号', 'zh-TW': '交易編號', en: 'Transaction ID' },
  member: { 'zh-CN': '会员', 'zh-TW': '會員', en: 'Member' },
  memberNo: { 'zh-CN': '会员号', 'zh-TW': '會員號', en: 'Member No.' },
  amount: { 'zh-CN': '消费金额', 'zh-TW': '消費金額', en: 'Amount' },
  stamps: { 'zh-CN': '印花数', 'zh-TW': '印花數', en: 'Stamps' },
  type: { 'zh-CN': '类型', 'zh-TW': '類型', en: 'Type' },
  status: { 'zh-CN': '状态', 'zh-TW': '狀態', en: 'Status' },
  operator: { 'zh-CN': '操作员', 'zh-TW': '操作員', en: 'Operator' },
  time: { 'zh-CN': '交易时间', 'zh-TW': '交易時間', en: 'Time' },
  actions: { 'zh-CN': '操作', 'zh-TW': '操作', en: 'Actions' },
  issue: { 'zh-CN': '发放', 'zh-TW': '發放', en: 'Issue' },
  void: { 'zh-CN': '作废', 'zh-TW': '作廢', en: 'Void' },
  completed: { 'zh-CN': '已完成', 'zh-TW': '已完成', en: 'Completed' },
  pending: { 'zh-CN': '处理中', 'zh-TW': '處理中', en: 'Pending' },
  voided: { 'zh-CN': '已作废', 'zh-TW': '已作廢', en: 'Voided' },
  search: { 'zh-CN': '搜索会员名/卡号', 'zh-TW': '搜索會員名/卡號', en: 'Search member/card' },
  export: { 'zh-CN': '导出', 'zh-TW': '導出', en: 'Export' },
  detail: { 'zh-CN': '交易详情', 'zh-TW': '交易詳情', en: 'Transaction Details' },
  receiptPhoto: { 'zh-CN': '小票照片', 'zh-TW': '小票照片', en: 'Receipt Photo' },
  transactionRef: { 'zh-CN': '交易参考号', 'zh-TW': '交易參考號', en: 'Transaction Ref' },
  voidConfirm: {
    'zh-CN': '确定要作废此笔印花交易吗？',
    'zh-TW': '確定要作廢此筆印花交易嗎？',
    en: 'Are you sure you want to void this stamp transaction?',
  },
};

interface StampTransaction {
  id: string;
  transactionId: string;
  memberName: string;
  memberNo: string;
  phone: string;
  amount: number;
  stamps: number;
  type: 'issue' | 'void';
  status: 'completed' | 'pending' | 'voided';
  operator: string;
  transactionRef?: string;
  receiptPhoto?: string;
  time: string;
  remark?: string;
}

const mockData: StampTransaction[] = [
  { id: '1', transactionId: 'STX-20250120-001', memberName: '王小明', memberNo: 'LR20240001', phone: '138****8001', amount: 580, stamps: 5, type: 'issue', status: 'completed', operator: '张伟', transactionRef: 'INV-001', receiptPhoto: 'https://placeholder.pics/svg/200x300', time: '2025-01-20 14:32:00' },
  { id: '2', transactionId: 'STX-20250120-002', memberName: '李芳', memberNo: 'LR20240015', phone: '139****2345', amount: 1200, stamps: 12, type: 'issue', status: 'completed', operator: '张伟', time: '2025-01-20 14:15:00' },
  { id: '3', transactionId: 'STX-20250120-003', memberName: '陈大海', memberNo: 'LR20240023', phone: '137****5678', amount: 320, stamps: 3, type: 'issue', status: 'pending', operator: '李娜', time: '2025-01-20 13:48:00' },
  { id: '4', transactionId: 'STX-20250119-001', memberName: '张丽', memberNo: 'LR20240045', phone: '136****9012', amount: 890, stamps: 8, type: 'issue', status: 'completed', operator: '张伟', transactionRef: 'INV-045', time: '2025-01-19 16:22:00' },
  { id: '5', transactionId: 'STX-20250119-002', memberName: '赵强', memberNo: 'LR20240067', phone: '135****3456', amount: 450, stamps: 4, type: 'issue', status: 'voided', operator: '张伟', remark: '顾客退货', time: '2025-01-19 15:10:00' },
  { id: '6', transactionId: 'STX-20250119-003', memberName: '刘敏', memberNo: 'LR20240089', phone: '133****7890', amount: 2100, stamps: 21, type: 'issue', status: 'completed', operator: '李娜', time: '2025-01-19 12:45:00' },
  { id: '7', transactionId: 'STX-20250118-001', memberName: '孙涛', memberNo: 'LR20240102', phone: '132****1234', amount: 760, stamps: 7, type: 'issue', status: 'completed', operator: '张伟', time: '2025-01-18 17:30:00' },
  { id: '8', transactionId: 'STX-20250118-002', memberName: '周雪', memberNo: 'LR20240118', phone: '131****5678', amount: 1500, stamps: 15, type: 'issue', status: 'completed', operator: '李娜', transactionRef: 'INV-118', time: '2025-01-18 14:20:00' },
];

const TransactionRecords: React.FC = () => {
  const { locale } = useLocale();
  const [searchText, setSearchText] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StampTransaction | null>(null);

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const statusConfig: Record<string, { color: string; label: string }> = {
    completed: { color: 'green', label: getLabel('completed') },
    pending: { color: 'processing', label: getLabel('pending') },
    voided: { color: 'red', label: getLabel('voided') },
  };

  const columns: ColumnsType<StampTransaction> = [
    {
      title: getLabel('transactionId'),
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 180,
      render: (text) => <Text copyable={{ text }}>{text}</Text>,
    },
    {
      title: getLabel('member'),
      key: 'member',
      width: 150,
      render: (_, record) => (
        <div>
          <Text strong>{record.memberName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.memberNo}</Text>
        </div>
      ),
    },
    {
      title: getLabel('amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (val) => `HK$ ${val.toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: getLabel('stamps'),
      dataIndex: 'stamps',
      key: 'stamps',
      width: 100,
      align: 'center',
      render: (val) => (
        <Text strong style={{ color: '#1890ff' }}>+{val}</Text>
      ),
      sorter: (a, b) => a.stamps - b.stamps,
    },
    {
      title: getLabel('status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: getLabel('completed'), value: 'completed' },
        { text: getLabel('pending'), value: 'pending' },
        { text: getLabel('voided'), value: 'voided' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.label}</Tag>
      ),
    },
    {
      title: getLabel('operator'),
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: getLabel('time'),
      dataIndex: 'time',
      key: 'time',
      width: 170,
      sorter: (a, b) => dayjs(a.time).unix() - dayjs(b.time).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: getLabel('actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title={getLabel('detail')}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedRecord(record);
                setDetailVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'completed' && (
            <Tooltip title={getLabel('void')}>
              <Button
                type="text"
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: getLabel('void'),
                    content: getLabel('voidConfirm'),
                    okButtonProps: { danger: true },
                  });
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filteredData = mockData.filter(
    (item) =>
      item.memberName.includes(searchText) ||
      item.memberNo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.transactionId.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Title level={4}>
        <GiftOutlined style={{ marginRight: 8 }} />
        {getLabel('title')}
      </Title>

      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space wrap>
            <Input
              prefix={<SearchOutlined />}
              placeholder={getLabel('search')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <RangePicker />
          </Space>
          <Button icon={<ExportOutlined />}>{getLabel('export')}</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) =>
              locale === 'en' ? `Total ${total} records` : `共 ${total} 条记录`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        open={detailVisible}
        title={getLabel('detail')}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label={getLabel('transactionId')} span={2}>
              {selectedRecord.transactionId}
            </Descriptions.Item>
            <Descriptions.Item label={getLabel('member')}>
              {selectedRecord.memberName}
            </Descriptions.Item>
            <Descriptions.Item label={getLabel('memberNo')}>
              {selectedRecord.memberNo}
            </Descriptions.Item>
            <Descriptions.Item label={getLabel('amount')}>
              HK$ {selectedRecord.amount.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label={getLabel('stamps')}>
              <Text strong style={{ color: '#1890ff' }}>+{selectedRecord.stamps}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={getLabel('status')}>
              <Tag color={statusConfig[selectedRecord.status]?.color}>
                {statusConfig[selectedRecord.status]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={getLabel('operator')}>
              {selectedRecord.operator}
            </Descriptions.Item>
            <Descriptions.Item label={getLabel('time')} span={2}>
              {selectedRecord.time}
            </Descriptions.Item>
            {selectedRecord.transactionRef && (
              <Descriptions.Item label={getLabel('transactionRef')} span={2}>
                {selectedRecord.transactionRef}
              </Descriptions.Item>
            )}
            {selectedRecord.receiptPhoto && (
              <Descriptions.Item label={getLabel('receiptPhoto')} span={2}>
                <Image width={120} src={selectedRecord.receiptPhoto} />
              </Descriptions.Item>
            )}
            {selectedRecord.remark && (
              <Descriptions.Item
                label={locale === 'en' ? 'Remark' : '备注'}
                span={2}
              >
                {selectedRecord.remark}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TransactionRecords;
