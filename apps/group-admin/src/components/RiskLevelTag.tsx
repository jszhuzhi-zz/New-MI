import React from 'react';
import { Tag } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { RiskLevel } from '@link-reit/types';
import { useLocale } from '../hooks/useLocale';

interface RiskLevelTagProps {
  level: RiskLevel;
}

const riskConfig: Record<
  RiskLevel,
  { color: string; icon: React.ReactNode; labelKey: string }
> = {
  low: { color: 'green', icon: <CheckCircleOutlined />, labelKey: 'riskControl.low' },
  medium: { color: 'orange', icon: <WarningOutlined />, labelKey: 'riskControl.medium' },
  high: { color: 'red', icon: <ExclamationCircleOutlined />, labelKey: 'riskControl.high' },
  critical: { color: '#cf1322', icon: <CloseCircleOutlined />, labelKey: 'riskControl.critical' },
};

const RiskLevelTag: React.FC<RiskLevelTagProps> = ({ level }) => {
  const { t } = useLocale();
  const config = riskConfig[level];

  return (
    <Tag
      color={config.color}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
    >
      {config.icon}
      {t(config.labelKey)}
    </Tag>
  );
};

export default RiskLevelTag;
