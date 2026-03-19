// Type định nghĩa cho Group
export interface Group {
  id: number;
  groupName: string;
  description: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
}

// Type định nghĩa cho PageRole
export interface PageRole {
  id: number;
  pageName: string;
  pageUrl: string;
  pageIcon: string | null;
  parentId: number;
  menuIndex: number;
  level: number;
  pageType: string | null;
  roles: string; // "13,39,40,41,58"
  roleId: number;
  children?: PageRole[];
}

// Type định nghĩa cho User
export interface User {
  id: number;
  avatar: string;
  fullName: string;
  username: string;
  password: string | null;
  status: string;
  phone: string;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  fullNameNotMark: string;
  groups: Group[];
}

export type TGroupDetail = {
  group: Group;
  users: User[];
  pageRoles: PageRole[];
};

// Type định nghĩa cho toàn bộ response data
export interface ApiResponseGetMe {
  groups: Group[];
  pageRoles: PageRole[];
  user: User;
}

// Enum cho User Status (tuỳ chọn)
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// Type cho User với enum status (tuỳ chọn)
export interface UserWithEnum extends Omit<User, 'status'> {
  status: UserStatus;
}
