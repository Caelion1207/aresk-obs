import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface PhasePortraitProps {
  dataB1: Array<{ hDiv: number; omegaSem: number; caelionIntervened: boolean }>;
  dataC1: Array<{ hDiv: number; omegaSem: number; caelionIntervened: boolean }>;
}

export function PhasePortrait({ dataB1, dataC1 }: PhasePortraitProps) {
  const scatterDataB1 = useMemo(() => {
    return dataB1.map((d, i) => ({
      x: d.hDiv,
      y: d.omegaSem,
      index: i + 1,
      regime: "B-1",
    }));
  }, [dataB1]);

  const scatterDataC1 = useMemo(() => {
    return dataC1.map((d, i) => ({
      x: d.hDiv,
      y: d.omegaSem,
      index: i + 1,
      regime: "C-1",
      intervened: d.caelionIntervened,
    }));
  }, [dataC1]);

  const scatterDataC1Intervened = useMemo(() => {
    return scatterDataC1.filter((d) => d.intervened);
  }, [scatterDataC1]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            type="number"
            dataKey="x"
            name="H_div"
            label={{ value: "H_div (Divergencia Entrópica)", position: "insideBottom", offset: -10, fill: "#94a3b8" }}
            stroke="#94a3b8"
            domain={[0, "auto"]}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Ω_sem"
            label={{ value: "Ω_sem (Coherencia)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
            stroke="#94a3b8"
            domain={[0, 1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
            formatter={(value: any, name: string) => {
              if (name === "H_div") return [value.toFixed(4), "H_div"];
              if (name === "Ω_sem") return [value.toFixed(4), "Ω_sem"];
              return [value, name];
            }}
            labelFormatter={(label) => `Interacción ${label}`}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8" }}
            formatter={(value) => {
              if (value === "B-1") return "Régimen B-1 (sin CAELION)";
              if (value === "C-1") return "Régimen C-1 (con CAELION)";
              if (value === "C-1 Intervenciones") return "C-1 Intervenciones CAELION";
              return value;
            }}
          />
          
          {/* Reference lines for thresholds */}
          <ReferenceLine y={0.4} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Ω < 0.4 (Desalineación)", fill: "#ef4444", fontSize: 12 }} />
          <ReferenceLine y={0.7} stroke="#22c55e" strokeDasharray="5 5" label={{ value: "Ω > 0.7 (Alta coherencia)", fill: "#22c55e", fontSize: 12 }} />

          <Scatter name="B-1" data={scatterDataB1} fill="#3b82f6" opacity={0.6} />
          <Scatter name="C-1" data={scatterDataC1} fill="#8b5cf6" opacity={0.6} />
          <Scatter name="C-1 Intervenciones" data={scatterDataC1Intervened} fill="#ef4444" shape="star" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
