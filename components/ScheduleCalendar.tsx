"use client";

import { useRef, useState } from "react";
import { scheduleColor, type CalSession } from "@/components/WeekScheduleView";

// Outlook-style weekly calendar for creating a class. Shows all EXISTING class
// sessions as muted colored blocks (read-only context), and lets you drag to
// select the NEW class's time slots on top. Drag again over a selection to remove.
// Emits a hidden input `schedule`: [{ day: 0-6, start: "HH:MM", end: "HH:MM" }].

const DAYS = [
  { idx: 1, label: "Mon" },
  { idx: 2, label: "Tue" },
  { idx: 3, label: "Wed" },
  { idx: 4, label: "Thu" },
  { idx: 5, label: "Fri" },
  { idx: 6, label: "Sat" },
  { idx: 0, label: "Sun" },
];

const START_HOUR = 7;
const END_HOUR = 21;
const STEP = 30;
const SLOT_PX = 22;
const SLOTS = ((END_HOUR - START_HOUR) * 60) / STEP;
const GRID_H = SLOTS * SLOT_PX;

function slotTime(slot: number): string {
  const mins = START_HOUR * 60 + slot * STEP;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function toMin(t: string): number {
  return Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
}

type Block = { day: number; start: string; end: string };

function toBlocks(selected: Set<string>): Block[] {
  const blocks: Block[] = [];
  for (let col = 0; col < DAYS.length; col++) {
    let run: number[] = [];
    const flush = () => {
      if (run.length) {
        blocks.push({ day: DAYS[col].idx, start: slotTime(run[0]), end: slotTime(run[run.length - 1] + 1) });
        run = [];
      }
    };
    for (let s = 0; s < SLOTS; s++) {
      if (selected.has(`${col}-${s}`)) run.push(s);
      else flush();
    }
    flush();
  }
  return blocks;
}

function buildInitialSet(initial: { day: number; start: string; end: string }[]): Set<string> {
  const set = new Set<string>();
  for (const s of initial) {
    const col = DAYS.findIndex((d) => d.idx === s.day);
    if (col < 0) continue;
    const startSlot = Math.round((toMin(s.start) - START_HOUR * 60) / STEP);
    const endSlot = Math.round((toMin(s.end) - START_HOUR * 60) / STEP);
    for (let sl = Math.max(0, startSlot); sl < Math.min(SLOTS, endSlot); sl++) {
      set.add(`${col}-${sl}`);
    }
  }
  return set;
}

// Greedy lane packing for overlapping existing sessions in one day.
function packLanes(items: CalSession[]) {
  const sorted = [...items].sort((a, b) => toMin(a.start) - toMin(b.start) || toMin(a.end) - toMin(b.end));
  const laneEnds: number[] = [];
  const placed = sorted.map((s) => {
    const start = toMin(s.start);
    let lane = laneEnds.findIndex((end) => end <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(toMin(s.end));
    } else {
      laneEnds[lane] = toMin(s.end);
    }
    return { s, lane };
  });
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

type Drag = { col: number; anchor: number; current: number; mode: "paint" | "erase" };

export default function ScheduleCalendar({
  existing = [],
  initial = [],
}: {
  existing?: CalSession[];
  initial?: { day: number; start: string; end: string }[];
}) {
  const [selected, setSelected] = useState<Set<string>>(() => buildInitialSet(initial));
  const [drag, setDrag] = useState<Drag | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const blocks = toBlocks(selected);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  function cellFromPoint(x: number, y: number): { col: number; slot: number } | null {
    const el = document.elementFromPoint(x, y);
    const cell = el?.closest<HTMLElement>("[data-col]");
    if (!cell) return null;
    return { col: Number(cell.dataset.col), slot: Number(cell.dataset.slot) };
  }

  function onPointerDown(e: React.PointerEvent) {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-col]");
    if (!target) return;
    const col = Number(target.dataset.col);
    const slot = Number(target.dataset.slot);
    const mode = selected.has(`${col}-${slot}`) ? "erase" : "paint";
    gridRef.current?.setPointerCapture(e.pointerId);
    setDrag({ col, anchor: slot, current: slot, mode });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const hit = cellFromPoint(e.clientX, e.clientY);
    if (hit && hit.col === drag.col && hit.slot !== drag.current) {
      setDrag({ ...drag, current: hit.slot });
    }
  }

  function commit() {
    if (!drag) return;
    const lo = Math.min(drag.anchor, drag.current);
    const hi = Math.max(drag.anchor, drag.current);
    const next = new Set(selected);
    for (let s = lo; s <= hi; s++) {
      const key = `${drag.col}-${s}`;
      if (drag.mode === "paint") next.add(key);
      else next.delete(key);
    }
    setSelected(next);
    setDrag(null);
  }

  function isSelected(col: number, slot: number): boolean {
    if (drag && col === drag.col) {
      const lo = Math.min(drag.anchor, drag.current);
      const hi = Math.max(drag.anchor, drag.current);
      if (slot >= lo && slot <= hi) return drag.mode === "paint";
    }
    return selected.has(`${col}-${slot}`);
  }

  const legend = Array.from(
    new Map(existing.map((s) => [s.title, s.colorIndex])).entries()
  ).map(([name, colorIndex]) => ({ name, colorIndex }));

  return (
    <div>
      <input type="hidden" name="schedule" value={JSON.stringify(blocks)} />

      {legend.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {legend.map((l) => (
            <span key={l.name} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
              <span className={`h-3 w-3 rounded-sm border-l-4 ${scheduleColor(l.colorIndex)}`} />
              {l.name}
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <div
          ref={gridRef}
          className="min-w-[660px] select-none"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={commit}
          onPointerCancel={commit}
        >
          {/* Header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-14 shrink-0" />
            {DAYS.map((d) => (
              <div key={d.idx} className="flex-1 py-2 text-center text-xs font-semibold text-gray-700">
                {d.label}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="flex">
            {/* Time gutter */}
            <div className="relative w-14 shrink-0" style={{ height: GRID_H }}>
              {hours.map((h) => (
                <span
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-gray-400"
                  style={{ top: ((h - START_HOUR) * 60) / STEP * SLOT_PX }}
                >
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((d, col) => {
              const { placed, lanes } = packLanes(existing.filter((s) => s.day === d.idx));
              const widthPct = 100 / lanes;
              return (
                <div
                  key={d.idx}
                  className="relative flex-1 border-l border-gray-100"
                  style={{
                    height: GRID_H,
                    backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${SLOT_PX * 2 - 1}px, #f1f5f9 ${SLOT_PX * 2 - 1}px, #f1f5f9 ${SLOT_PX * 2}px)`,
                  }}
                >
                  {/* Existing sessions (read-only context) */}
                  {placed.map(({ s, lane }) => {
                    const top = Math.max(0, ((toMin(s.start) - START_HOUR * 60) / STEP) * SLOT_PX);
                    const rawH = ((toMin(s.end) - toMin(s.start)) / STEP) * SLOT_PX;
                    const height = Math.min(Math.max(rawH, 16), GRID_H - top);
                    return (
                      <div
                        key={s.id}
                        className={`pointer-events-none absolute overflow-hidden rounded-md border-l-4 px-1 py-0.5 text-[10px] leading-tight opacity-80 ${scheduleColor(s.colorIndex)}`}
                        style={{ top, height, left: `calc(${lane * widthPct}% + 1px)`, width: `calc(${widthPct}% - 2px)` }}
                        title={`${s.title} · ${s.start.slice(0, 5)}–${s.end.slice(0, 5)}`}
                      >
                        <div className="truncate font-semibold">{s.title}</div>
                      </div>
                    );
                  })}

                  {/* Interactive selection overlay */}
                  <div className="absolute inset-0 flex flex-col">
                    {Array.from({ length: SLOTS }).map((_, slot) => (
                      <div
                        key={slot}
                        data-col={col}
                        data-slot={slot}
                        style={{ height: SLOT_PX }}
                        className={`cursor-pointer ${
                          isSelected(col, slot)
                            ? "bg-brand-600/85 ring-1 ring-inset ring-brand-700"
                            : "hover:bg-brand-200/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          {blocks.length === 0
            ? "Drag across the calendar to add this class's times. Existing classes are shown for reference."
            : `${blocks.length} session${blocks.length > 1 ? "s" : ""} selected for this class`}
        </p>
        {blocks.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {blocks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {blocks.map((b, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-md bg-brand-600 px-2 py-1 text-xs font-medium text-white"
            >
              {DAYS.find((d) => d.idx === b.day)?.label} {b.start}–{b.end}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
