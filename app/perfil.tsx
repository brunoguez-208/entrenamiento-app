import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

const SEXOS = [
  { id: "masculino", label: "Masculino" },
  { id: "femenino", label: "Femenino" },
  { id: "otro", label: "Otro" },
];

const ACTIVIDADES = [
  { id: "sedentario", label: "Sedentario", desc: "Poco o nada de ejercicio" },
  { id: "ligero", label: "Ligero", desc: "1-3 días/semana" },
  { id: "moderado", label: "Moderado", desc: "3-5 días/semana" },
  { id: "activo", label: "Activo", desc: "6-7 días/semana" },
  { id: "muyActivo", label: "Muy activo", desc: "Atleta o trabajo físico" },
];

export default function PerfilScreen() {
  const { theme } = useTheme();
  const { profile, updateProfile } = useUser();
  const s = styles(theme);

  const [form, setForm] = useState({ ...profile });
  const [guardado, setGuardado] = useState(false);

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const guardar = async () => {
    await updateProfile(form);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inner}>

        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{form.nombre ? form.nombre[0].toUpperCase() : "?"}</Text>
          </View>
          <Text style={s.headerTitle}>{form.nombre || "Tu perfil"}</Text>
          <Text style={s.headerSub}>Tus datos se usan para personalizar la IA</Text>
        </View>

        {/* Datos básicos */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Información personal</Text>
          <View style={s.card}>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Nombre</Text>
              <TextInput style={s.fieldInput} value={form.nombre} onChangeText={v => set("nombre", v)} placeholder="Tu nombre" placeholderTextColor={theme.textMuted} />
            </View>
            <View style={s.divider} />
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Edad</Text>
              <TextInput style={s.fieldInput} value={form.edad} onChangeText={v => set("edad", v)} placeholder="Años" placeholderTextColor={theme.textMuted} keyboardType="numeric" />
            </View>
            <View style={s.divider} />
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Peso</Text>
              <TextInput style={s.fieldInput} value={form.peso} onChangeText={v => set("peso", v)} placeholder="kg" placeholderTextColor={theme.textMuted} keyboardType="numeric" />
            </View>
            <View style={s.divider} />
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Altura</Text>
              <TextInput style={s.fieldInput} value={form.altura} onChangeText={v => set("altura", v)} placeholder="cm" placeholderTextColor={theme.textMuted} keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* Sexo */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Sexo biológico</Text>
          <View style={s.chipRow}>
            {SEXOS.map(sx => (
              <TouchableOpacity key={sx.id} style={[s.chip, form.sexo === sx.id && s.chipActive]} onPress={() => set("sexo", sx.id)} activeOpacity={0.7}>
                <Text style={[s.chipText, form.sexo === sx.id && s.chipTextActive]}>{sx.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Objetivo */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Objetivo principal</Text>
          <View style={s.card}>
            <TextInput
              style={s.textArea}
              value={form.objetivo}
              onChangeText={v => set("objetivo", v)}
              placeholder="Ej: ganar masa muscular, perder grasa, mejorar resistencia..."
              placeholderTextColor={theme.textMuted}
              multiline
            />
          </View>
        </View>

        {/* Restricciones */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Restricciones alimentarias</Text>
          <View style={s.card}>
            <TextInput
              style={s.textArea}
              value={form.restricciones}
              onChangeText={v => set("restricciones", v)}
              placeholder="Ej: sin lactosa, vegano, sin gluten... (opcional)"
              placeholderTextColor={theme.textMuted}
              multiline
            />
          </View>
        </View>

        {/* Nivel actividad */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Nivel de actividad</Text>
          <View style={s.actividadCol}>
            {ACTIVIDADES.map(a => (
              <TouchableOpacity key={a.id} style={[s.actividadBtn, form.nivelActividad === a.id && s.actividadBtnActive]} onPress={() => set("nivelActividad", a.id)} activeOpacity={0.7}>
                <View style={[s.actividadRadio, form.nivelActividad === a.id && s.actividadRadioActive]}>
                  {form.nivelActividad === a.id && <View style={s.actividadDot} />}
                </View>
                <View>
                  <Text style={[s.actividadLabel, form.nivelActividad === a.id && s.actividadLabelActive]}>{a.label}</Text>
                  <Text style={s.actividadDesc}>{a.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[s.btnGuardar, guardado && s.btnGuardado]} onPress={guardar} activeOpacity={0.8}>
          <Text style={s.btnGuardarText}>{guardado ? "✓ Guardado" : "Guardar perfil"}</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { alignItems: "center", paddingBottom: 48 },
  inner: { width: "100%", maxWidth: 600, padding: 20 },

  header: { alignItems: "center", paddingVertical: 28 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: t.text, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: "800", color: t.bg },
  headerTitle: { fontSize: 22, fontWeight: "800", color: t.text, marginBottom: 4 },
  headerSub: { fontSize: 13, color: t.textMuted, textAlign: "center" },

  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },

  card: { backgroundColor: t.bgCard, borderRadius: 14, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
  fieldRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, justifyContent: "space-between" },
  fieldLabel: { fontSize: 15, fontWeight: "600", color: t.text, width: 70 },
  fieldInput: { flex: 1, fontSize: 15, color: t.text, textAlign: "right" },
  divider: { height: 1, backgroundColor: t.border, marginLeft: 16 },
  textArea: { padding: 16, fontSize: 15, color: t.text, minHeight: 70, lineHeight: 22 },

  chipRow: { flexDirection: "row", gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: t.bgCard, borderWidth: 1, borderColor: t.border, alignItems: "center" },
  chipActive: { backgroundColor: t.text, borderColor: t.text },
  chipText: { fontSize: 14, fontWeight: "600", color: t.textSecondary },
  chipTextActive: { color: t.bg },

  actividadCol: { gap: 8 },
  actividadBtn: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: t.bgCard, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 14 },
  actividadBtnActive: { borderColor: t.text, backgroundColor: t.bgSubtle },
  actividadRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: t.border, alignItems: "center", justifyContent: "center" },
  actividadRadioActive: { borderColor: t.text },
  actividadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: t.text },
  actividadLabel: { fontSize: 14, fontWeight: "700", color: t.textSecondary },
  actividadLabelActive: { color: t.text },
  actividadDesc: { fontSize: 12, color: t.textMuted, marginTop: 1 },

  btnGuardar: { backgroundColor: t.text, borderRadius: 12, padding: 16, alignItems: "center" },
  btnGuardado: { backgroundColor: t.accentGreen },
  btnGuardarText: { color: t.bg, fontWeight: "700", fontSize: 15 },
});
