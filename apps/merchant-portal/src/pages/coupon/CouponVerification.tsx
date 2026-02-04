import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Result,
  Descriptions,
  Tag,
  Divider,
  message,
  Alert,
  Modal,
  Table,
} from 'antd';
import {
  ScanOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GiftOutlined,
  BarcodeOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '优惠券核销', 'zh-TW': '優惠券核銷', en: 'Coupon Verification' },
  scanCoupon: { 'zh-CN': '扫描优惠券二维码/条形码', 'zh-TW': '掃描優惠券二維碼/條形碼', en: 'Scan Coupon QR/Barcode' },
  enterCode: { 'zh-CN': '或手动输入券码', 'zh-TW': '或手動輸入券碼', en: 'Or Enter Code Manually' },
  couponCode: { 'zh-CN': '优惠券券码', 'zh-TW': '優惠券券碼', en: 'Coupon Code' },
  verify: { 'zh-CN': '验证', 'zh-TW': '驗證', en: 'Verify' },
  couponInfo: { 'zh-CN': '优惠券信息', 'zh-TW': '優惠券信息', en: 'Coupon Information' },
  couponName: { 'zh-CN': '优惠券名称', 'zh-TW': '優惠券名稱', en: 'Coupon Name' },
  couponType: { 'zh-CN': '类型', 'zh-TW': '類型', en: 'Type' },
  discount: { 'zh-CN': '折扣', 'zh-TW': '折扣', en: 'Discount' },
  member: { 'zh-CN': '持有会员', 'zh-TW': '持有會員', en: 'Member' },
  validPeriod: { 'zh-CN': '有效期', 'zh-TW': '有效期', en: 'Valid Period' },
  minSpend: { 'zh-CN': '最低消费', 'zh-TW': '最低消費', en: 'Min. Spend' },
  status: { 'zh-CN': '状态', 'zh-TW': '狀態', en: 'Status' },
  confirmRedeem: { 'zh-CN': '确认核销', 'zh-TW': '確認核銷', en: 'Confirm Redemption' },
  redeemConfirmMsg: {
    'zh-CN': '确定要核销此优惠券吗？核销后不可撤销。',
    'zh-TW': '確定要核銷此優惠券嗎？核銷後不可撤銷。',
    en: 'Are you sure you want to redeem this coupon? This action cannot be undone.',
  },
  redeemSuccess: { 'zh-CN': '核销成功!', 'zh-TW': '核銷成功!', en: 'Redeemed Successfully!' },
  redeemSuccessDesc: {
    'zh-CN': '优惠券已成功核销',
    'zh-TW': '優惠券已成功核銷',
    en: 'The coupon has been successfully redeemed',
  },
  scanAnother: { 'zh-CN': '继续核销', 'zh-TW': '繼續核銷', en: 'Scan Another' },
  valid: { 'zh-CN': '有效', 'zh-TW': '有效', en: 'Valid' },
  expired: { 'zh-CN': '已过期', 'zh-TW': '已過期', en: 'Expired' },
  used: { 'zh-CN': '已使用', 'zh-TW': '已使用', en: 'Used' },
  invalid: { 'zh-CN': '无效', 'zh-TW': '無效', en: 'Invalid' },
  cashCoupon: { 'zh-CN': '现金券', 'zh-TW': '現金券', en: 'Cash Coupon' },
  discountCoupon: { 'zh-CN': '折扣券', 'zh-TW': '折扣券', en: 'Discount Coupon' },
  freeCoupon: { 'zh-CN': '免费券', 'zh-TW': '免費券', en: 'Free Item Coupon' },
  recentRedemptions: { 'zh-CN': '今日核销记录', 'zh-TW': '今日核銷記錄', en: "Today's Redemptions" },
  time: { 'zh-CN': '时间', 'zh-TW': '時間', en: 'Time' },
  coupon: { 'zh-CN': '优惠券', 'zh-TW': '優惠券', en: 'Coupon' },
  codeRequired: { 'zh-CN': '请输入或扫描券码', 'zh-TW': '請輸入或掃描券碼', en: 'Please enter or scan a code' },
  notApplicable: {
    'zh-CN': '此优惠券不适用于本店铺',
    'zh-TW': '此優惠券不適用於本店鋪',
    en: 'This coupon is not applicable to this shop',
  },
};

interface CouponDetail {
  code: string;
  name: Record<string, string>;
  type: 'cash' | 'discount' | 'free';
  discount: string;
  memberName: string;
  memberNo: string;
  validFrom: string;
  validTo: string;
  minSpend: number;
  status: 'valid' | 'expired' | 'used' | 'invalid';
  applicable: boolean;
}

interface RedemptionRecord {
  id: string;
  time: string;
  couponName: string;
  couponCode: string;
  memberName: string;
  type: 'cash' | 'discount' | 'free';
}

const mockCoupon: CouponDetail = {
  code: 'CPN-2025-ABC123',
  name: { 'zh-CN': '满500减50现金券', 'zh-TW': '滿500減50現金券', en: 'HK$50 off on HK$500+' },
  type: 'cash',
  discount: 'HK$ 50',
  memberName: '王小明',
  memberNo: 'LR20240001',
  validFrom: '2025-01-01',
  validTo: '2025-03-31',
  minSpend: 500,
  status: 'valid',
  applicable: true,
};

const mockRedemptions: RedemptionRecord[] = [
  { id: '1', time: '14:32', couponName: '满500减50现金券', couponCode: 'CPN-2025-ABC123', memberName: '王小明', type: 'cash' },
  { id: '2', time: '13:15', couponName: '9折优惠券', couponCode: 'CPN-2025-DEF456', memberName: '李芳', type: 'discount' },
  { id: '3', time: '11:45', couponName: '免费饮品券', couponCode: 'CPN-2025-GHI789', memberName: '陈大海', type: 'free' },
];

const CouponVerification: React.FC = () => {
  const { locale } = useLocale();
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<CouponDetail | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const typeLabels: Record<string, string> = {
    cash: getLabel('cashCoupon'),
    discount: getLabel('discountCoupon'),
    free: getLabel('freeCoupon'),
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    valid: { color: 'green', label: getLabel('valid') },
    expired: { color: 'red', label: getLabel('expired') },
    used: { color: 'default', label: getLabel('used') },
    invalid: { color: 'error', label: getLabel('invalid') },
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      message.warning(getLabel('codeRequired'));
      return;
    }
    setVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setCoupon(mockCoupon);
      setRedeemed(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleScan = () => {
    message.info(locale === 'en' ? 'Scanning...' : '正在扫描...');
    setTimeout(() => {
      setCode('CPN-2025-ABC123');
      setCoupon(mockCoupon);
      setRedeemed(false);
    }, 1500);
  };

  const handleRedeem = () => {
    Modal.confirm({
      title: getLabel('confirmRedeem'),
      icon: <ExclamationCircleOutlined />,
      content: getLabel('redeemConfirmMsg'),
      onOk: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRedeemed(true);
        message.success(getLabel('redeemSuccess'));
      },
    });
  };

  const handleReset = () => {
    setCode('');
    setCoupon(null);
    setRedeemed(false);
  };

  const redemptionColumns: ColumnsType<RedemptionRecord> = [
    { title: getLabel('time'), dataIndex: 'time', key: 'time', width: 80 },
    { title: getLabel('coupon'), dataIndex: 'couponName', key: 'couponName' },
    { title: getLabel('member'), dataIndex: 'memberName', key: 'memberName', width: 100 },
    {
      title: getLabel('couponType'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag>{typeLabels[type]}</Tag>,
    },
  ];

  return (
    <div>
      <Title level={4}>
        <CheckCircleOutlined style={{ marginRight: 8 }} />
        {getLabel('title')}
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          {/* Scan / Input Area */}
          <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', borderRadius: 8, cursor: 'pointer' }}
                  onClick={handleScan}
                >
                  <ScanOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 8 }} />
                  <div>{getLabel('scanCoupon')}</div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card style={{ borderRadius: 8 }}>
                  <Text strong>
                    <BarcodeOutlined style={{ marginRight: 4 }} />
                    {getLabel('enterCode')}
                  </Text>
                  <Space.Compact style={{ width: '100%', marginTop: 12 }}>
                    <Input
                      placeholder={getLabel('couponCode')}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onPressEnter={handleVerify}
                    />
                    <Button type="primary" loading={verifying} onClick={handleVerify}>
                      {getLabel('verify')}
                    </Button>
                  </Space.Compact>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Coupon Detail / Result */}
          {coupon && !redeemed && (
            <Card
              title={getLabel('couponInfo')}
              bordered={false}
              style={{ borderRadius: 8 }}
            >
              {!coupon.applicable && (
                <Alert
                  type="warning"
                  message={getLabel('notApplicable')}
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label={getLabel('couponCode')} span={2}>
                  <Text copyable>{coupon.code}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('couponName')} span={2}>
                  {coupon.name[locale] || coupon.name.en}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('couponType')}>
                  <Tag color="blue">{typeLabels[coupon.type]}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('discount')}>
                  <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                    {coupon.discount}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('member')}>
                  {coupon.memberName} ({coupon.memberNo})
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('minSpend')}>
                  HK$ {coupon.minSpend.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('validPeriod')} span={2}>
                  {coupon.validFrom} ~ {coupon.validTo}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('status')} span={2}>
                  <Tag
                    color={statusConfig[coupon.status]?.color}
                    icon={coupon.status === 'valid' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    {statusConfig[coupon.status]?.label}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  disabled={coupon.status !== 'valid' || !coupon.applicable}
                  onClick={handleRedeem}
                  style={{ minWidth: 200 }}
                >
                  {getLabel('confirmRedeem')}
                </Button>
              </div>
            </Card>
          )}

          {redeemed && (
            <Card bordered={false} style={{ borderRadius: 8 }}>
              <Result
                status="success"
                title={getLabel('redeemSuccess')}
                subTitle={getLabel('redeemSuccessDesc')}
                extra={[
                  <Button type="primary" key="more" onClick={handleReset}>
                    {getLabel('scanAnother')}
                  </Button>,
                ]}
              />
            </Card>
          )}
        </Col>

        {/* Today's Redemptions */}
        <Col xs={24} md={10}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                {getLabel('recentRedemptions')}
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <Table
              columns={redemptionColumns}
              dataSource={mockRedemptions}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CouponVerification;
