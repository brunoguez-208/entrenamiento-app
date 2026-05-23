import { Mistral } from "@mistralai/mistralai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

export default function AlimentacionScreen() {
  const { theme } = useTheme();
  const s = styles(theme);

  const [quiere, setQuiere] = useState("");
  const [noQuiere, setNoQuiere] = useState("");
  const [momentos, setMomentos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [menu, setMenu] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [platoSeleccionado, setPlatoSeleccionado] = useState<Plato | null>(null);

  const toggleMomento = (m: string) => {
    setMomentos(prev => prev.includes(m) ? prev.filter(i => i !== m) : [...prev, m]);
  };

  const generarMenuConIA = async () => {
    if (!quiere.trim() || momentos.length === 0) return;
    setCargando(true);
    setMenu(null);
    const exclusiones = noQuiere.trim() ? noQuiere : "ninguna";

    const prompt = `Actúa como nutricionista deportivo de élite. Genera plan de alimentación basándote en:
    - Alimentos incluidos: ${quiere}
    - Restricciones: ${exclusiones}
    - Comidas: ${momentos.join(", ")}
    
    Responde SOLO con JSON válido, sin markdown:
    {"platos":[{"momento":"Desayuno","nombrePlato":"Nombre creativo","descripcion":"Breve descripción","macros":{"calorias":450,"proteinas":35,"carbohidratos":45,"grasas":12},"receta":["Paso 1...","Paso 2..."]}]}`;

    try {
      const response = await client.chat.complete({
        model: "mistral-small-latest",
        responseFormat: { type: "json_object" },
        messages: [{ role: "user", content: prompt }]
      });
      const contenido = response.choices?.[0]?.message?.content;
      if (typeof contenido === "string") {
        const parsed = JSON.parse(contenido.trim());
        setMenu({ id: Date.now().toString(), tipo: "alimentacion", platos: parsed.platos });
      } else throw new Error("Respuesta inválida");
    } catch (err) {
      Alert.alert("Error", "No se pudo generar el menú. Revisá tu API key.");
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

  const verDetalles = (plato: Plato) => { setPlatoSeleccionado(plato); setModalVisible(true); };
  const canGenerate = quiere.trim() && momentos.length > 0 && !cargando;

  const MOMENTOS = ["Desayuno", "Almuerzo", "Colación", "Cena"];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      <View style={s.section}>
        <Text style={s.sectionLabel}>Alimentos que querés</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: palta, pollo, huevos, avena..."
          placeholderTextColor={theme.textMuted}
          value={quiere}
          onChangeText={setQuiere}
        />
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>Restricciones o alergias</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: lácteos, gluten... (opcional)"
          placeholderTextColor={theme.textMuted}
          value={noQuiere}
          onChangeText={setNoQuiere}
        />
      </View>

      <View style={s.section}>
        <Text style={s.sectionLabel}>Comidas del día</Text>
        <View style={s.momentosGrid}>
          {MOMENTOS.map((m) => {
            const activo = momentos.includes(m);
            return (
              <TouchableOpacity
                key={m}
                style={[s.momentoBtn, activo && s.momentoBtnActive]}
                onPress={() => toggleMomento(m)}
                activeOpacity={0.7}
              >
                <Text style={[s.momentoText, activo && s.momentoTextActive]}>{m}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[s.btnGenerar, !canGenerate && s.btnGenerarOff]}
        onPress={generarMenuConIA}
        disabled={!canGenerate}
        activeOpacity={0.8}
      >
        {cargando
          ? <ActivityIndicator color={theme.bg} size="small" />
          : <Text style={s.btnGenerarText}>Generar menú con Mistral AI</Text>
        }
      </TouchableOpacity>

      {menu && (
        <View style={s.resultado}>
          <View style={s.resultadoHeader}>
            <Text style={s.resultadoEyebrow}>Menú personalizado</Text>
            <Text style={s.resultadoHint}>Tocá un plato para ver la receta</Text>
          </View>
          <View style={s.resultadoDivider} />

          {menu.platos.map((plato: Plato, i: number) => (
            <TouchableOpacity key={i} style={s.platoRow} onPress={() => verDetalles(plato)} activeOpacity={0.7}>
              <View style={s.platoLeft}>
                <Text style={s.platoMomento}>{plato.momento.toUpperCase()}</Text>
                <Text style={s.platoNombre}>{plato.nombrePlato}</Text>
                <Text style={s.platoDesc} numberOfLines={2}>{plato.descripcion}</Text>
              </View>
              <View style={s.platoRight}>
                <Text style={s.kcal}>{plato.macros.calorias}</Text>
                <Text style={s.kcalLabel}>kcal</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={s.btnGuardar} onPress={guardarEnFavoritos} activeOpacity={0.7}>
            <Text style={s.btnGuardarText}>Guardar plan completo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
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
                    { v: platoSeleccionado.macros.calorias, l: "Kcal" },
                    { v: `${platoSeleccionado.macros.proteinas}g`, l: "Prot" },
                    { v: `${platoSeleccionado.macros.carbohidratos}g`, l: "Carbs" },
                    { v: `${platoSeleccionado.macros.grasas}g`, l: "Grasas" },
                  ].map((m, i) => (
                    <View key={i} style={s.macroCard}>
                      <Text style={s.macroVal}>{m.v}</Text>
                      <Text style={s.macroLabel}>{m.l}</Text>
                    </View>
                  ))}
                </View>

                <Text style={s.recetaLabel}>Preparación</Text>
                {platoSeleccionado.receta.map((paso, i) => (
                  <View key={i} style={s.pasoRow}>
                    <Text style={s.pasoNum}>{i + 1}</Text>
                    <Text style={s.pasoText}>{paso.replace(/^Paso \d+:\s*/i, "")}</Text>
                  </View>
                ))}

                <TouchableOpacity style={s.btnCerrar} onPress={() => setModalVisible(false)}>
                  <Text style={s.btnCerrarText}>Cerrar</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: 'center', paddingBottom: 48 },
  inner: { width: '100%', maxWidth: 600, padding: 20 },

  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  input: {
    backgroundColor: t.bgCard, borderRadius: 12, borderWidth: 1,
    borderColor: t.border, padding: 14, fontSize: 15, color: t.text,
  },

  momentosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  momentoBtn: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
    backgroundColor: t.bgCard, borderWidth: 1, borderColor: t.border,
  },
  momentoBtnActive: { backgroundColor: t.accentGreen, borderColor: t.accentGreen },
  momentoText: { fontSize: 14, fontWeight: "600", color: t.textSecondary },
  momentoTextActive: { color: "#fff" },

  btnGenerar: { backgroundColor: t.text, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 28 },
  btnGenerarOff: { backgroundColor: t.border },
  btnGenerarText: { color: t.bg, fontWeight: "700", fontSize: 15 },

  resultado: { backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
  resultadoHeader: { padding: 20, paddingBottom: 12 },
  resultadoEyebrow: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  resultadoHint: { fontSize: 13, color: t.textMuted },
  resultadoDivider: { height: 1, backgroundColor: t.border, marginHorizontal: 20, marginBottom: 4 },

  platoRow: {
    flexDirection: "row", paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: t.borderLight,
    alignItems: "center", gap: 12,
  },
  platoLeft: { flex: 1 },
  platoMomento: { fontSize: 10, fontWeight: "700", color: t.accentGreen, letterSpacing: 1.5, marginBottom: 3 },
  platoNombre: { fontSize: 15, fontWeight: "700", color: t.text, marginBottom: 3 },
  platoDesc: { fontSize: 12, color: t.textSecondary, lineHeight: 17 },
  platoRight: { alignItems: "center" },
  kcal: { fontSize: 18, fontWeight: "800", color: t.text },
  kcalLabel: { fontSize: 10, color: t.textMuted, fontWeight: "600" },

  btnGuardar: { margin: 16, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 13, alignItems: "center" },
  btnGuardarText: { fontWeight: "600", color: t.textSecondary, fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: { backgroundColor: t.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: "85%" },
  modalMomento: { fontSize: 10, fontWeight: "700", color: t.accentGreen, letterSpacing: 1.5, marginBottom: 6 },
  modalTitulo: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.3, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: t.textSecondary, lineHeight: 20, marginBottom: 20 },

  macrosRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  macroCard: { flex: 1, backgroundColor: t.bgSubtle, borderRadius: 12, padding: 12, alignItems: "center" },
  macroVal: { fontSize: 16, fontWeight: "800", color: t.text },
  macroLabel: { fontSize: 11, color: t.textMuted, marginTop: 2, fontWeight: "600" },

  recetaLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  pasoRow: { flexDirection: "row", gap: 12, marginBottom: 10, alignItems: "flex-start" },
  pasoNum: { width: 22, height: 22, borderRadius: 6, backgroundColor: t.bgSubtle, textAlign: "center", lineHeight: 22, fontSize: 12, fontWeight: "800", color: t.textSecondary },
  pasoText: { flex: 1, fontSize: 14, color: t.text, lineHeight: 21 },

  btnCerrar: { backgroundColor: t.text, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 20 },
  btnCerrarText: { color: t.bg, fontWeight: "700", fontSize: 15 },
});
