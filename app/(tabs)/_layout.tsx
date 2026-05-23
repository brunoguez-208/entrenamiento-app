import { Tabs, router } from "expo-router";
import React from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
      <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useUser();

  const headerLeft = () => (
    <TouchableOpacity onPress={() => router.push("/")} style={{ marginLeft: 16 }}>
      <Text style={{ fontSize: 17, fontWeight: "800", color: theme.text, letterSpacing: -0.3 }}>
        Fitness AI
      </Text>
    </TouchableOpacity>
  );

  const headerRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginRight: 16 }}>
      <TouchableOpacity
        onPress={toggleTheme}
        style={{ width: 36, height: 21, borderRadius: 11, backgroundColor: theme.dark ? "#4f46e5" : theme.border, justifyContent: "center", padding: 2 }}
      >
        <View style={{ width: 17, height: 17, borderRadius: 9, backgroundColor: "#fff", alignSelf: theme.dark ? "flex-end" : "flex-start", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 2 }} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/perfil")}
        style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.text, alignItems: "center", justifyContent: "center", overflow: "hidden" }}
      >
        {profile.fotoPerfil ? (
          <Image source={{ uri: profile.fotoPerfil }} style={{ width: 32, height: 32 }} />
        ) : (
          <Text style={{ fontSize: 13, fontWeight: "800", color: theme.bg }}>
            {profile.nombre ? profile.nombre[0].toUpperCase() : "👤"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const screenOptions = {
    tabBarActiveTintColor: theme.text,
    tabBarInactiveTintColor: theme.textMuted,
    tabBarStyle: {
      height: 60,
      paddingBottom: 6,
      paddingTop: 6,
      backgroundColor: theme.tabBar,
      borderTopColor: theme.tabBarBorder,
      borderTopWidth: 1,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarLabelStyle: { fontSize: 9, fontWeight: "600" as const, marginTop: 2 },
    tabBarIconStyle: { marginBottom: 0 },
    headerStyle: { backgroundColor: theme.headerBg, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: theme.border },
    headerTitleStyle: { color: theme.text, fontSize: 16, fontWeight: "700" as const },
    headerLeft,
    headerTitle: () => null,
    headerRight,
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: ({ focused }) => <TabIcon emoji="⌂" focused={focused} /> }} />
      <Tabs.Screen name="entrenamiento" options={{ title: "Rutina", tabBarIcon: ({ focused }) => <TabIcon emoji="🏋️" focused={focused} /> }} />
      <Tabs.Screen name="alimentacion" options={{ title: "Nutrición", tabBarIcon: ({ focused }) => <TabIcon emoji="🥗" focused={focused} /> }} />
      <Tabs.Screen name="progreso" options={{ title: "Progreso", tabBarIcon: ({ focused }) => <TabIcon emoji="📸" focused={focused} /> }} />
      <Tabs.Screen name="calculadora" options={{ title: "Calc.", tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }} />
      <Tabs.Screen name="favoritos" options={{ title: "Guardados", tabBarIcon: ({ focused }) => <TabIcon emoji="⭐" focused={focused} /> }} />
    </Tabs>
  );
}
