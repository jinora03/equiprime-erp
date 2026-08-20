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
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { Workflow, WorkflowRecord, WorkflowStage } from "@/types";

interface WorkflowKanbanProps<T extends WorkflowRecord> {
  items: T[];
  workflow: Workflow;
  /** Called on drop; the parent/service validates before committing the move. */
  onMove: (id: number, toStageId: string) => void | Promise<void>;
  canMove?: boolean;
  renderCard: (item: T) => ReactNode;
}

/**
 * Generic Kanban board for any workflow-driven record. Columns are generated
 * from the assigned workflow's stages — never hardcoded — so editing the
 * workflow reshapes the board automatically. Columns expand to fill the
 * available width (Jira/Linear-style) and scroll only when there are many
 * stages. Drag-and-drop uses @dnd-kit with the drop-return animation disabled;
 * the service validates the requested transition before the record is updated.
 */
export function WorkflowKanban<T extends WorkflowRecord>({
  items,
  workflow,
  onMove,
  canMove = false,
  renderCard,
}: WorkflowKanbanProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [activeId, setActiveId] = useState<number | null>(null);

  const stages = useMemo(
    () => [...workflow.stages].sort((a, b) => a.order - b.order),
    [workflow.stages],
  );

  const byStage = useMemo(() => {
    const map: Record<string, T[]> = {};
    for (const stage of stages) map[stage.id] = [];
    for (const item of items) (map[item.currentStageId] ??= []).push(item);
    return map;
  }, [items, stages]);

  const activeItem = items.find((i) => i.id === activeId) ?? null;

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(Number(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const toStageId = String(over.id);
    const item = items.find((i) => i.id === Number(active.id));
    if (item && item.currentStageId !== toStageId) {
      onMove(item.id, toStageId);
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
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            count={byStage[stage.id]?.length ?? 0}
          >
            {(byStage[stage.id] ?? []).map((item) =>
              canMove ? (
                <DraggableCard key={item.id} id={item.id}>
                  {renderCard(item)}
                </DraggableCard>
              ) : (
                <div key={item.id}>{renderCard(item)}</div>
              ),
            )}
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="rotate-1 cursor-grabbing">{renderCard(activeItem)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  stage,
  count,
  children,
}: {
  stage: WorkflowStage;
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-64 min-w-64 flex-1 flex-col rounded-xl border bg-muted/30 transition-colors",
        isOver && "border-primary/50 bg-primary/[0.05]",
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <span className="truncate text-sm font-semibold text-foreground">
          {stage.name}
        </span>
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-background px-1.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
        {children}
      </div>
    </div>
  );
}

function DraggableCard({ id, children }: { id: number; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    // Hide the source while dragging; the DragOverlay shows the moving card.
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
