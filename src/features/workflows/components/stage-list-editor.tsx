import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TONE } from "@/shared/components/workflow-tones";
import type { WorkflowStage, WorkflowTone } from "@/types";

const TONES = Object.keys(TONE) as WorkflowTone[];

const newStageId = () => `stg-${Math.random().toString(36).slice(2, 9)}`;

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

interface StageListEditorProps {
  stages: WorkflowStage[];
  onChange: (stages: WorkflowStage[]) => void;
  editable?: boolean;
  getDeleteBlockReason?: (stage: WorkflowStage) => string | null;
}

/**
 * Drag-and-drop stage editor (add / rename / delete / reorder). Uses native
 * HTML5 drag-and-drop (no extra dependency) plus up/down buttons for
 * keyboard/touch. Emits the reordered list to the parent — no persistence here.
 */
export function StageListEditor({
  stages,
  onChange,
  editable = true,
  getDeleteBlockReason,
}: StageListEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const commit = (next: WorkflowStage[]) =>
    onChange(next.map((s, i) => ({ ...s, order: i + 1 })));

  const rename = (index: number, name: string) =>
    commit(stages.map((s, i) => (i === index ? { ...s, name } : s)));

  const setTone = (index: number, tone: WorkflowTone) =>
    commit(stages.map((s, i) => (i === index ? { ...s, tone } : s)));

  const remove = (index: number) => {
    const stage = stages[index];
    const reason = stage ? getDeleteBlockReason?.(stage) : null;
    if (reason) {
      toast.warning("Stage can't be deleted", { description: reason });
      return;
    }
    commit(stages.filter((_, i) => i !== index));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= stages.length) return;
    commit(reorder(stages, from, to));
  };

  const addStage = () =>
    commit([
      ...stages,
      {
        id: newStageId(),
        name: "New Stage",
        order: stages.length + 1,
        tone: TONES[stages.length % TONES.length],
      },
    ]);

  const handleDrop = (target: number) => {
    if (dragIndex !== null && dragIndex !== target) {
      commit(reorder(stages, dragIndex, target));
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {stages.map((stage, index) => (
        <div
          key={stage.id}
          draggable={editable}
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverIndex(index);
          }}
          onDrop={() => handleDrop(index)}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-card p-2 transition-colors",
            editable && "cursor-grab active:cursor-grabbing",
            overIndex === index && dragIndex !== null && "border-primary bg-primary/5",
            dragIndex === index && "opacity-50",
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground">
            {editable ? <GripVertical className="h-4 w-4" /> : null}
          </span>

          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>

          <Input
            value={stage.name}
            onChange={(e) => rename(index, e.target.value)}
            disabled={!editable}
            className="h-9 flex-1"
            aria-label={`Stage ${index + 1} name`}
          />

          <Select
            value={stage.tone}
            onValueChange={(v) => setTone(index, v as WorkflowTone)}
            disabled={!editable}
          >
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((tone) => (
                <SelectItem key={tone} value={tone}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn("h-2.5 w-2.5 rounded-full", TONE[tone].dot)}
                    />
                    <span className="capitalize">{tone}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {editable ? (
            <div className="flex shrink-0 items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, index + 1)}
                disabled={index === stages.length - 1}
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                disabled={stages.length <= 1}
                className="text-destructive hover:text-destructive"
                aria-label="Delete stage"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ))}

      {editable ? (
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={addStage}
        >
          <Plus className="h-4 w-4" /> Add stage
        </Button>
      ) : null}
    </div>
  );
}
