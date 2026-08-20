import type { WorkflowRecord } from "@/types";

export interface Project extends WorkflowRecord {
  client: string;
  manager: string;
  progress: number; // 0–100
  startDate: string;
  dueDate: string;
}

export interface ProjectInput {
  title: string;
  client: string;
  manager: string;
  startDate: string;
  dueDate: string;
  actor: string;
}
