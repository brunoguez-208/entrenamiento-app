import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  nombre: string;
  edad: string;
  sexo: "masculino" | "femenino" | "otro" | null;
  peso: string;
  altura: string;
  objetivo: string;
  restricciones: string;
  fotoPerfil: string;
  nivelActividad: "sedentario" | "ligero" | "moderado" | "activo" | "muyActivo" | null;
}

export interface AppState {
  isPremium: boolean;
  racha: number;
  ultimoEntrenamiento: string | null;
}

interface UserContextType {
  profile: UserProfile;
  appState: AppState;
  updateProfile: (p: Partial<UserProfile>) => void;
  activatePremium: () => void;
  registrarEntrenamiento: () => void;
}

const defaultProfile: UserProfile = {
  nombre: "", edad: "", sexo: null, peso: "", altura: "",
  objetivo: "", restricciones: "", fotoPerfil: "", nivelActividad: null,
};

const defaultAppState: AppState = {
  isPremium: false, racha: 0, ultimoEntrenamiento: null,
};

const UserContext = createContext<UserContextType>({
  profile: defaultProfile,
  appState: defaultAppState,
  updateProfile: () => {},
  activatePremium: () => {},
  registrarEntrenamiento: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [appState, setAppState] = useState<AppState>(defaultAppState);

  useEffect(() => {
    (async () => {
      try {
        const p = await AsyncStorage.getItem("@user_profile_v2");
        const a = await AsyncStorage.getItem("@app_state");
        if (p) setProfile(JSON.parse(p));
        if (a) {
          const saved = JSON.parse(a);
          // Recalculate streak on load
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          if (saved.ultimoEntrenamiento !== today && saved.ultimoEntrenamiento !== yesterday) {
            saved.racha = 0;
          }
          setAppState(saved);
        }
      } catch {}
    })();
  }, []);

  const updateProfile = async (partial: Partial<UserProfile>) => {
    const updated = { ...profile, ...partial };
    setProfile(updated);
    await AsyncStorage.setItem("@user_profile_v2", JSON.stringify(updated));
  };

  const activatePremium = async () => {
    const updated = { ...appState, isPremium: true };
    setAppState(updated);
    await AsyncStorage.setItem("@app_state", JSON.stringify(updated));
  };

  const registrarEntrenamiento = async () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let nuevaRacha = appState.racha;
    if (appState.ultimoEntrenamiento === today) return;
    if (appState.ultimoEntrenamiento === yesterday) {
      nuevaRacha = appState.racha + 1;
    } else {
      nuevaRacha = 1;
    }
    const updated = { ...appState, racha: nuevaRacha, ultimoEntrenamiento: today };
    setAppState(updated);
    await AsyncStorage.setItem("@app_state", JSON.stringify(updated));
  };

  return (
    <UserContext.Provider value={{ profile, appState, updateProfile, activatePremium, registrarEntrenamiento }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
