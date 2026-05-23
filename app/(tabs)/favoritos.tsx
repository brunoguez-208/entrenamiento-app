import React, { useState, useCallback, useRef, useEffect } from "react";
import { Animated, StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from "react-native";
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

export default function FavoritosScreen() {
  const { theme } = useTheme();
  const s = styles(theme);
  const [items, setItems] = useState<any[]>([]);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const data = await AsyncStorage.getItem("favoritos");
          setItems(data ? JSON.parse(data) : []);
        } catch {}
      })();
      // Reset confirm state when tab is focused
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
      // Auto-cancel after 3 seconds
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
                  <View style={s.card}>
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
                              {item.tipo === "entrenamiento" ? item.objetivo : `Menú · ${item.platos?.length || 0} platos`}
                            </Text>
                          </View>
                        </View>

                        {/* Delete button — dos pasos para evitar el problema de Alert en web */}
                        <TouchableOpacity
                          onPress={() => handleDeletePress(item.id)}
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
                            <View style={s.tag}><Text style={s.tagText}>{item.dias?.length || item.dias} días/sem</Text></View>
                          </View>
                          {item.diasRutina?.slice(0, 2).map((d: any, i: number) => (
                            <Text key={i} style={s.itemText}>· {d.dia} — {d.enfoque}</Text>
                          ))}
                          {item.diasRutina?.length > 2 && (
                            <Text style={s.moreText}>+{item.diasRutina.length - 2} días más</Text>
                          )}
                        </View>
                      ) : (
                        <View style={s.detailsBlock}>
                          {item.platos?.slice(0, 3).map((p: any, i: number) => (
                            <Text key={i} style={s.itemText}>· {p.nombrePlato} <Text style={s.itemMeta}>({p.momento})</Text></Text>
                          ))}
                          {item.platos?.length > 3 && (
                            <Text style={s.moreText}>+{item.platos.length - 3} platos más</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </FadeInView>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: "center", paddingBottom: 48 },
  inner: { width: "100%", maxWidth: 600, padding: 20 },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 52, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: t.text },
  emptyDesc: { fontSize: 14, color: t.textSecondary, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },

  statsRow: {
    flexDirection: "row", backgroundColor: t.bgCard,
    borderRadius: 16, borderWidth: 1, borderColor: t.border,
    padding: 20, marginBottom: 20, alignItems: "center",
  },
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
  moreText: { fontSize: 12, color: t.textMuted, marginTop: 2 },
});
