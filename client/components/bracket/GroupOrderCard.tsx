"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { GroupStanding, StandingTeam } from "@/lib/api";

/** One draggable team row inside a group. */
function TeamRow({ team, position }: { team: StandingTeam; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: team.tla });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  // Top 2 positions get the "qualified" highlight.
  const qualifies = position <= 2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 px-3 py-2 rounded-md border cursor-grab active:cursor-grabbing touch-none transition-colors
        ${qualifies ? "bg-volt/10 border-volt/50" : "bg-panel border-line"}`}
    >
      <span
        className={`w-5 text-center font-display font-black text-sm ${
          qualifies ? "text-volt" : "text-ink-dim"
        }`}
      >
        {position}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={team.crest} alt="" className="h-5 w-5 object-contain" />
      <span className="font-display font-bold text-sm flex-1">{team.tla}</span>
      <span className="text-ink-dim text-[10px] font-body uppercase tracking-wider">
        {qualifies ? "Advances" : ""}
      </span>
    </div>
  );
}

/** A group card with drag-to-reorder team rows. */
export default function GroupOrderCard({
  group,
  onReorder,
}: {
  group: GroupStanding;
  onReorder: (teams: StandingTeam[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = group.teams.findIndex((t) => t.tla === active.id);
    const newIndex = group.teams.findIndex((t) => t.tla === over.id);
    onReorder(arrayMove(group.teams, oldIndex, newIndex));
  }

  return (
    <div className="card-angled panel-gradient border border-line p-4">
      <h3 className="font-display font-bold tracking-wide accent-line mb-3">
        {group.group.replace("_", " ")}
      </h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={group.teams.map((t) => t.tla)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {group.teams.map((t, i) => (
              <TeamRow key={t.tla} team={t} position={i + 1} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}