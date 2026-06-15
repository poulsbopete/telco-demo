import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function formatTimeLabel(time) {
  try {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return time;
  }
}

export function TimeSeriesChart({ data, lines = [], height = 200, type = 'line', onClick }) {
  const Chart = type === 'area' ? AreaChart : type === 'bar' ? BarChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} onClick={onClick} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
        <XAxis
          dataKey="time"
          tickFormatter={formatTimeLabel}
          tick={{ fontSize: 10, fill: '#69707d' }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10, fill: '#69707d' }} width={45} />
        <Tooltip
          labelFormatter={formatTimeLabel}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #d3dae6' }}
        />
        {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {lines.map(l => {
          if (type === 'area') {
            return (
              <Area
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.name || l.key}
                stroke={l.color}
                fill={l.color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            );
          }
          if (type === 'bar') {
            return <Bar key={l.key} dataKey={l.key} name={l.name || l.key} fill={l.color} radius={[2, 2, 0, 0]} />;
          }
          return (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name || l.key}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          );
        })}
      </Chart>
    </ResponsiveContainer>
  );
}

export default TimeSeriesChart;
