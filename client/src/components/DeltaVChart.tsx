import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";

interface DeltaVChartProps {
  dataB1: Array<{ vLyapunov: number; caelionIntervened: boolean }>;
  dataC1: Array<{ vLyapunov: number; caelionIntervened: boolean }>;
}

export function DeltaVChart({ dataB1, dataC1 }: DeltaVChartProps) {
  const chartData = useMemo(() => {
    const maxLength = Math.max(dataB1.length, dataC1.length);
    const result = [];
    
    for (let i = 1; i < maxLength; i++) {
      const deltaVB1 = dataB1[i] && dataB1[i - 1] ? dataB1[i].vLyapunov - dataB1[i - 1].vLyapunov : null;
      const deltaVC1 = dataC1[i] && dataC1[i - 1] ? dataC1[i].vLyapunov - dataC1[i - 1].vLyapunov : null;
      
      result.push({
        index: i + 1,
        deltaVB1,
        deltaVC1,
        caelionIntervened: dataC1[i]?.caelionIntervened ?? false,
      });
    }
    
    return result;
  }, [dataB1, dataC1]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="index"
            label={{ value: "Interacción", position: "insideBottom", offset: -10, fill: "#94a3b8" }}
            stroke="#94a3b8"
          />
          <YAxis
            label={{
              value: "ΔV (Cambio incremental de energía)",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
            }}
            stroke="#94a3b8"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
            formatter={(value: any, name: string) => {
              if (name === "deltaVB1") return [value !== null ? value.toFixed(6) : "N/A", "ΔV(B-1)"];
              if (name === "deltaVC1") return [value !== null ? value.toFixed(6) : "N/A", "ΔV(C-1)"];
              return [value, name];
            }}
            labelFormatter={(label) => `Interacción ${label}`}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8" }}
            formatter={(value) => {
              if (value === "deltaVB1") return "ΔV(B-1) - sin CAELION";
              if (value === "deltaVC1") return "ΔV(C-1) - con CAELION";
              return value;
            }}
          />

          {/* Reference line at zero */}
          <ReferenceLine y={0} stroke="#64748b" strokeWidth={2} />

          <Bar dataKey="deltaVB1" fill="#3b82f6" name="deltaVB1" />
          <Bar dataKey="deltaVC1" fill="#8b5cf6" name="deltaVC1">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.caelionIntervened ? "#ef4444" : "#8b5cf6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
