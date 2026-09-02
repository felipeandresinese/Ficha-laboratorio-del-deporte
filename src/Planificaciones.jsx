rt React, { useState, useEffect, useCallback } from "react";
import { Printer, Plus, X, Loader2 } from "lucide-react";

/* ============================================================================
   PLANIFICACIONES — generación automática de sesiones por cualidad prioritaria
   Usa la misma paleta y componentes de estilo que el resto de la app
   (NAVY / PAPER / LINE_C) y el mismo cliente Supabase.

   Tablas Supabase usadas:
     macro_plans      -> cualidad(es) + período del deportista
     plan_sessions    -> sesiones generadas dentro del período
     session_blocks   -> bloques fijos de cada sesión (label + duración)
     block_exercises  -> ejercicios dentro de cada bloque (nombre + intensidad)
   ========================================================================== */

const NAVY = "#1F3864";
const NAVY_DARK = "#152B4D";
const PAPER = "#F7F5F0";
const PAPER_RAISED = "#FFFFFF";
const INK = "#20242B";
const MUTED = "#6B6659";
const LINE_C = "#DDD9CF";
const ACCENT_BG = "#F3F6FA";

const QUALITIES = [
  { id: "potencia", label: "Potencia" },
  { id: "fuerza", label: "Fuerza" },
  { id: "resistencia_aerobica", label: "Resistencia aeróbica" },
  { id: "capacidad_reactiva", label: "Capacidad reactiva" },
  { id: "equilibrio", label: "Equilibrio" },
  { id: "flexibilidad", label: "Flexibilidad" },
  { id: "core", label: "Core" },
];

// Esqueletos fijos por cualidad (solo etiqueta, sin texto descriptivo).
// `priority: true` marca el bloque que corresponde a la cualidad prioritaria.
const SKELETONS = {
  potencia: [
    { label: "Movilidad" },
    { label: "Activación" },
    { label: "Potencia", priority: true },
    { label: "Core" },
  ],
  fuerza: [
    { label: "Activación" },
    { label: "Movilidad" },
    { label: "Técnica" },
    { label: "Fuerza", priority: true },
    { label: "Core" },
  ],
  resistencia_aerobica: [
    { label: "Activación y movilidad" },
    { label: "Cognitivo-coordinativo" },
    { label: "Resistencia", priority: true },
    { label: "Core" },
  ],
  capacidad_reactiva: [
    { label: "Movilidad" },
    { label: "Activación" },
    { label: "Capacidad reactiva", priority: true },
    { label: "Core" },
  ],
  equilibrio: [{ label: "Equilibrio", priority: true }],
  flexibilidad: [{ label: "Flexibilidad", priority: true }],
  core: [{ label: "Core", priority: true }],
};

const SESSIONS_PER_MONTH = 4; // asume 1x/semana; ajustable a futuro

function buildBlockSkeleton(qualities) {
  if (qualities.length === 0) return [];
  const base = SKELETONS[qualities[0]] || [];
  const blocks = base.map((b) => ({ ...b }));

  qualities.slice(1).forEach((q) => {
    const priorityBlock = (SKELETONS[q] || []).find((b) => b.priority);
    if (priorityBlock) {
      const coreIdx = blocks.findIndex((b) => b.label.toLowerCase().includes("core"));
      if (coreIdx >= 0) blocks.splice(coreIdx, 0, { ...priorityBlock });
      else blocks.push({ ...priorityBlock });
    }
  });

  return blocks;
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Planificaciones({ supabase, athlete }) {
  const [loading, setLoading] = useState(true);
  const [macroPlan, setMacroPlan] = useState(null); // plan activo actual (si existe)
  const [sessions, setSessions] = useState([]); // [{ ...session, blocks: [{ ...block, exercises: [...] }] }]
  const [selectedQualities, setSelectedQualities] = useState(["potencia"]);
  const [periodMonths, setPeriodMonths] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState(null);

  const loadActivePlan = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data: plan, error: planErr } = await supabase
        .from("macro_plans")
        .select("*")
        .eq("athlete_id", athlete.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (planErr) throw planErr;

      if (!plan) {
        setMacroPlan(null);
        setSessions([]);
        setLoading(false);
        return;
      }

      const { data: sessionRows, error: sessErr } = await supabase
        .from("plan_sessions")
        .select("*")
        .eq("macro_plan_id", plan.id)
        .order("session_number", { ascending: true });
      if (sessErr) throw sessErr;

      const sessionIds = sessionRows.map((s) => s.id);
      const { data: blockRows, error: blockErr } = await supabase
        .from("session_blocks")
        .select("*")
        .in("session_id", sessionIds.length ? sessionIds : ["00000000-0000-0000-0000-000000000000"])
        .order("block_order", { ascending: true });
      if (blockErr) throw blockErr;

      const blockIds = blockRows.map((b) => b.id);
      const { data: exerciseRows, error: exErr } = await supabase
        .from("block_exercises")
        .select("*")
        .in("block_id", blockIds.length ? blockIds : ["00000000-0000-0000-0000-000000000000"])
        .order("exercise_order", { ascending: true });
      if (exErr) throw exErr;

      const blocksBySession = {};
      blockRows.forEach((b) => {
        const exercises = exerciseRows.filter((e) => e.block_id === b.id);
        (blocksBySession[b.session_id] ||= []).push({ ...b, exercises });
      });

      const fullSessions = sessionRows.map((s) => ({
        ...s,
        blocks: blocksBySession[s.id] || [],
      }));

      setMacroPlan(plan);
      setSelectedQualities(plan.qualities);
      setPeriodMonths(plan.period_months);
      setSessions(fullSessions);
    } catch (e) {
      setErr("No se pudo cargar la planificación desde la nube.");
    } finally {
      setLoading(false);
    }
  }, [supabase, athlete.id]);

  useEffect(() => {
    loadActivePlan();
  }, [loadActivePlan]);

  const toggleQuality = (id) => {
    setSelectedQualities((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedQualities.length === 0 || generating) return;
    setGenerating(true);
    setErr(null);
    try {
      // Si hay un plan activo, lo cerramos (queda historial) antes de crear el nuevo
      if (macroPlan) {
        await supabase
          .from("macro_plans")
          .update({ status: "ended", ended_reason: "Reemplazado por nueva planificación" })
          .eq("id", macroPlan.id);
      }

      const startDate = todayISO();
      const endDate = addMonths(startDate, periodMonths);

      const { data: newPlan, error: planErr } = await supabase
        .from("macro_plans")
        .insert({
          athlete_id: athlete.id,
          qualities: selectedQualities,
          period_months: periodMonths,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single();
      if (planErr) throw planErr;

      const totalSessions = SESSIONS_PER_MONTH * periodMonths;
      const skeleton = buildBlockSkeleton(selectedQualities);

      const builtSessions = [];
      for (let i = 0; i < totalSessions; i++) {
        const { data: newSession, error: sessErr } = await supabase
          .from("plan_sessions")
          .insert({
            macro_plan_id: newPlan.id,
            athlete_id: athlete.id,
            session_date: startDate, // fecha real la ajusta él al imprimir/agendar
            session_number: i + 1,
          })
          .select()
          .single();
        if (sessErr) throw sessErr;

        const blockRowsToInsert = skeleton.map((b, idx) => ({
          session_id: newSession.id,
          block_order: idx,
          block_label: b.label,
          is_priority_block: !!b.priority,
        }));
        const { data: insertedBlocks, error: blockErr } = await supabase
          .from("session_blocks")
          .insert(blockRowsToInsert)
          .select();
        if (blockErr) throw blockErr;

        const exerciseRowsToInsert = insertedBlocks.map((b) => ({
          block_id: b.id,
          exercise_order: 0,
          name: "",
          intensity: "",
        }));
        const { data: insertedExercises, error: exErr } = await supabase
          .from("block_exercises")
          .insert(exerciseRowsToInsert)
          .select();
        if (exErr) throw exErr;

        const blocksWithExercises = insertedBlocks.map((b) => ({
          ...b,
          exercises: insertedExercises.filter((e) => e.block_id === b.id),
        }));

        builtSessions.push({ ...newSession, blocks: blocksWithExercises });
      }

      setMacroPlan(newPlan);
      setSessions(builtSessions);
    } catch (e) {
      setErr("No se pudo generar la planificación. Intenta nuevamente.");
    } finally {
      setGenerating(false);
    }
  };

  const updateBlockDuration = async (blockId, value) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        blocks: s.blocks.map((b) =>
          b.id === blockId ? { ...b, duration_minutes: value === "" ? null : value } : b
        ),
      }))
    );
    try {
      await supabase
        .from("session_blocks")
        .update({ duration_minutes: value === "" ? null : parseInt(value, 10) || null })
        .eq("id", blockId);
    } catch {
      /* se reintentará en el próximo guardado del usuario */
    }
  };

  const updateExerciseField = async (exerciseId, field, value) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        blocks: s.blocks.map((b) => ({
          ...b,
          exercises: b.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, [field]: value } : ex
          ),
        })),
      }))
    );
    try {
      await supabase.from("block_exercises").update({ [field]: value }).eq("id", exerciseId);
    } catch {
      /* se reintentará en el próximo guardado del usuario */
    }
  };

  const addExercise = async (blockId) => {
    try {
      const { data: newEx, error } = await supabase
        .from("block_exercises")
        .insert({ block_id: blockId, exercise_order: 999, name: "", intensity: "" })
        .select()
        .single();
      if (error) throw error;
      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          blocks: s.blocks.map((b) =>
            b.id === blockId ? { ...b, exercises: [...b.exercises, newEx] } : b
          ),
        }))
      );
    } catch {
      setErr("No se pudo agregar el ejercicio.");
    }
  };

  const removeExercise = async (blockId, exerciseId) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        blocks: s.blocks.map((b) =>
          b.id !== blockId
            ? b
            : {
                ...b,
                exercises:
                  b.exercises.length > 1
                    ? b.exercises.filter((ex) => ex.id !== exerciseId)
                    : b.exercises,
              }
        ),
      }))
    );
    try {
      await supabase.from("block_exercises").delete().eq("id", exerciseId);
    } catch {
      /* noop */
    }
  };

  const handlePrint = () => window.print();

  const qualityLabels = selectedQualities
    .map((id) => QUALITIES.find((q) => q.id === id)?.label)
    .filter(Boolean)
    .join(" + ");

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: MUTED, fontSize: 13.5, padding: 30 }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando planificación…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760 }}>
      {err && (
        <div style={{ background: "#FBEAEA", color: "#C62828", fontSize: 12.5, padding: "8px 14px", borderRadius: 8, marginBottom: 14 }}>
          {err}
        </div>
      )}

      <div className="no-print" style={{ border: `1px solid ${LINE_C}`, borderRadius: 12, padding: 18, background: PAPER_RAISED, marginBottom: 18 }}>
        <div style={labelStyle}>Cualidad prioritaria</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {QUALITIES.map((q) => {
            const active = selectedQualities.includes(q.id);
            return (
              <button
                key={q.id}
                onClick={() => toggleQuality(q.id)}
                style={{
                  padding: "7px 13px",
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1px solid ${active ? NAVY : LINE_C}`,
                  background: active ? NAVY : "transparent",
                  color: active ? "#fff" : MUTED,
                }}
              >
                {q.label}
              </button>
            );
          })}
        </div>

        <div style={labelStyle}>Período de trabajo</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[1, 2, 3].map((m) => (
            <button
              key={m}
              onClick={() => setPeriodMonths(m)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${periodMonths === m ? NAVY : LINE_C}`,
                background: periodMonths === m ? ACCENT_BG : "transparent",
                color: periodMonths === m ? NAVY : MUTED,
              }}
            >
              {m} {m === 1 ? "mes" : "meses"}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={selectedQualities.length === 0 || generating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 16px",
            borderRadius: 9,
            border: "none",
            background: NAVY,
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            opacity: selectedQualities.length === 0 || generating ? 0.5 : 1,
          }}
        >
          {generating && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
          {macroPlan ? "Regenerar planificación" : "Generar planificación"}
        </button>
        {macroPlan && (
          <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8 }}>
            Regenerar reemplaza la planificación actual; la anterior queda guardada en el historial.
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <>
          <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button
              onClick={handlePrint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px solid ${NAVY}`,
                background: "transparent",
                color: NAVY,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Printer size={14} /> Imprimir / guardar PDF
            </button>
          </div>

          <div className="print-only" style={{ display: "none", marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: NAVY, fontWeight: 700 }}>
              Laboratorio del Deporte
            </div>
            <div style={{ fontSize: 13, color: MUTED }}>
              {athlete.name} — {qualityLabels} — {periodMonths} {periodMonths === 1 ? "mes" : "meses"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                className="session-card"
                style={{ background: PAPER_RAISED, borderRadius: 12, border: `1px solid ${LINE_C}`, padding: 16 }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: NAVY_DARK,
                    marginBottom: 12,
                    borderBottom: `2px solid ${NAVY}`,
                    paddingBottom: 8,
                  }}
                >
                  Sesión {session.session_number}
                </div>

                {session.blocks.map((block) => (
                  <div
                    key={block.id}
                    style={{
                      marginBottom: 10,
                      paddingBottom: 10,
                      borderBottom: `1px solid ${LINE_C}`,
                      ...(block.is_priority_block ? { background: ACCENT_BG, borderRadius: 8, padding: "8px 10px" } : {}),
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: INK, flex: 1 }}>{block.block_label}</div>
                      <input
                        className="no-print-border"
                        placeholder="min"
                        value={block.duration_minutes ?? ""}
                        onChange={(e) => updateBlockDuration(block.id, e.target.value)}
                        style={{ ...smallInputStyle, width: 44, textAlign: "center" }}
                      />
                      <span style={{ fontSize: 11, color: MUTED }}>min</span>
                    </div>

                    {block.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 22px", gap: 6, marginBottom: 6, paddingLeft: 4 }}
                      >
                        <input
                          className="no-print-border"
                          placeholder="ejercicio"
                          value={ex.name}
                          onChange={(e) => updateExerciseField(ex.id, "name", e.target.value)}
                          style={smallInputStyle}
                        />
                        <input
                          className="no-print-border"
                          placeholder="intensidad / volumen"
                          value={ex.intensity}
                          onChange={(e) => updateExerciseField(ex.id, "intensity", e.target.value)}
                          style={smallInputStyle}
                        />
                        <button
                          className="no-print"
                          onClick={() => removeExercise(block.id, ex.id)}
                          aria-label="quitar ejercicio"
                          style={{ border: "none", background: "transparent", color: "#ccc", fontSize: 16, cursor: "pointer" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      className="no-print"
                      onClick={() => addExercise(block.id)}
                      style={{ fontSize: 12, border: "none", background: "transparent", color: NAVY, cursor: "pointer", padding: "2px 4px", marginLeft: 4 }}
                    >
                      <Plus size={12} style={{ verticalAlign: -2 }} /> ejercicio
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && sessions.length === 0 && !macroPlan && (
        <div style={{ padding: 24, textAlign: "center", fontSize: 13.5, color: MUTED, border: `1px dashed ${LINE_C}`, borderRadius: 12 }}>
          {athlete.name} aún no tiene una planificación activa. Elige una cualidad prioritaria y un período arriba para generar una.
        </div>
      )}

      <style>{`
        @media print {
          .no-print, .no-print-border { display: none !important; }
          .print-only { display: block !important; }
          .session-card { break-inside: avoid; border: 1px solid #000 !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: NAVY_DARK,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 10,
};

const smallInputStyle = {
  fontSize: 13,
  padding: "6px 8px",
  border: `1px solid ${LINE_C}`,
  borderRadius: 5,
  color: INK,
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};impo
