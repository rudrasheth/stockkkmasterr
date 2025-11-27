// api/warehouse/heatmap.ts
// Edge-friendly handler that returns mock heatmap data (cols, rows, cells)

export const config = {
  runtime: "edge", // use the Edge runtime (fast). Change to 'nodejs' if you need Node globals.
};

export default function handler(req: Request): Response {
  const cols = 6;
  const rows = 4;
  const cells: Array<any> = [];

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const intensity = Math.random(); // 0..1
      const hasSku = Math.random() > 0.7;
      cells.push({
        id: `r${r}c${c}`,
        row: r,
        col: c,
        sku: hasSku ? `SKU-${Math.floor(Math.random() * 900) + 100}` : undefined,
        intensity: Math.round(intensity * 100) / 100,
      });
    }
  }

  const body = JSON.stringify({ cols, rows, cells });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
    },
  });
}
