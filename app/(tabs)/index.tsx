import React, { useEffect, useRef } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

function FadeInView({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const { profile, appState } = useUser();
  const s = styles(theme);

  const CARDS = [
    { route: "/entrenamiento", emoji: "🏋️", title: "Entrenamiento", desc: "Rutina semanal personalizada con IA.", accent: theme.accentPurple, accentMuted: theme.accentPurpleMuted, premium: false },
    { route: "/alimentacion", emoji: "🥗", title: "Nutrición", desc: "Menú semanal día a día con IA.", accent: theme.accentGreen, accentMuted: theme.accentGreenMuted, premium: true },
    { route: "/progreso", emoji: "📸", title: "Mi Progreso", desc: "Racha, fotos mensuales y comparación.", accent: theme.accentOrange, accentMuted: theme.accentOrangeMuted, premium: true },
    { route: "/calculadora", emoji: "📊", title: "Calculadora", desc: "IMC y calorías diarias según tu perfil.", accent: theme.textMuted, accentMuted: theme.bgSubtle, premium: false },
    { route: "/favoritos", emoji: "⭐", title: "Mis Planes", desc: "Rutinas y menús que guardaste.", accent: theme.textMuted, accentMuted: theme.bgSubtle, premium: false },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.heroWrapper}>
        <Image source={{ uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80" }} style={s.heroBg} resizeMode="cover" />
        <View style={s.heroOverlay} />
        <View style={s.heroContent}>
          <FadeInView delay={0}>
            <Text style={s.heroEyebrow}>{profile.nombre ? `HOLA, ${profile.nombre.toUpperCase()} 👋` : "BIENVENIDO 👋"}</Text>
          </FadeInView>
          <FadeInView delay={100}>
            <Text style={s.heroTitle}>Tu cuerpo,{"\n"}tu plan.</Text>
          </FadeInView>
          <FadeInView delay={200}>
            {appState.racha > 0 ? (
              <View style={s.rachaHero}>
                <Text style={s.rachaHeroEmoji}>🔥</Text>
                <Text style={s.rachaHeroText}>{appState.racha} día{appState.racha !== 1 ? "s" : ""} de racha</Text>
              </View>
            ) : (
              <Text style={s.heroSub}>IA que diseña rutinas y menús para vos.</Text>
            )}
          </FadeInView>
        </View>
      </View>

      <View style={s.inner}>
        <FadeInView delay={300}>
          <Text style={s.sectionLabel}>¿Qué querés hacer hoy?</Text>
        </FadeInView>

        {CARDS.map((card, i) => (
          <FadeInView key={card.route} delay={380 + i * 70}>
            <TouchableOpacity style={s.card} onPress={() => router.push(card.route as any)} activeOpacity={0.75}>
              <View style={s.cardInner}>
                <View style={[s.cardIcon, { backgroundColor: card.accentMuted }]}>
                  <Text style={s.cardIconText}>{card.emoji}</Text>
                </View>
                <View style={s.cardText}>
                  <View style={s.cardTitleRow}>
                    <Text style={s.cardTitle}>{card.title}</Text>
                    {card.premium && !appState.isPremium && (
                      <View style={s.premiumBadge}>
                        <Text style={s.premiumBadgeText}>⭐ Premium</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.cardDesc}>{card.desc}</Text>
                </View>
                <Text style={[s.cardArrow, { color: card.accent }]}>→</Text>
              </View>
              <View style={[s.cardAccentBar, { backgroundColor: card.accent }]} />
            </TouchableOpacity>
          </FadeInView>
        ))}

        <FadeInView delay={750}>
          <View style={s.footer}>
            <Text style={s.footerText}>Fitness AI · Powered by Mistral</Text>
          </View>
        </FadeInView>
      </View>
    </ScrollView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: "center", paddingBottom: 48 },
  heroWrapper: { width: "100%", height: 260, position: "relative", overflow: "hidden" },
  heroBg: { position: "absolute", width: "100%", height: "100%" },
  heroOverlay: { position: "absolute", width: "100%", height: "100%", backgroundColor: t.dark ? "rgba(0,0,0,0.65)" : "rgba(15,10,5,0.52)" },
  heroContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 28, paddingBottom: 32 },
  heroEyebrow: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.65)", letterSpacing: 2, marginBottom: 8 },
  heroTitle: { fontSize: 40, fontWeight: "800", color: "#fff", lineHeight: 46, letterSpacing: -0.5, marginBottom: 10 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.75)" },
  rachaHero: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" },
  rachaHeroEmoji: { fontSize: 18 },
  rachaHeroText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  inner: { width: "100%", maxWidth: 600, padding: 24, paddingTop: 28 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 },
  card: { backgroundColor: t.bgCard, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
  cardInner: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
  cardAccentBar: { height: 3 },
  cardIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  cardIconText: { fontSize: 20 },
  cardText: { flex: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: t.text },
  premiumBadge: { backgroundColor: t.premiumMuted, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  premiumBadgeText: { fontSize: 10, fontWeight: "700", color: t.premium },
  cardDesc: { fontSize: 13, color: t.textSecondary, lineHeight: 18 },
  cardArrow: { fontSize: 20 },
  footer: { alignItems: "center", paddingTop: 28 },
  footerText: { fontSize: 11, color: t.textMuted, letterSpacing: 1 },
});
