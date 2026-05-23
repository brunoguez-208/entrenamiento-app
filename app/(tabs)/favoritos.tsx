import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function FavoritosScreen() {
  const { theme } = useTheme();
  const s = styles(theme);
  const [items, setItems] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const data = await AsyncStorage.getItem("favoritos");
          setItems(data ? JSON.parse(data) : []);
        } catch {}
      })();
    }, [])
  );

  const eliminar = async (id: string) => {
    Alert.alert("Eliminar", "¿Seguro que querés borrar este plan?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const filtrados = items.filter(i => i.id !== id);
          setItems(filtrados);
          await AsyncStorage.setItem("favoritos", JSON.stringify(filtrados));
        }
      }
    ]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>☆</Text>
          <Text style={s.emptyTitle}>Sin planes guardados</Text>
          <Text style={s.emptyDesc}>Generá una rutina o menú y guardalo para verlo acá.</Text>
        </View>
      ) : (
        <>
          <Text style={s.countText}>{items.length} plan{items.length !== 1 ? "es" : ""} guardado{items.length !== 1 ? "s" : ""}</Text>
          {items.map((item) => (
            <View key={item.id} style={s.card}>
              <View style={[s.cardBar, { backgroundColor: item.tipo === "entrenamiento" ? theme.accentPurple : theme.accentGreen }]} />
              <View style={s.cardBody}>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={[s.cardType, { color: item.tipo === "entrenamiento" ? theme.accentPurple : theme.accentGreen }]}>
                      {item.tipo === "entrenamiento" ? "ENTRENAMIENTO" : "NUTRICIÓN"}
                    </Text>
                    <Text style={s.cardTitle}>
                      {item.tipo === "entrenamiento"
                        ? item.objetivo
                        : `${item.platos?.length || 0} platos · Menú del día`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => eliminar(item.id)} style={s.deleteBtn} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Text style={s.deleteIcon}>×</Text>
                  </TouchableOpacity>
                </View>

                {item.tipo === "entrenamiento" ? (
                  <View style={s.detailsBlock}>
                    <Text style={s.metaText}>{item.nivel} · {item.dias} días/sem</Text>
                    {item.ejercicios?.slice(0, 3).map((ej: any, i: number) => (
                      <View key={i} style={s.itemRow}>
                        <Text style={s.itemDot}>·</Text>
                        <Text style={s.itemText}>{ej.n} <Text style={s.itemSeries}>{ej.s}</Text></Text>
                      </View>
                    ))}
                    {item.ejercicios?.length > 3 && (
                      <Text style={s.moreText}>+{item.ejercicios.length - 3} ejercicios más</Text>
                    )}
                  </View>
                ) : (
                  <View style={s.detailsBlock}>
                    {item.platos?.map((p: any, i: number) => (
                      <View key={i} style={s.itemRow}>
                        <Text style={s.itemDot}>·</Text>
                        <Text style={s.itemText}>{p.nombrePlato} <Text style={s.metaText}>({p.momento})</Text></Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: 'center', paddingBottom: 48 },
  inner: { width: '100%', maxWidth: 600, padding: 20 },

  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyIcon: { fontSize: 40, color: t.textMuted, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: t.text },
  emptyDesc: { fontSize: 14, color: t.textSecondary, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },

  countText: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 },

  card: {
    backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1,
    borderColor: t.border, marginBottom: 12, overflow: "hidden",
    flexDirection: "row",
  },
  cardBar: { width: 4 },
  cardBody: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  cardType: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 3 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: t.text, maxWidth: "90%" },
  deleteBtn: { padding: 2 },
  deleteIcon: { fontSize: 22, color: t.textMuted, lineHeight: 22 },

  detailsBlock: { gap: 4 },
  metaText: { fontSize: 12, color: t.textMuted, fontWeight: "500" },
  itemRow: { flexDirection: "row", gap: 6 },
  itemDot: { color: t.textMuted, fontSize: 14, lineHeight: 20 },
  itemText: { fontSize: 13, color: t.textSecondary, lineHeight: 20, flex: 1 },
  itemSeries: { color: t.accentPurple, fontWeight: "700" },
  moreText: { fontSize: 12, color: t.textMuted, marginTop: 2 },
});
