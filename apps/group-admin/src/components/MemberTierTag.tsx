import React from 'react';
import { Tag } from 'antd';
import { CrownOutlined } from '@ant-design/icons';

interface MemberTierTagProps {
  tier: string;
  level?: number;
  color?: string;
}

const tierColorMap: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
  Diamond: '#b9f2ff',
};

const tierLevelColors: Record<number, string> = {
  1: '#cd7f32',
  2: '#c0c0c0',
  3: '#ffd700',
  4: '#e5e4e2',
  5: '#b9f2ff',
};

const MemberTierTag: React.FC<MemberTierTagProps> = ({ tier, level, color }) => {
  const resolvedColor =
    color || tierColorMap[tier] || (level ? tierLevelColors[level] : undefined) || '#1677ff';

  return (
    <Tag
      color={resolvedColor}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontWeight: 500,
      }}
    >
      <CrownOutlined />
      {tier}
    </Tag>
  );
};

export default MemberTierTag;
