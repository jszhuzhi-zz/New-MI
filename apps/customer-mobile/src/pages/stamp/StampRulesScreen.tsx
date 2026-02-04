import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocale } from '../../hooks/useLocale';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

const rulesContent = {
  'zh-TW': {
    title: '印花規則',
    sections: [
      {
        heading: '如何獲取印花',
        items: [
          '每次於參與商場消費滿HK$50或以上，即可掃描小票獲取印花',
          '基本比率：每消費HK$1可獲1印花',
          '部分特約商戶可享雙倍或三倍印花',
          '印花將於小票審核通過後自動存入帳戶',
          '每張小票最多可獲10,000印花',
        ],
      },
      {
        heading: '印花有效期',
        items: [
          '印花自獲取日起計12個月內有效',
          '過期印花將自動從帳戶中扣除',
          '會員等級升級時，部分印花有效期可延長',
        ],
      },
      {
        heading: '印花使用',
        items: [
          '印花可用於兌換禮品、優惠券及參加抽獎活動',
          '兌換後印花將即時從帳戶中扣除',
          '已兌換的印花不可退還',
        ],
      },
      {
        heading: '會員等級',
        items: [
          '綠卡會員：註冊即可成為',
          '銀卡會員：年度累積500印花',
          '金卡會員：年度累積2,000印花',
          '白金會員：年度累積5,000印花',
          '鑽石會員：年度累積10,000印花',
        ],
      },
      {
        heading: '等級權益',
        items: [
          '銀卡：消費印花1.2倍、生日月雙倍印花',
          '金卡：消費印花1.5倍、免費泊車2小時/次',
          '白金：消費印花2倍、免費泊車3小時/次、專屬禮遇',
          '鑽石：消費印花3倍、免費泊車4小時/次、VIP專屬通道',
        ],
      },
      {
        heading: '注意事項',
        items: [
          '小票需於消費後7天內提交',
          '每張小票只可提交一次',
          '退貨交易將扣除相應印花',
          '領展保留修改印花規則的權利',
          '如有任何爭議，以領展最終決定為準',
        ],
      },
    ],
  },
  'zh-CN': {
    title: '印花规则',
    sections: [
      {
        heading: '如何获取印花',
        items: [
          '每次于参与商场消费满HK$50或以上，即可扫描小票获取印花',
          '基本比率：每消费HK$1可获1印花',
          '部分特约商户可享双倍或三倍印花',
          '印花将于小票审核通过后自动存入账户',
          '每张小票最多可获10,000印花',
        ],
      },
      {
        heading: '印花有效期',
        items: [
          '印花自获取日起计12个月内有效',
          '过期印花将自动从账户中扣除',
          '会员等级升级时，部分印花有效期可延长',
        ],
      },
      {
        heading: '印花使用',
        items: [
          '印花可用于兑换礼品、优惠券及参加抽奖活动',
          '兑换后印花将即时从账户中扣除',
          '已兑换的印花不可退还',
        ],
      },
      {
        heading: '会员等级',
        items: [
          '绿卡会员：注册即可成为',
          '银卡会员：年度累积500印花',
          '金卡会员：年度累积2,000印花',
          '白金会员：年度累积5,000印花',
          '钻石会员：年度累积10,000印花',
        ],
      },
      {
        heading: '等级权益',
        items: [
          '银卡：消费印花1.2倍、生日月双倍印花',
          '金卡：消费印花1.5倍、免费泊车2小时/次',
          '白金：消费印花2倍、免费泊车3小时/次、专属礼遇',
          '钻石：消费印花3倍、免费泊车4小时/次、VIP专属通道',
        ],
      },
      {
        heading: '注意事项',
        items: [
          '小票需于消费后7天内提交',
          '每张小票只可提交一次',
          '退货交易将扣除相应印花',
          '领展保留修改印花规则的权利',
          '如有任何争议，以领展最终决定为准',
        ],
      },
    ],
  },
  en: {
    title: 'Stamp Rules',
    sections: [
      {
        heading: 'How to Earn Stamps',
        items: [
          'Scan your receipt for purchases of HK$50 or above at participating malls',
          'Base rate: 1 stamp per HK$1 spent',
          'Selected merchants offer double or triple stamps',
          'Stamps are credited after receipt verification',
          'Maximum 10,000 stamps per receipt',
        ],
      },
      {
        heading: 'Stamp Validity',
        items: [
          'Stamps are valid for 12 months from the date of earning',
          'Expired stamps are automatically deducted',
          'Validity may be extended upon tier upgrade',
        ],
      },
      {
        heading: 'Using Stamps',
        items: [
          'Stamps can be redeemed for gifts, coupons, and lucky draw entries',
          'Redeemed stamps are immediately deducted',
          'Redeemed stamps are non-refundable',
        ],
      },
      {
        heading: 'Membership Tiers',
        items: [
          'Green: Free upon registration',
          'Silver: 500 stamps per year',
          'Gold: 2,000 stamps per year',
          'Platinum: 5,000 stamps per year',
          'Diamond: 10,000 stamps per year',
        ],
      },
      {
        heading: 'Tier Benefits',
        items: [
          'Silver: 1.2x stamps, birthday month double stamps',
          'Gold: 1.5x stamps, 2-hour free parking per visit',
          'Platinum: 2x stamps, 3-hour free parking, exclusive perks',
          'Diamond: 3x stamps, 4-hour free parking, VIP access',
        ],
      },
      {
        heading: 'Terms & Conditions',
        items: [
          'Receipts must be submitted within 7 days of purchase',
          'Each receipt can only be submitted once',
          'Returned transactions will result in stamp deduction',
          'Link REIT reserves the right to amend stamp rules',
          'In case of disputes, Link REIT\'s decision is final',
        ],
      },
    ],
  },
};

export default function StampRulesScreen() {
  const { locale } = useLocale();
  const content = rulesContent[locale];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {content.sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
          </View>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.item}>
              <View style={styles.bullet} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {locale === 'en'
            ? 'Last updated: January 2024'
            : locale === 'zh-CN'
            ? '最后更新：2024年1月'
            : '最後更新：2024年1月'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary, justifyContent: 'center',
    alignItems: 'center', marginRight: 10,
  },
  sectionNumberText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  sectionHeading: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingLeft: 4 },
  bullet: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primary, marginTop: 7, marginRight: 10,
  },
  itemText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  footer: { alignItems: 'center', marginTop: 8 },
  footerText: { fontSize: 12, color: COLORS.textTertiary },
});
