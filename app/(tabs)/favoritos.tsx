import React, { useState, useCallback, useRef, useEffect } from "react";
import { Animated, StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

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

// Modal de detalle para rutina de entrenamiento
function DetalleEntrenamiento({ item, onClose, theme }: any) {
  const s = modalStyles(theme);
  const [diaActivo, setDiaActivo] = useState(0);
  const dias = item.diasRutina || [];

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.sheetHeader}>
            <View>
              <Text style={s.sheetEyebrow}>{item.nivel} · {item.dias?.length || 0} días/sem</Text>
              <Text style={s.sheetTitle}>{item.objetivo}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Consejo */}
          {item.consejo && (
            <View style={s.consejoBox}>
              <Text style={s.consejoIcon}>💡</Text>
              <Text style={s.consejoText}>{item.consejo}</Text>
            </View>
          )}

          {/* Selector de días */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.diasScroll} contentContainerStyle={s.diasScrollContent}>
            {dias.map((d: any, i: number) => (
              <TouchableOpacity key={i} style={[s.diaTab, diaActivo === i && s.diaTabActive]} onPress={() => setDiaActivo(i)}>
                <Text style={[s.diaTabText, diaActivo === i && s.diaTabTextActive]}>{d.dia}</Text>
                <Text style={[s.diaTabEnfoque, diaActivo === i && s.diaTabEnfoqueActive]} numberOfLines={1}>{d.enfoque}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Ejercicios del día */}
          <ScrollView style={s.ejerciciosList} showsVerticalScrollIndicator={false}>
            {dias[diaActivo]?.ejercicios?.map((ej: any, i: number) => (
              <View key={i} style={[s.ejercicioRow, i === dias[diaActivo].ejercicios.length - 1 && s.ejercicioRowLast]}>
                <View style={s.ejercicioNum}>
                  <Text style={s.ejercicioNumText}>{i + 1}</Text>
                </View>
                <View style={s.ejercicioBody}>
                  <View style={s.ejercicioTop}>
                    <Text style={s.ejercicioNombre}>{ej.nombre}</Text>
                    <Text style={s.ejercicioSeries}>{ej.series}×{ej.reps}</Text>
                  </View>
                  {ej.descanso && (
                    <View style={s.badge}><Text style={s.badgeText}>⏱ {ej.descanso}</Text></View>
                  )}
                  {ej.nota && <Text style={s.ejercicioNota}>{ej.nota}</Text>}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Modal de detalle para menú de alimentación
function DetalleAlimentacion({ item, onClose, theme }: any) {
  const s = modalStyles(theme);
  const [diaActivo, setDiaActivo] = useState(0);
  const [platoAbierto, setPlatoAbierto] = useState<any>(null);

  const dias = item.dias || [];
  // Soporte para items guardados con el formato viejo (solo platos, sin días)
  const diasData = dias.length > 0 ? dias : [{ dia: "Menú", platos: item.platos || [] }];

  const MOMENTOS_EMOJI: Record<string, string> = {
    "Desayuno": "🌅", "Almuerzo": "☀️", "Colación": "🍎", "Cena": "🌙",
  };

  if (platoAbierto) {
    return (
      <Modal animationType="slide" transparent visible onRequestClose={() => setPlatoAbierto(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <View>
                <Text style={s.sheetEyebrow}>{platoAbierto.momento?.toUpperCase()}</Text>
                <Text style={s.sheetTitle}>{platoAbierto.nombrePlato}</Text>
              </View>
              <TouchableOpacity onPress={() => setPlatoAbierto(null)} style={s.closeBtn}>
                <Text style={s.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.platoDesc}>{platoAbierto.descripcion}</Text>
              <View style={s.macrosRow}>
                {[
                  { v: platoAbierto.macros?.calorias, l: "Kcal", e: "🔥" },
                  { v: `${platoAbierto.macros?.proteinas}g`, l: "Prot", e: "💪" },
                  { v: `${platoAbierto.macros?.carbohidratos}g`, l: "Carbs", e: "⚡" },
                  { v: `${platoAbierto.macros?.grasas}g`, l: "Grasas", e: "🥑" },
                ].map((m, i) => (
                  <View key={i} style={s.macroCard}>
                    <Text style={s.macroEmoji}>{m.e}</Text>
                    <Text style={s.macroVal}>{m.v}</Text>
                    <Text style={s.macroLabel}>{m.l}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.recetaLabel}>Preparación 🍳</Text>
              {platoAbierto.receta?.map((paso: string, i: number) => (
                <View key={i} style={s.pasoRow}>
                  <View style={s.pasoNumBox}><Text style={s.pasoNum}>{i + 1}</Text></View>
                  <Text style={s.pasoText}>{paso.replace(/^Paso \d+:\s*/i, "")}</Text>
                </View>
              ))}
              <TouchableOpacity style={s.btnCerrar} onPress={() => setPlatoAbierto(null)}>
                <Text style={s.btnCerrarText}>← Volver al menú</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Tu menú guardado 🍽️</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          {diasData.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.diasScroll} contentContainerStyle={s.diasScrollContent}>
              {diasData.map((d: any, i: number) => (
                <TouchableOpacity key={i} style={[s.diaTab, diaActivo === i && s.diaTabActive]} onPress={() => setDiaActivo(i)}>
                  <Text style={[s.diaTabText, diaActivo === i && s.diaTabTextActive]}>{d.dia}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={s.platoHint}>Tocá un plato para ver la receta</Text>

          <ScrollView style={s.ejerciciosList} showsVerticalScrollIndicator={false}>
            {diasData[diaActivo]?.platos?.map((plato: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={[s.platoRow, i === diasData[diaActivo].platos.length - 1 && s.ejercicioRowLast]}
                onPress={() => setPlatoAbierto(plato)}
                activeOpacity={0.7}
              >
                <View style={s.platoEmojiBox}>
                  <Text style={s.platoEmojiText}>{MOMENTOS_EMOJI[plato.momento] || "🍴"}</Text>
                </View>
                <View style={s.platoBody}>
                  <Text style={s.platoMomento}>{plato.momento?.toUpperCase()}</Text>
                  <Text style={s.platoNombre}>{plato.nombrePlato}</Text>
                  <Text style={s.platoDescBreve} numberOfLines={1}>{plato.descripcion}</Text>
                </View>
                <View style={s.platoKcalBox}>
                  <Text style={s.platoKcal}>{plato.macros?.calorias}</Text>
                  <Text style={s.platoKcalLabel}>kcal</Text>
                </View>
                <Text style={s.platoArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function FavoritosScreen() {
  const { theme } = useTheme();
  const s = styles(theme);
  const [items, setItems] = useState<any[]>([]);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [itemAbierto, setItemAbierto] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const data = await AsyncStorage.getItem("favoritos");
          setItems(data ? JSON.parse(data) : []);
        } catch {}
      })();
      setConfirmandoId(null);
    }, [])
  );

  const eliminar = async (id: string) => {
    const filtrados = items.filter(i => i.id !== id);
    setItems(filtrados);
    setConfirmandoId(null);
    await AsyncStorage.setItem("favoritos", JSON.stringify(filtrados));
  };

  const handleDeletePress = (id: string) => {
    if (confirmandoId === id) {
      eliminar(id);
    } else {
      setConfirmandoId(id);
      setTimeout(() => setConfirmandoId(prev => prev === id ? null : prev), 3000);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>
        {items.length === 0 ? (
          <FadeInView delay={0}>
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>Sin planes guardados</Text>
              <Text style={s.emptyDesc}>Generá una rutina o menú y guardalo para verlo acá.</Text>
            </View>
          </FadeInView>
        ) : (
          <>
            <FadeInView delay={0}>
              <View style={s.statsRow}>
                <View style={s.statBox}>
                  <Text style={s.statNum}>{items.filter(i => i.tipo === "entrenamiento").length}</Text>
                  <Text style={s.statLabel}>Rutinas 🏋️</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statBox}>
                  <Text style={s.statNum}>{items.filter(i => i.tipo === "alimentacion").length}</Text>
                  <Text style={s.statLabel}>Menús 🥗</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statBox}>
                  <Text style={s.statNum}>{items.length}</Text>
                  <Text style={s.statLabel}>Total ⭐</Text>
                </View>
              </View>
            </FadeInView>

            {items.map((item, idx) => {
              const confirmando = confirmandoId === item.id;
              return (
                <FadeInView key={item.id} delay={80 + idx * 60}>
                  <TouchableOpacity
                    style={s.card}
                    onPress={() => setItemAbierto(item)}
                    activeOpacity={0.75}
                  >
                    <View style={[s.cardBar, { backgroundColor: item.tipo === "entrenamiento" ? theme.accentPurple : theme.accentGreen }]} />
                    <View style={s.cardBody}>
                      <View style={s.cardHeader}>
                        <View style={s.cardHeaderLeft}>
                          <Text style={s.cardEmoji}>{item.tipo === "entrenamiento" ? "🏋️" : "🥗"}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[s.cardType, { color: item.tipo === "entrenamiento" ? theme.accentPurple : theme.accentGreen }]}>
                              {item.tipo === "entrenamiento" ? "ENTRENAMIENTO" : "NUTRICIÓN"}
                            </Text>
                            <Text style={s.cardTitle} numberOfLines={1}>
                              {item.tipo === "entrenamiento" ? item.objetivo : `Menú · ${item.dias?.length || 0} días`}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation?.(); handleDeletePress(item.id); }}
                          style={[s.deleteBtn, confirmando && s.deleteBtnConfirm]}
                          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        >
                          <Text style={[s.deleteIcon, confirmando && s.deleteIconConfirm]}>
                            {confirmando ? "¿Borrar?" : "×"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {item.tipo === "entrenamiento" ? (
                        <View style={s.detailsBlock}>
                          <View style={s.tagRow}>
                            <View style={s.tag}><Text style={s.tagText}>{item.nivel}</Text></View>
                            <View style={s.tag}><Text style={s.tagText}>{item.dias?.length || 0} días/sem</Text></View>
                          </View>
                          {item.diasRutina?.slice(0, 2).map((d: any, i: number) => (
                            <Text key={i} style={s.itemText}>· {d.dia} — {d.enfoque}</Text>
                          ))}
                          {item.diasRutina?.length > 2 && (
                            <Text style={s.moreText}>+{item.diasRutina.length - 2} días más · Tocá para ver todo</Text>
                          )}
                        </View>
                      ) : (
                        <View style={s.detailsBlock}>
                          {(item.dias || [{ platos: item.platos }])[0]?.platos?.slice(0, 2).map((p: any, i: number) => (
                            <Text key={i} style={s.itemText}>· {p.nombrePlato} <Text style={s.itemMeta}>({p.momento})</Text></Text>
                          ))}
                          <Text style={s.moreText}>Tocá para ver el menú completo →</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </FadeInView>
              );
            })}
          </>
        )}
      </View>

      {/* Modales de detalle */}
      {itemAbierto?.tipo === "entrenamiento" && (
        <DetalleEntrenamiento item={itemAbierto} onClose={() => setItemAbierto(null)} theme={theme} />
      )}
      {itemAbierto?.tipo === "alimentacion" && (
        <DetalleAlimentacion item={itemAbierto} onClose={() => setItemAbierto(null)} theme={theme} />
      )}
    </ScrollView>
  );
}

const modalStyles = (t: any) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { backgroundColor: t.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: "90%" },

  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  sheetEyebrow: { fontSize: 10, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: t.text, letterSpacing: -0.3, maxWidth: "85%" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: t.bgSubtle, alignItems: "center", justifyContent: "center" },
  closeIcon: { fontSize: 20, color: t.textMuted, lineHeight: 22 },

  consejoBox: { flexDirection: "row", backgroundColor: t.bgSubtle, borderRadius: 10, padding: 12, gap: 8, marginBottom: 14 },
  consejoIcon: { fontSize: 14 },
  consejoText: { flex: 1, fontSize: 13, color: t.textSecondary, lineHeight: 19 },

  diasScroll: { marginBottom: 12 },
  diasScrollContent: { gap: 8, paddingRight: 8 },
  diaTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: t.bgSubtle, borderWidth: 1, borderColor: t.border, minWidth: 80, alignItems: "center" },
  diaTabActive: { backgroundColor: t.text, borderColor: t.text },
  diaTabText: { fontSize: 13, fontWeight: "700", color: t.textSecondary },
  diaTabTextActive: { color: t.bg },
  diaTabEnfoque: { fontSize: 10, color: t.textMuted, marginTop: 2, maxWidth: 90 },
  diaTabEnfoqueActive: { color: t.bg, opacity: 0.7 },

  ejerciciosList: { maxHeight: 420 },
  ejercicioRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.borderLight, gap: 12 },
  ejercicioRowLast: { borderBottomWidth: 0 },
  ejercicioNum: { width: 26, height: 26, borderRadius: 8, backgroundColor: t.bgSubtle, alignItems: "center", justifyContent: "center" },
  ejercicioNumText: { fontSize: 11, fontWeight: "800", color: t.textMuted },
  ejercicioBody: { flex: 1 },
  ejercicioTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  ejercicioNombre: { fontSize: 14, fontWeight: "700", color: t.text, flex: 1, marginRight: 8 },
  ejercicioSeries: { fontSize: 13, fontWeight: "800", color: t.accentPurple },
  badge: { backgroundColor: t.bgSubtle, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start", marginBottom: 4 },
  badgeText: { fontSize: 11, color: t.textMuted, fontWeight: "600" },
  ejercicioNota: { fontSize: 12, color: t.textSecondary, lineHeight: 17, fontStyle: "italic" },

  platoHint: { fontSize: 12, color: t.textMuted, marginBottom: 10 },
  platoRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.borderLight, alignItems: "center", gap: 12 },
  platoEmojiBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: t.bgSubtle, alignItems: "center", justifyContent: "center" },
  platoEmojiText: { fontSize: 17 },
  platoBody: { flex: 1 },
  platoMomento: { fontSize: 10, fontWeight: "700", color: t.accentGreen, letterSpacing: 1.5, marginBottom: 2 },
  platoNombre: { fontSize: 14, fontWeight: "700", color: t.text, marginBottom: 2 },
  platoDescBreve: { fontSize: 12, color: t.textSecondary },
  platoKcalBox: { alignItems: "center" },
  platoKcal: { fontSize: 16, fontWeight: "800", color: t.text },
  platoKcalLabel: { fontSize: 10, color: t.textMuted },
  platoArrow: { fontSize: 16, color: t.textMuted },

  platoDesc: { fontSize: 14, color: t.textSecondary, lineHeight: 20, marginBottom: 18 },
  macrosRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  macroCard: { flex: 1, backgroundColor: t.bgSubtle, borderRadius: 12, padding: 10, alignItems: "center", gap: 3 },
  macroEmoji: { fontSize: 16 },
  macroVal: { fontSize: 14, fontWeight: "800", color: t.text },
  macroLabel: { fontSize: 10, color: t.textMuted, fontWeight: "600" },
  recetaLabel: { fontSize: 13, fontWeight: "700", color: t.text, marginBottom: 12 },
  pasoRow: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  pasoNumBox: { width: 24, height: 24, borderRadius: 7, backgroundColor: t.text, alignItems: "center", justifyContent: "center" },
  pasoNum: { fontSize: 11, fontWeight: "800", color: t.bg },
  pasoText: { flex: 1, fontSize: 14, color: t.text, lineHeight: 21 },
  btnCerrar: { backgroundColor: t.bgSubtle, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 16 },
  btnCerrarText: { fontWeight: "600", color: t.textSecondary, fontSize: 14 },
});

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: "center", paddingBottom: 48 },
  inner: { width: "100%", maxWidth: 600, padding: 20 },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 52, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: t.text },
  emptyDesc: { fontSize: 14, color: t.textSecondary, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },

  statsRow: { flexDirection: "row", backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 20, marginBottom: 20, alignItems: "center" },
  statBox: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "800", color: t.text },
  statLabel: { fontSize: 12, color: t.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: t.border },

  card: { flexDirection: "row", backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, marginBottom: 12, overflow: "hidden" },
  cardBar: { width: 4 },
  cardBody: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  cardEmoji: { fontSize: 24 },
  cardType: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: t.text },

  deleteBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: t.bgSubtle, borderWidth: 1, borderColor: t.border },
  deleteBtnConfirm: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  deleteIcon: { fontSize: 16, color: t.textMuted, fontWeight: "700" },
  deleteIconConfirm: { fontSize: 12, color: "#dc2626", fontWeight: "700" },

  detailsBlock: { gap: 4 },
  tagRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  tag: { backgroundColor: t.bgSubtle, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 12, color: t.textSecondary, fontWeight: "600" },
  itemText: { fontSize: 13, color: t.textSecondary, lineHeight: 20 },
  itemMeta: { color: t.textMuted },
  moreText: { fontSize: 12, color: t.textMuted, marginTop: 4, fontStyle: "italic" },
});
