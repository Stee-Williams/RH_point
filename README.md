# RH-Point — Application complète

Cette archive est prête à être extraite directement dans :
`C:\Users\HP\Desktop\Applications\RH_point`

Stack : React + TypeScript (Vite) · Symfony 7 + Doctrine ORM · PostgreSQL 16.

## Arborescence

```
RH_point/
├── database/
│   └── schema.sql                  → schéma PostgreSQL complet (9 tables, triggers, vues, vue matérialisée)
├── docs/
│   └── ARCHITECTURE.md             → architecture détaillée, table complète des routes API, état d'avancement
├── backend/                        → à fusionner dans un projet Symfony 7
│   ├── src/
│   │   ├── Entity/                  → Role, Utilisateur, Employe, Service, Horaire, Pointage, Conge,
│   │   │                              Absence, Notification
│   │   ├── Repository/              → un repository par entité (recherche/filtre/pagination sur les listes)
│   │   ├── Dto/                     → un DTO de requête par action d'écriture (validation Symfony)
│   │   ├── Service/                 → logique métier (Auth, Employe, ServiceManagement, HoraireManagement,
│   │   │                              Pointage, Conge, Notification, Dashboard, Rapport, RapportPdf,
│   │   │                              RapportExcel, AbsenceGeneration)
│   │   ├── Controller/Api/          → un contrôleur REST par ressource
│   │   ├── EventSubscriber/         → ForcerChangementMotDePasseSubscriber (bloque l'API tant que le
│   │   │                              mot de passe temporaire n'a pas été changé)
│   │   ├── Exception/               → ConflitMetierException (409), RessourceIntrouvableException (404)
│   │   ├── Doctrine/Types/          → SmallIntArrayType (mapping PostgreSQL SMALLINT[])
│   │   └── Command/                 → RefreshStatsCommand, GenerateAbsencesCommand (à planifier en cron)
│   ├── config/packages/             → security.yaml, lexik_jwt_authentication.yaml, doctrine.yaml
│   └── tests/Controller/Api/        → tests fonctionnels (Auth, Employé, Pointage)
└── frontend/                       → à fusionner dans un projet React + Vite
    └── src/
        ├── App.example.tsx          → exemple de câblage complet (providers + routage par rôle) — à adapter
        ├── components/               → ProtectedRoute, EmployeTable, EmployeFormModal, PointageWidget,
        │                               PointageHistoryTable, CongeRequestForm, CongeList, NotificationBell
        ├── context/                  → AuthContext.tsx
        ├── hooks/                    → un hook React Query par domaine (useEmployes, usePointage, useConges,
        │                               useNotifications, useDashboard, useRapports...)
        ├── services/                  → api.ts (axios + JWT) + un service par ressource
        ├── types/                     → types TypeScript (miroir des DTO backend)
        ├── pages/
        │   ├── auth/                   → LoginPage, ChangePasswordPage
        │   ├── employe/                 → PointagePage, CongesPage
        │   ├── chef-service/             → PresencesPage, ValidationCongesPage
        │   ├── admin-rh/                  → EmployesPage, RapportsPage
        │   └── dashboard/                  → DashboardPage
        ├── package.json
        └── tsconfig.json
```

## Installation

### 1. Base de données
```bash
psql -U postgres -c "CREATE DATABASE rhpoint;"
psql -U postgres -d rhpoint -f database/schema.sql
```

### 2. Backend Symfony
```bash
composer create-project symfony/skeleton backend-symfony
cd backend-symfony
composer require symfony/orm-pack symfony/security-bundle lexik/jwt-authentication-bundle \
    symfony/validator symfony/serializer-pack symfony/console \
    dompdf/dompdf phpoffice/phpspreadsheet

# Copier backend/src, backend/config/packages, backend/tests dans le projet créé
# Renseigner DATABASE_URL dans .env.local (utilisateur/mot de passe PostgreSQL)

php bin/console lexik:jwt:generate-keypair
php bin/console server:start   # ou symfony server:start
```

Pour rafraîchir périodiquement les statistiques mensuelles du tableau de bord, et générer chaque jour les constats d'absence (à planifier en cron, ex. tous les matins) :
```bash
php bin/console app:dashboard:refresh-stats
php bin/console app:absences:generate          # génère les absences de la veille
```

Exemple de crontab (backend Symfony) :
```
0 6 * * * cd /chemin/vers/backend && php bin/console app:absences:generate >> var/log/absences.log 2>&1
0 6 * * * cd /chemin/vers/backend && php bin/console app:dashboard:refresh-stats >> var/log/stats.log 2>&1
```

### 3. Frontend React
```bash
npm create vite@latest frontend-react -- --template react-ts
cd frontend-react
npm install axios react-router-dom react-hook-form @hookform/resolvers zod @tanstack/react-query

# Copier le contenu de frontend/src dans src/
# Renommer App.example.tsx en App.tsx (ou en reprendre le contenu dans votre App.tsx existant)

npm run dev
```

## Comptes de démarrage

Le schéma crée automatiquement les 3 rôles (`ROLE_ADMIN_RH`, `ROLE_CHEF_SERVICE`, `ROLE_EMPLOYE`) et un horaire standard. Il n'y a **aucun utilisateur par défaut** : créez le premier compte RH directement en base pour démarrer, par exemple :

```sql
INSERT INTO utilisateur (matricule, email, mot_de_passe, role_id)
VALUES ('ADMIN', 'admin@votre-entreprise.tld', '$2y$13$...', (SELECT id FROM role WHERE nom = 'ROLE_ADMIN_RH'));
```

(le mot de passe doit être haché avec l'algorithme configuré dans `security.yaml` — le plus simple est de générer ce hash via `php bin/console security:hash-password` une fois le backend installé). Une fois connecté avec ce compte RH, tous les employés suivants peuvent être créés depuis l'interface (`/employes`), qui génère automatiquement leur compte et leur mot de passe temporaire.

## Points d'attention métier

- **Création d'employé** = création automatique du compte de connexion associé (matricule + mot de passe temporaire généré côté serveur, affiché **une seule fois** dans une modale RH).
- **Désactivation d'employé** = *soft delete* (`statut = 'inactif'` sur `employe` et `utilisateur`) : aucune suppression physique, l'historique de pointage/congés reste intact.
- **Suppression de service/horaire** : bloquée tant que des employés y sont encore rattachés (message d'erreur explicite plutôt qu'une erreur SQL brute).
- **Calcul retard / heures supplémentaires / départ anticipé** : entièrement géré par un trigger PostgreSQL (`fn_calculer_pointage`), pas par le code applicatif — la donnée reste cohérente même en cas d'écriture SQL directe. Priorité du statut : retard > départ anticipé > présent.
- **Congés** : une nouvelle demande ne peut pas chevaucher une demande existante non refusée du même employé (vérifié en base avant insertion).
- **Sécurité des listes filtrées** (pointages, congés) : un simple employé ne voit jamais que ses propres données, quel que soit le paramètre `employeId` envoyé au frontend — c'est le contrôleur qui impose le filtre côté serveur pour ce rôle, jamais une confiance aveugle dans la requête entrante.
- **Mot de passe temporaire** : tout compte créé par le RH (module Employés) est marqué `doit_changer_mot_de_passe = true`. Un `EventSubscriber` (`ForcerChangementMotDePasseSubscriber`) bloque alors **côté serveur** tout accès à l'API (hors connexion/profil/changement de mot de passe) tant que l'employé n'a pas changé son mot de passe — ce n'est pas qu'une redirection frontend contournable.
- **Notifications** : générées automatiquement à la création d'une demande de congé (vers le chef du service concerné, s'il est assigné) et à sa décision (vers l'employé). D'autres événements peuvent être branchés en appelant `NotificationService::notifier()` depuis n'importe quel service métier.

## Ce qui n'est pas fait (scope assumé)

- **Export PDF/Excel** : le code est écrit (`RapportPdfService`, `RapportExcelService`) et syntaxiquement valide, mais n'a pas pu être exécuté dans ce bac à sable (pas d'accès à Packagist pour installer `dompdf/dompdf` et `phpoffice/phpspreadsheet`). **À tester en priorité** une fois ces paquets installés dans votre projet réel — voir §4.4 de `ARCHITECTURE.md`.
- **Notifications** au-delà du cycle de vie des congés (nouvelle demande / décision) : pas encore de notification sur pointage, création d'employé, etc. — le service `NotificationService::notifier()` est prêt à être appelé depuis n'importe quel autre service métier pour étendre la couverture.
- Le composant `NotificationBell.tsx` est prêt à l'emploi mais n'est câblé dans aucun layout/en-tête commun : ce projet n'a pas encore de composant de mise en page partagé (header/sidebar) entre les pages — à ajouter selon vos préférences visuelles, puis y placer `<NotificationBell />`.

## Ce qui a été validé (pas seulement écrit)

- `database/schema.sql` **exécuté avec succès** sur une instance PostgreSQL 16 réelle : tables, contraintes, triggers, vues, vue matérialisée.
- Trigger de pointage testé avec plusieurs scénarios réels : retard + heures sup cumulés, départ anticipé, contrainte d'unicité employé/jour.
- Workflow congés testé en conditions réelles : chevauchement de dates détecté, approbation, contrainte `date_fin >= date_debut`.
- **Génération automatique des absences** testée sur 4 scénarios réels : absence justifiée liée à un congé approuvé, absence non justifiée, non-duplication en cas de ré-exécution, aucun constat généré si un pointage existe déjà.
- **Flag `doit_changer_mot_de_passe`** testé sur son cycle complet : `true` à la création avec mot de passe temporaire, `false` après changement, `false` par défaut pour les comptes existants.
- **Notifications** testées sur la vraie base : création (chef de service + employé), comptage des non-lues, marquage groupé comme lues.
- Requêtes d'agrégation (recherche employés, dashboard, rapports) **rejouées en SQL brut sur la vraie base** avec données de test, résultats comparés aux attentes.
- **60 fichiers PHP** passés au crible de `php -l` (0 erreur de syntaxe) — à l'exception de `RapportPdfService`/`RapportExcelService`, validés en syntaxe uniquement (dépendances non installables ici, voir ci-dessus).
- L'intégralité du frontend TypeScript/React **compilée avec `tsc --noEmit` en mode strict**, avec les vraies dépendances installées (React 19, React Query, React Hook Form, Zod, axios, react-router-dom) — 0 erreur.

## Prochaines étapes possibles

(1) Tester l'export PDF/Excel une fois les paquets composer installés ; (2) étendre les notifications à d'autres événements (pointage manquant, employé créé...) ; (3) construire un layout commun (header/sidebar) pour y intégrer `NotificationBell`.
