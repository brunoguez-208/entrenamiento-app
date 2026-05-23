import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
  );
}

export default function TabLayout() {
  const { theme, toggleTheme } = useTheme();

  const headerRight = () => (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        marginRight: 18,
        width: 34,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.dark ? theme.accent : theme.border,
        justifyContent: "center",
        padding: 2,
      }}
    >
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: theme.dark ? theme.bg : theme.accent,
          alignSelf: theme.dark ? "flex-end" : "flex-start",
        }}
      />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
        headerStyle: {
          backgroundColor: theme.headerBg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: {
          color: theme.text,
          fontSize: 16,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
        headerRight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerTitle: "Fitness AI",
          tabBarIcon: ({ focused }) => <TabIcon emoji="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="entrenamiento"
        options={{
          title: "Rutina",
          headerTitle: "Plan de Entrenamiento",
          tabBarIcon: ({ focused }) => <TabIcon emoji="↑" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="alimentacion"
        options={{
          title: "Nutrición",
          headerTitle: "Plan Nutricional",
          tabBarIcon: ({ focused }) => <TabIcon emoji="◇" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Guardados",
          headerTitle: "Mis Planes",
          tabBarIcon: ({ focused }) => <TabIcon emoji="☆" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
