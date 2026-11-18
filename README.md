# QuizLive - Quiz en direct pour la classe

Site statique (GitHub Pages) + backend Supabase. Le professeur cree un quiz, le lance, un QR code s'affiche ; les eleves scannent, s'identifient (nom, prenom, matricule EPHEC) et repondent sur leur telephone. Le professeur voit les reponses arriver en direct.

## Fonctionnement

| Page | Role |
| --- | --- |
| `index.html` | Accueil / porte d'entree |
| `teacher.html` | Espace professeur (code d'acces), creation de quiz (formulaire ou JSON, chrono optionnel), choix de la classe au lancement, historique des sessions + export Excel |
| `live.html?session=<id>` | QR code + resultats en direct + alertes anti-triche + export Excel + suppression de session ; quitter la page termine la session automatiquement |
| `play.html?session=<id>` | Page eleve : identite, questions dans un ordre aleatoire, anti-triche, chrono visible si le quiz en a un |
| `guide.html` | Notice a donner a Claude pour generer des quiz en JSON |
| `config.js` | URL + cle anon Supabase (publique), limite anti-triche, appels RPC |
| `export.js` | Export Excel des resultats (SheetJS), partage entre prof et live |

## Regles metier

- **Identification eleve** : nom + prenom + matricule EPHEC avant de commencer.
- **Matricule unique** : un matricule (normalise : espaces et casse ignores) ne peut participer qu'une fois par session. Tentative terminee ou annulee = impossible de recommencer. Une tentative encore en cours (page rechargee sans etre annulee) est **reprise** la ou elle en etait : reponses conservees, questions restantes re-melangees.
- **Classes** : au lancement d'un quiz, le professeur choisit la classe (liste existante + ajout). Chaque session appartient a une classe et les resultats sont separes par classe.
- **Historique + Excel** : l'espace professeur liste les sessions passees (quiz, classe, nombre d'eleves), avec acces aux resultats et export Excel (Nom, Prenom, Matricule, Score, colonne "Tout bon" pour les sans-faute) via SheetJS en CDN. Une session terminee peut etre **supprimee** (avec ses resultats) depuis sa page de resultats, avec confirmation.
- **Chrono optionnel** : a la creation du quiz (formulaire ou champ JSON `timer_minutes`), une duree en minutes peut etre fixee. L'eleve voit le decompte en haut a droite pendant tout le quiz, une alerte s'affiche a 30 secondes, et a 0 seconde ses reponses deja donnees sont envoyees automatiquement. Le chrono part du `started_at` serveur de la tentative : il continue de couler pendant un rechargement.
- **Fermeture automatique de session** : quitter la page live (retour professeur, fermeture de l'onglet) termine la session immediatement (`fetch keepalive` au `pagehide`). Un vrai rechargement (F5) ne la ferme pas : un marqueur de 15 s permet a la page rechargee de la rouvrir (avec reverification, le beacon de fermeture pouvant arriver apres la reouverture). Un retour volontaire sur la page (lien, historique) ne la rouvre pas.
- **Ordre aleatoire** : les questions sont melangees par eleve (Fisher-Yates, cote client).
- **Anti-triche** : si l'eleve quitte l'onglet ou la fenetre (`visibilitychange` / `blur`) plus de **3 secondes**, sa tentative passe en `cancelled`, il est bloque, et une alerte avec son identite et la raison arrive en direct chez le professeur (table `alerts`).
- **Temps reel** : Supabase Realtime sur `attempts`, `responses`, `alerts` (filtre par session).

## Base de donnees (Supabase)

Tables : `quizzes` (avec `timer_seconds`, optionnel), `questions`, `classes`, `sessions` (avec `class_id`), `attempts`, `responses`, `alerts`, `teacher_secret` (empreinte du code professeur).
RLS active et **aucune politique ni droit de table pour `anon`** : les tables ne sont pas lisibles ni modifiables directement. Tout passe par des fonctions SQL `SECURITY DEFINER` appelees en RPC :
- eleves (`s_session`, `s_start`, `s_submit`, `s_cancel`) : le quiz est envoye sans les bonnes reponses, le score est calcule cote serveur, l'identifiant de tentative (uuid) fait office de jeton ;
- professeur (`t_*`) : chaque appel envoie le code professeur, verifie cote serveur contre une empreinte salee (`teacher_secret`).
Le suivi en direct se fait par interrogation reguliere (toutes les 4 s) de `t_session`.

## Securite

- Le code professeur n'est **pas** dans le code du site : il est verifie par le serveur (fonctions `t_*`) et seule son empreinte salee est stockee en base. Il est communique au professeur separement. Pour le changer, mettre a jour la ligne de `teacher_secret` (sel + sha256(sel || code)).
- La cle Supabase du site est la cle `anon` (publique par conception) : sans le code professeur, elle ne donne acces ni aux eleves, ni aux reponses, ni aux bonnes reponses, ni aux quiz.
- Un eleve ne recoit jamais les bonnes reponses ; le score est calcule par le serveur.
- Limites connues : le chrono est applique cote navigateur ; un eleve qui connait le matricule d'un camarade peut reprendre sa tentative en cours (comportement d'origine).

## Deploiement

Pages statiques servies par GitHub Pages (branche `main`, racine).
Modifier `config.js` si le projet Supabase change.

