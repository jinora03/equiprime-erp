import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import { projectSeed } from "./data";
import type { Project, ProjectInput } from "./types";

const store = createRecordStore<Project>(projectSeed);
let counter = projectSeed.length;

export const projectService = {
  ...store,
  create(input: ProjectInput): Promise<Project> {
    const now = new Date().toISOString();
    counter += 1;
    const record: Project = {
      id: nextRecordId(),
      code: `PRJ-2026-${String(counter).padStart(3, "0")}`,
      title: input.title,
      moduleId: "projects",
      currentStageId: "pr-planning",
      history: [historyEntry(null, "pr-planning", input.actor, undefined, now)],
      assignee: input.manager,
      client: input.client,
      manager: input.manager,
      progress: 0,
      startDate: input.startDate,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    return store.add(record);
  },
};
