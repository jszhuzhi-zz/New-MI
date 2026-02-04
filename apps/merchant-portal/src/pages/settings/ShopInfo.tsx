import React, { useState } from 'react';
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
  TimePicker,
  Upload,
  Avatar,
  Descriptions,
  Divider,
  message,
  Tag,
} from 'antd';
import {
  ShopOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLocale } from '../../hooks/useLocale';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;
const { TextArea } = Input;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '店铺信息', 'zh-TW': '店鋪信息', en: 'Shop Information' },
  basicInfo: { 'zh-CN': '基本信息', 'zh-TW': '基本信息', en: 'Basic Information' },
  shopName: { 'zh-CN': '店铺名称', 'zh-TW': '店鋪名稱', en: 'Shop Name' },
  shopNameEn: { 'zh-CN': '店铺英文名', 'zh-TW': '店鋪英文名', en: 'Shop Name (English)' },
  category: { 'zh-CN': '经营类别', 'zh-TW': '經營類別', en: 'Category' },
  shopNo: { 'zh-CN': '铺号', 'zh-TW': '鋪號', en: 'Shop No.' },
  floor: { 'zh-CN': '楼层', 'zh-TW': '樓層', en: 'Floor' },
  mall: { 'zh-CN': '所属商场', 'zh-TW': '所屬商場', en: 'Mall' },
  phone: { 'zh-CN': '联系电话', 'zh-TW': '聯繫電話', en: 'Phone' },
  operatingHours: { 'zh-CN': '营业时间', 'zh-TW': '營業時間', en: 'Operating Hours' },
  description: { 'zh-CN': '店铺描述', 'zh-TW': '店鋪描述', en: 'Description' },
  logo: { 'zh-CN': '店铺Logo', 'zh-TW': '店鋪Logo', en: 'Shop Logo' },
  edit: { 'zh-CN': '编辑', 'zh-TW': '編輯', en: 'Edit' },
  save: { 'zh-CN': '保存', 'zh-TW': '保存', en: 'Save' },
  cancel: { 'zh-CN': '取消', 'zh-TW': '取消', en: 'Cancel' },
  saveSuccess: { 'zh-CN': '保存成功', 'zh-TW': '保存成功', en: 'Saved successfully' },
  stampConfig: { 'zh-CN': '印花配置', 'zh-TW': '印花配置', en: 'Stamp Configuration' },
  stampRule: { 'zh-CN': '适用规则', 'zh-TW': '適用規則', en: 'Applied Rule' },
  earnRate: { 'zh-CN': '获取比率', 'zh-TW': '獲取比率', en: 'Earn Rate' },
  maxPerTx: { 'zh-CN': '单笔上限', 'zh-TW': '單筆上限', en: 'Max Per Transaction' },
  status: { 'zh-CN': '状态', 'zh-TW': '狀態', en: 'Status' },
  active: { 'zh-CN': '营业中', 'zh-TW': '營業中', en: 'Active' },
  food: { 'zh-CN': '餐饮', 'zh-TW': '餐飲', en: 'Food & Beverage' },
  fashion: { 'zh-CN': '时尚服饰', 'zh-TW': '時尚服飾', en: 'Fashion' },
  lifestyle: { 'zh-CN': '生活百货', 'zh-TW': '生活百貨', en: 'Lifestyle' },
  beauty: { 'zh-CN': '美妆护理', 'zh-TW': '美妝護理', en: 'Beauty' },
  electronics: { 'zh-CN': '数码电子', 'zh-TW': '數碼電子', en: 'Electronics' },
};

const ShopInfo: React.FC = () => {
  const { locale } = useLocale();
  const { user, isManager } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const categories = ['food', 'fashion', 'lifestyle', 'beauty', 'electronics'].map((c) => ({
    label: getLabel(c),
    value: c,
  }));

  const mockShopInfo = {
    shopName: locale === 'zh-TW' ? '優品生活館' : locale === 'en' ? 'Premium Living' : '优品生活馆',
    shopNameEn: 'Premium Living',
    category: 'lifestyle',
    shopNo: 'G-15',
    floor: locale === 'en' ? 'Ground Floor' : 'G/F',
    mall: locale === 'zh-TW' ? '樂富廣場' : locale === 'en' ? 'Lok Fu Place' : '乐富广场',
    phone: '+852 2345 6789',
    openTime: '10:00',
    closeTime: '22:00',
    description: locale === 'en'
      ? 'Premium lifestyle products including home goods, accessories, and gifts.'
      : '精选生活好物，涵盖家居用品、配饰及礼品。',
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      await new Promise((resolve) => setTimeout(resolve, 800));
      message.success(getLabel('saveSuccess'));
      setEditing(false);
    } catch {
      // validation error
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ShopOutlined style={{ marginRight: 8 }} />
          {getLabel('title')}
        </Title>
        {isManager() && !editing && (
          <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
            {getLabel('edit')}
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Title level={5}>{getLabel('basicInfo')}</Title>

            {!editing ? (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label={getLabel('shopName')} span={2}>
                  {mockShopInfo.shopName}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('shopNameEn')} span={2}>
                  {mockShopInfo.shopNameEn}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('category')}>
                  <Tag color="blue">{getLabel(mockShopInfo.category)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('status')}>
                  <Tag color="green">{getLabel('active')}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('shopNo')}>
                  {mockShopInfo.shopNo}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('floor')}>
                  {mockShopInfo.floor}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('mall')} span={2}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {mockShopInfo.mall}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('phone')} span={2}>
                  <PhoneOutlined style={{ marginRight: 4 }} />
                  {mockShopInfo.phone}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('operatingHours')} span={2}>
                  {mockShopInfo.openTime} - {mockShopInfo.closeTime}
                </Descriptions.Item>
                <Descriptions.Item label={getLabel('description')} span={2}>
                  {mockShopInfo.description}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  ...mockShopInfo,
                  openTime: dayjs(mockShopInfo.openTime, 'HH:mm'),
                  closeTime: dayjs(mockShopInfo.closeTime, 'HH:mm'),
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="shopName" label={getLabel('shopName')} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="shopNameEn" label={getLabel('shopNameEn')}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="category" label={getLabel('category')}>
                      <Select options={categories} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="phone" label={getLabel('phone')}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="openTime" label={`${getLabel('operatingHours')} - Start`}>
                      <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="closeTime" label={`${getLabel('operatingHours')} - End`}>
                      <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="description" label={getLabel('description')}>
                      <TextArea rows={3} />
                    </Form.Item>
                  </Col>
                </Row>
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                    {getLabel('save')}
                  </Button>
                  <Button icon={<CloseOutlined />} onClick={() => setEditing(false)}>
                    {getLabel('cancel')}
                  </Button>
                </Space>
              </Form>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Logo */}
          <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center', marginBottom: 16 }}>
            <Title level={5}>{getLabel('logo')}</Title>
            <Avatar
              size={100}
              icon={<ShopOutlined />}
              style={{ backgroundColor: '#1890ff', marginBottom: 12 }}
            />
            {editing && (
              <div>
                <Upload showUploadList={false} accept="image/*">
                  <Button icon={<CameraOutlined />} size="small">
                    {locale === 'en' ? 'Change Logo' : '更换Logo'}
                  </Button>
                </Upload>
              </div>
            )}
          </Card>

          {/* Stamp Config (read-only) */}
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Title level={5}>{getLabel('stampConfig')}</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={getLabel('stampRule')}>
                {locale === 'en' ? 'Standard Rule' : '标准规则'}
              </Descriptions.Item>
              <Descriptions.Item label={getLabel('earnRate')}>
                {locale === 'en' ? '1 stamp per HK$100' : '每满HK$100得1印花'}
              </Descriptions.Item>
              <Descriptions.Item label={getLabel('maxPerTx')}>
                {locale === 'en' ? '50 stamps' : '50印花'}
              </Descriptions.Item>
            </Descriptions>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {locale === 'en'
                ? 'Stamp rules are configured at the mall level. Contact mall admin for changes.'
                : '印花规则由商场统一配置，如需修改请联系商场管理员。'}
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShopInfo;
