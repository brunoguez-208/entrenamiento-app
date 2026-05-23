import { Mistral } from "@mistralai/mistralai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const API_KEY = "bSJ9FpFxEVb2R84Gwl7wra86l9x97nwO";
const client = new Mistral({ apiKey: API_KEY });

interface Plato {
  momento: string;
  nombrePlato: string;
  descripcion: string;
  macros: { calorias: number; proteinas: number; carbohidratos: number; grasas: number };
  receta: string[];
}

interface DiaMenu {
  dia: string;
  platos: Plato[];
}

function FadeInView({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DIAS_FULL: Record<string, string> = {
  "Lun": "Lunes", "Mar": "Martes", "Mié": "Miércoles",
  "Jue": "Jueves", "Vie": "Viernes", "Sáb": "Sábado", "Dom": "Domingo"
};
const MOMENTOS = [
  { id: "Desayuno", emoji: "🌅" },
  { id: "Almuerzo", emoji: "☀️" },
  { id: "Colación", emoji: "🍎" },
  { id: "Cena", emoji: "🌙" },
];

function DiaMenuCard({ diaMenu, index, total, onPrev, onNext, theme, onVerPlato }: any) {
  const s = diaCardStyles(theme);
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

  const totalKcal = diaMenu.platos?.reduce((sum: number, p: Plato) => sum + (p.macros?.calorias || 0), 0) || 0;

  return (
    <View style={s.wrapper}>
      <View style={s.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[s.dot, i === index && s.dotActive]} />
        ))}
      </View>

      <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <View style={s.cardHeader}>
          <View>
            <Text style={s.diaLabel}>DÍA {index + 1} DE {total}</Text>
            <Text style={s.diaNombre}>{diaMenu.dia}</Text>
          </View>
          <View style={s.kcalBox}>
            <Text style={s.kcalTotal}>{totalKcal}</Text>
            <Text style={s.kcalLabel}>kcal totales</Text>
          </View>
        </View>

        <ScrollView style={s.platosList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {diaMenu.platos?.map((plato: Plato, i: number) => {
            const momentoInfo = MOMENTOS.find(m => m.id === plato.momento);
            return (
              <TouchableOpacity
                key={i}
                style={[s.platoRow, i === diaMenu.platos.length - 1 && s.platoRowLast]}
                onPress={() => onVerPlato(plato)}
                activeOpacity={0.7}
              >
                <View style={s.platoEmoji}>
                  <Text style={s.platoEmojiText}>{momentoInfo?.emoji || "🍴"}</Text>
                </View>
                <View style={s.platoBody}>
                  <Text style={s.platoMomento}>{plato.momento.toUpperCase()}</Text>
                  <Text style={s.platoNombre}>{plato.nombrePlato}</Text>
                  <Text style={s.platoDesc} numberOfLines={1}>{plato.descripcion}</Text>
                </View>
                <Text style={s.platoKcal}>{plato.macros?.calorias} kcal</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      <View style={s.nav}>
        <TouchableOpacity
          style={[s.navBtn, index === 0 && s.navBtnDisabled]}
          onPress={() => animateTransition(-1, onPrev)}
          disabled={index === 0}
        >
          <Text style={[s.navBtnText, index === 0 && s.navBtnTextDisabled]}>← Anterior</Text>
        </TouchableOpacity>
        <Text style={s.navCounter}>{index + 1} / {total}</Text>
        <TouchableOpacity
          style={[s.navBtn, index === total - 1 && s.navBtnDisabled]}
          onPress={() => animateTransition(1, onNext)}
          disabled={index === total - 1}
        >
          <Text style={[s.navBtnText, index === total - 1 && s.navBtnTextDisabled]}>Siguiente →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AlimentacionScreen() {
  const { theme } = useTheme();
  const s = styles(theme);

  const [quiere, setQuiere] = useState("");
  const [noQuiere, setNoQuiere] = useState("");
  const [momentos, setMomentos] = useState<string[]>([]);
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [menu, setMenu] = useState<any>(null);
  const [diaActivo, setDiaActivo] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [platoSeleccionado, setPlatoSeleccionado] = useState<Plato | null>(null);

  const toggleMomento = (m: string) => setMomentos(prev => prev.includes(m) ? prev.filter(i => i !== m) : [...prev, m]);
  const toggleDia = (d: string) => setDiasSeleccionados(prev => prev.includes(d) ? prev.filter(i => i !== d) : [...prev, d]);

  const generarMenuConIA = async () => {
    if (!quiere.trim() || momentos.length === 0 || diasSeleccionados.length === 0) return;
    setCargando(true);
    setMenu(null);
    setDiaActivo(0);

    const exclusiones = noQuiere.trim() ? noQuiere : "ninguna";
    const diasNombres = diasSeleccionados.map(d => DIAS_FULL[d]).join(", ");

    const prompt = `Eres nutricionista deportivo de élite. Generá un plan de alimentación para CADA DÍA de la semana indicado.

Datos:
- Alimentos incluidos: ${quiere}
- Restricciones: ${exclusiones}
- Comidas por día: ${momentos.join(", ")}
- Días de la semana: ${diasNombres}

REGLAS:
- Generá un menú DISTINTO para cada día
- Cada día debe tener exactamente los momentos solicitados
- Platos creativos, variados y de alto valor nutricional
- Incluí macros estimados para cada plato

Respondé SOLO con JSON válido sin markdown:
{
  "dias": [
    {
      "dia": "Lunes",
      "platos": [
        {
          "momento": "Desayuno",
          "nombrePlato": "Nombre del plato",
          "descripcion": "Breve descripción",
          "macros": { "calorias": 450, "proteinas": 35, "carbohidratos": 45, "grasas": 12 },
          "receta": ["Paso 1...", "Paso 2..."]
        }
      ]
    }
  ]
}`;

    try {
      const response = await client.chat.complete({
        model: "mistral-small-latest",
        responseFormat: { type: "json_object" },
        messages: [{ role: "user", content: prompt }]
      });
      const contenido = response.choices?.[0]?.message?.content;
      if (typeof contenido === "string") {
        const parsed = JSON.parse(contenido.trim());
        setMenu({ id: Date.now().toString(), tipo: "alimentacion", dias: parsed.dias, platos: parsed.dias.flatMap((d: DiaMenu) => d.platos) });
      } else throw new Error("Respuesta inválida");
    } catch {
      Alert.alert("Error", "No se pudo generar el menú.");
    } finally {
      setCargando(false);
    }
  };

  const guardarEnFavoritos = async () => {
    try {
      const prev = await AsyncStorage.getItem("favoritos");
      const favs = prev ? JSON.parse(prev) : [];
      if (favs.some((f: any) => f.id === menu.id)) { Alert.alert("Aviso", "Este menú ya está guardado."); return; }
      favs.push(menu);
      await AsyncStorage.setItem("favoritos", JSON.stringify(favs));
      Alert.alert("Guardado", "Menú añadido a tus planes.");
    } catch { Alert.alert("Error", "No se pudo guardar."); }
  };

  const canGenerate = quiere.trim() && momentos.length > 0 && diasSeleccionados.length > 0 && !cargando;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>

        <FadeInView delay={0}>
          <View style={s.pageHeader}>
            <Text style={s.pageEmoji}>🥗</Text>
            <Text style={s.pageTitle}>Plan Nutricional</Text>
            <Text style={s.pageDesc}>Contame qué te gusta y armamos tu menú semanal.</Text>
          </View>
        </FadeInView>

        <FadeInView delay={80}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Alimentos que querés incluir</Text>
            <TextInput style={s.input} placeholder="Ej: palta, pollo, huevos, avena..." placeholderTextColor={theme.textMuted} value={quiere} onChangeText={setQuiere} />
          </View>
        </FadeInView>

        <FadeInView delay={130}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Restricciones o alergias</Text>
            <TextInput style={s.input} placeholder="Ej: lácteos, gluten... (opcional)" placeholderTextColor={theme.textMuted} value={noQuiere} onChangeText={setNoQuiere} />
          </View>
        </FadeInView>

        <FadeInView delay={180}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>¿Qué días querés planificar?</Text>
            <View style={s.diasRow}>
              {DIAS_SEMANA.map((dia) => {
                const activo = diasSeleccionados.includes(dia);
                return (
                  <TouchableOpacity key={dia} style={[s.diaBtn, activo && s.diaBtnActive]} onPress={() => toggleDia(dia)} activeOpacity={0.7}>
                    <Text style={[s.diaBtnText, activo && s.diaBtnTextActive]}>{dia}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {diasSeleccionados.length > 0 && (
              <Text style={s.diasHint}>{diasSeleccionados.length} día{diasSeleccionados.length !== 1 ? "s" : ""} seleccionado{diasSeleccionados.length !== 1 ? "s" : ""}</Text>
            )}
          </View>
        </FadeInView>

        <FadeInView delay={230}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>Comidas por día</Text>
            <View style={s.momentosGrid}>
              {MOMENTOS.map((m) => {
                const activo = momentos.includes(m.id);
                return (
                  <TouchableOpacity key={m.id} style={[s.momentoBtn, activo && s.momentoBtnActive]} onPress={() => toggleMomento(m.id)} activeOpacity={0.7}>
                    <Text style={s.momentoEmoji}>{m.emoji}</Text>
                    <Text style={[s.momentoText, activo && s.momentoTextActive]}>{m.id}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={280}>
          <TouchableOpacity style={[s.btnGenerar, !canGenerate && s.btnGenerarOff]} onPress={generarMenuConIA} disabled={!canGenerate} activeOpacity={0.8}>
            {cargando
              ? <View style={s.loadingRow}><ActivityIndicator color={theme.bg} size="small" /><Text style={[s.btnGenerarText, { marginLeft: 10 }]}>Armando tu menú...</Text></View>
              : <Text style={s.btnGenerarText}>Generar menú semanal con IA ✨</Text>
            }
          </TouchableOpacity>
        </FadeInView>

        {menu?.dias && (
          <FadeInView delay={0}>
            <View style={s.resultado}>
              <View style={s.resultadoHeader}>
                <Text style={s.resultadoEyebrow}>Plan semanal personalizado</Text>
                <Text style={s.resultadoTitle}>Tu menú de la semana 🍽️</Text>
                <Text style={s.resultadoHint}>Tocá cualquier plato para ver la receta</Text>
              </View>

              <DiaMenuCard
                diaMenu={menu.dias[diaActivo]}
                index={diaActivo}
                total={menu.dias.length}
                onPrev={() => setDiaActivo(i => Math.max(0, i - 1))}
                onNext={() => setDiaActivo(i => Math.min(menu.dias.length - 1, i + 1))}
                theme={theme}
                onVerPlato={(plato: Plato) => { setPlatoSeleccionado(plato); setModalVisible(true); }}
              />

              <TouchableOpacity style={s.btnGuardar} onPress={guardarEnFavoritos} activeOpacity={0.7}>
                <Text style={s.btnGuardarText}>Guardar plan completo ⭐</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        )}
      </View>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            {platoSeleccionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={s.modalMomento}>{platoSeleccionado.momento.toUpperCase()}</Text>
                <Text style={s.modalTitulo}>{platoSeleccionado.nombrePlato}</Text>
                <Text style={s.modalDesc}>{platoSeleccionado.descripcion}</Text>
                <View style={s.macrosRow}>
                  {[
                    { v: platoSeleccionado.macros.calorias, l: "Kcal", emoji: "🔥" },
                    { v: `${platoSeleccionado.macros.proteinas}g`, l: "Prot", emoji: "💪" },
                    { v: `${platoSeleccionado.macros.carbohidratos}g`, l: "Carbs", emoji: "⚡" },
                    { v: `${platoSeleccionado.macros.grasas}g`, l: "Grasas", emoji: "🥑" },
                  ].map((m, i) => (
                    <View key={i} style={s.macroCard}>
                      <Text style={s.macroEmoji}>{m.emoji}</Text>
                      <Text style={s.macroVal}>{m.v}</Text>
                      <Text style={s.macroLabel}>{m.l}</Text>
                    </View>
                  ))}
                </View>
                <Text style={s.recetaLabel}>Preparación 🍳</Text>
                {platoSeleccionado.receta.map((paso, i) => (
                  <View key={i} style={s.pasoRow}>
                    <View style={s.pasoNumBox}><Text style={s.pasoNum}>{i + 1}</Text></View>
                    <Text style={s.pasoText}>{paso.replace(/^Paso \d+:\s*/i, "")}</Text>
                  </View>
                ))}
                <TouchableOpacity style={s.btnCerrar} onPress={() => setModalVisible(false)}>
                  <Text style={s.btnCerrarText}>Listo</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const diaCardStyles = (t: any) => StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingBottom: 8 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.border },
  dotActive: { width: 20, backgroundColor: t.accentGreen },
  card: { backgroundColor: t.bgSubtle, borderRadius: 16, borderWidth: 1, borderColor: t.border, overflow: "hidden", minHeight: 280 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 18, backgroundColor: t.accentGreen },
  diaLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.65)", letterSpacing: 1.5, marginBottom: 4 },
  diaNombre: { fontSize: 22, fontWeight: "800", color: "#fff" },
  kcalBox: { alignItems: "flex-end" },
  kcalTotal: { fontSize: 24, fontWeight: "800", color: "#fff" },
  kcalLabel: { fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: "600" },
  platosList: { maxHeight: 300 },
  platoRow: { flexDirection: "row", padding: 14, borderBottomWidth: 1, borderBottomColor: t.border, alignItems: "center", gap: 12 },
  platoRowLast: { borderBottomWidth: 0 },
  platoEmoji: { width: 36, height: 36, borderRadius: 10, backgroundColor: t.bgCard, alignItems: "center", justifyContent: "center" },
  platoEmojiText: { fontSize: 17 },
  platoBody: { flex: 1 },
  platoMomento: { fontSize: 10, fontWeight: "700", color: t.accentGreen, letterSpacing: 1.5, marginBottom: 2 },
  platoNombre: { fontSize: 14, fontWeight: "700", color: t.text, marginBottom: 2 },
  platoDesc: { fontSize: 12, color: t.textSecondary },
  platoKcal: { fontSize: 12, fontWeight: "700", color: t.textMuted },
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4, paddingTop: 14 },
  navBtn: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: t.bgCard, borderRadius: 10, borderWidth: 1, borderColor: t.border },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: 13, fontWeight: "700", color: t.text },
  navBtnTextDisabled: { color: t.textMuted },
  navCounter: { fontSize: 13, fontWeight: "600", color: t.textMuted },
});

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: "center", paddingBottom: 48 },
  inner: { width: "100%", maxWidth: 600, padding: 20 },
  pageHeader: { alignItems: "center", paddingVertical: 24, marginBottom: 8 },
  pageEmoji: { fontSize: 40, marginBottom: 10 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: t.text, letterSpacing: -0.3, marginBottom: 6 },
  pageDesc: { fontSize: 14, color: t.textSecondary, textAlign: "center", lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  input: { backgroundColor: t.bgCard, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 14, fontSize: 15, color: t.text },
  diasRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  diaBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: t.bgCard, borderWidth: 1, borderColor: t.border, alignItems: "center" },
  diaBtnActive: { backgroundColor: t.accentGreen, borderColor: t.accentGreen },
  diaBtnText: { fontSize: 12, fontWeight: "700", color: t.textSecondary },
  diaBtnTextActive: { color: "#fff" },
  diasHint: { fontSize: 12, color: t.textMuted, marginTop: 8, textAlign: "center" },
  momentosGrid: { flexDirection: "row", gap: 10 },
  momentoBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: t.bgCard, borderWidth: 1, borderColor: t.border, alignItems: "center", gap: 4 },
  momentoBtnActive: { backgroundColor: t.accentGreen, borderColor: t.accentGreen },
  momentoEmoji: { fontSize: 18 },
  momentoText: { fontSize: 12, fontWeight: "600", color: t.textSecondary },
  momentoTextActive: { color: "#fff" },
  btnGenerar: { backgroundColor: t.text, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 28 },
  btnGenerarOff: { backgroundColor: t.border },
  btnGenerarText: { color: t.bg, fontWeight: "700", fontSize: 15 },
  loadingRow: { flexDirection: "row", alignItems: "center" },
  resultado: { backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, overflow: "hidden", paddingBottom: 8 },
  resultadoHeader: { padding: 20, paddingBottom: 12 },
  resultadoEyebrow: { fontSize: 10, fontWeight: "700", color: t.accentGreen, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  resultadoTitle: { fontSize: 20, fontWeight: "800", color: t.text, marginBottom: 4 },
  resultadoHint: { fontSize: 12, color: t.textMuted },
  btnGuardar: { marginHorizontal: 16, marginTop: 8, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 13, alignItems: "center" },
  btnGuardarText: { fontWeight: "600", color: t.textSecondary, fontSize: 14 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: { backgroundColor: t.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: "85%" },
  modalMomento: { fontSize: 10, fontWeight: "700", color: t.accentGreen, letterSpacing: 1.5, marginBottom: 6 },
  modalTitulo: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.3, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: t.textSecondary, lineHeight: 20, marginBottom: 20 },
  macrosRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  macroCard: { flex: 1, backgroundColor: t.bgSubtle, borderRadius: 12, padding: 12, alignItems: "center", gap: 3 },
  macroEmoji: { fontSize: 16 },
  macroVal: { fontSize: 15, fontWeight: "800", color: t.text },
  macroLabel: { fontSize: 10, color: t.textMuted, fontWeight: "600" },
  recetaLabel: { fontSize: 13, fontWeight: "700", color: t.text, marginBottom: 14 },
  pasoRow: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  pasoNumBox: { width: 24, height: 24, borderRadius: 7, backgroundColor: t.text, alignItems: "center", justifyContent: "center" },
  pasoNum: { fontSize: 11, fontWeight: "800", color: t.bg },
  pasoText: { flex: 1, fontSize: 14, color: t.text, lineHeight: 21 },
  btnCerrar: { backgroundColor: t.text, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 20 },
  btnCerrarText: { color: t.bg, fontWeight: "700", fontSize: 15 },
});
