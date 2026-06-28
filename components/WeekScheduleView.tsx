// Outlook-style weekly calendar that DISPLAYS all scheduled class sessions as
// colored blocks positioned on a day x time grid. Pure render (no client JS).

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
const STEP = 30; // minutes per row
const SLOT_PX = 22;
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / STEP;
const GRID_H = TOTAL_SLOTS * SLOT_PX;

// Static color strings so Tailwind generates them.
export const SCHEDULE_COLORS = [
  "bg-brand-100 border-brand-500 text-brand-800",
  "bg-blue-100 border-blue-500 text-blue-800",
  "bg-emerald-100 border-emerald-500 text-emerald-800",
  "bg-amber-100 border-amber-500 text-amber-800",
  "bg-pink-100 border-pink-500 text-pink-800",
  "bg-purple-100 border-purple-500 text-purple-800",
  "bg-teal-100 border-teal-500 text-teal-800",
  "bg-rose-100 border-rose-500 text-rose-800",
];

export function scheduleColor(index: number): string {
  return SCHEDULE_COLORS[index % SCHEDULE_COLORS.length];
}

export type CalSession = {
  id: string;
  day: number; // 0-6
  start: string; // "HH:MM" or "HH:MM:SS"
  end: string;
  title: string;
  room?: string | null;
  colorIndex: number;
};

function toMin(t: string): number {
  return Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
}

// Greedy lane packing for overlapping sessions in one day.
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

export default function WeekScheduleView({ sessions }: { sessions: CalSession[] }) {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <div className="min-w-[720px]">
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
          {DAYS.map((d) => {
            const dayItems = sessions.filter((s) => s.day === d.idx);
            const { placed, lanes } = packLanes(dayItems);
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
                {placed.map(({ s, lane }) => {
                  const top = Math.max(0, ((toMin(s.start) - START_HOUR * 60) / STEP) * SLOT_PX);
                  const rawH = ((toMin(s.end) - toMin(s.start)) / STEP) * SLOT_PX;
                  const height = Math.min(Math.max(rawH, 18), GRID_H - top);
                  return (
                    <div
                      key={s.id}
                      className={`absolute overflow-hidden rounded-md border-l-4 px-1.5 py-0.5 text-[11px] leading-tight ${scheduleColor(s.colorIndex)}`}
                      style={{
                        top,
                        height,
                        left: `calc(${lane * widthPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                      }}
                      title={`${s.title} · ${s.start.slice(0, 5)}–${s.end.slice(0, 5)}${s.room ? ` · ${s.room}` : ""}`}
                    >
                      <div className="truncate font-semibold">{s.title}</div>
                      <div className="truncate tabular-nums opacity-80">
                        {s.start.slice(0, 5)}–{s.end.slice(0, 5)}
                        {s.room ? ` · ${s.room}` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
