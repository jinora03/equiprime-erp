export interface Department {
  id: number;
  name: string;
  slug: string;
  code: string;
  description?: string | null;
  head?: string | null;
  color: string;
  member_count: number;
}

export interface DepartmentInput {
  name: string;
  code: string;
  description?: string;
  head?: string;
  color?: string;
}
