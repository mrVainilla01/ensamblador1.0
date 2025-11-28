// Configuración de Supabase para el backend
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Credenciales de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://tfnyaytkvmgikjywksfx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbnlheXRrdm1naWtqeXdrc2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzA4MTcsImV4cCI6MjA3OTc0NjgxN30.kvqot7jQIuARtikVg8N2RrX8G8tClv09ed4q6JuRScg';

// Validar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ ERROR: Las variables SUPABASE_URL y SUPABASE_KEY deben estar configuradas');
  console.error('📖 Crea un archivo .env en la carpeta backend con estas variables');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Función para verificar la conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('analyses').select('count').limit(1);
    if (error && !error.message.includes('relation "analyses" does not exist')) {
      console.error('Error conectando a Supabase:', error);
      return false;
    }
    console.log('✅ Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error en test de conexión:', error);
    return false;
  }
}

