// Configuración de Supabase
import { createClient } from '@supabase/supabase-js';

// ⚠️ IMPORTANTE: Configura estas variables en tu archivo .env
// Lee CONFIGURAR_SUPABASE.md para obtener tus credenciales
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bsnvmbmyveqhcilebfci.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbnZtYm15dmVxaGNpbGViZmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDA3MTUsImV4cCI6MjA3OTQ3NjcxNX0.iS2alg0SKvo7bKKwQDq0XiyAjvGzvWwLBCuCIMLqYQo';

// Validar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERROR: Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar configuradas en el archivo .env');
  console.error('📖 Consulta CONFIGURAR_SUPABASE.md para más información');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

