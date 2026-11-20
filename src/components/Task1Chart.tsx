import type { Task1ChartData } from '../types/ielts';

interface Task1ChartProps {
  data: Task1ChartData;
}

export function Task1Chart({ data }: Task1ChartProps) {
  if (data.kind === 'table') {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-slate-900">{data.title}</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                {data.headers.map((header, idx) => (
                  <th
                    key={header}
                    className={`px-3 py-2 font-semibold ${
                      idx === 0 ? 'text-left' : 'text-right tabular-nums'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((row) => (
                <tr key={String(row[0])} className="hover:bg-slate-50/70">
                  {row.map((cell, idx) => (
                    <td
                      key={idx}
                      className={`px-3 py-2 ${
                        idx === 0
                          ? 'font-medium text-slate-900'
                          : idx === row.length - 1
                            ? 'text-right font-semibold text-slate-900 font-mono tabular-nums'
                            : 'text-right text-slate-700 font-mono tabular-nums'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const width = 540;
  const height = 270;
  const padLeft = 52;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const allValues = data.series.flatMap((s) => s.values);
  const rawMax = Math.max(...allValues, 10);
  const step = data.unit === '%' ? 20 : Math.ceil(rawMax / 5 / 500) * 500 || 100;
  const maxVal = data.unit === '%' ? 100 : Math.ceil(rawMax / step) * step;
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((maxVal / tickCount) * i),
  );

  const yPos = (val: number) => padTop + plotH - (val / maxVal) * plotH;

  if (data.kind === 'line') {
    const xStep = plotW / Math.max(1, data.xLabels.length - 1);

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-slate-900">{data.title}</span>
          <span className="text-xs font-mono text-slate-500">Unit: {data.unit}</span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label={data.title}
        >
          {/* Horizontal gridlines & Y-axis labels */}
          {yTicks.map((tick) => {
            const y = yPos(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.xLabels.map((label, i) => (
            <text
              key={label}
              x={padLeft + i * xStep}
              y={height - 12}
              textAnchor="middle"
              className="fill-slate-600 text-[11px] font-mono tabular-nums"
            >
              {label}
            </text>
          ))}

          {/* Series lines & data points */}
          {data.series.map((series) => {
            const points = series.values
              .map((v, i) => `${padLeft + i * xStep},${yPos(v)}`)
              .join(' ');
            return (
              <g key={series.name}>
                <polyline
                  fill="none"
                  stroke={series.color}
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={points}
                />
                {series.values.map((v, i) => (
                  <g key={i}>
                    <circle
                      cx={padLeft + i * xStep}
                      cy={yPos(v)}
                      r="3.5"
                      fill="#FFFFFF"
                      stroke={series.color}
                      strokeWidth="2"
                    />
                    {(i === 0 || i === series.values.length - 1) && (
                      <text
                        x={padLeft + i * xStep}
                        y={yPos(v) - 8}
                        textAnchor={i === 0 ? 'start' : 'end'}
                        className="fill-slate-800 text-[9.5px] font-mono font-medium tabular-nums"
                      >
                        {v}
                      </text>
                    )}
                  </g>
                ))}
              </g>
            );
          })}
        </svg>

        <div className="mt-2 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-2.5 text-xs text-slate-700">
          {data.series.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-4 rounded-xs"
                style={{ backgroundColor: s.color }}
              />
              <span className="font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grouped Bar Chart
  const groupW = plotW / data.xLabels.length;
  const barGroupInnerW = groupW * 0.72;
  const barW = barGroupInnerW / data.series.length;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{data.title}</span>
        <span className="text-xs font-mono text-slate-500">Unit: {data.unit}</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={data.title}
      >
        {yTicks.map((tick) => {
          const y = yPos(tick);
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono tabular-nums"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {data.xLabels.map((label, groupIdx) => {
          const groupStartX = padLeft + groupIdx * groupW + (groupW - barGroupInnerW) / 2;
          return (
            <g key={label}>
              {data.series.map((series, sIdx) => {
                const val = series.values[groupIdx] ?? 0;
                const y = yPos(val);
                const h = padTop + plotH - y;
                const x = groupStartX + sIdx * barW + 1;
                return (
                  <g key={series.name}>
                    <rect
                      x={x}
                      y={y}
                      width={Math.max(4, barW - 2)}
                      height={h}
                      rx="2"
                      fill={series.color}
                    />
                    <text
                      x={x + Math.max(4, barW - 2) / 2}
                      y={y - 5}
                      textAnchor="middle"
                      className="fill-slate-700 text-[9px] font-mono tabular-nums"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}
              <text
                x={padLeft + groupIdx * groupW + groupW / 2}
                y={height - 12}
                textAnchor="middle"
                className="fill-slate-700 text-[10.5px] font-medium"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-2.5 text-xs text-slate-700">
        {data.series.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-medium">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
