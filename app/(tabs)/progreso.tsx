import React, { useState, useCallback, useRef, useEffect } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../../context/UserContext";
import PaywallScreen from "../../components/PaywallScreen";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

interface FotoProgreso {
  id: string;
  fecha: string;
  mes: string;
  uri: string;
  nota: string;
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

export default function ProgresoScreen() {
  const { theme } = useTheme();
  const { appState } = useUser();
  if (!appState.isPremium) return <PaywallScreen feature="Progreso" />;
  const s = styles(theme);
  const [fotos, setFotos] = useState<FotoProgreso[]>([]);
  const [comparando, setComparando] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem("@fotos_progreso");
        setFotos(data ? JSON.parse(data) : []);
      } catch {}
    })();
  }, []));

  const subirFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería para subir fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      const now = new Date();
      const nueva: FotoProgreso = {
        id: Date.now().toString(),
        fecha: now.toLocaleDateString("es-UY", { day: "2-digit", month: "2-digit", year: "numeric" }),
        mes: now.toLocaleDateString("es-UY", { month: "long", year: "numeric" }),
        uri: result.assets[0].uri,
        nota: "",
      };
      const updated = [...fotos, nueva];
      setFotos(updated);
      await AsyncStorage.setItem("@fotos_progreso", JSON.stringify(updated));
    }
  };

  const eliminarFoto = async (id: string) => {
    const updated = fotos.filter(f => f.id !== id);
    setFotos(updated);
    setComparando(prev => prev.filter(c => c !== id));
    await AsyncStorage.setItem("@fotos_progreso", JSON.stringify(updated));
  };

  const toggleComparar = (id: string) => {
    setComparando(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const fotosComparando = fotos.filter(f => comparando.includes(f.id));

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>

        {/* Racha */}
        <FadeInView delay={0}>
          <View style={s.rachaCard}>
            <View style={s.rachaLeft}>
              <Text style={s.rachaEmoji}>🔥</Text>
              <View>
                <Text style={s.rachaNum}>{appState.racha}</Text>
                <Text style={s.rachaLabel}>días de racha</Text>
              </View>
            </View>
            <View style={s.rachaRight}>
              <Text style={s.rachaMsg}>
                {appState.racha === 0
                  ? "¡Empezá hoy!"
                  : appState.racha < 7
                  ? "¡Buen comienzo! 💪"
                  : appState.racha < 30
                  ? "¡Estás en racha! 🚀"
                  : "¡Imparable! 🏆"}
              </Text>
              {appState.ultimoEntrenamiento && (
                <Text style={s.rachaFecha}>Último: {appState.ultimoEntrenamiento}</Text>
              )}
            </View>
          </View>
        </FadeInView>

        {/* Fotos */}
        <FadeInView delay={100}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>📸 Fotos de progreso</Text>
            <TouchableOpacity style={s.btnAgregar} onPress={subirFoto} activeOpacity={0.7}>
              <Text style={s.btnAgregarText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

        {fotos.length === 0 ? (
          <FadeInView delay={160}>
            <View style={s.emptyFotos}>
              <Text style={s.emptyEmoji}>📷</Text>
              <Text style={s.emptyTitle}>Sin fotos todavía</Text>
              <Text style={s.emptyDesc}>Subí tu primera foto para empezar a registrar tu progreso mensual.</Text>
              <TouchableOpacity style={s.btnSubir} onPress={subirFoto} activeOpacity={0.8}>
                <Text style={s.btnSubirText}>Subir primera foto</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        ) : (
          <>
            {/* Comparación */}
            {comparando.length === 2 && (
              <FadeInView delay={0}>
                <View style={s.comparacionBox}>
                  <Text style={s.comparacionLabel}>Comparando</Text>
                  <View style={s.comparacionRow}>
                    {fotosComparando.map((f, i) => (
                      <View key={f.id} style={s.comparacionItem}>
                        <Image source={{ uri: f.uri }} style={s.comparacionImg} />
                        <Text style={s.comparacionFecha}>{f.mes}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => setComparando([])}>
                    <Text style={s.comparacionCerrar}>Cerrar comparación</Text>
                  </TouchableOpacity>
                </View>
              </FadeInView>
            )}

            {comparando.length < 2 && comparando.length > 0 && (
              <View style={s.comparacionHint}>
                <Text style={s.comparacionHintText}>Seleccioná otra foto para comparar</Text>
              </View>
            )}

            <FadeInView delay={160}>
              <Text style={s.fotosHint}>Tocá para seleccionar y comparar dos fotos</Text>
              <View style={s.fotosGrid}>
                {fotos.map((foto, i) => {
                  const seleccionada = comparando.includes(foto.id);
                  return (
                    <TouchableOpacity
                      key={foto.id}
                      style={[s.fotoCard, seleccionada && s.fotoCardSelected]}
                      onPress={() => toggleComparar(foto.id)}
                      onLongPress={() => eliminarFoto(foto.id)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: foto.uri }} style={s.fotoImg} />
                      {seleccionada && (
                        <View style={s.fotoOverlay}>
                          <Text style={s.fotoCheck}>✓</Text>
                        </View>
                      )}
                      <View style={s.fotoInfo}>
                        <Text style={s.fotoMes}>{foto.mes}</Text>
                        <Text style={s.fotoFecha}>{foto.fecha}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={s.deleteHint}>Mantené presionado para eliminar una foto</Text>
            </FadeInView>
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

  rachaCard: {
    flexDirection: "row", backgroundColor: t.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: t.border, padding: 20, marginBottom: 24,
    alignItems: "center", justifyContent: "space-between",
  },
  rachaLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  rachaEmoji: { fontSize: 44 },
  rachaNum: { fontSize: 40, fontWeight: "800", color: t.text, lineHeight: 44 },
  rachaLabel: { fontSize: 13, color: t.textMuted, fontWeight: "600" },
  rachaRight: { alignItems: "flex-end" },
  rachaMsg: { fontSize: 14, fontWeight: "700", color: t.text, marginBottom: 3 },
  rachaFecha: { fontSize: 11, color: t.textMuted },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: t.text },
  btnAgregar: { backgroundColor: t.text, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnAgregarText: { color: t.bg, fontWeight: "700", fontSize: 13 },

  emptyFotos: { backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 32, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: t.text },
  emptyDesc: { fontSize: 13, color: t.textSecondary, textAlign: "center", lineHeight: 20 },
  btnSubir: { backgroundColor: t.text, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 11, marginTop: 6 },
  btnSubirText: { color: t.bg, fontWeight: "700", fontSize: 14 },

  comparacionBox: { backgroundColor: t.bgCard, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: 16, marginBottom: 16 },
  comparacionLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 },
  comparacionRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  comparacionItem: { flex: 1, alignItems: "center", gap: 6 },
  comparacionImg: { width: "100%", aspectRatio: 3 / 4, borderRadius: 10 },
  comparacionFecha: { fontSize: 12, fontWeight: "600", color: t.textSecondary },
  comparacionCerrar: { fontSize: 13, color: t.textMuted, textAlign: "center", fontWeight: "600" },

  comparacionHint: { backgroundColor: t.accentPurpleMuted, borderRadius: 10, padding: 12, marginBottom: 12, alignItems: "center" },
  comparacionHintText: { fontSize: 13, color: t.accentPurple, fontWeight: "600" },

  fotosHint: { fontSize: 12, color: t.textMuted, marginBottom: 12 },
  fotosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  fotoCard: { width: "47%", borderRadius: 12, overflow: "hidden", borderWidth: 2, borderColor: "transparent", backgroundColor: t.bgCard },
  fotoCardSelected: { borderColor: t.accentPurple },
  fotoImg: { width: "100%", aspectRatio: 3 / 4 },
  fotoOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 36, backgroundColor: "rgba(61,46,140,0.3)", alignItems: "center", justifyContent: "center" },
  fotoCheck: { fontSize: 32, color: "#fff", fontWeight: "800" },
  fotoInfo: { padding: 10 },
  fotoMes: { fontSize: 13, fontWeight: "700", color: t.text, textTransform: "capitalize" },
  fotoFecha: { fontSize: 11, color: t.textMuted },
  deleteHint: { fontSize: 11, color: t.textMuted, textAlign: "center", marginTop: 10 },
});
