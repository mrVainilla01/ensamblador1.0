import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Upload, Camera, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Activity } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import { apiService } from "../../services/api";
import { estherAIService } from "../../services/estherAIService";

interface HomeSectionProps {
  userName: string;
  userId?: string;
}

interface AnalysisResult {
  prediction: string;
  confidence: number;
  recommendation: string;
  riskLevel: "ninguno" | "bajo" | "medio" | "alto";
}

export function HomeSection({ userName, userId }: HomeSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Detectar si es dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setSelectedImage(imageData);
        setAnalysisResult(null);
        // Si la imagen viene de la cámara (dispositivo móvil), analizar automáticamente
        const isFromCamera = e.target.getAttribute('capture') !== null;
        if (isFromCamera && isMobile) {
          // Pequeño delay para asegurar que el estado se haya actualizado
          setTimeout(() => {
            // Usar la imagen directamente en lugar de esperar al estado
            analyzeImage(imageData);
          }, 500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResult(null);

    // Simular progreso de análisis mientras se procesa
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    try {
      // Llamar a la API real de EstherAI
      const result = await estherAIService.predictImage(imageData);

      // Completar la barra de progreso
      setProgress(100);

      // Guardar en Supabase si hay userId, sino en localStorage como fallback
      const analysisRecord = {
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        image: imageData,
        result: result
      };

      if (userId) {
        // Guardar en Supabase
        try {
          await apiService.saveAnalysis(userId, analysisRecord);
        } catch (error) {
          console.error('Error guardando análisis en Supabase:', error);
          // Fallback a localStorage si falla Supabase
          const historial = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
          historial.unshift(analysisRecord);
          localStorage.setItem("skinAnalysisHistory", JSON.stringify(historial));
        }
      } else {
        // Fallback a localStorage si no hay userId
        const historial = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
        historial.unshift(analysisRecord);
        localStorage.setItem("skinAnalysisHistory", JSON.stringify(historial));
      }

      setAnalysisResult(result);

    } catch (error) {
      console.error('Error en el análisis:', error);
      clearInterval(progressInterval);

      // Mostrar error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setAnalysisResult({
        prediction: "Error en el Análisis",
        confidence: 0,
        recommendation: `No se pudo completar el análisis: ${errorMessage}. Por favor, verifica que el servidor de EstherAI esté ejecutándose en http://localhost:8000`,
        riskLevel: "medio"
      });
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleAnalyze = () => {
    if (selectedImage) {
      analyzeImage(selectedImage);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "ninguno":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "bajo":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
      case "medio":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
      case "alto":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "ninguno":
      case "bajo":
        return <CheckCircle className="h-5 w-5" />;
      case "medio":
      case "alto":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Welcome Message */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100/50 dark:border-blue-900/20 shadow-sm animate-in fade-in slide-in-from-top duration-500">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-100/20 dark:bg-blue-900/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-indigo-100/20 dark:bg-indigo-900/10 blur-3xl"></div>

          <div className="relative p-6 sm:p-10 text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground animate-in fade-in duration-700">
              ¡Hola, {userName}! 👋
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              Bienvenido a tu sistema de análisis. La detección temprana es tu mejor aliada.
            </p>
            <div className="pt-2 animate-in fade-in duration-700 delay-200">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary backdrop-blur-sm border border-primary/20">
                💪 Tu salud es nuestra prioridad
              </span>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <Card className="animate-in fade-in slide-in-from-bottom duration-500 delay-150">
          <CardHeader>
            <CardTitle>Análisis de Imagen</CardTitle>
            <CardDescription>
              Carga una imagen o toma una fotografía de la lesión cutánea para análisis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedImage ? (
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <button
                  className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 sm:p-12 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-lg active:scale-[0.99] animate-in fade-in scale-in duration-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="rounded-full bg-background p-3 sm:p-4 shadow-sm ring-1 ring-border transition-transform group-hover:scale-110 group-hover:shadow-md">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm sm:text-lg font-semibold text-foreground">Cargar</p>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Desde galería
                    </p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {isMobile && (
                  <>
                    <button
                      className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 sm:p-12 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-lg active:scale-[0.99] animate-in fade-in scale-in duration-300 delay-100"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <div className="rounded-full bg-background p-3 sm:p-4 shadow-sm ring-1 ring-border transition-transform group-hover:scale-110 group-hover:shadow-md">
                        <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm sm:text-lg font-semibold text-foreground">Cámara</p>
                        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                          Tomar foto
                        </p>
                      </div>
                    </button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
                {/* Analysis Progress */}
                {isAnalyzing && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
                    <div className="flex items-center gap-3 text-primary justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="font-medium">Analizando imagen con IA...</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Procesando características de la lesión
                    </p>
                  </div>
                )}

                {/* Analysis Result - Redesigned Hero */}
                {analysisResult && !isAnalyzing && (
                  <div className={`overflow-hidden rounded-3xl border-2 ${getRiskColor(analysisResult.riskLevel)} bg-card shadow-2xl animate-in fade-in slide-in-from-bottom duration-500`}>
                    <div className="grid md:grid-cols-[400px_1fr]">
                      {/* Left Column: Image */}
                      <div className="relative h-[300px] md:h-full bg-muted/30 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-border/50">
                        <img
                          src={selectedImage}
                          alt="Imagen analizada"
                          className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                        />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">
                          Imagen Original
                        </div>
                      </div>

                      {/* Right Column: Results */}
                      <div className="p-6 sm:p-8 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                              <Activity className="h-4 w-4" />
                              Resultado del Análisis
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight text-foreground">
                              {analysisResult.prediction}
                            </h3>
                          </div>
                          <div className={`p-3 rounded-2xl ${analysisResult.riskLevel === 'ninguno' ? 'bg-blue-100 text-blue-700' :
                            analysisResult.riskLevel === 'bajo' ? 'bg-green-100 text-green-700' :
                              analysisResult.riskLevel === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {getRiskIcon(analysisResult.riskLevel)}
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Confianza</p>
                            <p className="text-2xl font-bold text-foreground">{analysisResult.confidence}%</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Nivel de Riesgo</p>
                            <p className="text-xl font-bold capitalize">
                              {analysisResult.riskLevel === "ninguno" ? "Ninguno" : analysisResult.riskLevel}
                            </p>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            Recomendación
                          </p>
                          <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/50">
                            {analysisResult.recommendation}
                          </p>
                        </div>

                        {/* Disclaimer */}
                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20">
                          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p>
                            Este análisis es orientativo. Consulte siempre con un dermatólogo certificado.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!analysisResult && !isAnalyzing && (
                    <Button
                      className="flex-1 h-12 text-base"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Analizar Imagen
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                      setIsAnalyzing(false);
                    }}
                    className={`h-12 text-base ${!analysisResult && !isAnalyzing ? "flex-1" : "w-full"}`}
                  >
                    {analysisResult ? "Nuevo Análisis" : "Cancelar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-100 space-y-2">
                <p>
                  <strong>Información importante:</strong> Este sistema utiliza inteligencia
                  artificial para proporcionar una evaluación preliminar. Los resultados NO
                  sustituyen el diagnóstico médico profesional.
                </p>
                <p>
                  Siempre consulte con un dermatólogo certificado para un diagnóstico definitivo
                  y plan de tratamiento adecuado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
