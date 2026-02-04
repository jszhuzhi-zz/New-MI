import { AuditFields, CommonStatus, MultiLangText } from './common';

/** Message center (消息中心) */
export interface MessageCenter {
  /** Notification and campaign push to member message management */
  notifications: MemberNotification[];
  unreadCount: number;
  totalCount: number;
}

/** Member notification */
export interface MemberNotification extends AuditFields {
  id: string;
  memberId: string;
  title: MultiLangText;
  body: MultiLangText;
  type: 'system' | 'campaign' | 'stamp' | 'tier' | 'coupon' | 'reminder';
  /** Link to related entity */
  linkType?: string;
  linkId?: string;
  read: boolean;
  readAt?: Date;
  /** Delivery channels */
  deliveredVia: ('push' | 'sms' | 'email' | 'in-app')[];
  /** Support app, SMS, APP push in-page messages */
  priority: 'low' | 'normal' | 'high';
}

/** Interface monitoring (接口监控) */
export interface InterfaceMonitor extends AuditFields {
  id: string;
  /** Monitor third party systems (like CRM/parking lot interface) */
  systemName: string;
  interfaceName: string;
  url: string;
  method: string;
  /** Health status */
  status: 'healthy' | 'degraded' | 'down';
  /** Last check */
  lastCheckAt: Date;
  /** Response time ms */
  responseTimeMs: number;
  /** Uptime percentage */
  uptimePercent: number;
  /** Error rate */
  errorRate: number;
  /** Provide health status and alert functions */
  alertThresholds: {
    responseTimeMs: number;
    errorRate: number;
    uptimePercent: number;
  };
  /** Alert contacts */
  alertContacts: string[];
}

/** SMS sending record */
export interface SmsSendRecord extends AuditFields {
  id: string;
  memberId?: string;
  phone: string;
  type: 'verification' | 'notification' | 'marketing';
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  provider: string;
  providerId?: string;
  errorMessage?: string;
}
