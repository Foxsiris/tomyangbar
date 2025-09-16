import { createClient } from '@supabase/supabase-js'

// Конфигурация Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fguwtuaxtjrojgjnxchv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndXd0dWF4dGpyb2pnam54Y2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDg0ODUsImV4cCI6MjA3MzYyNDQ4NX0.-NyA5IJkBuYG-qMABFNQ5KFw38q8RHdg182Eswwddlw'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Создаем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Экспортируем типы для TypeScript (если понадобится)
export default supabase
