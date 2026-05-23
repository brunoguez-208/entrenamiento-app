import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function HomeScreen() {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>
        <View style={s.hero}>
          <Text style={s.heroEyebrow}>Bienvenido</Text>
          <Text style={s.heroTitle}>Tu cuerpo,{"\n"}tu plan.</Text>
          <Text style={s.heroSub}>
            IA que diseña rutinas y menús personalizados para vos.
          </Text>
        </View>

        <View style={s.divider} />

        <Text style={s.sectionLabel}>¿Qué querés hoy?</Text>

        <TouchableOpacity style={s.card} onPress={() => router.push("/entrenamiento")} activeOpacity={0.7}>
          <View style={s.cardInner}>
            <View style={[s.cardDot, { backgroundColor: theme.accentPurpleMuted }]}>
              <Text style={s.cardDotText}>↑</Text>
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitle}>Entrenamiento</Text>
              <Text style={s.cardDesc}>Generá tu rutina semanal con IA según tu nivel y objetivo.</Text>
            </View>
            <Text style={[s.cardArrow, { color: theme.accentPurple }]}>→</Text>
          </View>
          <View style={[s.cardAccent, { backgroundColor: theme.accentPurple }]} />
        </TouchableOpacity>

        <TouchableOpacity style={s.card} onPress={() => router.push("/alimentacion")} activeOpacity={0.7}>
          <View style={s.cardInner}>
            <View style={[s.cardDot, { backgroundColor: theme.accentGreenMuted }]}>
              <Text style={s.cardDotText}>◇</Text>
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitle}>Nutrición</Text>
              <Text style={s.cardDesc}>Armá tu menú del día con platos que te gustan de verdad.</Text>
            </View>
            <Text style={[s.cardArrow, { color: theme.accentGreen }]}>→</Text>
          </View>
          <View style={[s.cardAccent, { backgroundColor: theme.accentGreen }]} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.card, s.cardSecondary]} onPress={() => router.push("/favoritos")} activeOpacity={0.7}>
          <View style={s.cardInner}>
            <View style={[s.cardDot, { backgroundColor: theme.bgSubtle }]}>
              <Text style={s.cardDotText}>☆</Text>
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitle}>Mis Planes</Text>
              <Text style={s.cardDesc}>Revisá los planes que guardaste para seguir progresando.</Text>
            </View>
            <Text style={[s.cardArrow, { color: theme.textMuted }]}>→</Text>
          </View>
        </TouchableOpacity>

        <View style={s.footer}>
          <Text style={s.footerText}>Fitness AI · Powered by Mistral</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: "center", paddingBottom: 40 },
  inner: { width: "100%", maxWidth: 600, padding: 24, paddingTop: 20 },
  hero: { paddingTop: 12, paddingBottom: 28 },
  heroEyebrow: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  heroTitle: { fontSize: 38, fontWeight: "800", color: t.text, lineHeight: 44, letterSpacing: -0.5, marginBottom: 12 },
  heroSub: { fontSize: 15, color: t.textSecondary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: t.border, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 },
  card: { backgroundColor: t.bgCard, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
  cardSecondary: { backgroundColor: t.bgSubtle },
  cardInner: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
  cardAccent: { height: 3 },
  cardDot: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardDotText: { fontSize: 18, color: t.text },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: t.text, marginBottom: 3 },
  cardDesc: { fontSize: 13, color: t.textSecondary, lineHeight: 18 },
  cardArrow: { fontSize: 20, fontWeight: "300" },
  footer: { alignItems: "center", paddingTop: 32 },
  footerText: { fontSize: 11, color: t.textMuted, letterSpacing: 1 },
});
