import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { User, Mail, Lock, Bell, Shield, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface User {
  id?: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface ConfiguracionSectionProps {
  user: User;
  onUpdateUser: (name: string, email: string) => void;
  onUpdatePassword?: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

export function ConfiguracionSection({ user, onUpdateUser, onUpdatePassword }: ConfiguracionSectionProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reportNotifications, setReportNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name || !email) {
      setErrorMessage("Todos los campos son obligatorios");
      return;
    }

    try {
      onUpdateUser(name, email);
      setSuccessMessage("Perfil actualizado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Error al actualizar el perfil. Por favor intenta de nuevo.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Todos los campos son obligatorios");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    // Usar la función de actualización de contraseña si está disponible
    if (onUpdatePassword) {
      const result = await onUpdatePassword(currentPassword, newPassword);
      if (result.success) {
        setSuccessMessage(result.message || "Contraseña cambiada exitosamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.message || "Error al cambiar la contraseña");
      }
    } else {
      setErrorMessage("La funcionalidad de cambio de contraseña no está disponible");
    }
  };

  const handleDeleteAccount = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.filter((u: User) => u.email !== user.email);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.removeItem("currentUser");
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom duration-500">
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Actualiza tu información de perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
              />
            </div>
            <Button type="submit">Guardar Cambios</Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña de seguridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit">Cambiar Contraseña</Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura tus preferencias de notificación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe actualizaciones por correo electrónico
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reportes Automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Recibe reportes semanales de análisis
              </p>
            </div>
            <Switch
              checked={reportNotifications}
              onCheckedChange={setReportNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas de Seguridad</Label>
              <p className="text-sm text-muted-foreground">
                Notificaciones sobre actividad inusual
              </p>
            </div>
            <Switch
              checked={securityAlerts}
              onCheckedChange={setSecurityAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidad y Seguridad
          </CardTitle>
          <CardDescription>
            Gestiona la privacidad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="mb-2 text-foreground font-semibold">Sesiones Activas</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Tu cuenta está activa en este dispositivo
            </p>
            <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              Cerrar Otras Sesiones
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones irreversibles para tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Eliminar Cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente tu
                  cuenta y eliminará todos tus datos de nuestros servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sí, eliminar mi cuenta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
