import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Clock, GripVertical, User } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { TONE } from "@/shared/components/workflow-tones";
import { formatDate } from "@/utils/format";
import {
  canTransitionWorkItemStatus,
  WORK_ITEM_STATUSES,
  type WorkItemStatus,
} from "../statuses";
import type { WorkItem } from "../types";

interface WorkItemKanbanProps {
  items: WorkItem[];
  canMove?: boolean | ((item: WorkItem) => boolean);
  onMove: (id: number, status: WorkItemStatus) => void;
}

/**
 * Work item Kanban. Columns come from the fixed status config (not hardcoded);
 * callers may authorize movement per item; the mutation service re-checks it.
 * Columns fill the width and stay comfortably sized.
 */
export function WorkItemKanban({ items, canMove = false, onMove }: WorkItemKanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [activeId, setActiveId] = useState<number | null>(null);

  const byStatus = useMemo(() => {
    const map: Record<string, WorkItem[]> = {};
    for (const s of WORK_ITEM_STATUSES) map[s.id] = [];
    for (const item of items) (map[item.status] ??= []).push(item);
    return map;
  }, [items]);

  const activeItem = items.find((i) => i.id === activeId) ?? null;
  const canMoveItem = (item: WorkItem) =>
    typeof canMove === "function" ? canMove(item) : canMove;

  const handleDragStart = (e: DragStartEvent) => setActiveId(Number(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const status = String(over.id) as WorkItemStatus;
    const item = items.find((i) => i.id === Number(active.id));
    if (
      item &&
      canMoveItem(item) &&
      item.status !== status &&
      canTransitionWorkItemStatus(item.status, status)
    ) {
      onMove(item.id, status);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex w-full gap-4 overflow-x-auto pb-2">
        {WORK_ITEM_STATUSES.map((status) => (
          <Column
            key={status.id}
            id={status.id}
            label={status.label}
            tone={status.tone}
            count={byStatus[status.id]?.length ?? 0}
          >
            {(byStatus[status.id] ?? []).map((item) =>
              canMoveItem(item) ? (
                <DraggableCard key={item.id} id={item.id}>
                  <ItemCard item={item} draggable />
                </DraggableCard>
              ) : (
                <ItemCard key={item.id} item={item} />
              ),
            )}
          </Column>
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeItem ? <ItemCard item={activeItem} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  id,
  label,
  tone,
  count,
  children,
}: {
  id: string;
  label: string;
  tone: keyof typeof TONE;
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-64 min-w-64 flex-1 flex-col rounded-xl border bg-muted/30 transition-colors",
        isOver && "border-primary/50 bg-primary/[0.05]",
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className={cn("h-2 w-2 rounded-full", TONE[tone].dot)} />
          {label}
        </span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex min-h-[100px] flex-1 flex-col gap-2 p-2">
        {children}
      </div>
    </div>
  );
}

function ItemCard({
  item,
  draggable,
  overlay,
}: {
  item: WorkItem;
  draggable?: boolean;
  overlay?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 shadow-soft",
        overlay && "rotate-1 shadow-elevated",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[11px] text-muted-foreground">{item.code}</p>
        <div className="flex items-center gap-1">
          <PriorityBadge priority={item.priority} />
          {draggable ? (
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          ) : null}
        </div>
      </div>
      <p className="mt-1 text-sm font-medium leading-snug text-foreground">
        {item.task}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1 truncate">
          <User className="h-3.5 w-3.5" />
          {item.assignee ?? "Unassigned"}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {item.actualHours}/{item.estimatedHours}h
        </span>
      </div>
      {item.dueDate ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Due {formatDate(item.dueDate)}
        </p>
      ) : null}
    </div>
  );
}

function DraggableCard({ id, children }: { id: number; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      {children}
    </div>
  );
}
