import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TokenData {
  profile: string;
  label: string;
  tokens: number;
}

interface TokensByProfileChartProps {
  data: TokenData[];
}

/**
 * TokensByProfileChart - Comparación de Tokens por Perfil
 * 
 * Visualiza tokens consumidos agrupados por perfil de planta.
 */
export function TokensByProfileChart({ data }: TokensByProfileChartProps) {
  // Colores por perfil (consistentes con sistema)
  const profileColors: Record<string, string> = {
    tipo_a: '#ef4444',    // rojo - Alta Entropía
    tipo_b: '#f59e0b',    // amarillo - Ruido Moderado
    acoplada: '#10b981',  // verde - Régimen CAELION
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="label" 
            stroke="#9ca3af"
            style={{ fontSize: '12px', fontFamily: 'monospace' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px', fontFamily: 'monospace' }}
            label={{ 
              value: 'Tokens', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#9ca3af', fontSize: '12px' }
            }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#d1d5db' }}
            itemStyle={{ color: '#d1d5db' }}
            formatter={(value: number) => [`${value.toLocaleString()} tokens`, 'Consumo']}
          />
          <Bar dataKey="tokens" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={profileColors[entry.profile] || '#6b7280'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
