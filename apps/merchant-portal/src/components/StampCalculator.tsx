import React from 'react';
import { Card, Typography, Divider, Space, Tag } from 'antd';
import { GiftOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useLocale } from '../hooks/useLocale';

const { Text, Title } = Typography;

interface StampRule {
  id: string;
  name: Record<string, string>;
  threshold: number; // minimum spend
  stampsPerUnit: number; // stamps earned per unit
  unitAmount: number; // amount per unit (e.g., every HK$100)
  maxStamps?: number; // cap per transaction
  bonusMultiplier?: number; // e.g. 2x for special events
  bonusLabel?: Record<string, string>;
}

interface StampCalculatorProps {
  receiptAmount: number;
  rules?: StampRule[];
  memberTier?: string;
}

const defaultRules: StampRule[] = [
  {
    id: 'base',
    name: { 'zh-CN': '基础规则', 'zh-TW': '基礎規則', en: 'Base Rule' },
    threshold: 0,
    stampsPerUnit: 1,
    unitAmount: 100,
    maxStamps: 50,
  },
  {
    id: 'weekend_bonus',
    name: { 'zh-CN': '周末双倍', 'zh-TW': '週末雙倍', en: 'Weekend Double' },
    threshold: 0,
    stampsPerUnit: 1,
    unitAmount: 100,
    bonusMultiplier: 2,
    bonusLabel: { 'zh-CN': '双倍印花', 'zh-TW': '雙倍印花', en: 'Double Stamps' },
  },
];

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '印花计算', 'zh-TW': '印花計算', en: 'Stamp Calculation' },
  receiptAmount: { 'zh-CN': '消费金额', 'zh-TW': '消費金額', en: 'Receipt Amount' },
  rule: { 'zh-CN': '适用规则', 'zh-TW': '適用規則', en: 'Applied Rule' },
  baseStamps: { 'zh-CN': '基础印花', 'zh-TW': '基礎印花', en: 'Base Stamps' },
  bonusStamps: { 'zh-CN': '奖励印花', 'zh-TW': '獎勵印花', en: 'Bonus Stamps' },
  totalStamps: { 'zh-CN': '合计印花', 'zh-TW': '合計印花', en: 'Total Stamps' },
  perUnit: { 'zh-CN': '每满 HK${amount} 获得 {stamps} 印花', 'zh-TW': '每滿 HK${amount} 獲得 {stamps} 印花', en: 'Earn {stamps} stamp(s) per HK${amount}' },
  maxCap: { 'zh-CN': '单笔上限 {max} 印花', 'zh-TW': '單筆上限 {max} 印花', en: 'Max {max} stamps per transaction' },
  noStamps: { 'zh-CN': '消费金额不足，无法获得印花', 'zh-TW': '消費金額不足，無法獲得印花', en: 'Amount insufficient for stamps' },
};

const StampCalculator: React.FC<StampCalculatorProps> = ({
  receiptAmount,
  rules = defaultRules,
}) => {
  const { locale } = useLocale();
  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  // Use the first rule as the active rule for calculation
  const activeRule = rules[0];
  const isWeekend = [0, 6].includes(new Date().getDay());
  const bonusRule = isWeekend ? rules.find((r) => r.bonusMultiplier) : null;

  // Calculate base stamps
  let baseStamps = 0;
  if (activeRule && receiptAmount >= activeRule.threshold) {
    baseStamps = Math.floor(receiptAmount / activeRule.unitAmount) * activeRule.stampsPerUnit;
    if (activeRule.maxStamps) {
      baseStamps = Math.min(baseStamps, activeRule.maxStamps);
    }
  }

  // Calculate bonus
  let bonusStamps = 0;
  if (bonusRule && bonusRule.bonusMultiplier) {
    bonusStamps = baseStamps * (bonusRule.bonusMultiplier - 1);
  }

  const totalStamps = baseStamps + bonusStamps;

  return (
    <Card
      size="small"
      title={
        <Space>
          <CalculatorOutlined />
          {getLabel('title')}
        </Space>
      }
      style={{ borderRadius: 8 }}
    >
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">{getLabel('receiptAmount')}: </Text>
        <Text strong>HK$ {receiptAmount.toFixed(2)}</Text>
      </div>

      {activeRule && (
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">{getLabel('rule')}: </Text>
          <Text>{activeRule.name[locale] || activeRule.name.en}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getLabel('perUnit')
              .replace('{amount}', String(activeRule.unitAmount))
              .replace('{stamps}', String(activeRule.stampsPerUnit))}
          </Text>
          {activeRule.maxStamps && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {getLabel('maxCap').replace('{max}', String(activeRule.maxStamps))}
              </Text>
            </>
          )}
        </div>
      )}

      <Divider style={{ margin: '8px 0' }} />

      {totalStamps > 0 ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text>{getLabel('baseStamps')}</Text>
            <Text>{baseStamps}</Text>
          </div>
          {bonusStamps > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Space>
                <Text>{getLabel('bonusStamps')}</Text>
                <Tag color="orange" style={{ fontSize: 10 }}>
                  {bonusRule?.bonusLabel?.[locale] || bonusRule?.bonusLabel?.en}
                </Tag>
              </Space>
              <Text style={{ color: '#fa8c16' }}>+{bonusStamps}</Text>
            </div>
          )}
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 16 }}>{getLabel('totalStamps')}</Text>
            <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
              <GiftOutlined style={{ marginRight: 4 }} />
              {totalStamps}
            </Title>
          </div>
        </>
      ) : (
        <Text type="warning">{getLabel('noStamps')}</Text>
      )}
    </Card>
  );
};

export default StampCalculator;
