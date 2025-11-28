import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LogIn, UserPlus, AlertCircle, Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onRegister: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

export function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Estados para animaciones cuando el usuario escribe
  const [isTypingLogin, setIsTypingLogin] = useState(false);
  const [isTypingRegister, setIsTypingRegister] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Detectar cuando el usuario empieza a escribir
  useEffect(() => {
    const hasLoginInput = loginEmail.length > 0 || loginPassword.length > 0;
    setIsTypingLogin(hasLoginInput);
  }, [loginEmail, loginPassword]);

  useEffect(() => {
    const hasRegisterInput = registerName.length > 0 || registerEmail.length > 0 || registerPassword.length > 0;
    setIsTypingRegister(hasRegisterInput);
  }, [registerName, registerEmail, registerPassword]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!loginEmail || !loginPassword) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    try {
      const result = await onLogin(loginEmail, loginPassword);
      if (!result.success) {
        setError(result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      setError("Error al iniciar sesión. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!registerName || !registerEmail || !registerPassword) {
      setError("Por favor completa todos los campos obligatorios");
      setIsLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const result = await onRegister(registerName, registerEmail, registerPassword);
      if (!result.success) {
        setError(result.message || "Error al registrar usuario. Por favor intenta de nuevo.");
      }
    } catch (error) {
      setError("Error al registrar usuario. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 relative overflow-hidden">
      {/* Efectos de fondo animados mejorados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        {/* Partículas flotantes */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 transform transition-all hover:scale-[1.01]">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center mb-2 transition-all duration-500">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <CardTitle className="text-foreground text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-top duration-500">
            Análisis de Cáncer de Piel
          </CardTitle>
          <CardDescription className="text-muted-foreground animate-in fade-in slide-in-from-top duration-500 delay-100">
            Sistema de diagnóstico asistido por inteligencia artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/50 p-1">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 data-[state=active]:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </span>
                {activeTab === "login" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 data-[state=active]:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </span>
                {activeTab === "register" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-pulse" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 animate-in fade-in slide-in-from-right duration-300">
              <form onSubmit={handleLoginSubmit} className={`space-y-4 transition-all duration-500 ${isTypingLogin ? 'scale-[1.01]' : ''}`}>
                <div className="space-y-2 relative">
                  <Label htmlFor="login-email" className="text-foreground flex items-center gap-2">
                    <span className="transition-all duration-300">Correo Electrónico</span>
                    {focusedField === "login-email" && (
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="corre@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onFocus={() => setFocusedField("login-email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${isTypingLogin && loginEmail ? 'ring-2 ring-primary/30 border-primary shadow-md shadow-primary/20' : ''}`}
                    />
                    {loginEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="login-password" className="text-foreground flex items-center gap-2">
                    <span className="transition-all duration-300">Contraseña</span>
                    {focusedField === "login-password" && (
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onFocus={() => setFocusedField("login-password")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-10 ${isTypingLogin && loginPassword ? 'ring-2 ring-primary/30 border-primary shadow-md shadow-primary/20' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 animate-pulse" />
                    <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-6 transition-all duration-300 relative overflow-hidden group ${isTypingLogin ? 'scale-[1.02] shadow-lg shadow-primary/30' : ''} ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      Iniciar Sesión
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6 animate-in fade-in slide-in-from-right duration-300">
              <form onSubmit={handleRegisterSubmit} className={`space-y-4 transition-all duration-500 ${isTypingRegister ? 'scale-[1.01]' : ''}`}>
                <div className="space-y-2 relative">
                  <Label htmlFor="register-name" className="text-foreground flex items-center gap-2">
                    <span className="transition-all duration-300">Nombre Completo *</span>
                    {focusedField === "register-name" && (
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Andy Mauricio"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      onFocus={() => setFocusedField("register-name")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${isTypingRegister && registerName ? 'ring-2 ring-primary/30 border-primary shadow-md shadow-primary/20' : ''}`}
                    />
                    {registerName && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="register-email" className="text-foreground flex items-center gap-2">
                    <span className="transition-all duration-300">Correo Electrónico *</span>
                    {focusedField === "register-email" && (
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@ejemplo.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      onFocus={() => setFocusedField("register-email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${isTypingRegister && registerEmail ? 'ring-2 ring-primary/30 border-primary shadow-md shadow-primary/20' : ''}`}
                    />
                    {registerEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="register-password" className="text-foreground flex items-center gap-2">
                    <span className="transition-all duration-300">Contraseña *</span>
                    {focusedField === "register-password" && (
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      onFocus={() => setFocusedField("register-password")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-10 ${isTypingRegister && registerPassword ? 'ring-2 ring-primary/30 border-primary shadow-md shadow-primary/20' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${registerPassword.length === 0 ? 'bg-muted' :
                        registerPassword.length < 6 ? 'bg-red-500' :
                          registerPassword.length < 10 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {registerPassword.length < 6 ? 'Mínimo 6 caracteres' : registerPassword.length < 10 ? 'Buena' : 'Excelente'}
                    </p>
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 animate-pulse" />
                    <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
                  </Alert>
                )}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 p-3 rounded-lg text-xs text-foreground/80 animate-in fade-in duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_3s_infinite]" />
                  <p className="relative z-10">Al crear una cuenta, confirmo que usaré este sistema como herramienta de apoyo
                    y que consultaré siempre con un profesional de la salud para diagnósticos definitivos.</p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-6 transition-all duration-300 relative overflow-hidden group ${isTypingRegister ? 'scale-[1.02] shadow-lg shadow-primary/30' : ''} ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                      Crear Cuenta
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}