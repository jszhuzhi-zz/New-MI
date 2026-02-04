import React from 'react';
import { Badge, Tag, Tooltip } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { useLocale } from '../hooks/useLocale';

interface StampBadgeProps {
  count: number;
  size?: 'small' | 'default';
  showIcon?: boolean;
  maxCount?: number;
}

const StampBadge: React.FC<StampBadgeProps> = ({
  count,
  size = 'default',
  showIcon = true,
  maxCount = 99999,
}) => {
  const { t } = useLocale();

  const formattedCount = count > maxCount ? `${maxCount}+` : count.toLocaleString();

  return (
    <Tooltip title={`${t('stamp.stampBalance')}: ${count.toLocaleString()}`}>
      <Tag
        color="gold"
        style={{
          fontSize: size === 'small' ? 12 : 14,
          padding: size === 'small' ? '0 4px' : '2px 8px',
          borderRadius: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {showIcon && <StarOutlined />}
        {formattedCount}
      </Tag>
    </Tooltip>
  );
};

export default StampBadge;
