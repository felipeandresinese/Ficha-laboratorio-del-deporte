// ============================================================================
// WellnessEvolution.jsx
// Para el LADO DEL ENTRENADOR (dentro de la app, con login).
// Muestra el historial de check-ins de un deportista: gráfico de evolución
// y una alerta si el bienestar general viene bajo varios días seguidos.
//
// Uso dentro de la ficha del deportista, donde ya tienes `selected` (el
// deportista activo) y el cliente `supabase`:
//
//   <WellnessEvolution supabase={supabase} athleteId={selected.id} />
//
// Requiere "recharts", que tu app ya usa para los gráficos de evolución
// física, así que no agrega dependencias nuevas.
// ============================================================================

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const UMBRAL_ALERTA = 15;       // total <= 15 (de 25) se considera "bajo"
const DIAS_SEGUIDOS_ALERTA = 3; // si pasa esto N días seguidos, se muestra alerta

const ETIQUETAS = {
  fatiga: "Energía",
  sueno: "Sueño",
  dolor_muscular: "Dolor muscular",
  estres: "Estrés (bajo = más estresado)",
  animo: "Ánimo",
  total: "Total (5-25)",
};

export default function WellnessEvolution({ supabase, athleteId }) {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("wellness_checkins")
        .select("checkin_date, fatiga, sueno, dolor_muscular, estres, animo, total, comentario")
        .eq("athlete_id", athleteId)
        .order("checkin_date", { ascending: true });
      if (!error && data) setCheckins(data);
      setLoading(false);
    })();
  }, [supabase, athleteId]);

  if (loading) return <p style={{ color: "#888", fontSize: 14 }}>Cargando bienestar...</p>;

  if (checkins.length === 0) {
    return (
      <div style={styles.box}>
        <h3 style={styles.h3}>Check-in de bienestar</h3>
        <p style={{ color: "#888", fontSize: 14 }}>
          Este deportista todavía no ha respondido su check-in diario.
        </p>
      </div>
    );
  }

  // ¿Alerta? últimos N check-ins consecutivos por debajo del umbral
  const ultimos = checkins.slice(-DIAS_SEGUIDOS_ALERTA);
  const enAlerta =
    ultimos.length === DIAS_SEGUIDOS_ALERTA &&
    ultimos.every((c) => c.total <= UMBRAL_ALERTA);

  const ultimo = checkins[checkins.length - 1];
  const comentariosRecientes = checkins
    .slice(-5)
    .filter((c) => c.comentario)
    .reverse();

  const data = checkins.map((c) => ({
    fecha: formatearFecha(c.checkin_date),
    ...c,
  }));

  return (
    <div style={styles.box}>
      <div style={styles.headerRow}>
        <h3 style={styles.h3}>Check-in de bienestar</h3>
        {enAlerta && (
          <span style={styles.alertBadge}>
            ⚠️ {DIAS_SEGUIDOS_ALERTA} días seguidos con bienestar bajo
          </span>
        )}
      </div>

      <p style={{ fontSize: 13, color: "#666", marginTop: -6, marginBottom: 14 }}>
        Último registro: {formatearFecha(ultimo.checkin_date)} · puntaje {ultimo.total}/25
      </p>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
            <YAxis domain={[5, 25]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={UMBRAL_ALERTA} stroke="#e67e22" strokeDasharray="4 4" label={{ value: "umbral", fontSize: 11, fill: "#e67e22" }} />
            <Line type="monotone" dataKey="total" name={ETIQUETAS.total} stroke="#2563eb" strokeWidth={2.5} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 220, marginTop: 8 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
            <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="fatiga" name={ETIQUETAS.fatiga} stroke="#16a34a" dot={false} />
            <Line type="monotone" dataKey="sueno" name={ETIQUETAS.sueno} stroke="#9333ea" dot={false} />
            <Line type="monotone" dataKey="dolor_muscular" name={ETIQUETAS.dolor_muscular} stroke="#dc2626" dot={false} />
            <Line type="monotone" dataKey="estres" name={ETIQUETAS.estres} stroke="#ea580c" dot={false} />
            <Line type="monotone" dataKey="animo" name={ETIQUETAS.animo} stroke="#0891b2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {comentariosRecientes.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Comentarios recientes</p>
          {comentariosRecientes.map((c, i) => (
            <p key={i} style={styles.comentario}>
              <strong>{formatearFecha(c.checkin_date)}:</strong> {c.comentario}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function formatearFecha(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

const styles = {
  box: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 18,
    marginTop: 16,
  },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  h3: { margin: 0, fontSize: 16, fontWeight: 700 },
  alertBadge: {
    background: "#fff4e6",
    color: "#b45309",
    border: "1px solid #f5c98a",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12.5,
    fontWeight: 600,
  },
  comentario: { fontSize: 13.5, color: "#444", margin: "4px 0" },
};

// ----------------------------------------------------------------------------
// BONUS opcional: función para pintar un punto rojo en la LISTA de deportistas
// (sidebar) si un deportista está "en alerta". Llama a esto una vez al cargar
// el Dashboard y guarda el resultado en un estado, ej: const [alertas, setAlertas] = useState({})
// ----------------------------------------------------------------------------
export async function cargarAlertasBienestar(supabase, athleteIds) {
  if (!athleteIds.length) return {};
  const { data, error } = await supabase
    .from("wellness_checkins")
    .select("athlete_id, checkin_date, total")
    .in("athlete_id", athleteIds)
    .order("checkin_date", { ascending: true });
  if (error || !data) return {};

  const porDeportista = {};
  for (const row of data) {
    (porDeportista[row.athlete_id] ||= []).push(row);
  }

  const alertas = {};
  for (const id of athleteIds) {
    const historial = porDeportista[id] || [];
    const ultimos = historial.slice(-DIAS_SEGUIDOS_ALERTA);
    alertas[id] =
      ultimos.length === DIAS_SEGUIDOS_ALERTA &&
      ultimos.every((c) => c.total <= UMBRAL_ALERTA);
  }
  return alertas; // { [athleteId]: true/false }
}
