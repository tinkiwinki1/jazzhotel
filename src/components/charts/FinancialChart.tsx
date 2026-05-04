import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    <div className="w-full h-[280px] md:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }} barCategoryGap="22%">
          <CartesianGrid stroke="#C9B98C" strokeOpacity={0.35} vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#C9B98C' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <Tooltip
            cursor={{ fill: '#B89651', fillOpacity: 0.06 }}
            contentStyle={{
              background: '#0F1B2A',
              border: '1px solid #B89651',
              borderRadius: 0,
              padding: '8px 12px',
              fontSize: 12,
              color: '#F5F1E8',
            }}
            labelStyle={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}
            formatter={(v: number, name: string) => [`${v}K`, name]}
          />
          <Legend
            iconType="square"
            wrapperStyle={{ fontSize: 11, paddingTop: 8, color: '#6B7280' }}
            verticalAlign="bottom"
          />
          <Bar
            dataKey="revenue"
            name={labels.revenue}
            fill="#B89651"
            animationDuration={900}
          />
          <Bar
            dataKey="profit"
            name={labels.profit}
            fill="#0F1B2A"
            animationDuration={900}
            animationBegin={150}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
