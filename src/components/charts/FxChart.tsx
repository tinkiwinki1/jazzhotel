import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

const data = [
  { year: '2018', rate: 2.49 },
  { year: '2019', rate: 2.81 },
  { year: '2020', rate: 3.10 },
  { year: '2021', rate: 3.22 },
  { year: '2022', rate: 2.92 },
  { year: '2023', rate: 2.62 },
  { year: '2024', rate: 2.72 },
  { year: '2025', rate: 2.74 },
  { year: '2026', rate: 2.69 },
];

interface Props {
  annotations: { peak: string; today: string };
}

export default function FxChart({ annotations }: Props) {
  return (
    <div className="w-full h-[300px] md:h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 28, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#C9B98C" strokeOpacity={0.35} vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#C9B98C' }}
          />
          <YAxis
            domain={[2.3, 3.5]}
            tickCount={5}
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(2)}
            width={42}
          />
          <Tooltip
            cursor={{ stroke: '#B89651', strokeOpacity: 0.4, strokeDasharray: '3 3' }}
            contentStyle={{
              background: '#0F1B2A',
              border: '1px solid #B89651',
              borderRadius: 0,
              padding: '8px 12px',
              fontSize: 12,
              color: '#F5F1E8',
            }}
            labelStyle={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}
            formatter={(v: number) => [v.toFixed(2), 'GEL']}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#B89651"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#B89651', stroke: '#F5F1E8', strokeWidth: 1.5 }}
            activeDot={{ r: 7, fill: '#B89651', stroke: '#F5F1E8', strokeWidth: 2 }}
            animationDuration={1100}
            animationEasing="ease-out"
          />
          <ReferenceDot
            x="2021"
            y={3.22}
            r={5}
            fill="#B5443A"
            stroke="#F5F1E8"
            strokeWidth={1.5}
            label={{
              value: annotations.peak,
              position: 'top',
              fill: '#B5443A',
              fontSize: 10,
              offset: 12,
            }}
          />
          <ReferenceDot
            x="2026"
            y={2.69}
            r={5}
            fill="#0F1B2A"
            stroke="#B89651"
            strokeWidth={2}
            label={{
              value: annotations.today,
              position: 'top',
              fill: '#0F1B2A',
              fontSize: 10,
              offset: 12,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
