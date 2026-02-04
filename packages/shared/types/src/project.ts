import { AuditFields, CommonStatus, MultiLangText } from './common';

/** Project list item (项目列表) */
export interface ProjectListItem {
  id: string;
  name: MultiLangText;
  code: string;
  status: CommonStatus;
  memberCount: number;
  merchantCount: number;
  address: MultiLangText;
}

/** Project detail for management */
export interface ProjectDetail {
  id: string;
  groupId: string;
  name: MultiLangText;
  code: string;
  status: CommonStatus;
  /** Number of linked system integrations */
  integrationCount: number;
  /** Direct link to system for querying */
  systemLink: string;
}
