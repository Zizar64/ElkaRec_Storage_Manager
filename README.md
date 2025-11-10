# ElkaRec Storage Manager - Version Moderne

Application web moderne pour la gestion du parc matériel audiovisuel et informatique d'ElkaRec.

## 🚀 Stack Technique

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** pour l'accès aux données
- **MySQL** comme base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hashage des mots de passe

### Frontend
- **React 18** + **TypeScript**
- **Vite** comme bundler
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Axios** pour les requêtes HTTP
- **React Hook Form** + **Zod** pour la validation

### DevOps
- **Docker** & **Docker Compose** pour le déploiement
- **Prisma Migrate** pour les migrations de base de données

## ✨ Fonctionnalités

### Authentification
- ✅ Connexion/Déconnexion sécurisée
- ✅ Gestion des tokens JWT
- ✅ Protection des routes
- ✅ Rôles utilisateurs (Admin/User)

### Gestion des Équipements
- ✅ Affichage de tous les équipements
- ✅ Filtrage par secteur (Broadcast, Événementiel, Informatique)
- ✅ Filtrage par statut de maintenance (Ready, À réviser, En Maintenance, HS)
- ✅ Recherche textuelle (TAG, localisation, type, constructeur, modèle)
- ✅ Mise à jour du statut de maintenance avec historique
- ✅ CRUD complet (Admin uniquement)

### Interface
- ✅ Thème sombre moderne
- ✅ Design responsive
- ✅ Interface intuitive
- ✅ Feedback utilisateur en temps réel

## 📦 Installation

### Prérequis
- Node.js 18+
- MySQL 8.0+
- npm ou yarn
- Docker & Docker Compose (optionnel)

### Installation Locale

#### 1. Cloner le projet
```bash
git clone <repository-url>
cd elkarec-modern
```

#### 2. Configuration Backend
```bash
cd backend
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres de base de données

# Générer le client Prisma et exécuter les migrations
npx prisma generate
npx prisma migrate dev

# Créer un utilisateur admin (optionnel)
# Vous pouvez utiliser l'endpoint /api/auth/register
```

#### 3. Configuration Frontend
```bash
cd ../frontend
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Par défaut, l'API est sur http://localhost:3000/api
```

#### 4. Lancer l'application

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

L'application sera accessible sur:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Installation avec Docker

```bash
# Copier les fichiers .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Lancer les conteneurs
docker-compose up -d

# Exécuter les migrations
docker-compose exec backend npx prisma migrate dev

# Voir les logs
docker-compose logs -f
```

## 📝 Utilisation

### Première connexion

1. Créer un compte administrateur via l'API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elkarec.com",
    "password": "votre_mot_de_passe",
    "firstName": "Admin",
    "lastName": "ElkaRec"
  }'
```

2. Se connecter sur http://localhost:5173/login

### Gestion des équipements

- **Filtrer**: Utilisez les dropdowns pour filtrer par secteur et statut
- **Rechercher**: Tapez dans la barre de recherche pour trouver un équipement
- **Mettre à jour un statut**: Cliquez sur "Update Status" sur la ligne d'un équipement
- **CRUD** (Admin): Les admins peuvent créer, modifier et supprimer des équipements

## 🗄️ Structure de la Base de Données

### Tables principales:
- **users**: Utilisateurs de l'application
- **equipments**: Équipements du parc matériel
- **equipment_history**: Historique des changements de statut

### Schéma détaillé:
Voir `backend/prisma/schema.prisma` pour le schéma complet.

## 🔒 Sécurité

- ✅ Authentification JWT
- ✅ Mots de passe hashés avec bcrypt
- ✅ Validation des entrées
- ✅ Protection CSRF
- ✅ Requêtes préparées (Prisma)
- ✅ Variables d'environnement pour les secrets
- ✅ CORS configuré

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📚 API Documentation

### Authentification

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**GET** `/api/auth/me` (Authentifié)

### Équipements

**GET** `/api/equipments?sector=BROADCAST&status=READY&search=camera` (Authentifié)

**GET** `/api/equipments/:id` (Authentifié)

**POST** `/api/equipments` (Admin) - Créer un équipement

**PUT** `/api/equipments/:id` (Admin) - Modifier un équipement

**PATCH** `/api/equipments/:id/status` (Authentifié) - Mettre à jour le statut

**DELETE** `/api/equipments/:id` (Admin) - Supprimer un équipement

## 🛠️ Scripts Disponibles

### Backend
- `npm run dev` - Démarrer en mode développement
- `npm run build` - Build production
- `npm start` - Démarrer en production
- `npm run prisma:generate` - Générer le client Prisma
- `npm run prisma:migrate` - Exécuter les migrations
- `npm run prisma:studio` - Ouvrir Prisma Studio

### Frontend
- `npm run dev` - Démarrer en mode développement
- `npm run build` - Build production
- `npm run preview` - Prévisualiser le build
- `npm run lint` - Linter le code

## 🐛 Résolution des Problèmes

### Le backend ne démarre pas
- Vérifiez que MySQL est lancé
- Vérifiez les variables dans `.env`
- Exécutez `npx prisma generate` et `npx prisma migrate dev`

### Le frontend ne se connecte pas au backend
- Vérifiez que `VITE_API_URL` dans `.env` est correct
- Vérifiez que le backend est lancé sur le bon port
- Vérifiez les logs de la console navigateur

### Erreur CORS
- Vérifiez que `FRONTEND_URL` dans le backend `.env` correspond à l'URL du frontend

## 📄 Licence

MIT License - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues! Pour contribuer:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

---

**Version**: 1.0.0
**Date**: 2025
**Auteur**: ElkaRec Team
