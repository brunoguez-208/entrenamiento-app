import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mistral } from "@mistralai/mistralai";
import { useState, useRef } from "react";
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View, Animated, Dimensions
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

const API_KEY = "bSJ9FpFxEVb2R84Gwl7wra86l9x97nwO";
const client = new Mistral({ apiKey: API_KEY });

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const NIVELES = [
  { id: "nuevo", label: "Soy nuevo", desc: "Empecé hace poco o nunca entrené" },
  { id: "intermedio", label: "Tengo experiencia", desc: "Entreno hace algunos meses o años" },
  { id: "avanzado", label: "Soy avanzado", desc: "Llevo años entrenando en serio" },
];

function DiaCard({ diaRutina, index, total, onPrev, onNext, theme }: any) {
  const s = cardStyles(theme);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (direction: number, callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: direction * -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction * 30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handlePrev = () => animateTransition(-1, onPrev);
  const handleNext = () => animateTransition(1, onNext);

  return (
    <View style={s.wrapper}>
      {/* Dots */}
      <View style={s.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[s.dot, i === index && s.dotActive]} />
        ))}
      </View>

      {/* Card animada */}
      <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        {/* Header del día */}
        <View style={s.cardHeader}>
          <View style={s.cardHeaderLeft}>
            <Text style={s.diaLabel}>DÍA {index + 1} DE {total}</Text>
            <Text style={s.diaNombre}>{diaRutina.dia}</Text>
            <View style={s.enfoqueBadge}>
              <Text style={s.enfoqueText}>{diaRutina.enfoque}</Text>
            </View>
          </View>
          <View style={s.cardHeaderRight}>
            <Text style={s.ejercicioCount}>{diaRutina.ejercicios?.length}</Text>
            <Text style={s.ejercicioCountLabel}>ejercicios</Text>
          </View>
        </View>

        {/* Lista de ejercicios */}
        <ScrollView style={s.ejerciciosList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {diaRutina.ejercicios?.map((ej: any, i: number) => (
            <View key={i} style={[s.ejercicioRow, i === diaRutina.ejercicios.length - 1 && s.ejercicioRowLast]}>
              <View style={s.ejercicioNum}>
                <Text style={s.ejercicioNumText}>{i + 1}</Text>
              </View>
              <View style={s.ejercicioBody}>
                <View style={s.ejercicioTop}>
                  <Text style={s.ejercicioNombre}>{ej.nombre}</Text>
                  <Text style={s.ejercicioSeries}>{ej.series}×{ej.reps}</Text>
                </View>
                <View style={s.ejercicioMeta}>
                  {ej.descanso && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>⏱ {ej.descanso}</Text>
                    </View>
                  )}
                </View>
                {ej.nota && <Text style={s.ejercicioNota}>{ej.nota}</Text>}
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Navegación */}
      <View style={s.nav}>
        <TouchableOpacity
          style={[s.navBtn, index === 0 && s.navBtnDisabled]}
          onPress={handlePrev}
          disabled={index === 0}
          activeOpacity={0.7}
        >
          <Text style={[s.navBtnText, index === 0 && s.navBtnTextDisabled]}>← Anterior</Text>
        </TouchableOpacity>

        <Text style={s.navCounter}>{index + 1} / {total}</Text>

        <TouchableOpacity
          style={[s.navBtn, index === total - 1 && s.navBtnDisabled]}
          onPress={handleNext}
          disabled={index === total - 1}
          activeOpacity={0.7}
        >
          <Text style={[s.navBtnText, index === total - 1 && s.navBtnTextDisabled]}>Siguiente →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EntrenamientoScreen() {
  const { theme } = useTheme();
  const s = styles(theme);

  const { registrarEntrenamiento } = useUser();
  const [objetivo, setObjetivo] = useState("");
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [nivel, setNivel] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [rutina, setRutina] = useState<any>(null);
  const [diaActivo, setDiaActivo] = useState(0);

  const toggleDia = (dia: string) => {
    setDiasSeleccionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const generarRutinaConIA = async () => {
    if (!objetivo.trim() || diasSeleccionados.length === 0 || !nivel) return;
    setCargando(true);
    setRutina(null);
    setDiaActivo(0);

    const nivelLabel = NIVELES.find(n => n.id === nivel)?.label || nivel;

    const prompt = `Eres un coach de gimnasio experto. Generá un plan de entrenamiento COMPLETO y PROFESIONAL.

Datos del usuario:
- Objetivo: ${objetivo}
- Días que puede entrenar: ${diasSeleccionados.join(", ")}
- Nivel: ${nivelLabel}

REGLAS OBLIGATORIAS:
- Cada día debe tener entre 5 y 7 ejercicios
- Los ejercicios deben estar orientados al objetivo: ${objetivo}
- Distribuí los grupos musculares inteligentemente según los días
- Incluí series, repeticiones Y tiempo de descanso para cada ejercicio
- Las notas deben ser técnicas y útiles

Respondé ÚNICAMENTE con JSON válido, sin markdown:
{
  "consejo": "Un consejo clave personalizado",
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
          "nota": "Bajá la barra hasta rozar el pecho"
        }
      ]
    }
  ]
}`;

    try {
      const response = await client.chat.complete({
        model: "mistral-small-latest",
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
    } catch {
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
      await registrarEntrenamiento();
      Alert.alert("Guardado", "Rutina añadida a tus planes. 🔥 Racha actualizada!");
    } catch {
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  const canGenerate = objetivo.trim() && diasSeleccionados.length > 0 && nivel && !cargando;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Objetivo</Text>
          <TextInput
            style={s.input}
            placeholder="Ej: ganar masa muscular, perder grasa..."
            placeholderTextColor={theme.textMuted}
            value={objetivo}
            onChangeText={setObjetivo}
            multiline
          />
        </View>

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

        <TouchableOpacity
          style={[s.btnGenerar, !canGenerate && s.btnGenerarOff]}
          onPress={generarRutinaConIA}
          disabled={!canGenerate}
          activeOpacity={0.8}
        >
          {cargando ? (
            <View style={s.loadingRow}>
              <ActivityIndicator color={theme.bg} size="small" />
              <Text style={[s.btnGenerarText, { marginLeft: 10 }]}>Armando tu rutina...</Text>
            </View>
          ) : (
            <Text style={s.btnGenerarText}>Generar mi rutina personalizada</Text>
          )}
        </TouchableOpacity>

        {rutina && (
          <View style={s.resultado}>
            {/* Header resumen */}
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

            {/* Cards de días */}
            {rutina.diasRutina?.length > 0 && (
              <DiaCard
                diaRutina={rutina.diasRutina[diaActivo]}
                index={diaActivo}
                total={rutina.diasRutina.length}
                onPrev={() => setDiaActivo(i => Math.max(0, i - 1))}
                onNext={() => setDiaActivo(i => Math.min(rutina.diasRutina.length - 1, i + 1))}
                theme={theme}
              />
            )}

            <TouchableOpacity style={s.btnGuardar} onPress={guardarEnFavoritos} activeOpacity={0.7}>
              <Text style={s.btnGuardarText}>Guardar plan completo</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const cardStyles = (t: any) => StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingBottom: 8 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.border },
  dotActive: { width: 20, backgroundColor: t.text },

  card: {
    backgroundColor: t.bgSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.border,
    overflow: "hidden",
    minHeight: 320,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 18,
    backgroundColor: t.text,
  },
  cardHeaderLeft: { flex: 1 },
  cardHeaderRight: { alignItems: "center", marginLeft: 12 },
  diaLabel: { fontSize: 10, fontWeight: "700", color: t.dark ? t.textMuted : "rgba(255,255,255,0.6)", letterSpacing: 1.5, marginBottom: 4 },
  diaNombre: { fontSize: 22, fontWeight: "800", color: t.bg, marginBottom: 8 },
  enfoqueBadge: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  enfoqueText: { fontSize: 12, color: t.bg, fontWeight: "600" },
  ejercicioCount: { fontSize: 28, fontWeight: "800", color: t.bg, lineHeight: 32 },
  ejercicioCountLabel: { fontSize: 11, color: t.dark ? t.textMuted : "rgba(255,255,255,0.6)", fontWeight: "600" },

  ejerciciosList: { maxHeight: 340, padding: 4 },
  ejercicioRow: {
    flexDirection: "row", padding: 14,
    borderBottomWidth: 1, borderBottomColor: t.border,
    gap: 12, alignItems: "flex-start",
  },
  ejercicioRowLast: { borderBottomWidth: 0 },
  ejercicioNum: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: t.bgCard,
    alignItems: "center", justifyContent: "center",
  },
  ejercicioNumText: { fontSize: 11, fontWeight: "800", color: t.textMuted },
  ejercicioBody: { flex: 1 },
  ejercicioTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  ejercicioNombre: { fontSize: 14, fontWeight: "700", color: t.text, flex: 1, marginRight: 8 },
  ejercicioSeries: { fontSize: 13, fontWeight: "800", color: t.accentPurple },
  ejercicioMeta: { flexDirection: "row", gap: 8, marginBottom: 4 },
  badge: { backgroundColor: t.bgCard, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, color: t.textMuted, fontWeight: "600" },
  ejercicioNota: { fontSize: 12, color: t.textSecondary, lineHeight: 17, fontStyle: "italic" },

  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4, paddingTop: 14 },
  navBtn: {
    paddingVertical: 10, paddingHorizontal: 16,
    backgroundColor: t.bgCard, borderRadius: 10,
    borderWidth: 1, borderColor: t.border,
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: 13, fontWeight: "700", color: t.text },
  navBtnTextDisabled: { color: t.textMuted },
  navCounter: { fontSize: 13, fontWeight: "600", color: t.textMuted },
});

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
    borderWidth: 1, borderColor: t.border, overflow: "hidden", paddingBottom: 8,
  },
  resultadoHeader: { padding: 20, paddingBottom: 16 },
  resultadoEyebrow: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  resultadoTitle: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.3, marginBottom: 12 },
  consejoBox: { flexDirection: "row", backgroundColor: t.bgSubtle, borderRadius: 10, padding: 12, gap: 8, alignItems: "flex-start" },
  consejoIcon: { fontSize: 14 },
  consejoText: { flex: 1, fontSize: 13, color: t.textSecondary, lineHeight: 19 },

  btnGuardar: {
    marginHorizontal: 16, marginTop: 8,
    borderWidth: 1, borderColor: t.border,
    borderRadius: 10, padding: 13, alignItems: "center",
  },
  btnGuardarText: { fontWeight: "600", color: t.textSecondary, fontSize: 14 },
});
