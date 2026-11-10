// Configuration QuizLive - Quiz en classe EFAC
// La cle anon Supabase est publique par conception (securite geree cote base par RLS).
const CONFIG = {
  SUPABASE_URL: "https://uyywaqekatcnpuudklfn.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eXdhcWVrYXRjbnB1dWRrbGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzMjkzODIsImV4cCI6MjEwOTkwNTM4Mn0.sa2-BeEAGu-zz7tmtPTGLDUoqV-XXp3NDGWutGjjTLs",
  // Code d'acces a la partie professeur (simple protection, modifiable ici).
  TEACHER_PIN: "efac2026",
  // Duree max hors de l'onglet avant annulation (ms)
  AWAY_LIMIT_MS: 3000
};
