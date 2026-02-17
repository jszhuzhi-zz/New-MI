import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Radio,
  Divider,
  message,
  Modal,
  Alert,
  Spin,
} from 'antd';
import {
  TagsOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  PictureOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { RcFile, UploadFile } from 'antd/es/upload';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const labels: Record<string, Record<string, string>> = {
  createTitle: { 'zh-CN': '发布新优惠', 'zh-TW': '發布新優惠', en: 'Create New Offer' },
  editTitle: { 'zh-CN': '编辑优惠', 'zh-TW': '編輯優惠', en: 'Edit Offer' },
  back: { 'zh-CN': '返回', 'zh-TW': '返回', en: 'Back' },
  basicInfo: { 'zh-CN': '基本信息', 'zh-TW': '基本信息', en: 'Basic Information' },
  offerTitle: { 'zh-CN': '优惠名称（中文）', 'zh-TW': '優惠名稱（中文）', en: 'Offer Title (Chinese)' },
  offerTitleEn: { 'zh-CN': '优惠名称（英文）', 'zh-TW': '優惠名稱（英文）', en: 'Offer Title (English)' },
  description: { 'zh-CN': '优惠描述（中文）', 'zh-TW': '優惠描述（中文）', en: 'Description (Chinese)' },
  descriptionEn: { 'zh-CN': '优惠描述（英文）', 'zh-TW': '優惠描述（英文）', en: 'Description (English)' },
  category: { 'zh-CN': '优惠类型', 'zh-TW': '優惠類型', en: 'Offer Category' },
  discountInfo: { 'zh-CN': '优惠内容', 'zh-TW': '優惠內容', en: 'Discount Details' },
  discountType: { 'zh-CN': '折扣类型', 'zh-TW': '折扣類型', en: 'Discount Type' },
  percentage: { 'zh-CN': '百分比折扣', 'zh-TW': '百分比折扣', en: 'Percentage Off' },
  fixed: { 'zh-CN': '固定金额减免', 'zh-TW': '固定金額減免', en: 'Fixed Amount Off' },
  special: { 'zh-CN': '特殊优惠', 'zh-TW': '特殊優惠', en: 'Special Offer' },
  discountValue: { 'zh-CN': '折扣值', 'zh-TW': '折扣值', en: 'Discount Value' },
  discountDesc: { 'zh-CN': '优惠描述', 'zh-TW': '優惠描述', en: 'Offer Description' },
  minSpend: { 'zh-CN': '最低消费', 'zh-TW': '最低消費', en: 'Minimum Spend' },
  validPeriod: { 'zh-CN': '有效期', 'zh-TW': '有效期', en: 'Valid Period' },
  startDate: { 'zh-CN': '开始日期', 'zh-TW': '開始日期', en: 'Start Date' },
  endDate: { 'zh-CN': '结束日期', 'zh-TW': '結束日期', en: 'End Date' },
  coverImage: { 'zh-CN': '封面图片', 'zh-TW': '封面圖片', en: 'Cover Image' },
  uploadTip: { 'zh-CN': '建议尺寸：800x400像素，支持 JPG、PNG 格式', 'zh-TW': '建議尺寸：800x400像素，支持 JPG、PNG 格式', en: 'Recommended: 800x400px, JPG/PNG format' },
  terms: { 'zh-CN': '使用条款', 'zh-TW': '使用條款', en: 'Terms & Conditions' },
  termsPlaceholder: { 'zh-CN': '请输入优惠使用的具体条款和限制', 'zh-TW': '請輸入優惠使用的具體條款和限制', en: 'Enter specific terms and limitations for using this offer' },
  saveDraft: { 'zh-CN': '保存草稿', 'zh-TW': '保存草稿', en: 'Save Draft' },
  submitForApproval: { 'zh-CN': '提交审核', 'zh-TW': '提交審核', en: 'Submit for Approval' },
  draftSaved: { 'zh-CN': '草稿已保存', 'zh-TW': '草稿已保存', en: 'Draft saved' },
  submitSuccess: { 'zh-CN': '优惠已提交审核，请等待商场管理员审核', 'zh-TW': '優惠已提交審核，請等待商場管理員審核', en: 'Offer submitted for review. Please wait for mall admin approval.' },
  submitConfirm: { 'zh-CN': '确定提交审核？', 'zh-TW': '確定提交審核？', en: 'Submit for approval?' },
  submitConfirmDesc: { 'zh-CN': '提交后将无法修改，需等待商场管理员审核通过后才能生效', 'zh-TW': '提交後將無法修改，需等待商場管理員審核通過後才能生效', en: 'After submission, you cannot modify until the mall admin reviews and approves.' },
  confirm: { 'zh-CN': '确定', 'zh-TW': '確定', en: 'Confirm' },
  cancel: { 'zh-CN': '取消', 'zh-TW': '取消', en: 'Cancel' },
  required: { 'zh-CN': '此项必填', 'zh-TW': '此項必填', en: 'This field is required' },
  rejectedAlert: { 'zh-CN': '此优惠之前被拒绝，请根据以下原因修改后重新提交：', 'zh-TW': '此優惠之前被拒絕，請根據以下原因修改後重新提交：', en: 'This offer was previously rejected. Please revise based on the reason below and resubmit:' },
  food: { 'zh-CN': '餐饮美食', 'zh-TW': '餐飲美食', en: 'Food & Beverage' },
  shopping: { 'zh-CN': '购物折扣', 'zh-TW': '購物折扣', en: 'Shopping' },
  lifestyle: { 'zh-CN': '生活服务', 'zh-TW': '生活服務', en: 'Lifestyle' },
  entertainment: { 'zh-CN': '娱乐休闲', 'zh-TW': '娛樂休閒', en: 'Entertainment' },
  beauty: { 'zh-CN': '美容护理', 'zh-TW': '美容護理', en: 'Beauty' },
};

interface OfferFormData {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: string;
  discountType: 'percentage' | 'fixed' | 'special';
  discountValue?: number;
  discountDesc?: string;
  minSpend?: number;
  validPeriod: [dayjs.Dayjs, dayjs.Dayjs];
  terms?: string;
  coverImage?: UploadFile[];
}

const OfferForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { locale } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'special'>('percentage');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  const isEdit = !!id;
  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const categories = ['food', 'shopping', 'lifestyle', 'entertainment', 'beauty'].map((c) => ({
    label: getLabel(c),
    value: c,
  }));

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      // Mock loading existing offer
      setTimeout(() => {
        const mockOffer = {
          title: '周末特惠减HK$50',
          titleEn: 'Weekend Special HK$50 Off',
          description: '消费满HK$300立减HK$50！',
          descriptionEn: 'Spend HK$300 or more and get HK$50 off!',
          category: 'shopping',
          discountType: 'fixed' as const,
          discountValue: 50,
          minSpend: 300,
          validPeriod: [dayjs('2026-02-01'), dayjs('2026-02-28')] as [dayjs.Dayjs, dayjs.Dayjs],
          terms: locale === 'en'
            ? '1. Valid on weekends only\n2. Cannot be combined with other offers\n3. One coupon per transaction'
            : '1. 仅限周末使用\n2. 不可与其他优惠同时使用\n3. 每笔交易限用一张',
        };
        form.setFieldsValue(mockOffer);
        setDiscountType(mockOffer.discountType);
        setRejectReason(locale === 'en'
          ? 'Discount terms need clarification. Please specify if it can be combined with other offers.'
          : '优惠条款需要澄清，请说明是否可与其他优惠同时使用。');
        setLoading(false);
      }, 500);
    }
  }, [id, isEdit, form, locale]);

  const handleSaveDraft = async () => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    message.success(getLabel('draftSaved'));
    setSubmitting(false);
    navigate('/offers');
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      Modal.confirm({
        title: getLabel('submitConfirm'),
        icon: <ExclamationCircleOutlined />,
        content: getLabel('submitConfirmDesc'),
        okText: getLabel('confirm'),
        cancelText: getLabel('cancel'),
        onOk: async () => {
          setSubmitting(true);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          message.success(getLabel('submitSuccess'));
          setSubmitting(false);
          navigate('/offers');
        },
      });
    } catch {
      // Validation errors will be displayed by form
    }
  };

  const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(locale === 'en' ? 'You can only upload image files!' : '只能上传图片文件！');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(locale === 'en' ? 'Image must be smaller than 5MB!' : '图片大小不能超过5MB！');
      return false;
    }
    return false; // Prevent auto upload
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/offers')}
          style={{ marginRight: 16 }}
        >
          {getLabel('back')}
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          <TagsOutlined style={{ marginRight: 8 }} />
          {isEdit ? getLabel('editTitle') : getLabel('createTitle')}
        </Title>
      </div>

      {rejectReason && (
        <Alert
          type="error"
          showIcon
          message={getLabel('rejectedAlert')}
          description={rejectReason}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          discountType: 'percentage',
          category: 'shopping',
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            {/* Basic Info */}
            <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
              <Title level={5}>{getLabel('basicInfo')}</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label={getLabel('offerTitle')}
                    rules={[{ required: true, message: getLabel('required') }]}
                  >
                    <Input placeholder={locale === 'en' ? 'e.g., Summer Sale 30% Off' : '例：夏日特惠7折'} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="titleEn" label={getLabel('offerTitleEn')}>
                    <Input placeholder="e.g., Summer Sale 30% Off" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="description"
                    label={getLabel('description')}
                    rules={[{ required: true, message: getLabel('required') }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder={locale === 'en' ? 'Describe your offer in detail...' : '详细描述您的优惠活动...'}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="descriptionEn" label={getLabel('descriptionEn')}>
                    <TextArea rows={3} placeholder="Describe your offer in English..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label={getLabel('category')}
                    rules={[{ required: true, message: getLabel('required') }]}
                  >
                    <Select options={categories} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Discount Info */}
            <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
              <Title level={5}>{getLabel('discountInfo')}</Title>
              <Form.Item
                name="discountType"
                label={getLabel('discountType')}
                rules={[{ required: true }]}
              >
                <Radio.Group onChange={(e) => setDiscountType(e.target.value)}>
                  <Radio.Button value="percentage">{getLabel('percentage')}</Radio.Button>
                  <Radio.Button value="fixed">{getLabel('fixed')}</Radio.Button>
                  <Radio.Button value="special">{getLabel('special')}</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Row gutter={16}>
                {discountType === 'percentage' && (
                  <Col span={12}>
                    <Form.Item
                      name="discountValue"
                      label={getLabel('discountValue')}
                      rules={[{ required: true, message: getLabel('required') }]}
                    >
                      <InputNumber
                        min={1}
                        max={99}
                        addonAfter="%"
                        style={{ width: '100%' }}
                        placeholder="e.g., 30"
                      />
                    </Form.Item>
                  </Col>
                )}
                {discountType === 'fixed' && (
                  <Col span={12}>
                    <Form.Item
                      name="discountValue"
                      label={getLabel('discountValue')}
                      rules={[{ required: true, message: getLabel('required') }]}
                    >
                      <InputNumber
                        min={1}
                        addonBefore="HK$"
                        style={{ width: '100%' }}
                        placeholder="e.g., 50"
                      />
                    </Form.Item>
                  </Col>
                )}
                {discountType === 'special' && (
                  <Col span={24}>
                    <Form.Item
                      name="discountDesc"
                      label={getLabel('discountDesc')}
                      rules={[{ required: true, message: getLabel('required') }]}
                    >
                      <Input placeholder={locale === 'en' ? 'e.g., Buy 2 Get 1 Free' : '例：买二送一'} />
                    </Form.Item>
                  </Col>
                )}
                <Col span={12}>
                  <Form.Item name="minSpend" label={getLabel('minSpend')}>
                    <InputNumber
                      min={0}
                      addonBefore="HK$"
                      style={{ width: '100%' }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Valid Period */}
            <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
              <Title level={5}>{getLabel('validPeriod')}</Title>
              <Form.Item
                name="validPeriod"
                rules={[{ required: true, message: getLabel('required') }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Card>

            {/* Terms */}
            <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
              <Title level={5}>{getLabel('terms')}</Title>
              <Form.Item name="terms">
                <TextArea
                  rows={4}
                  placeholder={getLabel('termsPlaceholder')}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Cover Image */}
            <Card bordered={false} style={{ borderRadius: 8, marginBottom: 24 }}>
              <Title level={5}>{getLabel('coverImage')}</Title>
              <Form.Item name="coverImage">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                  accept="image/*"
                >
                  {fileList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>{locale === 'en' ? 'Upload' : '上传'}</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {getLabel('uploadTip')}
              </Text>
            </Card>

            {/* Actions */}
            <Card bordered={false} style={{ borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="large"
                  block
                  loading={submitting}
                  onClick={handleSubmit}
                >
                  {getLabel('submitForApproval')}
                </Button>
                <Button
                  icon={<SaveOutlined />}
                  size="large"
                  block
                  loading={submitting}
                  onClick={handleSaveDraft}
                >
                  {getLabel('saveDraft')}
                </Button>
              </Space>
              <Divider />
              <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
                {locale === 'en'
                  ? 'After submitting, your offer will be reviewed by the mall admin. You will be notified once it is approved or rejected.'
                  : '提交后，您的优惠将由商场管理员审核。审核通过或拒绝后，您将收到通知。'}
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default OfferForm;
