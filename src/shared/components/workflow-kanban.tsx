import { useEffect, useMemo, useRef, useState } from "react";
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
  /** Stretch columns to the available viewport height for full-page boards. */
  fillAvailableHeight?: boolean;
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
  fillAvailableHeight = false,
  renderCard,
}: WorkflowKanbanProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // dnd-kit's nested scroll handling can feel awkward when workflow columns
  // scroll vertically inside a horizontally scrolling board. While pointer
  // dragging, scroll only the board when the pointer approaches its edges.
  useEffect(() => {
    if (activeId == null) return;

    const board = boardRef.current;
    if (!board) return;

    let direction = 0;
    let frame = 0;
    const edgeSize = 96;
    const scrollStep = 12;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = board.getBoundingClientRect();
      const canScroll = board.scrollWidth > board.clientWidth;
      const withinVerticalBounds =
        event.clientY >= rect.top && event.clientY <= rect.bottom;

      if (!canScroll || !withinVerticalBounds) {
        direction = 0;
      } else if (event.clientX <= rect.left + edgeSize) {
        direction = -1;
      } else if (event.clientX >= rect.right - edgeSize) {
        direction = 1;
      } else {
        direction = 0;
      }
    };

    const scroll = () => {
      if (direction !== 0) board.scrollLeft += direction * scrollStep;
      frame = window.requestAnimationFrame(scroll);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    frame = window.requestAnimationFrame(scroll);

    return () => {
      direction = 0;
      window.removeEventListener("pointermove", handlePointerMove);
      window.cancelAnimationFrame(frame);
    };
  }, [activeId]);

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
      autoScroll={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div
        ref={boardRef}
        className={cn(
          "flex w-full gap-4 overflow-x-auto overscroll-x-contain pb-3",
          fillAvailableHeight
            ? "h-[calc(100dvh-13rem)] min-h-[22rem] items-stretch"
            : "items-start",
          activeId == null ? "snap-x snap-proximity" : "snap-none",
        )}
      >
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            count={byStage[stage.id]?.length ?? 0}
            fillAvailableHeight={fillAvailableHeight}
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
  fillAvailableHeight,
}: {
  stage: WorkflowStage;
  count: number;
  children: ReactNode;
  fillAvailableHeight: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[82vw] min-w-[82vw] snap-start flex-col overflow-hidden rounded-xl border bg-muted/30 transition-colors sm:w-64 sm:min-w-64 lg:flex-1",
        fillAvailableHeight ? "h-full" : "max-h-[70vh]",
        isOver && "border-primary/50 bg-primary/[0.05]",
      )}
    >
      <div className="shrink-0 flex items-center justify-between border-b bg-muted/40 px-3 py-2.5">
        <span className="truncate text-sm font-semibold text-foreground">
          {stage.name}
        </span>
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-background px-1.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto p-2">
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
