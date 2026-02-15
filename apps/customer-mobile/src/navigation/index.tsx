import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  StampStackParamList,
  OffersStackParamList,
  ProfileStackParamList,
} from './types';

import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';

// Auth Screens
import LoginScreen from '../pages/auth/LoginScreen';
import RegisterScreen from '../pages/auth/RegisterScreen';
import ForgotPasswordScreen from '../pages/auth/ForgotPasswordScreen';

// Home Screens
import HomeScreen from '../pages/home/HomeScreen';

// Stamp Screens
import StampScreen from '../pages/stamp/StampScreen';
import StampDetailScreen from '../pages/stamp/StampDetailScreen';
import StampRulesScreen from '../pages/stamp/StampRulesScreen';

// Scan Screen
import ScanScreen from '../pages/scan/ScanScreen';

// Offers Screens
import OffersScreen from '../pages/offers/OffersScreen';
import CampaignDetailScreen from '../pages/offers/CampaignDetailScreen';
import CouponListScreen from '../pages/offers/CouponListScreen';
import CouponDetailScreen from '../pages/offers/CouponDetailScreen';
import LuckyDrawScreen from '../pages/offers/LuckyDrawScreen';
import GiftCatalogScreen from '../pages/offers/GiftCatalogScreen';
import GiftRedemptionScreen from '../pages/offers/GiftRedemptionScreen';

// Profile Screens
import ProfileScreen from '../pages/profile/ProfileScreen';
import EditProfileScreen from '../pages/profile/EditProfileScreen';
import TierInfoScreen from '../pages/profile/TierInfoScreen';
import MessageCenterScreen from '../pages/profile/MessageCenterScreen';
import FavoriteStoresScreen from '../pages/profile/FavoriteStoresScreen';
import AICustomerServiceScreen from '../pages/profile/AICustomerServiceScreen';
import SettingsScreen from '../pages/profile/SettingsScreen';

// Mall Screens
import MallDirectoryScreen from '../pages/mall/MallDirectoryScreen';
import MerchantDetailScreen from '../pages/mall/MerchantDetailScreen';
import ServiceDirectoryScreen from '../pages/mall/ServiceDirectoryScreen';
import ParkingScreen from '../pages/mall/ParkingScreen';

// ─── i18n labels ─────────────────────────────────────────────────────────────

const tabLabels: Record<string, Record<string, string>> = {
  HomeTab: { 'zh-TW': '首頁', 'zh-CN': '首页', en: 'Home' },
  StampTab: { 'zh-TW': '印花', 'zh-CN': '印花', en: 'Stamps' },
  ScanTab: { 'zh-TW': '掃描', 'zh-CN': '扫描', en: 'Scan' },
  OffersTab: { 'zh-TW': '優惠', 'zh-CN': '优惠', en: 'Offers' },
  ProfileTab: { 'zh-TW': '我的', 'zh-CN': '我的', en: 'Profile' },
};

const headerTitles: Record<string, Record<string, string>> = {
  Login: { 'zh-TW': '登入', 'zh-CN': '登录', en: 'Login' },
  Register: { 'zh-TW': '註冊', 'zh-CN': '注册', en: 'Register' },
  ForgotPassword: { 'zh-TW': '忘記密碼', 'zh-CN': '忘记密码', en: 'Forgot Password' },
  Home: { 'zh-TW': '領展商場', 'zh-CN': '领展商场', en: 'Link Mall' },
  Stamps: { 'zh-TW': '我的印花', 'zh-CN': '我的印花', en: 'My Stamps' },
  StampDetail: { 'zh-TW': '印花詳情', 'zh-CN': '印花详情', en: 'Stamp Detail' },
  StampRules: { 'zh-TW': '印花規則', 'zh-CN': '印花规则', en: 'Stamp Rules' },
  Scan: { 'zh-TW': '掃描', 'zh-CN': '扫描', en: 'Scan' },
  Offers: { 'zh-TW': '優惠活動', 'zh-CN': '优惠活动', en: 'Offers' },
  CampaignDetail: { 'zh-TW': '活動詳情', 'zh-CN': '活动详情', en: 'Campaign Detail' },
  CouponList: { 'zh-TW': '我的優惠券', 'zh-CN': '我的优惠券', en: 'My Coupons' },
  CouponDetail: { 'zh-TW': '優惠券詳情', 'zh-CN': '优惠券详情', en: 'Coupon Detail' },
  LuckyDraw: { 'zh-TW': '幸運抽獎', 'zh-CN': '幸运抽奖', en: 'Lucky Draw' },
  GiftCatalog: { 'zh-TW': '禮品換購', 'zh-CN': '礼品换购', en: 'Gift Catalog' },
  GiftRedemption: { 'zh-TW': '兌換禮品', 'zh-CN': '兑换礼品', en: 'Redeem Gift' },
  Profile: { 'zh-TW': '我的', 'zh-CN': '我的', en: 'Profile' },
  EditProfile: { 'zh-TW': '編輯資料', 'zh-CN': '编辑资料', en: 'Edit Profile' },
  TierInfo: { 'zh-TW': '會員等級', 'zh-CN': '会员等级', en: 'Tier Info' },
  MessageCenter: { 'zh-TW': '消息中心', 'zh-CN': '消息中心', en: 'Messages' },
  FavoriteStores: { 'zh-TW': '收藏商戶', 'zh-CN': '收藏商户', en: 'Favorite Stores' },
  AICustomerService: { 'zh-TW': 'AI客服', 'zh-CN': 'AI客服', en: 'AI Customer Service' },
  Settings: { 'zh-TW': '設定', 'zh-CN': '设置', en: 'Settings' },
  MallDirectory: { 'zh-TW': '商場指南', 'zh-CN': '商场指南', en: 'Mall Directory' },
  MerchantDetail: { 'zh-TW': '商戶詳情', 'zh-CN': '商户详情', en: 'Store Detail' },
  ServiceDirectory: { 'zh-TW': '服務指南', 'zh-CN': '服务指南', en: 'Services' },
  Parking: { 'zh-TW': '泊車資訊', 'zh-CN': '停车信息', en: 'Parking' },
};

// ─── Tab Icon Component ──────────────────────────────────────────────────────

const TabIcon: React.FC<{ name: string; focused: boolean; color: string }> = ({
  name,
  focused,
  color,
}) => {
  const iconMap: Record<string, string> = {
    HomeTab: '🏠',
    StampTab: '⭐',
    ScanTab: '📷',
    OffersTab: '🎁',
    ProfileTab: '👤',
  };
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
      <View style={styles.tabIconInner}>
        <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
          {/* Text-based icon placeholder - replace with proper icon library */}
        </View>
      </View>
    </View>
  );
};

// ─── Scan Button Component ───────────────────────────────────────────────────

const ScanTabButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.scanButton} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.scanButtonInner}>
        <View style={styles.scanButtonIcon}>
          <View style={styles.scanIconLine1} />
          <View style={styles.scanIconLine2} />
          <View style={styles.scanCornerTL} />
          <View style={styles.scanCornerTR} />
          <View style={styles.scanCornerBL} />
          <View style={styles.scanCornerBR} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Stack Navigators ────────────────────────────────────────────────────────

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const StampStack = createStackNavigator<StampStackParamList>();
const OffersStack = createStackNavigator<OffersStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: '#00694B',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 17,
  },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: '#F5F5F5' },
};

function AuthNavigator() {
  const locale = useAppStore((s) => s.locale);
  return (
    <AuthStack.Navigator screenOptions={{ ...defaultScreenOptions, headerShown: false }}>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: headerTitles.Login[locale] }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: headerTitles.Register[locale], headerShown: true }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: headerTitles.ForgotPassword[locale], headerShown: true }}
      />
    </AuthStack.Navigator>
  );
}

function HomeNavigator() {
  const locale = useAppStore((s) => s.locale);
  return (
    <HomeStack.Navigator screenOptions={defaultScreenOptions}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: headerTitles.Home[locale], headerShown: false }}
      />
      <HomeStack.Screen
        name="CampaignDetail"
        component={CampaignDetailScreen}
        options={{ title: headerTitles.CampaignDetail[locale] }}
      />
      <HomeStack.Screen
        name="MallDirectory"
        component={MallDirectoryScreen}
        options={{ title: headerTitles.MallDirectory[locale] }}
      />
      <HomeStack.Screen
        name="MerchantDetail"
        component={MerchantDetailScreen}
        options={{ title: headerTitles.MerchantDetail[locale] }}
      />
      <HomeStack.Screen
        name="ServiceDirectory"
        component={ServiceDirectoryScreen}
        options={{ title: headerTitles.ServiceDirectory[locale] }}
      />
      <HomeStack.Screen
        name="Parking"
        component={ParkingScreen}
        options={{ title: headerTitles.Parking[locale] }}
      />
    </HomeStack.Navigator>
  );
}

function StampNavigator() {
  const locale = useAppStore((s) => s.locale);
  return (
    <StampStack.Navigator screenOptions={defaultScreenOptions}>
      <StampStack.Screen
        name="Stamps"
        component={StampScreen}
        options={{ title: headerTitles.Stamps[locale] }}
      />
      <StampStack.Screen
        name="StampDetail"
        component={StampDetailScreen}
        options={{ title: headerTitles.StampDetail[locale] }}
      />
      <StampStack.Screen
        name="StampRules"
        component={StampRulesScreen}
        options={{ title: headerTitles.StampRules[locale] }}
      />
    </StampStack.Navigator>
  );
}

function OffersNavigator() {
  const locale = useAppStore((s) => s.locale);
  return (
    <OffersStack.Navigator screenOptions={defaultScreenOptions}>
      <OffersStack.Screen
        name="Offers"
        component={OffersScreen}
        options={{ title: headerTitles.Offers[locale] }}
      />
      <OffersStack.Screen
        name="CampaignDetail"
        component={CampaignDetailScreen}
        options={{ title: headerTitles.CampaignDetail[locale] }}
      />
      <OffersStack.Screen
        name="CouponList"
        component={CouponListScreen}
        options={{ title: headerTitles.CouponList[locale] }}
      />
      <OffersStack.Screen
        name="CouponDetail"
        component={CouponDetailScreen}
        options={{ title: headerTitles.CouponDetail[locale] }}
      />
      <OffersStack.Screen
        name="LuckyDraw"
        component={LuckyDrawScreen}
        options={{ title: headerTitles.LuckyDraw[locale] }}
      />
      <OffersStack.Screen
        name="GiftCatalog"
        component={GiftCatalogScreen}
        options={{ title: headerTitles.GiftCatalog[locale] }}
      />
      <OffersStack.Screen
        name="GiftRedemption"
        component={GiftRedemptionScreen}
        options={{ title: headerTitles.GiftRedemption[locale] }}
      />
    </OffersStack.Navigator>
  );
}

function ProfileNavigator() {
  const locale = useAppStore((s) => s.locale);
  return (
    <ProfileStack.Navigator screenOptions={defaultScreenOptions}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: headerTitles.Profile[locale] }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: headerTitles.EditProfile[locale] }}
      />
      <ProfileStack.Screen
        name="TierInfo"
        component={TierInfoScreen}
        options={{ title: headerTitles.TierInfo[locale] }}
      />
      <ProfileStack.Screen
        name="MessageCenter"
        component={MessageCenterScreen}
        options={{ title: headerTitles.MessageCenter[locale] }}
      />
      <ProfileStack.Screen
        name="FavoriteStores"
        component={FavoriteStoresScreen}
        options={{ title: headerTitles.FavoriteStores[locale] }}
      />
      <ProfileStack.Screen
        name="AICustomerService"
        component={AICustomerServiceScreen}
        options={{ title: headerTitles.AICustomerService[locale] }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: headerTitles.Settings[locale] }}
      />
    </ProfileStack.Navigator>
  );
}

// ─── Main Tab Navigator ──────────────────────────────────────────────────────

function MainNavigator() {
  const locale = useAppStore((s) => s.locale);
  const insets = useSafeAreaInsets();

  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00694B',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#E0E0E0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <MainTab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarLabel: tabLabels.HomeTab[locale],
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="HomeTab" focused={focused} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="StampTab"
        component={StampNavigator}
        options={{
          tabBarLabel: tabLabels.StampTab[locale],
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="StampTab" focused={focused} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="ScanTab"
        component={ScanScreen}
        options={{
          tabBarLabel: tabLabels.ScanTab[locale],
          tabBarButton: (props) => (
            <ScanTabButton onPress={() => props.onPress?.(undefined as any)} />
          ),
        }}
      />
      <MainTab.Screen
        name="OffersTab"
        component={OffersNavigator}
        options={{
          tabBarLabel: tabLabels.OffersTab[locale],
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="OffersTab" focused={focused} color={color} />
          ),
        }}
      />
      <MainTab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: tabLabels.ProfileTab[locale],
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="ProfileTab" focused={focused} color={color} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
}

// ─── Root Navigator ──────────────────────────────────────────────────────────

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabIconInner: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00694B',
    shadowColor: '#00694B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#00694B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scanButtonIcon: {
    width: 28,
    height: 28,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIconLine1: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  scanIconLine2: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  scanCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
  },
  scanCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
  },
  scanCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
  },
  scanCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
  },
});
