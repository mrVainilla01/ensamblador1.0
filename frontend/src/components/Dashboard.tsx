import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  BarChart3,
  FileSearch,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Moon,
  Sun
} from "lucide-react";
import { HomeSection } from "./Configuracion/HomeSection";
import { AnalysisSection } from "./Configuracion/AnalysisSection";
import { ConsultasSection } from "./Configuracion/ConsultasSection";
import { HistorialSection } from "./Configuracion/HistorialSection";
import { ConfiguracionSection } from "./Configuracion/ConfiguracionSection";
import { useTheme } from "./ThemeProvider";

interface User {
  id?: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (name: string, email: string) => void;
  onUpdatePassword?: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

type Section = "home" | "analisis" | "consultas" | "historial" | "configuracion";

export function Dashboard({ user, onLogout, onUpdateUser, onUpdatePassword }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Solo guardar la sección activa si NO es "consultas"
    if (activeSection !== "consultas") {
      localStorage.setItem("activeSection", activeSection);
    }
  }, [activeSection]);

  const menuItems = [
    { id: "home" as Section, label: "Inicio", icon: Home },
    { id: "analisis" as Section, label: "Análisis", icon: BarChart3 },
    { id: "consultas" as Section, label: "Consultas", icon: FileSearch },
    { id: "historial" as Section, label: "Historial", icon: History },
    { id: "configuracion" as Section, label: "Configuración", icon: Settings },
  ];

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
    // Si se cambia a consultas, limpiar los mensajes guardados
    if (section === "consultas") {
      localStorage.removeItem("chatMessages");
    }
  };

  const handleLogout = () => {
    // Limpiar mensajes de consultas al cerrar sesión
    localStorage.removeItem("chatMessages");
    onLogout();
  };

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection userName={user.name} userId={user.id} />;
      case "analisis":
        return <AnalysisSection user={{ id: user.id }} />;
      case "consultas":
        return <ConsultasSection />;
      case "historial":
        return <HistorialSection user={{ id: user.id }} />;
      case "configuracion":
        return <ConfiguracionSection user={user} onUpdateUser={onUpdateUser} onUpdatePassword={onUpdatePassword} />;
      default:
        return <HomeSection userName={user.name} userId={user.id} />;
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 bottom-0 w-72 bg-card border-l border-border shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-primary font-semibold">Panel de Control</h2>
            <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium shadow-sm ring-2 ring-primary/20"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                } animate-in fade-in slide-in-from-right`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-in scale-in duration-300" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full bg-background">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex-1 min-w-0">
              <h1 className="text-primary font-semibold truncate text-base sm:text-lg animate-in fade-in">
                Análisis de Cáncer de Piel
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block animate-in fade-in delay-75">
                Sistema de Diagnóstico Asistido por IA
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="transition-all duration-200 hover:bg-accent active:scale-95"
                aria-label="Cambiar tema"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </Button>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 sm:p-3 hover:bg-accent rounded-lg transition-all duration-200 border border-border flex-shrink-0 active:scale-95"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderSection()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}