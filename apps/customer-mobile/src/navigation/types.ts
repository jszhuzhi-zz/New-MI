import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ─── Auth Stack ──────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: { phone?: string };
  ForgotPassword: undefined;
};

export type AuthScreenNavigationProp<T extends keyof AuthStackParamList> =
  StackNavigationProp<AuthStackParamList, T>;

export type AuthScreenRouteProp<T extends keyof AuthStackParamList> =
  RouteProp<AuthStackParamList, T>;

// ─── Main Tab Navigator ─────────────────────────────────────────────────────

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  StampTab: NavigatorScreenParams<StampStackParamList>;
  ScanTab: undefined;
  OffersTab: NavigatorScreenParams<OffersStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  BottomTabNavigationProp<MainTabParamList, T>;

// ─── Home Stack ──────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  Home: undefined;
  CampaignDetail: { campaignId: string };
  MallDirectory: { mallId?: string };
  MerchantDetail: { merchantId: string };
  ServiceDirectory: { mallId: string };
  Parking: { mallId: string };
  Notifications: undefined;
};

export type HomeScreenNavigationProp<T extends keyof HomeStackParamList> =
  StackNavigationProp<HomeStackParamList, T>;

export type HomeScreenRouteProp<T extends keyof HomeStackParamList> =
  RouteProp<HomeStackParamList, T>;

// ─── Stamp Stack ─────────────────────────────────────────────────────────────

export type StampStackParamList = {
  Stamps: undefined;
  StampDetail: { transactionId: string };
  StampRules: undefined;
};

export type StampScreenNavigationProp<T extends keyof StampStackParamList> =
  StackNavigationProp<StampStackParamList, T>;

export type StampScreenRouteProp<T extends keyof StampStackParamList> =
  RouteProp<StampStackParamList, T>;

// ─── Offers Stack ────────────────────────────────────────────────────────────

export type OffersStackParamList = {
  Offers: undefined;
  CampaignDetail: { campaignId: string };
  CouponList: undefined;
  CouponDetail: { couponId: string };
  LuckyDraw: { campaignId: string };
  GiftCatalog: undefined;
  GiftRedemption: { giftId: string };
};

export type OffersScreenNavigationProp<T extends keyof OffersStackParamList> =
  StackNavigationProp<OffersStackParamList, T>;

export type OffersScreenRouteProp<T extends keyof OffersStackParamList> =
  RouteProp<OffersStackParamList, T>;

// ─── Profile Stack ───────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  TierInfo: undefined;
  MessageCenter: undefined;
  FavoriteStores: undefined;
  Settings: undefined;
  TransactionHistory: undefined;
  HelpFAQ: undefined;
  About: undefined;
};

export type ProfileScreenNavigationProp<T extends keyof ProfileStackParamList> =
  StackNavigationProp<ProfileStackParamList, T>;

export type ProfileScreenRouteProp<T extends keyof ProfileStackParamList> =
  RouteProp<ProfileStackParamList, T>;

// ─── Root Navigator ──────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface MemberTier {
  id: string;
  name: string;
  nameZh: string;
  color: string;
  minStamps: number;
  benefits: string[];
}

export interface StampTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  amount: number;
  balance: number;
  description: string;
  mallName: string;
  merchantName?: string;
  receiptAmount?: number;
  timestamp: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  type: 'stamp_bonus' | 'lucky_draw' | 'gift_redemption' | 'coupon' | 'event';
  mallId?: string;
  mallName?: string;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  merchantName: string;
  mallName: string;
  imageUrl: string;
  code: string;
  expiryDate: string;
  status: 'active' | 'used' | 'expired';
  terms: string[];
}

export interface Gift {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  stampCost: number;
  stock: number;
  category: string;
}

export interface Mall {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  floors: number;
  openingHours: string;
  phone: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  mallId: string;
  mallName: string;
  floor: string;
  unit: string;
  imageUrl: string;
  phone?: string;
  stampMultiplier: number;
  isFavorite: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'stamp' | 'campaign' | 'coupon' | 'system' | 'tier';
  timestamp: string;
  isRead: boolean;
  data?: Record<string, string>;
}
