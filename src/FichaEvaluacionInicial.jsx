import React, { useState, useEffect, useRef } from "react";

/* ============================================================================
   Paleta — mismos tonos que usa el resto de Laboratorio del Deporte (App.jsx)
   ========================================================================== */
const NAVY = "#1F3864";
const NAVY_DARK = "#152B4D";
const PAPER = "#F7F5F0";
const PAPER_RAISED = "#FFFFFF";
const INK = "#20242B";
const MUTED = "#6B6659";
const LINE_C = "#DDD9CF";
const AMBER = "#B26A00";
const AMBER_BG = "#FBF0DE";

const SECTIONS = [
  { id: "port", label: "Portada" },
  { id: "s1", label: "I. Datos personales" },
  { id: "s2", label: "II. Apoderado" },
  { id: "s3", label: "III. Antec. deportivos" },
  { id: "s4", label: "IV. Antec. médicos" },
  { id: "s5", label: "V. Lesiones y cirugías" },
  { id: "s6", label: "VI. Hábitos y estilo de vida" },
  { id: "s7", label: "VII. Motivación deportista" },
  { id: "s8", label: "VIII. Opinión apoderados" },
  { id: "s9", label: "IX. Contexto escolar" },
  { id: "s10", label: "X. Psicosocial / entorno" },
  { id: "s11", label: "XI. Observaciones y firma" },
];

function emptyLesion() {
  return { id: Math.random().toString(36).slice(2), fecha: "", zona: "", diagnostico: "", mecanismo: "", tratamiento: "", recuperacion: "", secuelas: "" };
}

function defaultData() {
  return {
    nFicha: "", fechaEval: "", evaluador: "", lugar: "", fuente: "",
    nombre: "", rut: "", fechaNac: "", edad: "", sexo: "", direccion: "", comuna: "", region: "",
    telefono: "", correo: "", prevision: "", ocupacion: "", contactoEmerg: "", telEmerg: "",
    apNombre: "", apParentesco: "", apRut: "", apOcupacion: "", apTelefono: "", apCorreo: "",
    apViveCon: "", apAutoriza: "",
    deportePrincipal: "", posicion: "", club: "", entrenador: "", aniosPractica: "", sesionesSemana: "", horasSesion: "",
    nivelCompetitivo: "", seleccion: "", otroDeporte: "", deportesAnteriores: "", temporada: "", logro: "",
    prepFisica: "", evalPrevias: "",
    enfCronica: "", enfCronicaDet: "", medicamentos: "", medicamentosDet: "", alergias: "", alergiasDet: "",
    hospitalizado: "", hospitalizadoDet: "", antecFamiliares: "", sustancias: "", cicloMenstrual: "", vacunas: "",
    lesiones: [emptyLesion(), emptyLesion(), emptyLesion()],
    cirugia: "", cirugiaDet: "", ortesis: "", ortesisDet: "", dolorActual: "", dolorZona: "", dolorEva: "", dolorCircunstancia: "",
    sueñoHoras: "", sueñoCalidad: "", comidas: "", suplementos: "", suplementosDet: "", hidratacion: "",
    pantallas: "", extraprogramaticas: "", estres: "", transporte: "",
    motivacion: "", objCortoPlazo: "", objLargoPlazo: "", expectativaEval: "", autopercepcion: "", aspectoMejorar: "", temores: "",
    relacionDeporte: "", expectativaFamilia: "", cambiosAnimo: "", cambiosAnimoDet: "", nivelMotivacion: "",
    antecFamDeportivos: "", apoyoFamilia: "", preocupacionFamilia: "", compatibilidadEstudios: "",
    colegio: "", curso: "", rendimiento: "", interfiereEstudio: "", facilidadColegio: "",
    conVive: "", nHermanos: "", hermanosDeporte: "", ambienteFamiliar: "", disponEquip: "", obsContexto: "",
    obsEvaluador: "",
    firmaDeportista: "", firmaApoderado: "", fechaFirma: "", firmaEvaluador: "",
  };
}

/* ------------------------------ Estilos base ------------------------------ */
const labelStyle = { display: "block", fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 11.5, fontWeight: 600, color: NAVY_DARK, marginBottom: 4, letterSpacing: 0.2 };
const inputBaseStyle = { width: "100%", border: "none", borderBottom: `1.5px solid ${LINE_C}`, background: "transparent", padding: "6px 2px", fontSize: 14.5, fontFamily: "Georgia, serif", color: INK, outline: "none", boxSizing: "border-box" };
const textareaBaseStyle = { ...inputBaseStyle, resize: "vertical", minHeight: 44, lineHeight: 1.5 };
const row2Style = { display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" };
const rowItemStyle = { flex: "1 1 220px", minWidth: 0 };

function Field({ label, value, onChange, type = "text", placeholder }) {
  const [focused, setFocused] = useState(false);
  const style = { ...(type === "textarea" ? textareaBaseStyle : inputBaseStyle), borderBottomColor: focused ? AMBER : LINE_C };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {type === "textarea" ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} style={style}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} style={style}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      )}
    </div>
  );
}

function Row({ children }) {
  return <div style={row2Style}>{React.Children.map(children, (c) => <div style={rowItemStyle}>{c}</div>)}</div>;
}

function Choice({ question, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 8 }}>{question}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <label key={opt} style={{
              fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer",
              borderRadius: 20, border: `1px solid ${selected ? NAVY : LINE_C}`, padding: "6px 14px",
              display: "flex", alignItems: "center", gap: 6,
              color: selected ? "#fff" : INK, background: selected ? NAVY : "#fff",
            }}>
              <input type="radio" checked={selected} onChange={() => onChange(opt)} style={{ accentColor: AMBER, margin: 0 }} />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function OpenQ({ label, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6, lineHeight: 1.4 }}>{label}</label>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", fontFamily: "Georgia, serif", fontSize: 14, lineHeight: 1.5, color: INK, background: "#fff", border: `1px solid ${focused ? AMBER : LINE_C}`, borderRadius: 8, padding: 10, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function SectionTitle({ roman, title }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, borderBottom: `2px solid ${NAVY}`, paddingBottom: 8, marginBottom: 20 }}>
      <span style={{ fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontWeight: 700, color: "#fff", background: NAVY, width: 26, height: 26, minWidth: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
        {roman}
      </span>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: NAVY_DARK, margin: 0, letterSpacing: 0.2 }}>{title}</h2>
    </div>
  );
}

function SectionNote({ children }) {
  return <p style={{ fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 12, fontStyle: "italic", color: MUTED, margin: "-10px 0 16px" }}>{children}</p>;
}

/**
 * FichaEvaluacionInicial
 *
 * Props:
 * - athlete: { id, name }              -> deportista al que pertenece la ficha (requerido)
 * - initialData: object | null         -> datos ya guardados de esta ficha (si existen)
 * - onSave: async (athleteId, data) => -> se llama (con debounce) cada vez que cambia un campo
 * - onClose: () => void                -> botón "Volver al perfil" (opcional)
 */
function App({ athlete, initialData, onSave, onClose }) {
  const [data, setData] = useState(() => {
    const base = { ...defaultData(), ...(initialData || {}) };
    if (!base.nombre && athlete && athlete.name) base.nombre = athlete.name;
    return base;
  });
  const [activeSection, setActiveSection] = useState("port");
  const [saveStatus, setSaveStatus] = useState("");
  const saveTimer = useRef(null);
  const firstRun = useRef(true);
  const rootRef = useRef(null);

  const set = (key) => (val) => setData((d) => ({ ...d, [key]: val }));

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (!onSave) return;
    setSaveStatus("Guardando…");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await onSave(athlete.id, data);
        setSaveStatus("Guardado ✓");
      } catch (e) {
        setSaveStatus("No se pudo guardar");
      }
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [data, onSave, athlete]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const onScroll = () => {
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 140) current = s.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  const updateLesion = (id, field, val) => {
    setData((d) => ({ ...d, lesiones: d.lesiones.map((l) => (l.id === id ? { ...l, [field]: val } : l)) }));
  };
  const addLesion = () => setData((d) => ({ ...d, lesiones: [...d.lesiones, emptyLesion()] }));
  const removeLesion = (id) => setData((d) => ({ ...d, lesiones: d.lesiones.filter((l) => l.id !== id) }));

  const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);

  const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const buildPrintableHTML = (d) => {
    const line = (label, value) => `<div class="ln"><span class="lb">${esc(label)}:</span> <span class="val">${esc(value) || "&nbsp;"}</span></div>`;
    const pair = (l1, v1, l2, v2) => `<div class="row2">${line(l1, v1)}${line(l2, v2)}</div>`;
    const open = (label, value) => `<div class="oq"><div class="oqlabel">${esc(label)}</div><div class="oqval">${esc(value) || "&nbsp;"}</div></div>`;
    const sec = (roman, title, inner) => `<section class="sec"><h2><span class="num">${roman}</span>${esc(title)}</h2>${inner}</section>`;
    const lesionesRows = d.lesiones.map((l) =>
      `<tr><td>${esc(l.fecha)}</td><td>${esc(l.zona)}</td><td>${esc(l.diagnostico)}</td><td>${esc(l.mecanismo)}</td><td>${esc(l.tratamiento)}</td><td>${esc(l.recuperacion)}</td><td>${esc(l.secuelas)}</td></tr>`
    ).join("");

    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Ficha de Evaluación Inicial — ${esc(d.nombre) || "Laboratorio del Deporte"}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 850px; margin: 0 auto; padding: 30px 34px 60px; line-height: 1.45; }
  .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .topbar button { font-family: Helvetica, Arial, sans-serif; background: ${AMBER}; color: #fff; border: none; border-radius: 4px; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .cover { text-align: center; margin-bottom: 20px; }
  .cover h1 { font-size: 26px; color: ${NAVY}; margin: 0 0 4px; letter-spacing: 0.02em; }
  .cover .subtitle { font-style: italic; color: ${MUTED}; font-size: 15px; margin-bottom: 10px; }
  .cover .note { font-family: Helvetica, Arial, sans-serif; font-size: 11.5px; color: ${MUTED}; max-width: 640px; margin: 0 auto; line-height: 1.5; }
  .sec { margin-bottom: 8px; page-break-inside: avoid; }
  .sec h2 { font-size: 16px; color: ${NAVY}; border-bottom: 2px solid ${NAVY}; padding-bottom: 6px; margin: 20px 0 12px; display: flex; align-items: center; gap: 8px; }
  .sec h2 .num { font-family: Helvetica, Arial, sans-serif; font-weight: 700; color: #fff; background: ${NAVY}; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
  .ln { margin-bottom: 8px; font-size: 13.5px; }
  .lb { font-family: Helvetica, Arial, sans-serif; font-weight: 600; color: ${NAVY}; font-size: 11px; }
  .val { border-bottom: 1px solid #999; padding-bottom: 1px; }
  .row2 { display: flex; gap: 24px; }
  .row2 .ln { flex: 1; }
  .oq { margin-bottom: 10px; }
  .oqlabel { font-family: Helvetica, Arial, sans-serif; font-weight: 600; font-size: 12.5px; margin-bottom: 3px; }
  .oqval { border-bottom: 1px solid #999; min-height: 18px; padding: 2px 0 4px; font-size: 13.5px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px; }
  th { font-family: Helvetica, Arial, sans-serif; background: ${NAVY}; color: #fff; font-size: 9.5px; padding: 6px 5px; text-align: left; }
  td { border-bottom: 1px solid #ccc; padding: 5px; vertical-align: top; }
  .consent { font-size: 13px; margin: 10px 0 16px; }
  .sigrow { display: flex; gap: 30px; margin: 18px 0; }
  .sigbox { flex: 1; border-top: 1.5px solid #1a1a1a; padding-top: 4px; font-family: Helvetica, Arial, sans-serif; font-size: 10.5px; color: ${MUTED}; }
  .footnote { text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 9.5px; color: ${MUTED}; margin-top: 26px; padding-top: 12px; border-top: 1px solid #ccc; }
  @media print { .topbar { display: none; } body { padding: 0; } }
</style></head>
<body>
  <div class="topbar">
    <div style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color:${MUTED};">Ficha lista — usa el botón para imprimir o guardar como PDF</div>
    <button onclick="window.print()">Imprimir / Guardar como PDF</button>
  </div>
  <div class="cover">
    <h1>LABORATORIO DEL DEPORTE</h1>
    <div class="subtitle">Ficha de Evaluación Inicial — Anamnesis del Deportista</div>
    <p class="note">Documento confidencial de uso clínico interno.</p>
  </div>
  <div class="row2">${line("N° de ficha", d.nFicha)}${line("Fecha de evaluación", d.fechaEval)}${line("Evaluador(a)", d.evaluador)}</div>
  ${pair("Lugar de evaluación", d.lugar, "Fuente de la información", d.fuente)}
  ${sec("I", "Datos personales del deportista", `
    ${pair("Nombre completo", d.nombre, "RUT", d.rut)}
    <div class="row2">${line("Fecha de nacimiento", d.fechaNac)}${line("Edad", d.edad)}${line("Sexo", d.sexo)}</div>
    ${pair("Dirección", d.direccion, "Comuna / Región", `${d.comuna} ${d.region ? "/ " + d.region : ""}`)}
    ${pair("Teléfono de contacto", d.telefono, "Correo electrónico", d.correo)}
    ${pair("Previsión de salud", d.prevision, "Ocupación / curso actual", d.ocupacion)}
    ${pair("Contacto de emergencia", d.contactoEmerg, "Teléfono de emergencia", d.telEmerg)}
  `)}
  ${sec("II", "Datos del padre, madre o apoderado", `
    ${pair("Nombre completo", d.apNombre, "Parentesco", d.apParentesco)}
    ${pair("RUT", d.apRut, "Ocupación", d.apOcupacion)}
    ${pair("Teléfono", d.apTelefono, "Correo electrónico", d.apCorreo)}
    ${pair("¿Vive con el/la deportista?", d.apViveCon, "Quién autoriza y acompaña", d.apAutoriza)}
  `)}
  ${sec("III", "Antecedentes deportivos", `
    ${pair("Deporte principal", d.deportePrincipal, "Posición / especialidad", d.posicion)}
    ${pair("Club, academia o institución", d.club, "Entrenador(a) a cargo", d.entrenador)}
    <div class="row2">${line("Años de práctica", d.aniosPractica)}${line("Sesiones/semana", d.sesionesSemana)}${line("Horas/sesión", d.horasSesion)}</div>
    ${pair("Nivel competitivo actual", d.nivelCompetitivo, "¿Pertenece a selección?", d.seleccion)}
    ${pair("¿Practica otro deporte?", d.otroDeporte, "Prep. física estructurada", d.prepFisica)}
    ${open("Deporte(s) anteriores y motivo de cambio", d.deportesAnteriores)}
    ${open("Temporada / competencias relevantes próximas", d.temporada)}
    ${open("Mayor logro deportivo hasta la fecha", d.logro)}
    ${line("¿Ha recibido evaluaciones físicas o clínicas previas?", d.evalPrevias)}
  `)}
  ${sec("IV", "Antecedentes médicos generales", `
    ${pair("¿Enfermedad crónica diagnosticada?", d.enfCronica, "¿Cuál(es)?", d.enfCronicaDet)}
    ${pair("¿Medicamentos habituales?", d.medicamentos, "¿Cuál(es) y motivo?", d.medicamentosDet)}
    ${pair("¿Alergias?", d.alergias, "¿Cuál(es)?", d.alergiasDet)}
    ${pair("¿Hospitalizado(a) alguna vez?", d.hospitalizado, "Motivo y fecha", d.hospitalizadoDet)}
    ${open("Antecedentes familiares relevantes", d.antecFamiliares)}
    <div class="row2">${line("Tabaco/alcohol/sustancias", d.sustancias)}${line("Ciclo menstrual regular", d.cicloMenstrual)}${line("Vacunas al día", d.vacunas)}</div>
  `)}
  ${sec("V", "Antecedentes de lesiones y cirugías previas", `
    <table>
      <thead><tr><th>Fecha aprox.</th><th>Zona</th><th>Diagnóstico</th><th>Mecanismo</th><th>Tratamiento</th><th>Recuperación</th><th>Secuelas</th></tr></thead>
      <tbody>${lesionesRows}</tbody>
    </table>
    ${pair("¿Cirugía por causa deportiva?", d.cirugia, "Detalle", d.cirugiaDet)}
    ${pair("¿Usa órtesis/vendaje/soporte?", d.ortesis, "¿Cuál(es)?", d.ortesisDet)}
    ${pair("¿Dolor actual?", d.dolorActual, "Zona / EVA", `${d.dolorZona} ${d.dolorEva ? "(" + d.dolorEva + ")" : ""}`)}
    ${open("Circunstancias en que aparece/agrava el dolor", d.dolorCircunstancia)}
  `)}
  ${sec("VI", "Hábitos y estilo de vida", `
    <div class="row2">${line("Horas de sueño", d.sueñoHoras)}${line("Calidad de sueño (1–10)", d.sueñoCalidad)}${line("N° de comidas/día", d.comidas)}</div>
    ${pair("¿Suplementos?", d.suplementos, "¿Cuál(es)?", d.suplementosDet)}
    ${pair("Hidratación (L/día)", d.hidratacion, "Horas de pantalla/día", d.pantallas)}
    ${open("Actividades extraprogramáticas", d.extraprogramaticas)}
    ${pair("Nivel de estrés percibido", d.estres, "Transporte a entrenamientos", d.transporte)}
  `)}
  ${sec("VII", "Motivación y expectativas del deportista", `
    ${open("Motivación para practicar y seguir entrenando", d.motivacion)}
    ${open("Objetivos a corto plazo (3–6 meses)", d.objCortoPlazo)}
    ${open("Objetivos a largo plazo", d.objLargoPlazo)}
    ${open("Qué espera de esta evaluación", d.expectativaEval)}
    ${pair("Autopercepción de rendimiento (1–10)", d.autopercepcion, "Aspecto a mejorar", d.aspectoMejorar)}
    ${open("Temores o preocupaciones sobre desempeño/lesiones", d.temores)}
  `)}
  ${sec("VIII", "Opinión y expectativas de padres o apoderados", `
    ${open("Relación de su hijo/a con el deporte", d.relacionDeporte)}
    ${open("Expectativas sobre la práctica deportiva", d.expectativaFamilia)}
    ${pair("¿Cambios de ánimo/sueño/apetito?", d.cambiosAnimo, "Detalle", d.cambiosAnimoDet)}
    ${line("Nivel de motivación/compromiso percibido", d.nivelMotivacion)}
    ${open("Antecedentes deportivos en la familia", d.antecFamDeportivos)}
    ${open("Apoyo que entrega la familia", d.apoyoFamilia)}
    ${open("Preocupación específica para el equipo evaluador", d.preocupacionFamilia)}
    ${line("¿Se compatibiliza con los estudios?", d.compatibilidadEstudios)}
  `)}
  ${sec("IX", "Contexto escolar / académico", `
    ${pair("Establecimiento educacional", d.colegio, "Curso", d.curso)}
    ${pair("Rendimiento académico general", d.rendimiento, "¿Interfiere con lo escolar?", d.interfiereEstudio)}
    ${open("Facilidades otorgadas por el colegio", d.facilidadColegio)}
  `)}
  ${sec("X", "Aspectos psicosociales y de entorno", `
    ${pair("¿Con quién vive?", d.conVive, "N° de hermanos", d.nHermanos)}
    ${pair("¿Hermanos practican deporte?", d.hermanosDeporte, "Ambiente familiar percibido", d.ambienteFamiliar)}
    ${line("Disponibilidad de implementación deportiva", d.disponEquip)}
    ${open("Otras observaciones del contexto socioeconómico/familiar", d.obsContexto)}
  `)}
  ${sec("XI", "Observaciones del evaluador y consentimiento", `
    ${open("Observaciones del evaluador", d.obsEvaluador)}
    <p class="consent">Declaro que la información entregada en esta ficha es verídica y autorizo su uso confidencial con fines de evaluación, seguimiento y planificación deportiva/clínica dentro del Laboratorio del Deporte.</p>
    <div class="sigrow">
      <div class="sigbox">Nombre y firma del deportista</div>
      <div class="sigbox">Nombre y firma del padre/madre/apoderado</div>
    </div>
    ${pair("Fecha", d.fechaFirma, "Nombre del evaluador(a)", d.firmaEvaluador)}
  `)}
  <div class="footnote">Laboratorio del Deporte — Documento de uso clínico interno, información confidencial.</div>
</body></html>`;
  };

  const handlePrint = () => {
    try {
      const html = buildPrintableHTML(data);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (data.nombre || "deportista").trim().replace(/[^a-zA-Z0-9]+/g, "_");
      a.href = url;
      a.download = `Ficha_Evaluacion_Inicial_${safeName}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (e) {
      window.print();
    }
  };

  const handleReset = async () => {
    if (!window.confirm("¿Borrar todos los datos ingresados y empezar de nuevo? Esta acción no se puede deshacer.")) return;
    const fresh = defaultData();
    setData(fresh);
    if (onSave) { try { await onSave(athlete.id, fresh); } catch (e) {} }
  };

  const lesionInputStyle = { width: "100%", border: "none", background: "transparent", padding: "5px 4px", fontSize: 12.5, fontFamily: "Georgia, serif", color: INK, outline: "none", boxSizing: "border-box" };
  const lesionThStyle = { fontFamily: "-apple-system, Helvetica, Arial, sans-serif", background: NAVY, color: "#fff", fontSize: 10, fontWeight: 600, padding: "7px 6px", textAlign: "left" };
  const lesionTdStyle = { borderBottom: `1px solid ${LINE_C}`, padding: 2, verticalAlign: "top" };

  return (
    <div ref={rootRef} style={{ minHeight: "100%", background: PAPER, fontFamily: "Georgia, serif", color: INK }}>
      {/* Barra superior */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: NAVY, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 20px", fontFamily: "-apple-system, Helvetica, Arial, sans-serif" }}>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <b style={{ fontSize: 15, letterSpacing: 0.3 }}>LABORATORIO DEL DEPORTE</b>
            <span style={{ fontSize: 11, color: "#C9D6E3", fontStyle: "italic" }}>
              Ficha de Evaluación Inicial{athlete && athlete.name ? ` — ${athlete.name}` : ""}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#B9CBDA", minWidth: 100, textAlign: "right" }}>{saveStatus}</span>
            {onClose && (
              <button onClick={onClose} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
                Volver al perfil
              </button>
            )}
            <button onClick={handleReset} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
              Vaciar ficha
            </button>
            <button onClick={handlePrint} style={{ background: AMBER, color: "#fff", border: "none", borderRadius: 6, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Descargar ficha (imprimible)
            </button>
          </div>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.15)" }}>
          <div style={{ height: "100%", background: AMBER, width: `${((currentIdx + 1) / SECTIONS.length) * 100}%`, transition: "width .3s" }} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "flex-start" }}>
        {/* Menú lateral */}
        <nav style={{ fontFamily: "-apple-system, Helvetica, Arial, sans-serif", width: 220, minWidth: 220, flexShrink: 0, position: "sticky", top: 62, padding: 12, maxHeight: "calc(100vh - 62px)", overflowY: "auto" }}>
          {SECTIONS.map((s) => {
            const active = activeSection === s.id;
            return (
              <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); scrollTo(s.id); }}
                style={{
                  display: "block", padding: "7px 10px", marginBottom: 2, borderRadius: 6, fontSize: 12.5, lineHeight: 1.3,
                  textDecoration: "none", borderLeft: `2px solid ${active ? AMBER : "transparent"}`,
                  color: active ? NAVY_DARK : MUTED, fontWeight: active ? 600 : 400, background: active ? AMBER_BG : "transparent",
                }}>
                {s.label}
              </a>
            );
          })}
        </nav>

        <div style={{ flex: 1, minWidth: 0, padding: "28px 24px 90px" }}>
          {/* Portada */}
          <section id="port" style={{ marginBottom: 10 }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: NAVY_DARK, letterSpacing: 0.3, margin: "0 0 4px" }}>LABORATORIO DEL DEPORTE</h1>
              <div style={{ fontStyle: "italic", color: MUTED, fontSize: 15, marginBottom: 10 }}>Ficha de Evaluación Inicial — Anamnesis del Deportista</div>
              <p style={{ fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 12.5, color: MUTED, lineHeight: 1.5, maxWidth: 620, margin: "0 auto" }}>
                Este documento recopila información contextual, clínica y motivacional que complementa la batería de tests físicos. Complétala mediante
                entrevista directa con el/la deportista y, cuando corresponda, con su padre, madre o apoderado. La información es confidencial y se
                utiliza exclusivamente con fines de evaluación, seguimiento y planificación del entrenamiento/rehabilitación.
              </p>
            </div>
            <Row>
              <Field label="N° de ficha" value={data.nFicha} onChange={set("nFicha")} />
              <Field label="Fecha de evaluación" value={data.fechaEval} onChange={set("fechaEval")} type="date" />
              <Field label="Evaluador(a)" value={data.evaluador} onChange={set("evaluador")} />
            </Row>
            <Row>
              <Field label="Lugar de evaluación" value={data.lugar} onChange={set("lugar")} />
              <Field label="Fuente de la información (deportista / apoderado / ambos)" value={data.fuente} onChange={set("fuente")} />
            </Row>
          </section>

          {/* I */}
          <section id="s1" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="I" title="Datos personales del deportista" />
            <Row><Field label="Nombre completo" value={data.nombre} onChange={set("nombre")} /><Field label="RUT" value={data.rut} onChange={set("rut")} /></Row>
            <Row>
              <Field label="Fecha de nacimiento" value={data.fechaNac} onChange={set("fechaNac")} type="date" />
              <Field label="Edad" value={data.edad} onChange={set("edad")} />
              <Field label="Sexo" value={data.sexo} onChange={set("sexo")} />
            </Row>
            <Row>
              <Field label="Dirección" value={data.direccion} onChange={set("direccion")} />
              <Field label="Comuna" value={data.comuna} onChange={set("comuna")} />
              <Field label="Región" value={data.region} onChange={set("region")} />
            </Row>
            <Row><Field label="Teléfono de contacto" value={data.telefono} onChange={set("telefono")} /><Field label="Correo electrónico" value={data.correo} onChange={set("correo")} /></Row>
            <Row><Field label="Previsión de salud (Fonasa / Isapre / otro)" value={data.prevision} onChange={set("prevision")} /><Field label="Ocupación / curso actual" value={data.ocupacion} onChange={set("ocupacion")} /></Row>
            <Row><Field label="Contacto de emergencia (nombre)" value={data.contactoEmerg} onChange={set("contactoEmerg")} /><Field label="Teléfono de emergencia" value={data.telEmerg} onChange={set("telEmerg")} /></Row>
          </section>

          {/* II */}
          <section id="s2" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="II" title="Datos del padre, madre o apoderado" />
            <SectionNote>Completar obligatoriamente si el/la deportista es menor de 18 años.</SectionNote>
            <Row><Field label="Nombre completo" value={data.apNombre} onChange={set("apNombre")} /><Field label="Parentesco" value={data.apParentesco} onChange={set("apParentesco")} /></Row>
            <Row><Field label="RUT" value={data.apRut} onChange={set("apRut")} /><Field label="Ocupación" value={data.apOcupacion} onChange={set("apOcupacion")} /></Row>
            <Row><Field label="Teléfono" value={data.apTelefono} onChange={set("apTelefono")} /><Field label="Correo electrónico" value={data.apCorreo} onChange={set("apCorreo")} /></Row>
            <Choice question="¿Vive con el/la deportista?" options={["Sí", "No"]} value={data.apViveCon} onChange={set("apViveCon")} />
            <Choice question="¿Quién autoriza y acompaña el proceso de evaluación?" options={["Padre", "Madre", "Ambos", "Otro apoderado"]} value={data.apAutoriza} onChange={set("apAutoriza")} />
          </section>

          {/* III */}
          <section id="s3" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="III" title="Antecedentes deportivos" />
            <Row><Field label="Deporte principal" value={data.deportePrincipal} onChange={set("deportePrincipal")} /><Field label="Posición / especialidad" value={data.posicion} onChange={set("posicion")} /></Row>
            <Row><Field label="Club, academia o institución actual" value={data.club} onChange={set("club")} /><Field label="Entrenador(a) a cargo" value={data.entrenador} onChange={set("entrenador")} /></Row>
            <Row>
              <Field label="Años de práctica" value={data.aniosPractica} onChange={set("aniosPractica")} />
              <Field label="Sesiones por semana" value={data.sesionesSemana} onChange={set("sesionesSemana")} />
              <Field label="Horas por sesión" value={data.horasSesion} onChange={set("horasSesion")} />
            </Row>
            <Choice question="Nivel competitivo actual" options={["Recreativo", "Formativo", "Competitivo regional", "Selección nacional"]} value={data.nivelCompetitivo} onChange={set("nivelCompetitivo")} />
            <Choice question="¿Pertenece o ha pertenecido a selección?" options={["Sí", "No"]} value={data.seleccion} onChange={set("seleccion")} />
            <Choice question="¿Practica otro(s) deporte(s) de forma simultánea?" options={["Sí", "No"]} value={data.otroDeporte} onChange={set("otroDeporte")} />
            <Field label="Deporte(s) practicado(s) anteriormente y motivo de cambio" value={data.deportesAnteriores} onChange={set("deportesAnteriores")} type="textarea" />
            <div style={{ height: 10 }} />
            <Field label="Temporada / competencias relevantes próximas" value={data.temporada} onChange={set("temporada")} type="textarea" />
            <div style={{ height: 10 }} />
            <Field label="Mayor logro deportivo hasta la fecha" value={data.logro} onChange={set("logro")} type="textarea" />
            <div style={{ height: 14 }} />
            <Choice question="¿Recibe actualmente preparación física estructurada?" options={["Sí", "No"]} value={data.prepFisica} onChange={set("prepFisica")} />
            <Choice question="¿Ha recibido evaluaciones físicas o clínicas previas?" options={["Sí", "No"]} value={data.evalPrevias} onChange={set("evalPrevias")} />
          </section>

          {/* IV */}
          <section id="s4" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="IV" title="Antecedentes médicos generales" />
            <Choice question="¿Presenta alguna enfermedad crónica diagnosticada?" options={["Sí", "No"]} value={data.enfCronica} onChange={set("enfCronica")} />
            <Field label="¿Cuál(es)?" value={data.enfCronicaDet} onChange={set("enfCronicaDet")} />
            <div style={{ height: 14 }} />
            <Choice question="¿Toma medicamentos de forma habitual?" options={["Sí", "No"]} value={data.medicamentos} onChange={set("medicamentos")} />
            <Field label="¿Cuál(es) y motivo?" value={data.medicamentosDet} onChange={set("medicamentosDet")} />
            <div style={{ height: 14 }} />
            <Choice question="¿Presenta alergias (medicamentos, alimentos, otras)?" options={["Sí", "No"]} value={data.alergias} onChange={set("alergias")} />
            <Field label="¿Cuál(es)?" value={data.alergiasDet} onChange={set("alergiasDet")} />
            <div style={{ height: 14 }} />
            <Choice question="¿Ha sido hospitalizado(a) alguna vez?" options={["Sí", "No"]} value={data.hospitalizado} onChange={set("hospitalizado")} />
            <Field label="Motivo y fecha aproximada" value={data.hospitalizadoDet} onChange={set("hospitalizadoDet")} />
            <div style={{ height: 14 }} />
            <Field label="Antecedentes familiares relevantes (cardiovasculares, muerte súbita, metabólicos, otros)" value={data.antecFamiliares} onChange={set("antecFamiliares")} type="textarea" />
            <div style={{ height: 14 }} />
            <Choice question="Consumo de tabaco / alcohol / otras sustancias (si corresponde por edad)" options={["No", "Ocasional", "Frecuente"]} value={data.sustancias} onChange={set("sustancias")} />
            <Choice question="En deportistas mujeres: ¿ciclo menstrual regular?" options={["Sí", "No", "No aplica"]} value={data.cicloMenstrual} onChange={set("cicloMenstrual")} />
            <Choice question="¿Vacunas al día?" options={["Sí", "No", "No sabe"]} value={data.vacunas} onChange={set("vacunas")} />
          </section>

          {/* V */}
          <section id="s5" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="V" title="Antecedentes de lesiones y cirugías previas" />
            <SectionNote>Registrar todas las lesiones relevantes, deportivas y no deportivas, en orden cronológico.</SectionNote>
            <div style={{ overflowX: "auto", marginBottom: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 700 }}>
                <thead>
                  <tr>
                    {["Fecha aprox.", "Zona", "Diagnóstico", "Mecanismo", "Tratamiento", "Recuperación", "Secuelas", ""].map((h, i) => (
                      <th key={i} style={lesionThStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.lesiones.map((l) => (
                    <tr key={l.id}>
                      {["fecha", "zona", "diagnostico", "mecanismo", "tratamiento", "recuperacion", "secuelas"].map((f) => (
                        <td key={f} style={lesionTdStyle}><input value={l[f]} onChange={(e) => updateLesion(l.id, f, e.target.value)} style={lesionInputStyle} /></td>
                      ))}
                      <td style={{ ...lesionTdStyle, textAlign: "center" }}>
                        <button onClick={() => removeLesion(l.id)} style={{ color: AMBER, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22 }}>
              <button onClick={addLesion} style={{ fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 12, background: "#fff", border: `1px solid ${LINE_C}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: NAVY_DARK }}>
                + Agregar fila
              </button>
            </div>
            <Choice question="¿Ha sido intervenido(a) quirúrgicamente por causa deportiva?" options={["Sí", "No"]} value={data.cirugia} onChange={set("cirugia")} />
            <Field label="Detalle (cirugía, fecha, zona)" value={data.cirugiaDet} onChange={set("cirugiaDet")} />
            <div style={{ height: 14 }} />
            <Choice question="¿Usa actualmente algún tipo de órtesis, vendaje, plantilla o soporte?" options={["Sí", "No"]} value={data.ortesis} onChange={set("ortesis")} />
            <Field label="¿Cuál(es) y para qué zona?" value={data.ortesisDet} onChange={set("ortesisDet")} />
            <div style={{ height: 14 }} />
            <Choice question="¿Presenta dolor actualmente?" options={["Sí", "No"]} value={data.dolorActual} onChange={set("dolorActual")} />
            <Row><Field label="Zona de dolor" value={data.dolorZona} onChange={set("dolorZona")} /><Field label="Intensidad (EVA 0–10)" value={data.dolorEva} onChange={set("dolorEva")} /></Row>
            <Field label="Circunstancias en que aparece / se agrava el dolor" value={data.dolorCircunstancia} onChange={set("dolorCircunstancia")} type="textarea" />
          </section>

          {/* VI */}
          <section id="s6" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="VI" title="Hábitos y estilo de vida" />
            <Row><Field label="Horas de sueño promedio por noche" value={data.sueñoHoras} onChange={set("sueñoHoras")} /><Field label="Calidad de sueño percibida (1–10)" value={data.sueñoCalidad} onChange={set("sueñoCalidad")} /></Row>
            <Choice question="Número de comidas al día" options={["1–2", "3", "4 o más"]} value={data.comidas} onChange={set("comidas")} />
            <Choice question="¿Consume algún suplemento alimenticio o deportivo?" options={["Sí", "No"]} value={data.suplementos} onChange={set("suplementos")} />
            <Field label="¿Cuál(es)?" value={data.suplementosDet} onChange={set("suplementosDet")} />
            <div style={{ height: 14 }} />
            <Row><Field label="Hidratación habitual (litros de agua/día aprox.)" value={data.hidratacion} onChange={set("hidratacion")} /><Field label="Horas de uso de pantallas al día" value={data.pantallas} onChange={set("pantallas")} /></Row>
            <Field label="Actividades extraprogramáticas o extracurriculares" value={data.extraprogramaticas} onChange={set("extraprogramaticas")} type="textarea" />
            <div style={{ height: 14 }} />
            <Choice question="Nivel de estrés percibido en la rutina diaria" options={["Bajo", "Moderado", "Alto"]} value={data.estres} onChange={set("estres")} />
            <Field label="Medio de transporte habitual hacia los entrenamientos" value={data.transporte} onChange={set("transporte")} />
          </section>

          {/* VII */}
          <section id="s7" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="VII" title="Motivación y expectativas del deportista" />
            <SectionNote>Preguntas abiertas — registrar en lo posible con las palabras del propio deportista.</SectionNote>
            <OpenQ label="¿Por qué comenzó a practicar este deporte y qué lo(a) motiva a seguir entrenando?" value={data.motivacion} onChange={set("motivacion")} />
            <OpenQ label="¿Cuáles son sus objetivos a corto plazo (próximos 3–6 meses)?" value={data.objCortoPlazo} onChange={set("objCortoPlazo")} />
            <OpenQ label="¿Cuáles son sus objetivos a largo plazo (ej. selección, profesionalismo, salud, disfrute)?" value={data.objLargoPlazo} onChange={set("objLargoPlazo")} />
            <OpenQ label="¿Qué espera obtener de esta evaluación y del proceso en el Laboratorio del Deporte?" value={data.expectativaEval} onChange={set("expectativaEval")} />
            <Row><Field label="Autopercepción de su nivel de rendimiento actual (1–10)" value={data.autopercepcion} onChange={set("autopercepcion")} /><Field label="Aspecto que más le gustaría mejorar" value={data.aspectoMejorar} onChange={set("aspectoMejorar")} /></Row>
            <OpenQ label="¿Existe algún temor, inseguridad o preocupación relacionado con su desempeño o con lesiones?" value={data.temores} onChange={set("temores")} />
          </section>

          {/* VIII */}
          <section id="s8" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="VIII" title="Opinión y expectativas de padres, madres o apoderados" />
            <SectionNote>Completar si el/la deportista es menor de edad o si el apoderado está presente en la evaluación.</SectionNote>
            <OpenQ label="¿Cómo describiría la relación de su hijo/a con el deporte que practica?" value={data.relacionDeporte} onChange={set("relacionDeporte")} />
            <OpenQ label="¿Qué expectativas tiene usted sobre la práctica deportiva de su hijo/a?" value={data.expectativaFamilia} onChange={set("expectativaFamilia")} />
            <Choice question="¿Ha notado cambios de ánimo, sueño, apetito o comportamiento asociados al deporte?" options={["Sí", "No"]} value={data.cambiosAnimo} onChange={set("cambiosAnimo")} />
            <Field label="Detalle" value={data.cambiosAnimoDet} onChange={set("cambiosAnimoDet")} />
            <div style={{ height: 14 }} />
            <Choice question="¿Cómo percibe el nivel de motivación/compromiso de su hijo/a con el entrenamiento?" options={["Bajo", "Medio", "Alto"]} value={data.nivelMotivacion} onChange={set("nivelMotivacion")} />
            <Field label="Antecedentes deportivos relevantes en la familia (padres, hermanos)" value={data.antecFamDeportivos} onChange={set("antecFamDeportivos")} type="textarea" />
            <div style={{ height: 14 }} />
            <OpenQ label="¿Qué tipo de apoyo entrega la familia (traslados, alimentación, económico, emocional)?" value={data.apoyoFamilia} onChange={set("apoyoFamilia")} />
            <OpenQ label="¿Tiene alguna preocupación específica que quisiera comunicar al equipo evaluador?" value={data.preocupacionFamilia} onChange={set("preocupacionFamilia")} />
            <Choice question="¿El deporte se compatibiliza adecuadamente con los estudios?" options={["Sí, sin problemas", "Con dificultad ocasional", "Con dificultad frecuente"]} value={data.compatibilidadEstudios} onChange={set("compatibilidadEstudios")} />
          </section>

          {/* IX */}
          <section id="s9" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="IX" title="Contexto escolar / académico" />
            <SectionNote>Completar si el/la deportista se encuentra actualmente en etapa escolar.</SectionNote>
            <Row><Field label="Establecimiento educacional" value={data.colegio} onChange={set("colegio")} /><Field label="Curso" value={data.curso} onChange={set("curso")} /></Row>
            <Choice question="Rendimiento académico general" options={["Bajo el promedio", "Promedio", "Sobre el promedio"]} value={data.rendimiento} onChange={set("rendimiento")} />
            <Choice question="¿El deporte interfiere con el rendimiento o la asistencia escolar?" options={["Sí", "No", "A veces"]} value={data.interfiereEstudio} onChange={set("interfiereEstudio")} />
            <Field label="¿El colegio otorga algún tipo de facilidad (horarios, licencias deportivas, etc.)?" value={data.facilidadColegio} onChange={set("facilidadColegio")} type="textarea" />
          </section>

          {/* X */}
          <section id="s10" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="X" title="Aspectos psicosociales y de entorno" />
            <Row><Field label="¿Con quién vive?" value={data.conVive} onChange={set("conVive")} /><Field label="N° de hermanos" value={data.nHermanos} onChange={set("nHermanos")} /></Row>
            <Choice question="¿Los hermanos practican deporte de forma regular?" options={["Sí", "No"]} value={data.hermanosDeporte} onChange={set("hermanosDeporte")} />
            <Choice question="Ambiente familiar percibido por el/la deportista" options={["Muy favorable", "Favorable", "Con dificultades"]} value={data.ambienteFamiliar} onChange={set("ambienteFamiliar")} />
            <Choice question="Disponibilidad de implementación / equipamiento deportivo adecuado" options={["Adecuada", "Parcial", "Insuficiente"]} value={data.disponEquip} onChange={set("disponEquip")} />
            <Field label="Otras observaciones relevantes del contexto socioeconómico o familiar" value={data.obsContexto} onChange={set("obsContexto")} type="textarea" />
          </section>

          {/* XI */}
          <section id="s11" style={{ marginBottom: 10, paddingTop: 8 }}>
            <SectionTitle roman="XI" title="Observaciones del evaluador y consentimiento" />
            <Field label="Observaciones del evaluador" value={data.obsEvaluador} onChange={set("obsEvaluador")} type="textarea" />
            <div style={{ borderBottom: `2px solid ${NAVY}`, paddingBottom: 8, margin: "26px 0 16px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 15, color: NAVY_DARK, margin: 0 }}>Consentimiento</h2>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
              Declaro que la información entregada en esta ficha es verídica y autorizo su uso confidencial con fines de evaluación, seguimiento y
              planificación deportiva/clínica dentro del Laboratorio del Deporte.
            </p>
            <div style={{ display: "flex", gap: 30, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 220px", borderTop: `1.5px solid ${INK}`, paddingTop: 6 }}>
                <label style={{ fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 11, color: MUTED }}>Nombre y firma del deportista</label>
              </div>
              <div style={{ flex: "1 1 220px", borderTop: `1.5px solid ${INK}`, paddingTop: 6 }}>
                <label style={{ fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 11, color: MUTED }}>Nombre y firma del padre/madre/apoderado</label>
              </div>
            </div>
            <Row><Field label="Fecha" value={data.fechaFirma} onChange={set("fechaFirma")} type="date" /><Field label="Nombre del evaluador(a)" value={data.firmaEvaluador} onChange={set("firmaEvaluador")} /></Row>
          </section>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, paddingTop: 18, borderTop: `1px solid ${LINE_C}`, fontFamily: "-apple-system, Helvetica, Arial, sans-serif" }}>
            <button disabled={currentIdx <= 0} onClick={() => scrollTo(SECTIONS[currentIdx - 1].id)}
              style={{ background: "#fff", border: `1px solid ${LINE_C}`, borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: NAVY_DARK, cursor: currentIdx <= 0 ? "default" : "pointer", opacity: currentIdx <= 0 ? 0.35 : 1 }}>
              ← Anterior
            </button>
            {currentIdx >= SECTIONS.length - 1 ? (
              <button onClick={handlePrint} style={{ background: "#fff", border: `1px solid ${LINE_C}`, borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: NAVY_DARK, cursor: "pointer" }}>
                Descargar ficha (imprimible)
              </button>
            ) : (
              <button onClick={() => scrollTo(SECTIONS[currentIdx + 1].id)} style={{ background: "#fff", border: `1px solid ${LINE_C}`, borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: NAVY_DARK, cursor: "pointer" }}>
                Siguiente →
              </button>
            )}
          </div>

          <div style={{ textAlign: "center", fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 10.5, color: MUTED, paddingTop: 16, marginTop: 8, borderTop: `1px solid ${LINE_C}` }}>
            Laboratorio del Deporte — Documento de uso clínico interno, información confidencial. Tus datos se guardan automáticamente mientras completas
            la ficha. Al descargar, se genera un archivo con tus respuestas; ábrelo en el navegador y usa su botón "Imprimir / Guardar como PDF".
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FichaEvaluacionInicial({ athlete, initialData, onSave, onClose }) {
  if (!athlete || !athlete.id) {
    return (
      <div style={{ padding: 32, fontFamily: "-apple-system, Helvetica, Arial, sans-serif", fontSize: 13.5, color: MUTED }}>
        Falta el deportista (prop <code>athlete</code>) para abrir la ficha.
      </div>
    );
  }
  return <App athlete={athlete} initialData={initialData} onSave={onSave} onClose={onClose} />;
}
