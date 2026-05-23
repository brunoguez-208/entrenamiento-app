import { Slot } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Slot />
      </UserProvider>
    </ThemeProvider>
  );
}
