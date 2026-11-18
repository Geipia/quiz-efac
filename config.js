// Configuration QuizLive - Quiz en classe EPHEC
// La cle anon Supabase est publique par conception (securite geree cote base par RLS).
const CONFIG = {
  SUPABASE_URL: "https://uyywaqekatcnpuudklfn.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eXdhcWVrYXRjbnB1dWRrbGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzMjkzODIsImV4cCI6MjEwOTkwNTM4Mn0.sa2-BeEAGu-zz7tmtPTGLDUoqV-XXp3NDGWutGjjTLs",
  // Duree max hors de l'onglet avant annulation (ms)
  AWAY_LIMIT_MS: 3000
};


// Appel d'une fonction serveur (RPC Supabase). Les tables ne sont pas accessibles
// directement : tout passe par des fonctions qui verifient les droits cote serveur.
async function rpc(name, args) {
  const res = await fetch(CONFIG.SUPABASE_URL + '/rest/v1/rpc/' + name, {
    method: 'POST',
    headers: {
      apikey: CONFIG.SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args || {})
  });
  let body = null;
  try { body = await res.json(); } catch (e) { /* corps vide */ }
  if (!res.ok) {
    const err = new Error((body && body.message) || ('Erreur ' + res.status));
    err.forbidden = res.status === 401 || res.status === 403;
    throw err;
  }
  return body;
}
// Appel reserve au professeur : le code est verifie par le serveur a chaque appel.
const trpc = (name, args) => rpc(name, Object.assign({ p_code: sessionStorage.getItem('teacher_code') || '' }, args || {}));
