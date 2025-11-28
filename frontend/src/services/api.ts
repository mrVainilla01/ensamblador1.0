/// <reference types="vite/client" />
// Servicio API para comunicación con Supabase
// Este archivo maneja todas las llamadas relacionadas con usuarios usando Supabase

import { supabase } from '../lib/supabase';

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string; // No enviar en respuestas por seguridad
  createdAt?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

class ApiService {
  constructor() {
    // El servicio usa el cliente de Supabase configurado en lib/supabase.ts
  }

  /**
   * Guarda un análisis asociado a un usuario en Supabase
   */
  async saveAnalysis(userId: string, record: any): Promise<any> {
    try {
      const payload = {
        id: record.id,
        user_id: userId,
        fecha: record.fecha,
        image: record.image,
        result: record.result, // JSONB - se guarda como objeto JSON
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('analyses')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // Si la tabla no existe, no es crítico - se usará localStorage como fallback
        if (error.message.includes('relation "analyses" does not exist')) {
          console.warn('⚠️ La tabla "analyses" no existe en Supabase. Usando localStorage como fallback.');
          console.warn('📖 Consulta CREAR_TABLA_ANALISIS_SUPABASE.md para crear la tabla');
        } else {
          console.error('Error guardando análisis en Supabase:', error);
        }
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error saveAnalysis:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los análisis (historial) de un usuario desde Supabase
   */
  async getAnalyses(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('fecha', { ascending: false });

      if (error) {
        // Si la tabla no existe, retornar array vacío (se usará localStorage como fallback)
        if (error.message.includes('relation "analyses" does not exist')) {
          console.warn('⚠️ La tabla "analyses" no existe en Supabase. Usando localStorage como fallback.');
          console.warn('📖 Consulta CREAR_TABLA_ANALISIS_SUPABASE.md para crear la tabla');
        } else {
          console.warn('Error obteniendo análisis desde Supabase:', error);
        }
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error getAnalyses:', error);
      return [];
    }
  }

  /**
   * Elimina un análisis por su id
   */
  async deleteAnalysis(id: string, userId?: string): Promise<boolean> {
    try {
      let query = supabase.from('analyses').delete().eq('id', id);
      if (userId) {
        query = query.eq('user_id', userId) as any;
      }
      const { error } = await query;
      if (error) {
        if (error.message.includes('relation "analyses" does not exist')) {
          console.warn('⚠️ La tabla "analyses" no existe en Supabase.');
        } else {
          console.warn('Error eliminando análisis en Supabase:', error);
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleteAnalysis:', error);
      return false;
    }
  }

  /**
   * Elimina todos los análisis de un usuario
   */
  async deleteAllAnalyses(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('analyses').delete().eq('user_id', userId);
      if (error) {
        if (error.message.includes('relation "analyses" does not exist')) {
          console.warn('⚠️ La tabla "analyses" no existe en Supabase.');
        } else {
          console.warn('Error eliminando todos los análisis en Supabase:', error);
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleteAllAnalyses:', error);
      return false;
    }
  }
  /**
   * Registra un nuevo usuario en Supabase
   * @param name - Nombre completo del usuario
   * @param email - Correo electrónico
   * @param password - Contraseña
   * @returns Promise con la respuesta del servidor
   */
  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    try {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // Se guarda en user_metadata
          },
        },
      });

      if (authError) {
        // Manejar errores específicos de Supabase
        let errorMessage = 'Error al registrar usuario';
        
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          errorMessage = 'Este correo electrónico ya está registrado';
        } else if (authError.message.includes('Invalid email')) {
          errorMessage = 'El correo electrónico no es válido';
        } else if (authError.message.includes('Password')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else {
          errorMessage = authError.message;
        }

        return {
          success: false,
          message: errorMessage,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'Error al crear el usuario',
        };
      }

      // Guardar el perfil del usuario en una tabla personalizada (si existe)
      // Si no tienes una tabla "profiles", Supabase almacenará el nombre en user_metadata
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: name,
          email: email,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        }).select();

      // Si no existe la tabla "profiles", no es un error crítico
      // El nombre ya está guardado en user_metadata
      if (profileError && !profileError.message.includes('relation "profiles" does not exist')) {
        console.warn('Error al guardar perfil:', profileError);
      }

      // Obtener el token de sesión
      const session = authData.session;
      if (session?.access_token) {
        localStorage.setItem('authToken', session.access_token);
      }

      // Construir el objeto usuario
      const user: User = {
        id: authData.user.id,
        name: name,
        email: email,
        createdAt: authData.user.created_at,
      };

      return {
        success: true,
        user: user,
        token: session?.access_token,
      };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  }

  /**
   * Autentica un usuario existente en Supabase
   * @param email - Correo electrónico
   * @param password - Contraseña
   * @returns Promise con la respuesta del servidor
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        let errorMessage = 'Credenciales incorrectas';
        
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Correo electrónico o contraseña incorrectos';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor verifica tu correo electrónico antes de iniciar sesión';
        } else {
          errorMessage = authError.message;
        }

        return {
          success: false,
          message: errorMessage,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'Error al iniciar sesión',
        };
      }

      // Obtener el perfil del usuario (desde la tabla profiles o user_metadata)
      let name = authData.user.user_metadata?.name || '';
      
      // Intentar obtener el nombre desde la tabla profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', authData.user.id)
        .single();

      if (profileData?.name) {
        name = profileData.name;
      }

      // Guardar el token de sesión
      const session = authData.session;
      if (session?.access_token) {
        localStorage.setItem('authToken', session.access_token);
      }

      const user: User = {
        id: authData.user.id,
        name: name,
        email: email,
        createdAt: authData.user.created_at,
      };

      return {
        success: true,
        user: user,
        token: session?.access_token,
      };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  }

  /**
   * Obtiene el usuario actual desde Supabase
   * @returns Promise con los datos del usuario
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        localStorage.removeItem('authToken');
        return null;
      }

      // Obtener el nombre desde user_metadata o la tabla profiles
      let name = user.user_metadata?.name || '';
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profileData?.name) {
        name = profileData.name;
      }

      return {
        id: user.id,
        name: name,
        email: user.email || '',
        createdAt: user.created_at,
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  /**
   * Actualiza los datos del usuario en Supabase
   * @param name - Nuevo nombre
   * @param email - Nuevo correo electrónico
   * @returns Promise con el usuario actualizado
   */
  async updateUser(name: string, email: string): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Actualizar email en Supabase Auth (esto requiere confirmación)
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
          data: {
            name: name,
          },
        });

        if (emailError) {
          console.error('Error al actualizar email:', emailError);
          // Continuar con la actualización del nombre aunque falle el email
        }
      } else {
        // Solo actualizar el nombre en metadata
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            name: name,
          },
        });

        if (metadataError) {
          console.error('Error al actualizar metadata:', metadataError);
        }
      }

      // Actualizar en la tabla profiles (si existe)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name,
          email: email,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (profileError && !profileError.message.includes('relation "profiles" does not exist')) {
        console.error('Error al actualizar perfil:', profileError);
      }

      return {
        id: user.id,
        name: name,
        email: email,
        createdAt: user.created_at,
      };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return null;
    }
  }

  /**
   * Actualiza la contraseña del usuario en Supabase
   * @param currentPassword - Contraseña actual (para verificar)
   * @param newPassword - Nueva contraseña
   * @returns Promise con el resultado de la operación
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'No hay una sesión activa',
        };
      }

      // Verificar la contraseña actual intentando iniciar sesión
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword,
      });

      if (verifyError) {
        return {
          success: false,
          message: 'La contraseña actual es incorrecta',
        };
      }

      // Actualizar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return {
          success: false,
          message: updateError.message || 'Error al actualizar la contraseña',
        };
      }

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente',
      };
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar la contraseña',
      };
    }
  }

  /**
   * Cierra la sesión del usuario en Supabase
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('authToken');
  }
}

// Exportar una instancia del servicio
export const apiService = new ApiService();

