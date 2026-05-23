import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

const FEATURES = [
  { emoji: "🥗", title: "Plan Nutricional con IA", desc: "Menús semanales personalizados día a día" },
  { emoji: "📸", title: "Fotos de Progreso", desc: "Galería mensual y comparación lado a lado" },
  { emoji: "⏱️", title: "Timer de Descanso", desc: "Contador automático entre series" },
  { emoji: "📊", title: "Seguimiento avanzado", desc: "Registrá pesos y progresión por ejercicio" },
];

export default function PaywallScreen({ feature }: { feature: string }) {
  const { theme } = useTheme();
  const { activatePremium } = useUser();
  const s = styles(theme);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>⭐</Text>
          <Text style={s.heroTitle}>Fitness AI Premium</Text>
          <Text style={s.heroSub}>Desbloqueá todas las funciones para llevar tu entrenamiento al siguiente nivel.</Text>
        </View>

        <View style={s.lockedBadge}>
          <Text style={s.lockedEmoji}>🔒</Text>
          <Text style={s.lockedText}>"{feature}" es una función Premium</Text>
        </View>

        <Text style={s.featuresLabel}>QUÉ INCLUYE PREMIUM</Text>
        <View style={s.featuresList}>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureEmoji}>{f.emoji}</Text>
              <View style={s.featureText}>
                <Text style={s.featureTitle}>{f.title}</Text>
                <Text style={s.featureDesc}>{f.desc}</Text>
              </View>
              <Text style={s.featureCheck}>✓</Text>
            </View>
          ))}
        </View>

        <View style={s.priceCard}>
          <Text style={s.priceBadge}>LANZAMIENTO</Text>
          <Text style={s.priceAmount}>$4.99</Text>
          <Text style={s.pricePeriod}>/ mes · Cancelá cuando quieras</Text>
        </View>

        <TouchableOpacity style={s.btnActivar} onPress={activatePremium} activeOpacity={0.85}>
          <Text style={s.btnActivarText}>Activar Premium gratis (demo)</Text>
        </TouchableOpacity>

        <Text style={s.disclaimer}>Demo: el botón activa Premium sin cobrar. Integración de pagos próximamente.</Text>
      </View>
    </ScrollView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: "center", paddingBottom: 48 },
  inner: { width: "100%", maxWidth: 600, padding: 24 },

  hero: { alignItems: "center", paddingVertical: 32 },
  heroEmoji: { fontSize: 52, marginBottom: 14 },
  heroTitle: { fontSize: 28, fontWeight: "800", color: t.text, marginBottom: 10, letterSpacing: -0.3 },
  heroSub: { fontSize: 15, color: t.textSecondary, textAlign: "center", lineHeight: 22 },

  lockedBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: t.premiumMuted, borderRadius: 12, padding: 14, marginBottom: 28, justifyContent: "center" },
  lockedEmoji: { fontSize: 18 },
  lockedText: { fontSize: 14, fontWeight: "600", color: t.premium },

  featuresLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, marginBottom: 14 },
  featuresList: { backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, overflow: "hidden", marginBottom: 24 },
  featureRow: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: t.borderLight, gap: 14 },
  featureEmoji: { fontSize: 22, width: 32 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: "700", color: t.text, marginBottom: 2 },
  featureDesc: { fontSize: 12, color: t.textSecondary },
  featureCheck: { fontSize: 16, color: t.accentGreen, fontWeight: "800" },

  priceCard: { backgroundColor: t.premiumMuted, borderRadius: 16, borderWidth: 1, borderColor: t.premium + "40", padding: 24, alignItems: "center", marginBottom: 16 },
  priceBadge: { fontSize: 10, fontWeight: "700", color: t.premium, letterSpacing: 2, marginBottom: 8 },
  priceAmount: { fontSize: 48, fontWeight: "800", color: t.text, letterSpacing: -2 },
  pricePeriod: { fontSize: 14, color: t.textSecondary, marginTop: 4 },

  btnActivar: { backgroundColor: t.text, borderRadius: 14, padding: 18, alignItems: "center", marginBottom: 16 },
  btnActivarText: { color: t.bg, fontWeight: "800", fontSize: 16 },

  disclaimer: { fontSize: 11, color: t.textMuted, textAlign: "center", lineHeight: 16 },
});
