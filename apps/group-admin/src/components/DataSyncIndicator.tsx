import React from 'react';
import { Tag, Tooltip } from 'antd';
import { CloudSyncOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { DataSyncMode } from '@link-reit/types';
import { useLocale } from '../hooks/useLocale';

interface DataSyncIndicatorProps {
  mode: DataSyncMode;
  lastSyncAt?: string;
}

const DataSyncIndicator: React.FC<DataSyncIndicatorProps> = ({ mode, lastSyncAt }) => {
  const { t } = useLocale();

  if (mode === 'group-sync') {
    return (
      <Tooltip
        title={
          lastSyncAt
            ? `${t('system.groupSync')} - ${lastSyncAt}`
            : t('system.groupSync')
        }
      >
        <Tag color="blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <CloudSyncOutlined />
          {t('system.groupSync')}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={t('system.local')}>
      <Tag color="default" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <DatabaseOutlined />
        {t('system.local')}
      </Tag>
    </Tooltip>
  );
};

export default DataSyncIndicator;
