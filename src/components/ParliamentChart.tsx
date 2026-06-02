interface Seat {
  name: string;
  votes: number;
  color: string;
}

interface Props {
  data: Seat[];
  totalSeats?: number;
}

// Distinct HSL palette using design tokens fallback
const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(217 91% 60%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(0 84% 60%)",
  "hsl(280 65% 60%)",
  "hsl(173 58% 39%)",
  "hsl(24 70% 50%)",
  "hsl(199 89% 48%)",
];

export const ParliamentChart = ({ data, totalSeats = 60 }: Props) => {
  const totalVotes = data.reduce((s, d) => s + d.votes, 0);

  // Allocate seats proportionally (largest remainder)
  const allocations = data.map((d, i) => {
    const exact = totalVotes > 0 ? (d.votes / totalVotes) * totalSeats : 0;
    return { ...d, color: d.color || PALETTE[i % PALETTE.length], exact, seats: Math.floor(exact) };
  });
  let assigned = allocations.reduce((s, a) => s + a.seats, 0);
  const remainders = [...allocations]
    .map((a, i) => ({ i, rem: a.exact - Math.floor(a.exact) }))
    .sort((a, b) => b.rem - a.rem);
  let r = 0;
  while (assigned < totalSeats && totalVotes > 0 && r < remainders.length) {
    allocations[remainders[r].i].seats += 1;
    assigned += 1;
    r += 1;
  }

  // Build seat positions in a hemicycle. Use multiple rows.
  const rows = 4;
  const seatsPerRow: number[] = [];
  let remaining = totalSeats;
  // Distribute roughly proportional to row radius
  const weights = Array.from({ length: rows }, (_, i) => i + 2);
  const weightSum = weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < rows; i++) {
    const count = i === rows - 1 ? remaining : Math.round((weights[i] / weightSum) * totalSeats);
    seatsPerRow.push(count);
    remaining -= count;
  }

  const width = 400;
  const height = 220;
  const cx = width / 2;
  const cy = height - 10;
  const innerR = 70;
  const outerR = 180;

  type SeatPos = { x: number; y: number; angle: number };
  const positions: SeatPos[] = [];
  for (let row = 0; row < rows; row++) {
    const radius = innerR + ((outerR - innerR) * row) / (rows - 1);
    const n = seatsPerRow[row];
    for (let s = 0; s < n; s++) {
      // angle from PI (left) to 0 (right)
      const t = n === 1 ? 0.5 : s / (n - 1);
      const angle = Math.PI - t * Math.PI;
      positions.push({
        x: cx + Math.cos(angle) * radius,
        y: cy - Math.sin(angle) * radius,
        angle,
      });
    }
  }
  // Sort left-to-right by angle descending (PI -> 0)
  positions.sort((a, b) => b.angle - a.angle);

  // Assign colors per seat following allocations order
  const seatColors: string[] = [];
  allocations.forEach((a) => {
    for (let i = 0; i < a.seats; i++) seatColors.push(a.color);
  });
  // Pad if rounding short
  while (seatColors.length < positions.length) seatColors.push("hsl(var(--muted))");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {positions.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={7} fill={seatColors[i]} stroke="hsl(var(--background))" strokeWidth={1.5} />
        ))}
        <text x={cx} y={cy - 20} textAnchor="middle" className="fill-foreground" fontSize="22" fontWeight="700">
          {totalSeats}
        </text>
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          seats
        </text>
      </svg>
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        {allocations.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: a.color }} />
            <span className="font-medium">{a.name}</span>
            <span className="text-muted-foreground">
              {a.seats} {a.seats === 1 ? "seat" : "seats"} · {a.votes} votes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
