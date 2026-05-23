import { Tabs, router } from "expo-router";
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const { theme, toggleTheme } = useTheme();

  const headerRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginRight: 16 }}>
      {/* Dark mode toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={{ width: 34, height: 20, borderRadius: 10, backgroundColor: theme.dark ? theme.accent : theme.border, justifyContent: "center", padding: 2 }}
      >
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.dark ? theme.bg : theme.accent, alignSelf: theme.dark ? "flex-end" : "flex-start" }} />
      </TouchableOpacity>
      {/* Perfil */}
      <TouchableOpacity onPress={() => router.push("/perfil")} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: theme.text, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 14, color: theme.bg }}>👤</Text>
      </TouchableOpacity>
    </View>
  );

  const screenOptions = {
    tabBarActiveTintColor: theme.text,
    tabBarInactiveTintColor: theme.textMuted,
    tabBarStyle: { height: 64, paddingBottom: 10, paddingTop: 8, backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder, borderTopWidth: 1, elevation: 0, shadowOpacity: 0 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: "600" as const, letterSpacing: 0.2 },
    headerStyle: { backgroundColor: theme.headerBg, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: theme.border },
    headerTitleStyle: { color: theme.text, fontSize: 16, fontWeight: "700" as const },
    headerRight,
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="index" options={{ title: "Inicio", headerTitle: "Fitness AI", tabBarIcon: ({ focused }) => <TabIcon emoji="◎" focused={focused} /> }} />
      <Tabs.Screen name="entrenamiento" options={{ title: "Rutina", headerTitle: "Entrenamiento", tabBarIcon: ({ focused }) => <TabIcon emoji="🏋️" focused={focused} /> }} />
      <Tabs.Screen name="alimentacion" options={{ title: "Nutrición", headerTitle: "Nutrición", tabBarIcon: ({ focused }) => <TabIcon emoji="🥗" focused={focused} /> }} />
      <Tabs.Screen name="progreso" options={{ title: "Progreso", headerTitle: "Mi Progreso", tabBarIcon: ({ focused }) => <TabIcon emoji="📸" focused={focused} /> }} />
      <Tabs.Screen name="calculadora" options={{ title: "Calculadora", headerTitle: "IMC & TDEE", tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }} />
      <Tabs.Screen name="favoritos" options={{ title: "Guardados", headerTitle: "Mis Planes", tabBarIcon: ({ focused }) => <TabIcon emoji="⭐" focused={focused} /> }} />
    </Tabs>
  );
}
