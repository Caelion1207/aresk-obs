import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

interface LyapunovComparisonChartProps {
  dataB1: Array<{ vLyapunov: number; caelionIntervened: boolean }>;
  dataC1: Array<{ vLyapunov: number; caelionIntervened: boolean }>;
  showSquared?: boolean;
}

export function LyapunovComparisonChart({ dataB1, dataC1, showSquared = false }: LyapunovComparisonChartProps) {
  const chartData = useMemo(() => {
    const maxLength = Math.max(dataB1.length, dataC1.length);
    return Array.from({ length: maxLength }, (_, i) => {
      const vB1 = dataB1[i]?.vLyapunov ?? null;
      const vC1 = dataC1[i]?.vLyapunov ?? null;
      
      return {
        index: i + 1,
        vB1: showSquared && vB1 !== null ? vB1 * vB1 : vB1,
        vC1: showSquared && vC1 !== null ? vC1 * vC1 : vC1,
        caelionIntervened: dataC1[i]?.caelionIntervened ?? false,
      };
    });
  }, [dataB1, dataC1, showSquared]);

  const interventionPoints = useMemo(() => {
    return chartData.filter((d) => d.caelionIntervened);
  }, [chartData]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="index"
            label={{ value: "Interacción", position: "insideBottom", offset: -10, fill: "#94a3b8" }}
            stroke="#94a3b8"
          />
          <YAxis
            label={{
              value: showSquared ? "V² (Energía de error al cuadrado)" : "V (Energía de error)",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
            }}
            stroke="#94a3b8"
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
            formatter={(value: any, name: string) => {
              if (name === "vB1") return [value !== null ? value.toFixed(6) : "N/A", "V(B-1)"];
              if (name === "vC1") return [value !== null ? value.toFixed(6) : "N/A", "V(C-1)"];
              return [value, name];
            }}
            labelFormatter={(label) => `Interacción ${label}`}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8" }}
            formatter={(value) => {
              if (value === "vB1") return "V(B-1) - sin CAELION";
              if (value === "vC1") return "V(C-1) - con CAELION";
              return value;
            }}
          />

          {/* Reference line for stability threshold */}
          {!showSquared && (
            <ReferenceLine
              y={0.005}
              stroke="#22c55e"
              strokeDasharray="5 5"
              label={{ value: "V < 0.005 (Alta estabilidad)", fill: "#22c55e", fontSize: 12 }}
            />
          )}

          <Line type="monotone" dataKey="vB1" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="vB1" />
          <Line type="monotone" dataKey="vC1" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="vC1" />

          {/* Marcadores de intervenciones CAELION */}
          {interventionPoints.map((point) => (
            <ReferenceDot
              key={`intervention-${point.index}`}
              x={point.index}
              y={point.vC1}
              r={6}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
