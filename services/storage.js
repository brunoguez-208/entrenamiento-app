// services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@user_profile',
  CURRENT_ROUTINE: '@current_routine'
};

export const StorageService = {
  // Guardar el perfil del usuario (lesiones, días, objetivo, nivel)
  saveProfile: async (profile) => {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error("Error guardando el perfil", e);
    }
  },

  // Obtener el perfil guardado
  getProfile: async () => {
    try {
      const profile = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (e) {
      console.error("Error obteniendo el perfil", e);
      return null;
    }
  },

  // Guardar la rutina generada por Gemini
  saveRoutine: async (routine) => {
    try {
      await AsyncStorage.setItem(KEYS.CURRENT_ROUTINE, JSON.stringify(routine));
    } catch (e) {
      console.error("Error guardando la rutina", e);
    }
  },

  // Obtener la rutina actual
  getRoutine: async () => {
    try {
      const routine = await AsyncStorage.getItem(KEYS.CURRENT_ROUTINE);
      return routine ? JSON.parse(routine) : null;
    } catch (e) {
      console.error("Error obteniendo la rutina", e);
      return null;
    }
  }
};