import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mistral } from "@mistralai/mistralai";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const API_KEY = "bSJ9FpFxEVb2R84Gwl7wra86l9x97nwO";
const client = new Mistral({ apiKey: API_KEY });

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DIAS_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const NIVELES = [
  { id: "nuevo", label: "Soy nuevo", desc: "Empecé hace poco o nunca entrené" },
  { id: "intermedio", label: "Tengo experiencia", desc: "Entreno hace algunos meses o años" },
  { id: "avanzado", label: "Soy avanzado", desc: "Llevo años entrenando en serio" },
];

export default function EntrenamientoScreen() {
  const { theme } = useTheme();
  const s = styles(theme);

  const [objetivo, setObjetivo] = useState("");
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [nivel, setNivel] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [rutina, setRutina] = useState<any>(null);

  const toggleDia = (dia: string) => {
    setDiasSeleccionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const generarRutinaConIA = async () => {
    if (!objetivo.trim() || diasSeleccionados.length === 0 || !nivel) return;
    setCargando(true);
    setRutina(null);

    const nivelLabel = NIVELES.find(n => n.id === nivel)?.label || nivel;
    const diasOrdenados = DIAS_FULL.filter(d =>
      diasSeleccionados.includes(d.substring(0, 3) === "Mié" ? "Mié" : d.substring(0, 3))
    );

    const prompt = `Eres un coach de gimnasio experto. Generá un plan de entrenamiento COMPLETO y PROFESIONAL.

Datos del usuario:
- Objetivo: ${objetivo}
- Días que puede entrenar: ${diasSeleccionados.join(", ")}
- Nivel: ${nivelLabel}

REGLAS OBLIGATORIAS:
- Cada día de entrenamiento debe tener entre 5 y 7 ejercicios
- Los ejercicios deben estar ESPECÍFICAMENTE orientados al objetivo: ${objetivo}
- Distribuí los grupos musculares de forma inteligente según los días disponibles
- Incluí series, repeticiones Y tiempo de descanso para cada ejercicio
- Las notas deben ser técnicas y útiles (forma, respiración, variantes)

Respondé ÚNICAMENTE con JSON válido, sin markdown:
{
  "consejo": "Un consejo clave personalizado para este usuario",
  "dias": [
    {
      "dia": "Lunes",
      "enfoque": "Pecho y Tríceps",
      "ejercicios": [
        {
          "nombre": "Press banca plano",
          "series": "4",
          "reps": "8-10",
          "descanso": "90s",
          "nota": "Bajá la barra hasta rozar el pecho, explosivo hacia arriba"
        }
      ]
    }
  ]
}`;

    try {
      const response = await client.chat.complete({
        model: "mistral-large-latest",
        responseFormat: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      });

      const contenido = response.choices?.[0]?.message?.content;
      if (typeof contenido === "string") {
        const parsed = JSON.parse(contenido.trim());
        setRutina({
          id: Date.now().toString(),
          tipo: "entrenamiento",
          objetivo,
          dias: diasSeleccionados,
          nivel: nivelLabel,
          consejo: parsed.consejo,
          diasRutina: parsed.dias,
        });
      } else throw new Error("Respuesta inválida");
    } catch (err) {
      Alert.alert("Error", "No se pudo generar la rutina. Revisá tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  const guardarEnFavoritos = async () => {
    try {
      const prev = await AsyncStorage.getItem("favoritos");
      const favs = prev ? JSON.parse(prev) : [];
      if (favs.some((f: any) => f.id === rutina.id)) {
        Alert.alert("Aviso", "Esta rutina ya está guardada.");
        return;
      }
      favs.push(rutina);
      await AsyncStorage.setItem("favoritos", JSON.stringify(favs));
      Alert.alert("Guardado", "Rutina añadida a tus planes.");
    } catch {
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  const canGenerate = objetivo.trim() && diasSeleccionados.length > 0 && nivel && !cargando;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>

        {/* Objetivo */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Objetivo</Text>
          <TextInput
            style={s.input}
            placeholder="Ej: ganar masa muscular, perder grasa, mejorar resistencia..."
            placeholderTextColor={theme.textMuted}
            value={objetivo}
            onChangeText={setObjetivo}
            multiline
          />
        </View>

        {/* Días */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>¿Qué días podés entrenar?</Text>
          <Text style={s.sectionHint}>Seleccioná todos los días disponibles</Text>
          <View style={s.diasRow}>
            {DIAS_SEMANA.map((dia) => {
              const activo = diasSeleccionados.includes(dia);
              return (
                <TouchableOpacity
                  key={dia}
                  style={[s.diaBtn, activo && s.diaBtnActive]}
                  onPress={() => toggleDia(dia)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.diaBtnText, activo && s.diaBtnTextActive]}>{dia}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {diasSeleccionados.length > 0 && (
            <Text style={s.diasSelected}>
              {diasSeleccionados.length} día{diasSeleccionados.length !== 1 ? "s" : ""} seleccionado{diasSeleccionados.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Nivel */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>¿Cuánta experiencia tenés?</Text>
          <View style={s.nivelesCol}>
            {NIVELES.map((n) => {
              const activo = nivel === n.id;
              return (
                <TouchableOpacity
                  key={n.id}
                  style={[s.nivelBtn, activo && s.nivelBtnActive]}
                  onPress={() => setNivel(n.id)}
                  activeOpacity={0.7}
                >
                  <View style={s.nivelInner}>
                    <View style={[s.nivelRadio, activo && s.nivelRadioActive]}>
                      {activo && <View style={s.nivelRadioDot} />}
                    </View>
                    <View style={s.nivelText}>
                      <Text style={[s.nivelLabel, activo && s.nivelLabelActive]}>{n.label}</Text>
                      <Text style={s.nivelDesc}>{n.desc}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={[s.btnGenerar, !canGenerate && s.btnGenerarOff]}
          onPress={generarRutinaConIA}
          disabled={!canGenerate}
          activeOpacity={0.8}
        >
          {cargando
            ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color={theme.bg} size="small" />
                <Text style={[s.btnGenerarText, { marginLeft: 10 }]}>Armando tu rutina...</Text>
              </View>
            )
            : <Text style={s.btnGenerarText}>Generar mi rutina personalizada</Text>
          }
        </TouchableOpacity>

        {/* Resultado */}
        {rutina && (
          <View style={s.resultado}>

            {/* Header */}
            <View style={s.resultadoHeader}>
              <Text style={s.resultadoEyebrow}>{rutina.nivel} · {rutina.dias.length} días/sem</Text>
              <Text style={s.resultadoTitle}>{rutina.objetivo}</Text>
              {rutina.consejo && (
                <View style={s.consejoBox}>
                  <Text style={s.consejoIcon}>💡</Text>
                  <Text style={s.consejoText}>{rutina.consejo}</Text>
                </View>
              )}
            </View>

            {/* Días */}
            {rutina.diasRutina?.map((diaRutina: any, di: number) => (
              <View key={di} style={s.diaBlock}>
                <View style={s.diaHeader}>
                  <Text style={s.diaNombre}>{diaRutina.dia}</Text>
                  <Text style={s.diaEnfoque}>{diaRutina.enfoque}</Text>
                </View>

                {diaRutina.ejercicios?.map((ej: any, ei: number) => (
                  <View key={ei} style={[s.ejercicio, ei === diaRutina.ejercicios.length - 1 && s.ejercicioLast]}>
                    <View style={s.ejercicioNum}>
                      <Text style={s.ejercicioNumText}>{ei + 1}</Text>
                    </View>
                    <View style={s.ejercicioBody}>
                      <View style={s.ejercicioRow}>
                        <Text style={s.ejercicioNombre}>{ej.nombre}</Text>
                        <Text style={s.ejercicioSeries}>{ej.series}×{ej.reps}</Text>
                      </View>
                      <View style={s.ejercicioMeta}>
                        {ej.descanso && <Text style={s.ejercicioDescanso}>⏱ {ej.descanso}</Text>}
                      </View>
                      {ej.nota && <Text style={s.ejercicioNota}>{ej.nota}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <TouchableOpacity style={s.btnGuardar} onPress={guardarEnFavoritos} activeOpacity={0.7}>
              <Text style={s.btnGuardarText}>Guardar plan</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: "center", paddingBottom: 48 },
  inner: { width: "100%", maxWidth: 600, padding: 20 },

  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  sectionHint: { fontSize: 13, color: t.textMuted, marginBottom: 12 },

  input: {
    backgroundColor: t.bgCard, borderRadius: 12, borderWidth: 1,
    borderColor: t.border, padding: 14, fontSize: 15, color: t.text, lineHeight: 22,
  },

  diasRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  diaBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: t.bgCard, borderWidth: 1, borderColor: t.border,
    alignItems: "center",
  },
  diaBtnActive: { backgroundColor: t.text, borderColor: t.text },
  diaBtnText: { fontSize: 12, fontWeight: "700", color: t.textSecondary },
  diaBtnTextActive: { color: t.bg },
  diasSelected: { fontSize: 12, color: t.textMuted, marginTop: 10, textAlign: "center" },

  nivelesCol: { gap: 10 },
  nivelBtn: {
    backgroundColor: t.bgCard, borderRadius: 12, borderWidth: 1,
    borderColor: t.border, padding: 16,
  },
  nivelBtnActive: { borderColor: t.text, backgroundColor: t.bgSubtle },
  nivelInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  nivelRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: t.border,
    alignItems: "center", justifyContent: "center",
  },
  nivelRadioActive: { borderColor: t.text },
  nivelRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: t.text },
  nivelText: { flex: 1 },
  nivelLabel: { fontSize: 15, fontWeight: "700", color: t.textSecondary, marginBottom: 2 },
  nivelLabelActive: { color: t.text },
  nivelDesc: { fontSize: 12, color: t.textMuted },

  btnGenerar: {
    backgroundColor: t.text, borderRadius: 12, padding: 16,
    alignItems: "center", marginBottom: 28,
  },
  btnGenerarOff: { backgroundColor: t.border },
  btnGenerarText: { color: t.bg, fontWeight: "700", fontSize: 15 },
  loadingRow: { flexDirection: "row", alignItems: "center" },

  resultado: {
    backgroundColor: t.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: t.border, overflow: "hidden",
  },
  resultadoHeader: { padding: 20, paddingBottom: 16 },
  resultadoEyebrow: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  resultadoTitle: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.3, marginBottom: 12 },
  consejoBox: { flexDirection: "row", backgroundColor: t.bgSubtle, borderRadius: 10, padding: 12, gap: 8, alignItems: "flex-start" },
  consejoIcon: { fontSize: 14 },
  consejoText: { flex: 1, fontSize: 13, color: t.textSecondary, lineHeight: 19 },

  diaBlock: { borderTopWidth: 1, borderTopColor: t.border },
  diaHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: t.bgSubtle,
  },
  diaNombre: { fontSize: 13, fontWeight: "800", color: t.text, textTransform: "uppercase", letterSpacing: 1 },
  diaEnfoque: { fontSize: 12, color: t.textMuted, fontWeight: "600" },

  ejercicio: {
    flexDirection: "row", paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: t.borderLight, gap: 12,
  },
  ejercicioLast: { borderBottomWidth: 0 },
  ejercicioNum: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: t.bgSubtle,
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  ejercicioNumText: { fontSize: 11, fontWeight: "800", color: t.textMuted },
  ejercicioBody: { flex: 1 },
  ejercicioRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  ejercicioNombre: { fontSize: 14, fontWeight: "700", color: t.text, flex: 1, marginRight: 8 },
  ejercicioSeries: { fontSize: 13, fontWeight: "800", color: t.accentPurple },
  ejercicioMeta: { flexDirection: "row", gap: 12, marginBottom: 4 },
  ejercicioDescanso: { fontSize: 12, color: t.textMuted },
  ejercicioNota: { fontSize: 12, color: t.textSecondary, lineHeight: 17, fontStyle: "italic" },

  btnGuardar: {
    margin: 16, borderWidth: 1, borderColor: t.border,
    borderRadius: 10, padding: 13, alignItems: "center",
  },
  btnGuardarText: { fontWeight: "600", color: t.textSecondary, fontSize: 14 },
});
