import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { year: '2023', revenue: 480, profit: 198 },
  { year: '2024', revenue: 649, profit: 285 },
  { year: '2025', revenue: 805, profit: 444 },
];

interface Props {
  labels: { revenue: string; profit: string; unit: string };
}

export default function FinancialChart({ labels }: Props) {
  return (
    <div className="w-full">
      <div className="w-full h-[260px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }} barCategoryGap="22%">
            <CartesianGrid stroke="#525252" strokeOpacity={0.2} vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: '#525252', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#525252', strokeOpacity: 0.35 }}
            />
            <YAxis
              tick={{ fill: '#525252', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <Tooltip
              cursor={{ fill: '#16243E', fillOpacity: 0.06 }}
              contentStyle={{
                background: '#16243E',
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: '#F5F1E8',
              }}
              labelStyle={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}
              formatter={(v: number, name: string) => [`${v}K`, name]}
            />
            <Bar dataKey="revenue" name={labels.revenue} fill="#E6A25B" radius={[2, 2, 0, 0]} />
            <Bar dataKey="profit" name={labels.profit} fill="#16243E" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-5 pt-3 text-[11px] text-[#525252]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-[#E6A25B]"></span>
          {labels.revenue}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-[#16243E]"></span>
          {labels.profit}
        </span>
      </div>
    </div>
  );
}
