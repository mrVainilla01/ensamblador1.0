import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { apiService } from "../../services/api";
import { Search, Calendar, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
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

interface HistorialRecord {
  id: string;
  fecha: string;
  image: string;
  result: {
    prediction: string;
    confidence: number;
    recommendation: string;
    riskLevel: "ninguno" | "bajo" | "medio" | "alto";
  };
}

export function HistorialSection({ user }: { user?: { id?: string } }) {
  const [historial, setHistorial] = useState<HistorialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("todos");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [selectedImage, setSelectedImage] = useState<HistorialRecord | null>(null);

  useEffect(() => {
    const loadHistorial = async (showLoading = true) => {
      if (user?.id) {
        if (showLoading) setLoading(true);
        try {
          const data = await apiService.getAnalyses(user.id);
          const mapped = (data || []).map((d: any) => ({
            id: d.id,
            fecha: d.fecha,
            image: d.image,
            result: d.result,
          }));
          setHistorial(mapped);
        } catch (error) {
          console.error('Error cargando historial desde Supabase:', error);
          // Fallback a localStorage si falla
          const data = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
          setHistorial(data);
        }
        setLoading(false);
      } else {
        // Fallback a localStorage si no hay userId
        const data = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
        setHistorial(data);
      }
    };

    loadHistorial();

    // Recargar cada 3 segundos si hay userId (para detectar nuevos análisis)
    let interval: number | null = null;
    if (user?.id) {
      interval = setInterval(() => {
        loadHistorial(false);
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    if (user?.id) {
      const ok = await apiService.deleteAnalysis(id, user.id);
      if (ok) {
        setHistorial(prev => prev.filter(r => r.id !== id));
        if (selectedImage?.id === id) {
          setSelectedImage(null);
        }
      } else {
        console.error('Error al eliminar análisis de Supabase');
      }
    } else {
      // Fallback a localStorage
      const updated = historial.filter(record => record.id !== id);
      localStorage.setItem("skinAnalysisHistory", JSON.stringify(updated));
      setHistorial(updated);
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    }
  };

  const handleClearAll = async () => {
    if (user?.id) {
      const ok = await apiService.deleteAllAnalyses(user.id);
      if (ok) {
        setHistorial([]);
        setSelectedImage(null);
        // También limpiar filtros
        setSearchTerm("");
        setFilterRisk("todos");
      } else {
        console.error('Error al eliminar todos los análisis de Supabase');
      }
    } else {
      // Fallback a localStorage
      localStorage.setItem("skinAnalysisHistory", "[]");
      setHistorial([]);
      setSelectedImage(null);
      // También limpiar filtros
      setSearchTerm("");
      setFilterRisk("todos");
    }
  };

  const filteredHistorial = historial.filter((record) => {
    const matchesSearch =
      record.result.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.result.recommendation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "todos" || record.result.riskLevel === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "ninguno":
        return <Badge className="bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">Sin Riesgo</Badge>;
      case "bajo":
        return <Badge className="bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">Bajo Riesgo</Badge>;
      case "medio":
        return <Badge className="bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">Riesgo Medio</Badge>;
      case "alto":
        return <Badge className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">Alto Riesgo</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="animate-in fade-in slide-in-from-left duration-500">
          <h2 className="text-foreground font-semibold text-xl mb-2">
            Historial de Análisis
          </h2>
          <p className="text-muted-foreground">
            Registro completo de todas tus imágenes analizadas
          </p>
        </div>
        {historial.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 animate-in fade-in slide-in-from-right duration-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar Historial
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar todo el historial?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente todos los análisis guardados.
                  No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sí, eliminar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por diagnóstico..."
            className="pl-10 h-11 rounded-xl bg-card border-border/50 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl bg-card border-border/50 shadow-sm">
            <SelectValue placeholder="Nivel de riesgo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los niveles</SelectItem>
            <SelectItem value="ninguno">Sin Riesgo</SelectItem>
            <SelectItem value="bajo">Bajo Riesgo</SelectItem>
            <SelectItem value="medio">Riesgo Medio</SelectItem>
            <SelectItem value="alto">Alto Riesgo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History List */}
      {loading ? (
        <Card className="animate-in fade-in scale-in duration-500 delay-200">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-foreground font-semibold mb-2">
                Cargando historial...
              </h3>
              <p className="text-muted-foreground text-sm">
                Obteniendo tus análisis guardados
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filteredHistorial.length === 0 ? (
        <Card className="animate-in fade-in scale-in duration-500 delay-200">
          <CardContent className="py-12 text-center">
            <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4 animate-in fade-in duration-700" />
            <h3 className="text-foreground font-semibold mb-2">
              {historial.length === 0 ? "No hay análisis registrados" : "No se encontraron resultados"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {historial.length === 0
                ? "Realiza tu primer análisis de imagen para comenzar a construir tu historial médico."
                : "Intenta ajustar los filtros de búsqueda."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Records List */}
          {/* Records Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistorial.map((record, index) => {
              const date = new Date(record.fecha);
              return (
                <div
                  key={record.id}
                  className={`group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-in fade-in scale-in duration-300 ${selectedImage?.id === record.id
                    ? "ring-2 ring-primary border-primary shadow-lg"
                    : "border-border/50 hover:border-primary/50"
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedImage(record)}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                      src={record.image}
                      alt="Análisis"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {record.result.prediction}
                      </h4>
                      {getRiskBadge(record.result.riskLevel)}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {date.toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="font-medium">
                        {record.result.confidence}% Confianza
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail View - Desktop Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-1 h-fit lg:sticky lg:top-6">
            {selectedImage ? (
              <div className="rounded-3xl border border-border/50 bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-right duration-500">
                <div className="relative h-48 bg-muted">
                  <img
                    src={selectedImage.image}
                    alt="Detalle"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold">{selectedImage.result.prediction}</h3>
                    <p className="text-sm opacity-90">
                      {new Date(selectedImage.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este análisis?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente este registro del historial.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(selectedImage.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Riesgo</p>
                      <div className="mt-1">{getRiskBadge(selectedImage.result.riskLevel)}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Confianza</p>
                      <p className="text-2xl font-bold text-foreground">{selectedImage.result.confidence}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Recomendación</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedImage.result.recommendation}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-center text-muted-foreground">
                      ID: {selectedImage.id}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center animate-in fade-in duration-500">
                <div className="mx-auto w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm mb-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Detalles del Análisis</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona una imagen de la cuadrícula para ver el reporte completo
                </p>
              </div>
            )}
          </div>

          {/* Mobile Detail Modal */}
          <Dialog open={!!selectedImage && isMobile} onOpenChange={(open: boolean) => !open && setSelectedImage(null)}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl gap-0">
              {selectedImage && (
                <>
                  <div className="relative h-48 bg-muted">
                    <img
                      src={selectedImage.image}
                      alt="Detalle"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <DialogTitle className="text-xl font-bold">{selectedImage.result.prediction}</DialogTitle>
                      <DialogDescription className="text-white/90">
                        {new Date(selectedImage.fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </DialogDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-white/80 hover:text-white hover:bg-white/20">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar este análisis?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente este registro del historial.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(selectedImage.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Riesgo</p>
                        <div className="mt-1">{getRiskBadge(selectedImage.result.riskLevel)}</div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Confianza</p>
                        <p className="text-2xl font-bold text-foreground">{selectedImage.result.confidence}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Recomendación</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedImage.result.recommendation}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
