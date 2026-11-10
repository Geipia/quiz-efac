# QuizLive - Quiz en direct pour la classe

Site statique (GitHub Pages) + backend Supabase. Le professeur cree un quiz, le lance, un QR code s'affiche ; les eleves scannent, s'identifient (nom, prenom, matricule EPHEC) et repondent sur leur telephone. Le professeur voit les reponses arriver en direct.

## Fonctionnement

| Page | Role |
| --- | --- |
| `index.html` | Accueil / porte d'entree |
| `teacher.html` | Espace professeur (code d'acces), creation de quiz (formulaire ou JSON), choix de la classe au lancement, historique des sessions + export Excel |
| `live.html?session=<id>` | QR code + resultats en direct + alertes anti-triche + export Excel |
| `play.html?session=<id>` | Page eleve : identite, questions dans un ordre aleatoire, anti-triche |
| `guide.html` | Notice a donner a Claude pour generer des quiz en JSON |
| `config.js` | URL + cle anon Supabase, code professeur, limite anti-triche |
| `export.js` | Export Excel des resultats (SheetJS), partage entre prof et live |

## Regles metier

- **Identification eleve** : nom + prenom + matricule EPHEC avant de commencer.
- **Matricule unique** : un matricule (normalise : espaces et casse ignores) ne peut participer qu'une fois par session. Tentative terminee ou annulee = impossible de recommencer. Une tentative encore en cours (page rechargee sans etre annulee) est **reprise** la ou elle en etait : reponses conservees, questions restantes re-melangees.
- **Classes** : au lancement d'un quiz, le professeur choisit la classe (liste existante + ajout). Chaque session appartient a une classe et les resultats sont separes par classe.
- **Historique + Excel** : l'espace professeur liste les sessions passees (quiz, classe, nombre d'eleves), avec acces aux resultats et export Excel (Nom, Prenom, Matricule, Score, colonne "Tout bon" pour les sans-faute) via SheetJS en CDN.
- **Ordre aleatoire** : les questions sont melangees par eleve (Fisher-Yates, cote client).
- **Anti-triche** : si l'eleve quitte l'onglet ou la fenetre (`visibilitychange` / `blur`) plus de **3 secondes**, sa tentative passe en `cancelled`, il est bloque, et une alerte avec son identite et la raison arrive en direct chez le professeur (table `alerts`).
- **Temps reel** : Supabase Realtime sur `attempts`, `responses`, `alerts` (filtre par session).

## Base de donnees (Supabase)

Tables : `quizzes`, `questions`, `classes`, `sessions` (avec `class_id`), `attempts`, `responses`, `alerts`.
RLS active avec politiques ouvertes pour le role `anon` (usage classe).
Publication realtime : `attempts`, `responses`, `alerts`.

## Securite (v1)

- Le code professeur (`TEACHER_PIN` dans `config.js`) est une protection legere, visible dans le code source : il empeche les eleves d'entrer par megarde, pas un attaquant motive.
- La cle Supabase utilisee est la cle `anon` (publique par conception). Les bonnes reponses sont lisibles cote client : un eleve bricoleur pourrait les retrouver dans les devtools. Suffisant pour un usage classe, a durcir (Edge Functions / Auth) si besoin.

## Deploiement

Pages statiques servies par GitHub Pages (branche `main`, racine).
Modifier `config.js` si le projet Supabase change.
