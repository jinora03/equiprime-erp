import type { WorkflowRecord } from "@/types";

export interface Project extends WorkflowRecord {
  client: string;
  manager: string;
  progress: number; // 0–100
  startDate: string;
  dueDate: string;
}

/** Stable read DTO returned by the Projects service/API. */
export type ProjectResponse = Project;

/** API write contract; actor/audit/workflow revision fields are server-owned. */
export interface CreateProjectRequest {
  title: string;
  client: string;
  manager: string;
  startDate: string;
  dueDate: string;
}
