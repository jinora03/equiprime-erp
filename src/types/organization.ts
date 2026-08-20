export interface Company {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  displayName: string;
  region: string;
  attendanceRate: number;
}

export interface OrganizationScope {
  companyId: string;
  branchId: string;
}
