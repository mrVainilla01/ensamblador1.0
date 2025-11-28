import { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingDown, TrendingUp, Activity, Calendar, ImageIcon, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";

interface HistoryRecord {
  id: string;
  fecha: string;
  result: {
    prediction: string;
    confidence: number;
    riskLevel: string;
  };
}

export function AnalysisSection({ user }: { user?: { id?: string } }) {
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      let history: any[] = [];
      if (user?.id) {
        try {
          const data = await apiService.getAnalyses(user.id);
          // Mapear datos de Supabase al formato esperado
          history = (data || []).map((d: any) => ({
            id: d.id,
            fecha: d.fecha,
            result: d.result, // Ya viene como objeto desde Supabase
          }));
        } catch (error) {
          console.error('Error cargando análisis desde Supabase:', error);
          // Fallback a localStorage si falla
          history = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
        }
      } else {
        history = JSON.parse(localStorage.getItem("skinAnalysisHistory") || "[]");
      }
      setHistoryData(history);

      // Preparar datos para gráficos de progreso
      const chartData = (history.slice(0, 10).reverse() || []).map((record: any) => {
        const date = new Date(record.fecha);
        const riskScore = record.result.riskLevel === "ninguno" ? 0 :
          record.result.riskLevel === "bajo" ? 1 :
            record.result.riskLevel === "medio" ? 2 : 3;

        return {
          fecha: date.toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          riesgo: riskScore,
          confianza: record.result.confidence,
          nombre: record.result.prediction
        };
      });

      setProgressData(chartData);
      setLoading(false);
    };

    loadData();

    // Recargar cada 3 segundos para detectar nuevos análisis (tanto Supabase como localStorage)
    const interval = setInterval(() => {
      loadData(false);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const getOverallTrend = () => {
    if (progressData.length < 2) return null;

    const firstRisk = progressData[0].riesgo;
    const lastRisk = progressData[progressData.length - 1].riesgo;

    if (lastRisk < firstRisk) {
      return { type: "mejora", icon: TrendingDown, color: "text-green-600", text: "Mejorando" };
    } else if (lastRisk > firstRisk) {
      return { type: "empeora", icon: TrendingUp, color: "text-red-600", text: "Requiere atención" };
    } else {
      return { type: "estable", icon: Activity, color: "text-blue-600", text: "Estable" };
    }
  };

  const trend = getOverallTrend();
  const totalAnalysis = historyData.length;
  const lowRiskCount = historyData.filter(h => h.result.riskLevel === "bajo").length;
  const avgConfidence = historyData.length > 0
    ? (historyData.reduce((acc, h) => acc + h.result.confidence, 0) / historyData.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="animate-in fade-in slide-in-from-left duration-500">
        <h2 className="text-foreground font-semibold text-xl mb-2">
          Progreso del Tratamiento
        </h2>
        <p className="text-muted-foreground">
          Seguimiento visual de tu evolución en el tiempo
        </p>
      </div>

      {loading ? (
        <Card className="animate-in fade-in scale-in duration-500 delay-100">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-foreground font-semibold mb-2">
                Cargando datos de análisis...
              </h3>
              <p className="text-muted-foreground text-sm">
                Preparando tus estadísticas y gráficos
              </p>
            </div>
          </CardContent>
        </Card>
      ) : historyData.length === 0 ? (
        <Card className="animate-in fade-in scale-in duration-500 delay-100">
          <CardContent className="py-12 text-center">
            <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4 animate-in fade-in duration-700" />
            <h3 className="text-foreground font-semibold mb-2">
              No hay análisis todavía
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Realiza tu primer análisis de imagen para comenzar a ver tu progreso
              y seguimiento en el tiempo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom duration-300">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className="p-2 sm:p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Análisis</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{totalAnalysis}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom duration-300 delay-50">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className="p-2 sm:p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Favorables</p>
                  <div className="flex items-baseline justify-center sm:justify-start gap-1 sm:gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">{lowRiskCount}</h3>
                    <span className="text-xs text-muted-foreground">
                      ({totalAnalysis > 0 ? ((lowRiskCount / totalAnalysis) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom duration-300 delay-100">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className="p-2 sm:p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Confianza</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{avgConfidence}%</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom duration-300 delay-150">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className={`p-2 sm:p-3 rounded-2xl ${trend?.type === 'mejora' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : trend?.type === 'empeora' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-600'}`}>
                  {trend ? <trend.icon className="h-5 w-5 sm:h-6 sm:w-6" /> : <Activity className="h-5 w-5 sm:h-6 sm:w-6" />}
                </div>
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Tendencia</p>
                  <h3 className={`text-sm sm:text-lg font-bold ${trend?.color || "text-foreground"}`}>
                    {trend?.text || "Sin datos"}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Chart */}
          {progressData.length > 0 && (
            <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
              <CardHeader>
                <CardTitle>Evolución del Nivel de Riesgo</CardTitle>
                <CardDescription>
                  Seguimiento de tus análisis en el tiempo (0: Sin Riesgo, 1: Bajo, 2: Medio, 3: Alto)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRiesgo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="currentColor" opacity={0.2} />
                      <XAxis
                        dataKey="fecha"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }}
                        dy={10}
                      />
                      <YAxis
                        domain={[0, 4]}
                        ticks={[0, 1, 2, 3, 4]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover/95 backdrop-blur-sm p-4 rounded-xl border border-border shadow-xl text-popover-foreground">
                                <p className="font-semibold mb-1">{data.fecha}</p>
                                <p className="text-xs text-muted-foreground mb-2">{data.nombre}</p>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <p className="text-sm font-medium">
                                      Riesgo: {data.riesgo === 0 ? "Ninguno" : data.riesgo === 1 ? "Bajo" : data.riesgo === 2 ? "Medio" : "Alto"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                    <p className="text-sm text-muted-foreground">Confianza: {data.confianza}%</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ stroke: "currentColor", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.5 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="riesgo"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRiesgo)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confidence Chart */}
          {progressData.length > 0 && (
            <Card className="border-none shadow-sm bg-card/50 hover:bg-card transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
              <CardHeader>
                <CardTitle>Confianza del Análisis</CardTitle>
                <CardDescription>
                  Porcentaje de certeza en cada predicción realizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="currentColor" opacity={0.2} />
                      <XAxis
                        dataKey="fecha"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }}
                        dy={10}
                      />
                      <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover/95 backdrop-blur-sm p-4 rounded-xl border border-border shadow-xl text-popover-foreground">
                                <p className="font-semibold mb-1">{data.fecha}</p>
                                <p className="text-xs text-muted-foreground mb-2">{data.nombre}</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                  <p className="text-sm font-medium">Confianza: {data.confianza}%</p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ stroke: "currentColor", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="confianza"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{ fill: "#06b6d4", r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Predictions Summary */}
          <Card className="animate-in fade-in slide-in-from-bottom duration-500 delay-400">
            <CardHeader>
              <CardTitle>Últimos Diagnósticos</CardTitle>
              <CardDescription>
                Resumen de tus análisis más recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historyData.slice(0, 5).map((record, index) => {
                  const date = new Date(record.fecha);
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
                    <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/50 transition-all duration-200 hover:shadow-md animate-in fade-in slide-in-from-left duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5 sm:mt-0">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{record.result.prediction}</p>
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Confianza</p>
                          <p className="text-sm font-bold text-foreground">{record.result.confidence}%</p>
                        </div>
                        {getRiskBadge(record.result.riskLevel)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
