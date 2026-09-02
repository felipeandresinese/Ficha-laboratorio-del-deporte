// ============================================================================
// WellnessCheckin.jsx
// Pantalla de check-in diario de bienestar — SIN necesidad de login.
// El deportista elige su nombre de una lista y responde 5 preguntas rápidas
// (escala 1 a 5 con caritas). Se guarda directo en Supabase (tabla
// wellness_checkins) y queda bloqueado el resto del día.
//
// Uso: <WellnessCheckin supabase={supabase} onBack={() => setView("login")} />
// "supabase" es el mismo cliente que ya usas en el resto de la app
// (createClient con tu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
// ============================================================================

import { useState, useEffect } from "react";

// ---- Los 5 ítems del cuestionario (versión corta, escala 1-5) -------------
const ITEMS = [
  {
    key: "fatiga",
    pregunta: "¿Cómo tienes tu energía hoy?",
    opciones: [
      { valor: 1, emoji: "😩", texto: "Muy cansado" },
      { valor: 2, emoji: "😔", texto: "Cansado" },
      { valor: 3, emoji: "😐", texto: "Normal" },
      { valor: 4, emoji: "🙂", texto: "Con energía" },
      { valor: 5, emoji: "😃", texto: "Muy con energía" },
    ],
  },
  {
    key: "sueno",
    pregunta: "¿Cómo dormiste anoche?",
    opciones: [
      { valor: 1, emoji: "😩", texto: "Muy mal" },
      { valor: 2, emoji: "😔", texto: "Mal" },
      { valor: 3, emoji: "😐", texto: "Regular" },
      { valor: 4, emoji: "🙂", texto: "Bien" },
      { valor: 5, emoji: "😃", texto: "Muy bien" },
    ],
  },
  {
    key: "dolor_muscular",
    pregunta: "¿Tienes dolor muscular hoy?",
    opciones: [
      { valor: 1, emoji: "😖", texto: "Mucho dolor" },
      { valor: 2, emoji: "😕", texto: "Bastante" },
      { valor: 3, emoji: "😐", texto: "Un poco" },
      { valor: 4, emoji: "🙂", texto: "Casi nada" },
      { valor: 5, emoji: "😃", texto: "Sin dolor" },
    ],
  },
  {
    key: "estres",
    pregunta: "¿Cómo está tu nivel de estrés?",
    opciones: [
      { valor: 1, emoji: "😰", texto: "Muy estresado" },
      { valor: 2, emoji: "😟", texto: "Estresado" },
      { valor: 3, emoji: "😐", texto: "Normal" },
      { valor: 4, emoji: "🙂", texto: "Tranquilo" },
      { valor: 5, emoji: "😌", texto: "Muy tranquilo" },
    ],
  },
  {
    key: "animo",
    pregunta: "¿Cómo está tu ánimo hoy?",
    opciones: [
      { valor: 1, emoji: "😢", texto: "Muy mal" },
      { valor: 2, emoji: "🙁", texto: "Mal" },
      { valor: 3, emoji: "😐", texto: "Normal" },
      { valor: 4, emoji: "🙂", texto: "Bien" },
      { valor: 5, emoji: "😄", texto: "Muy bien" },
    ],
  },
];

export default function WellnessCheckin({ supabase, onBack }) {
  const [athletes, setAthletes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // { id, name }
  const [answers, setAnswers] = useState({});
  const [comentario, setComentario] = useState("");
  const [step, setStep] = useState("elegir"); // elegir | preguntas | enviado | ya-hecho | error
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("athletes_public")
        .select("id, name")
        .order("name", { ascending: true });
      if (!error && data) setAthletes(data);
      setLoadingList(false);
    })();
  }, [supabase]);

  const filtered = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const elegirDeportista = (athlete) => {
    setSelected(athlete);
    setAnswers({});
    setComentario("");
    setStep("preguntas");
  };

  const responder = (itemKey, valor) => {
    setAnswers((prev) => ({ ...prev, [itemKey]: valor }));
  };

  const todasRespondidas = ITEMS.every((it) => answers[it.key] != null);

  const enviar = async () => {
    if (!todasRespondidas || sending) return;
    setSending(true);
    setErrorMsg("");
    const { error } = await supabase.from("wellness_checkins").insert({
      athlete_id: selected.id,
      athlete_name: selected.name,
      fatiga: answers.fatiga,
      sueno: answers.sueno,
      dolor_muscular: answers.dolor_muscular,
      estres: answers.estres,
      animo: answers.animo,
      comentario: comentario.trim() || null,
    });
    setSending(false);
    if (error) {
      // código 23505 = ya existe una fila para este deportista+fecha (unique constraint)
      if (error.code === "23505") {
        setStep("ya-hecho");
      } else {
        setErrorMsg("No se pudo guardar el check-in. Revisa tu conexión e intenta de nuevo.");
        setStep("error");
      }
      return;
    }
    setStep("enviado");
  };

  const volverAlInicio = () => {
    setSelected(null);
    setAnswers({});
    setComentario("");
    setStep("elegir");
    if (onBack) onBack();
  };

  // -------------------------------------------------------------------------
  // PASO 1: elegir deportista
  // -------------------------------------------------------------------------
  if (step === "elegir") {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h2 style={styles.title}>Check-in diario</h2>
          <p style={styles.subtitle}>Elige tu nombre para comenzar</p>

          <input
            type="text"
            placeholder="Buscar nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
            autoFocus
          />

          {loadingList && <p style={styles.muted}>Cargando lista...</p>}

          <div style={styles.list}>
            {!loadingList && filtered.length === 0 && (
              <p style={styles.muted}>No se encontraron deportistas.</p>
            )}
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => elegirDeportista(a)}
                style={styles.listItem}
              >
                {a.name}
              </button>
            ))}
          </div>

          {onBack && (
            <button onClick={onBack} style={styles.linkBtn}>
              ← Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // PASO 2: preguntas
  // -------------------------------------------------------------------------
  if (step === "preguntas") {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h2 style={styles.title}>Hola, {selected.name.split(" ")[0]} 👋</h2>
          <p style={styles.subtitle}>Responde las 5 preguntas de hoy</p>

          {ITEMS.map((item) => (
            <div key={item.key} style={styles.question}>
              <p style={styles.questionText}>{item.pregunta}</p>
              <div style={styles.optionsRow}>
                {item.opciones.map((op) => (
                  <button
                    key={op.valor}
                    onClick={() => responder(item.key, op.valor)}
                    style={{
                      ...styles.optionBtn,
                      ...(answers[item.key] === op.valor
                        ? styles.optionBtnSelected
                        : {}),
                    }}
                    title={op.texto}
                  >
                    <span style={styles.optionEmoji}>{op.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={styles.question}>
            <p style={styles.questionText}>
              ¿Algo más que quieras contarnos? <span style={styles.muted}>(opcional)</span>
            </p>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ej: me duele el tobillo derecho..."
              style={styles.textarea}
              rows={3}
            />
          </div>

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          <button
            onClick={enviar}
            disabled={!todasRespondidas || sending}
            style={{
              ...styles.submitBtn,
              opacity: !todasRespondidas || sending ? 0.5 : 1,
            }}
          >
            {sending ? "Enviando..." : "Enviar check-in"}
          </button>

          <button onClick={() => setStep("elegir")} style={styles.linkBtn}>
            ← No soy yo, elegir otro nombre
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // PASO 3a: enviado con éxito
  // -------------------------------------------------------------------------
  if (step === "enviado") {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={styles.bigEmoji}>✅</div>
          <h2 style={styles.title}>¡Listo, {selected.name.split(" ")[0]}!</h2>
          <p style={styles.subtitle}>Tu check-in de hoy quedó guardado.</p>
          <button onClick={volverAlInicio} style={styles.submitBtn}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // PASO 3b: ya lo había hecho hoy
  // -------------------------------------------------------------------------
  if (step === "ya-hecho") {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={styles.bigEmoji}>👍</div>
          <h2 style={styles.title}>Ya hiciste tu check-in de hoy</h2>
          <p style={styles.subtitle}>
            {selected.name.split(" ")[0]}, ya registraste tus respuestas hoy. ¡Nos vemos mañana!
          </p>
          <button onClick={volverAlInicio} style={styles.submitBtn}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // PASO 3c: error
  // -------------------------------------------------------------------------
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.bigEmoji}>⚠️</div>
        <h2 style={styles.title}>Algo salió mal</h2>
        <p style={styles.subtitle}>{errorMsg}</p>
        <button onClick={() => setStep("preguntas")} style={styles.submitBtn}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

// ---- Estilos inline simples (sin dependencias extra) -----------------------
const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f5f7",
    padding: 16,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  title: { margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#1a1a1a" },
  subtitle: { margin: "0 0 20px", fontSize: 15, color: "#666" },
  muted: { color: "#888", fontSize: 14 },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid #ddd",
    marginBottom: 12,
    boxSizing: "border-box",
  },
  list: { display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" },
  listItem: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid #eee",
    background: "#fafafa",
    cursor: "pointer",
  },
  question: { marginBottom: 22 },
  questionText: { fontSize: 16, fontWeight: 600, marginBottom: 10, color: "#222" },
  optionsRow: { display: "flex", justifyContent: "space-between", gap: 6 },
  optionBtn: {
    flex: 1,
    padding: "10px 0",
    fontSize: 26,
    borderRadius: 12,
    border: "2px solid #eee",
    background: "#fafafa",
    cursor: "pointer",
  },
  optionBtnSelected: {
    border: "2px solid #2563eb",
    background: "#eaf1ff",
    transform: "scale(1.08)",
  },
  optionEmoji: { display: "block" },
  textarea: {
    width: "100%",
    padding: 12,
    fontSize: 15,
    borderRadius: 10,
    border: "1px solid #ddd",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical",
  },
  submitBtn: {
    width: "100%",
    padding: "14px 0",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    background: "#2563eb",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginTop: 4,
  },
  linkBtn: {
    display: "block",
    width: "100%",
    textAlign: "center",
    marginTop: 14,
    background: "none",
    border: "none",
    color: "#666",
    fontSize: 14,
    cursor: "pointer",
  },
  bigEmoji: { fontSize: 56, textAlign: "center", marginBottom: 8 },
  error: { color: "#c0392b", fontSize: 14, marginBottom: 10 },
};
