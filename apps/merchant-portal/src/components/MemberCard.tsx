import React from 'react';
import { Card, Avatar, Tag, Typography, Space, Descriptions, Divider } from 'antd';
import {
  UserOutlined,
  CrownOutlined,
  PhoneOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useLocale } from '../hooks/useLocale';

const { Text, Title } = Typography;

interface MemberInfo {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  memberNo: string;
  stampBalance: number;
  totalStamps: number;
  joinDate: string;
  lastVisit?: string;
  status: 'active' | 'inactive' | 'frozen';
}

interface MemberCardProps {
  member: MemberInfo;
  compact?: boolean;
  onIssueStamp?: () => void;
}

const tierConfig: Record<string, { color: string; label: Record<string, string> }> = {
  bronze: {
    color: '#cd7f32',
    label: { 'zh-CN': '铜卡', 'zh-TW': '銅卡', en: 'Bronze' },
  },
  silver: {
    color: '#c0c0c0',
    label: { 'zh-CN': '银卡', 'zh-TW': '銀卡', en: 'Silver' },
  },
  gold: {
    color: '#ffd700',
    label: { 'zh-CN': '金卡', 'zh-TW': '金卡', en: 'Gold' },
  },
  platinum: {
    color: '#e5e4e2',
    label: { 'zh-CN': '铂金卡', 'zh-TW': '鉑金卡', en: 'Platinum' },
  },
  diamond: {
    color: '#b9f2ff',
    label: { 'zh-CN': '钻石卡', 'zh-TW': '鑽石卡', en: 'Diamond' },
  },
};

const statusLabels: Record<string, Record<string, string>> = {
  active: { 'zh-CN': '正常', 'zh-TW': '正常', en: 'Active' },
  inactive: { 'zh-CN': '未激活', 'zh-TW': '未激活', en: 'Inactive' },
  frozen: { 'zh-CN': '已冻结', 'zh-TW': '已凍結', en: 'Frozen' },
};

const statusColors: Record<string, string> = {
  active: 'green',
  inactive: 'default',
  frozen: 'red',
};

const labels: Record<string, Record<string, string>> = {
  memberNo: { 'zh-CN': '会员号', 'zh-TW': '會員號', en: 'Member No.' },
  phone: { 'zh-CN': '手机号', 'zh-TW': '手機號', en: 'Phone' },
  stampBalance: { 'zh-CN': '印花余额', 'zh-TW': '印花餘額', en: 'Stamp Balance' },
  totalStamps: { 'zh-CN': '累计印花', 'zh-TW': '累計印花', en: 'Total Stamps' },
  joinDate: { 'zh-CN': '入会日期', 'zh-TW': '入會日期', en: 'Join Date' },
  lastVisit: { 'zh-CN': '上次到访', 'zh-TW': '上次到訪', en: 'Last Visit' },
};

const MemberCard: React.FC<MemberCardProps> = ({ member, compact = false }) => {
  const { locale } = useLocale();
  const tier = tierConfig[member.tier];

  if (compact) {
    return (
      <Card size="small" style={{ borderLeft: `4px solid ${tier.color}` }}>
        <Space>
          <Avatar
            size={40}
            src={member.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: tier.color }}
          />
          <div>
            <Space>
              <Text strong>{member.name}</Text>
              <Tag color={tier.color} icon={<CrownOutlined />}>
                {tier.label[locale] || tier.label.en}
              </Tag>
              <Tag color={statusColors[member.status]}>
                {statusLabels[member.status]?.[locale] || statusLabels[member.status]?.en}
              </Tag>
            </Space>
            <br />
            <Space size="middle">
              <Text type="secondary">
                <PhoneOutlined /> {member.phone}
              </Text>
              <Text type="secondary">
                <StarOutlined /> {member.stampBalance}
              </Text>
            </Space>
          </div>
        </Space>
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderTop: `4px solid ${tier.color}`,
        borderRadius: 8,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Avatar
          size={72}
          src={member.avatar}
          icon={<UserOutlined />}
          style={{ backgroundColor: tier.color, marginBottom: 8 }}
        />
        <Title level={4} style={{ margin: 0 }}>{member.name}</Title>
        <Space style={{ marginTop: 4 }}>
          <Tag color={tier.color} icon={<CrownOutlined />}>
            {tier.label[locale] || tier.label.en}
          </Tag>
          <Tag color={statusColors[member.status]}>
            {statusLabels[member.status]?.[locale] || statusLabels[member.status]?.en}
          </Tag>
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <Descriptions column={1} size="small">
        <Descriptions.Item label={labels.memberNo[locale] || labels.memberNo.en}>
          {member.memberNo}
        </Descriptions.Item>
        <Descriptions.Item label={labels.phone[locale] || labels.phone.en}>
          {member.phone}
        </Descriptions.Item>
        <Descriptions.Item label={labels.stampBalance[locale] || labels.stampBalance.en}>
          <Text strong style={{ color: '#1890ff', fontSize: 18 }}>
            {member.stampBalance}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label={labels.totalStamps[locale] || labels.totalStamps.en}>
          {member.totalStamps}
        </Descriptions.Item>
        <Descriptions.Item label={labels.joinDate[locale] || labels.joinDate.en}>
          {member.joinDate}
        </Descriptions.Item>
        {member.lastVisit && (
          <Descriptions.Item label={labels.lastVisit[locale] || labels.lastVisit.en}>
            {member.lastVisit}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default MemberCard;
