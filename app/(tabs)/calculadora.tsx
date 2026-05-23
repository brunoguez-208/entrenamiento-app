import React, { useState, useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

const ACTIVIDAD_MULT: Record<string, number> = {
  sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muyActivo: 1.9,
};

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

export default function CalculadoraScreen() {
  const { theme } = useTheme();
  const { profile } = useUser();
  const s = styles(theme);

  const peso = parseFloat(profile.peso) || 0;
  const altura = parseFloat(profile.altura) || 0;
  const edad = parseInt(profile.edad) || 0;
  const sexo = profile.sexo;
  const actividad = profile.nivelActividad;

  const hasData = peso > 0 && altura > 0 && edad > 0 && sexo && actividad;

  // IMC
  const alturaM = altura / 100;
  const imc = hasData ? peso / (alturaM * alturaM) : 0;
  const imcRedondeado = Math.round(imc * 10) / 10;

  const getIMCCategoria = (imc: number) => {
    if (imc < 18.5) return { label: "Bajo peso", color: "#3B82F6", emoji: "📉" };
    if (imc < 25) return { label: "Peso normal", color: theme.accentGreen, emoji: "✅" };
    if (imc < 30) return { label: "Sobrepeso", color: theme.accentOrange, emoji: "⚠️" };
    return { label: "Obesidad", color: "#EF4444", emoji: "🔴" };
  };

  // TMB (Harris-Benedict)
  let tmb = 0;
  if (hasData) {
    if (sexo === "masculino") {
      tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
    } else {
      tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad);
    }
  }

  const mult = actividad ? ACTIVIDAD_MULT[actividad] : 1.2;
  const tdee = Math.round(tmb * mult);

  const imcData = hasData ? getIMCCategoria(imc) : null;

  // IMC bar position (0-40 scale, clamped)
  const imcBarPercent = hasData ? Math.min(Math.max((imc / 40) * 100, 0), 100) : 0;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>

        <FadeInView delay={0}>
          <View style={s.pageHeader}>
            <Text style={s.pageEmoji}>📊</Text>
            <Text style={s.pageTitle}>Calculadora</Text>
            <Text style={s.pageDesc}>IMC y calorías calculadas desde tu perfil</Text>
          </View>
        </FadeInView>

        {!hasData ? (
          <FadeInView delay={80}>
            <View style={s.emptyCard}>
              <Text style={s.emptyEmoji}>👤</Text>
              <Text style={s.emptyTitle}>Completá tu perfil primero</Text>
              <Text style={s.emptyDesc}>Necesitamos tu peso, altura, edad, sexo y nivel de actividad para calcular tus métricas.</Text>
            </View>
          </FadeInView>
        ) : (
          <>
            {/* IMC */}
            <FadeInView delay={80}>
              <View style={s.card}>
                <Text style={s.cardLabel}>ÍNDICE DE MASA CORPORAL</Text>
                <View style={s.imcRow}>
                  <Text style={[s.imcValue, { color: imcData?.color }]}>{imcRedondeado}</Text>
                  <View style={s.imcBadge}>
                    <Text style={s.imcBadgeEmoji}>{imcData?.emoji}</Text>
                    <Text style={[s.imcBadgeText, { color: imcData?.color }]}>{imcData?.label}</Text>
                  </View>
                </View>

                {/* IMC bar */}
                <View style={s.imcBarBg}>
                  <View style={[s.imcBarFill, { width: `${imcBarPercent}%` as any, backgroundColor: imcData?.color }]} />
                  <View style={[s.imcBarMarker, { left: `${imcBarPercent}%` as any }]} />
                </View>
                <View style={s.imcScale}>
                  <Text style={s.imcScaleText}>16</Text>
                  <Text style={s.imcScaleText}>18.5</Text>
                  <Text style={s.imcScaleText}>25</Text>
                  <Text style={s.imcScaleText}>30</Text>
                  <Text style={s.imcScaleText}>40</Text>
                </View>

                <View style={s.imcCategories}>
                  {[
                    { label: "Bajo", color: "#3B82F6" },
                    { label: "Normal", color: theme.accentGreen },
                    { label: "Sobrepeso", color: theme.accentOrange },
                    { label: "Obesidad", color: "#EF4444" },
                  ].map((c, i) => (
                    <View key={i} style={s.imcCatItem}>
                      <View style={[s.imcCatDot, { backgroundColor: c.color }]} />
                      <Text style={s.imcCatLabel}>{c.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </FadeInView>

            {/* TDEE */}
            <FadeInView delay={160}>
              <View style={s.card}>
                <Text style={s.cardLabel}>CALORÍAS DIARIAS (TDEE)</Text>
                <View style={s.tdeeMain}>
                  <Text style={s.tdeeValue}>{tdee}</Text>
                  <Text style={s.tdeeUnit}>kcal/día</Text>
                </View>
                <Text style={s.tdeeDesc}>Para mantener tu peso actual con actividad {profile.nivelActividad}</Text>

                <View style={s.tdeeDivider} />

                <Text style={s.tdeeObjetivosLabel}>Según tu objetivo:</Text>
                <View style={s.tdeeObjetivos}>
                  <View style={s.tdeeObjCard}>
                    <Text style={s.tdeeObjEmoji}>📉</Text>
                    <Text style={s.tdeeObjVal}>{tdee - 500}</Text>
                    <Text style={s.tdeeObjLabel}>Perder grasa</Text>
                    <Text style={s.tdeeObjSub}>−500 kcal</Text>
                  </View>
                  <View style={[s.tdeeObjCard, s.tdeeObjCardMain]}>
                    <Text style={s.tdeeObjEmoji}>⚖️</Text>
                    <Text style={[s.tdeeObjVal, { color: theme.text }]}>{tdee}</Text>
                    <Text style={s.tdeeObjLabel}>Mantenimiento</Text>
                    <Text style={s.tdeeObjSub}>tu base</Text>
                  </View>
                  <View style={s.tdeeObjCard}>
                    <Text style={s.tdeeObjEmoji}>💪</Text>
                    <Text style={s.tdeeObjVal}>{tdee + 300}</Text>
                    <Text style={s.tdeeObjLabel}>Ganar masa</Text>
                    <Text style={s.tdeeObjSub}>+300 kcal</Text>
                  </View>
                </View>
              </View>
            </FadeInView>

            {/* Datos del perfil usados */}
            <FadeInView delay={240}>
              <View style={s.datosCard}>
                <Text style={s.datosLabel}>Calculado con tus datos</Text>
                <View style={s.datosRow}>
                  {[
                    { emoji: "⚖️", val: `${peso} kg`, label: "Peso" },
                    { emoji: "📏", val: `${altura} cm`, label: "Altura" },
                    { emoji: "🎂", val: `${edad} años`, label: "Edad" },
                    { emoji: "🏃", val: profile.nivelActividad || "-", label: "Actividad" },
                  ].map((d, i) => (
                    <View key={i} style={s.datosItem}>
                      <Text style={s.datosEmoji}>{d.emoji}</Text>
                      <Text style={s.datosVal}>{d.val}</Text>
                      <Text style={s.datosItemLabel}>{d.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
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

  pageHeader: { alignItems: "center", paddingVertical: 24, marginBottom: 8 },
  pageEmoji: { fontSize: 40, marginBottom: 10 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: t.text, letterSpacing: -0.3, marginBottom: 6 },
  pageDesc: { fontSize: 14, color: t.textSecondary, textAlign: "center" },

  emptyCard: { backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 32, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: t.text },
  emptyDesc: { fontSize: 13, color: t.textSecondary, textAlign: "center", lineHeight: 20 },

  card: { backgroundColor: t.bgCard, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 20, marginBottom: 16 },
  cardLabel: { fontSize: 10, fontWeight: "700", color: t.textMuted, letterSpacing: 2, marginBottom: 14 },

  imcRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  imcValue: { fontSize: 52, fontWeight: "800", letterSpacing: -2 },
  imcBadge: { alignItems: "flex-end", gap: 4 },
  imcBadgeEmoji: { fontSize: 24 },
  imcBadgeText: { fontSize: 15, fontWeight: "700" },

  imcBarBg: { height: 8, backgroundColor: t.bgSubtle, borderRadius: 4, marginBottom: 6, position: "relative" },
  imcBarFill: { height: "100%", borderRadius: 4 },
  imcBarMarker: { position: "absolute", top: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: t.text, marginLeft: -7 },
  imcScale: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  imcScaleText: { fontSize: 10, color: t.textMuted },
  imcCategories: { flexDirection: "row", justifyContent: "space-between" },
  imcCatItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  imcCatDot: { width: 8, height: 8, borderRadius: 4 },
  imcCatLabel: { fontSize: 11, color: t.textMuted },

  tdeeMain: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 6 },
  tdeeValue: { fontSize: 48, fontWeight: "800", color: t.text, letterSpacing: -2 },
  tdeeUnit: { fontSize: 16, fontWeight: "600", color: t.textMuted },
  tdeeDesc: { fontSize: 13, color: t.textSecondary, marginBottom: 16 },
  tdeeDivider: { height: 1, backgroundColor: t.border, marginBottom: 16 },
  tdeeObjetivosLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 },
  tdeeObjetivos: { flexDirection: "row", gap: 8 },
  tdeeObjCard: { flex: 1, backgroundColor: t.bgSubtle, borderRadius: 12, padding: 12, alignItems: "center", gap: 3 },
  tdeeObjCardMain: { borderWidth: 1, borderColor: t.border },
  tdeeObjEmoji: { fontSize: 18 },
  tdeeObjVal: { fontSize: 16, fontWeight: "800", color: t.textSecondary },
  tdeeObjLabel: { fontSize: 11, color: t.textMuted, textAlign: "center", fontWeight: "600" },
  tdeeObjSub: { fontSize: 10, color: t.textMuted },

  datosCard: { backgroundColor: t.bgSubtle, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: t.border },
  datosLabel: { fontSize: 10, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 },
  datosRow: { flexDirection: "row", justifyContent: "space-between" },
  datosItem: { alignItems: "center", gap: 3 },
  datosEmoji: { fontSize: 18 },
  datosVal: { fontSize: 13, fontWeight: "700", color: t.text },
  datosItemLabel: { fontSize: 10, color: t.textMuted },
});
