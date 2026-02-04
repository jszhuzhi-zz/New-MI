import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Steps,
  Result,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  message,
  Alert,
  Statistic,
} from 'antd';
import {
  ScanOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import MemberCard from '../../components/MemberCard';
import ReceiptUploader from '../../components/ReceiptUploader';
import StampCalculator from '../../components/StampCalculator';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '发放印花', 'zh-TW': '發放印花', en: 'Issue Stamps' },
  step1: { 'zh-CN': '查询会员', 'zh-TW': '查詢會員', en: 'Find Member' },
  step2: { 'zh-CN': '录入消费', 'zh-TW': '錄入消費', en: 'Enter Amount' },
  step3: { 'zh-CN': '确认发放', 'zh-TW': '確認發放', en: 'Confirm' },
  step4: { 'zh-CN': '完成', 'zh-TW': '完成', en: 'Done' },
  scanQR: { 'zh-CN': '扫描会员二维码', 'zh-TW': '掃描會員二維碼', en: 'Scan Member QR Code' },
  enterCard: { 'zh-CN': '或输入会员卡号', 'zh-TW': '或輸入會員卡號', en: 'Or Enter Card Number' },
  cardNumber: { 'zh-CN': '会员卡号', 'zh-TW': '會員卡號', en: 'Card Number' },
  search: { 'zh-CN': '查询', 'zh-TW': '查詢', en: 'Search' },
  receiptAmount: { 'zh-CN': '消费金额 (HK$)', 'zh-TW': '消費金額 (HK$)', en: 'Receipt Amount (HK$)' },
  receiptPhoto: { 'zh-CN': '小票拍照上传', 'zh-TW': '小票拍照上傳', en: 'Upload Receipt Photo' },
  transactionRef: { 'zh-CN': '交易参考号 (可选)', 'zh-TW': '交易參考號 (可選)', en: 'Transaction Ref (Optional)' },
  next: { 'zh-CN': '下一步', 'zh-TW': '下一步', en: 'Next' },
  prev: { 'zh-CN': '上一步', 'zh-TW': '上一步', en: 'Previous' },
  confirmIssue: { 'zh-CN': '确认发放印花', 'zh-TW': '確認發放印花', en: 'Confirm Issue Stamps' },
  confirmHint: {
    'zh-CN': '请确认以下信息无误后点击发放',
    'zh-TW': '請確認以下信息無誤後點擊發放',
    en: 'Please verify the details below before issuing',
  },
  member: { 'zh-CN': '会员', 'zh-TW': '會員', en: 'Member' },
  amount: { 'zh-CN': '消费金额', 'zh-TW': '消費金額', en: 'Amount' },
  stampsToIssue: { 'zh-CN': '发放印花数', 'zh-TW': '發放印花數', en: 'Stamps to Issue' },
  issueNow: { 'zh-CN': '立即发放', 'zh-TW': '立即發放', en: 'Issue Now' },
  successTitle: { 'zh-CN': '印花发放成功!', 'zh-TW': '印花發放成功!', en: 'Stamps Issued Successfully!' },
  successDesc: {
    'zh-CN': '已成功为会员 {name} 发放 {stamps} 个印花',
    'zh-TW': '已成功為會員 {name} 發放 {stamps} 個印花',
    en: 'Successfully issued {stamps} stamp(s) to member {name}',
  },
  issueMore: { 'zh-CN': '继续发放', 'zh-TW': '繼續發放', en: 'Issue More' },
  backToDashboard: { 'zh-CN': '返回首页', 'zh-TW': '返回首頁', en: 'Back to Dashboard' },
  amountRequired: { 'zh-CN': '请输入消费金额', 'zh-TW': '請輸入消費金額', en: 'Please enter amount' },
  cardRequired: { 'zh-CN': '请输入会员卡号', 'zh-TW': '請輸入會員卡號', en: 'Please enter card number' },
  memberFound: { 'zh-CN': '已找到会员信息', 'zh-TW': '已找到會員信息', en: 'Member found' },
  scanning: { 'zh-CN': '正在扫描...', 'zh-TW': '正在掃描...', en: 'Scanning...' },
  receiptHint: { 'zh-CN': '拍照上传小票有助于后续核查', 'zh-TW': '拍照上傳小票有助於後續核查', en: 'Uploading receipt photo helps with future verification' },
};

const mockMember = {
  id: 'member-001',
  name: '王小明',
  phone: '138****8001',
  tier: 'gold' as const,
  memberNo: 'LR20240001',
  stampBalance: 128,
  totalStamps: 560,
  joinDate: '2024-03-15',
  lastVisit: '2025-01-18',
  status: 'active' as const,
};

const IssueStamp: React.FC = () => {
  const { locale } = useLocale();
  const [currentStep, setCurrentStep] = useState(0);
  const [member, setMember] = useState<typeof mockMember | null>(null);
  const [receiptAmount, setReceiptAmount] = useState<number>(0);
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>();
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const handleScan = () => {
    message.info(getLabel('scanning'));
    // Simulate scan result
    setTimeout(() => {
      setMember(mockMember);
      message.success(getLabel('memberFound'));
    }, 1500);
  };

  const handleCardSearch = () => {
    setMember(mockMember);
    message.success(getLabel('memberFound'));
  };

  const handleAmountSubmit = () => {
    form.validateFields().then((values) => {
      setReceiptAmount(values.amount);
      setTransactionRef(values.transactionRef || '');
      setCurrentStep(2);
    });
  };

  const handleIssue = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setMember(null);
    setReceiptAmount(0);
    setReceiptPhoto(undefined);
    setTransactionRef('');
    form.resetFields();
  };

  const calculatedStamps = Math.min(Math.floor(receiptAmount / 100), 50);

  return (
    <div>
      <Title level={4}>
        <GiftOutlined style={{ marginRight: 8 }} />
        {getLabel('title')}
      </Title>

      <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
        <Steps
          current={currentStep}
          items={[
            { title: getLabel('step1') },
            { title: getLabel('step2') },
            { title: getLabel('step3') },
            { title: getLabel('step4') },
          ]}
          style={{ marginBottom: 32 }}
        />

        {/* Step 1: Find Member */}
        {currentStep === 0 && (
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card
                style={{ textAlign: 'center', cursor: 'pointer', borderRadius: 8 }}
                hoverable
                onClick={handleScan}
              >
                <ScanOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                <Title level={5}>{getLabel('scanQR')}</Title>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: 8 }}>
                <Title level={5}>
                  <CreditCardOutlined style={{ marginRight: 8 }} />
                  {getLabel('enterCard')}
                </Title>
                <Space.Compact style={{ width: '100%' }}>
                  <Input placeholder={getLabel('cardNumber')} />
                  <Button type="primary" onClick={handleCardSearch}>
                    {getLabel('search')}
                  </Button>
                </Space.Compact>
              </Card>
            </Col>
            {member && (
              <Col xs={24} style={{ marginTop: 16 }}>
                <MemberCard member={member} />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button type="primary" size="large" onClick={() => setCurrentStep(1)}>
                    {getLabel('next')}
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        )}

        {/* Step 2: Enter Receipt */}
        {currentStep === 1 && (
          <Row gutter={24}>
            <Col xs={24} md={14}>
              <Card style={{ borderRadius: 8 }}>
                {member && <MemberCard member={member} compact />}
                <Divider />
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{ amount: undefined, transactionRef: '' }}
                >
                  <Form.Item
                    name="amount"
                    label={getLabel('receiptAmount')}
                    rules={[{ required: true, message: getLabel('amountRequired') }]}
                  >
                    <InputNumber
                      prefix={<DollarOutlined />}
                      style={{ width: '100%' }}
                      size="large"
                      min={0}
                      precision={2}
                      placeholder="0.00"
                      onChange={(val) => setReceiptAmount(Number(val) || 0)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="receiptPhoto"
                    label={
                      <Space>
                        <CameraOutlined />
                        {getLabel('receiptPhoto')}
                      </Space>
                    }
                  >
                    <ReceiptUploader value={receiptPhoto} onChange={setReceiptPhoto} />
                  </Form.Item>
                  <Alert
                    message={getLabel('receiptHint')}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Form.Item
                    name="transactionRef"
                    label={getLabel('transactionRef')}
                  >
                    <Input placeholder="e.g. INV-2025-001" />
                  </Form.Item>
                </Form>
                <Space>
                  <Button icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(0)}>
                    {getLabel('prev')}
                  </Button>
                  <Button type="primary" onClick={handleAmountSubmit}>
                    {getLabel('next')}
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={10}>
              <StampCalculator receiptAmount={receiptAmount} />
            </Col>
          </Row>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 2 && (
          <Row justify="center">
            <Col xs={24} md={16} lg={12}>
              <Card style={{ borderRadius: 8, textAlign: 'center' }}>
                <Title level={5}>{getLabel('confirmHint')}</Title>
                <Divider />
                {member && <MemberCard member={member} compact />}
                <Divider />
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Statistic
                      title={getLabel('amount')}
                      value={receiptAmount}
                      prefix="HK$"
                      precision={2}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title={getLabel('stampsToIssue')}
                      value={calculatedStamps}
                      prefix={<GiftOutlined />}
                      valueStyle={{ color: '#52c41a', fontSize: 32 }}
                    />
                  </Col>
                </Row>
                {transactionRef && (
                  <Text type="secondary">Ref: {transactionRef}</Text>
                )}
                <Divider />
                <Space>
                  <Button icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(1)}>
                    {getLabel('prev')}
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    loading={loading}
                    onClick={handleIssue}
                  >
                    {getLabel('issueNow')}
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {/* Step 4: Success */}
        {currentStep === 3 && (
          <Result
            status="success"
            title={getLabel('successTitle')}
            subTitle={getLabel('successDesc')
              .replace('{name}', member?.name || '')
              .replace('{stamps}', String(calculatedStamps))}
            extra={[
              <Button type="primary" key="more" onClick={handleReset}>
                {getLabel('issueMore')}
              </Button>,
              <Button key="dashboard" onClick={() => window.location.href = '/dashboard'}>
                {getLabel('backToDashboard')}
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default IssueStamp;
