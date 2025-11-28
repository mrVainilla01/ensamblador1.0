import { useState, useEffect } from "react";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";
import { apiService, User } from "./services/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar si hay una sesión activa usando el token
    const checkAuth = async () => {
      const user = await apiService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.user) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        // Resetear la sección de consultas al iniciar sesión
        try {
          localStorage.removeItem('chatMessages');
          // Asegurar que la sección por defecto sea 'home' al iniciar sesión
          localStorage.setItem('activeSection', 'home');
        } catch (e) {
          // Ignorar si localStorage no está disponible
        }
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return { success: false, message: "Error al iniciar sesión. Por favor intenta de nuevo." };
    }
  };

  const handleRegister = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiService.register(name, email, password);
      if (response.success && response.user) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        // Resetear la sección de consultas al registrarse / iniciar sesión por primera vez
        try {
          localStorage.removeItem('chatMessages');
          // Fijar sección por defecto a 'home' tras registro
          localStorage.setItem('activeSection', 'home');
        } catch (e) {
          // Ignorar si localStorage no está disponible
        }
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return { success: false, message: "Error al registrar usuario. Por favor intenta de nuevo." };
    }
  };

  const handleLogout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    // Resetear la sección de consultas al cerrar sesión
    try {
      localStorage.removeItem('chatMessages');
      // También fijar la sección por defecto a 'home' al cerrar sesión
      localStorage.setItem('activeSection', 'home');
    } catch (e) {
      // Ignorar si localStorage no está disponible
    }
  };

  const handleUpdateUser = async (name: string, email: string) => {
    if (!currentUser) return;

    try {
      const updatedUser = await apiService.updateUser(name, email);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      return await apiService.updatePassword(currentPassword, newPassword);
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      return {
        success: false,
        message: "Error al actualizar la contraseña. Por favor intenta de nuevo.",
      };
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthForm 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
      />
    );
  }

  return (
    <Dashboard 
      user={currentUser!} 
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
      onUpdatePassword={handleUpdatePassword}
    />
  );
}
