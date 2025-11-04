// Supabase Configuration
// For local development, these values will be loaded from environment variables

const getProjectIdFromUrl = (url: string | undefined): string => {
  if (!url) return "kledfqvfixiuaqadqkvt";
  return url.replace('https://', '').replace('.supabase.co', '');
};

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const projectId = getProjectIdFromUrl(env.VITE_SUPABASE_URL);
export const publicAnonKey = env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZWRmcXZmaXhpdWFxYWRxa3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjEyMjgsImV4cCI6MjA3NzgzNzIyOH0.DA9QT6SQ89ZYQNDzfzqtpOwV09VCX524_kHhoNVxqRo"