# ElkaRec Storage Manager - Backend API

API REST pour la gestion du parc matériel ElkaRec.

## 🚀 Technologies

- Node.js + Express + TypeScript
- Prisma ORM
- MySQL
- JWT Authentication
- bcryptjs

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Créer un fichier `.env` basé sur `.env.example`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/elkarec_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

## 🗄️ Base de Données

### Générer le client Prisma
```bash
npm run prisma:generate
```

### Exécuter les migrations
```bash
npm run prisma:migrate
```

### Ouvrir Prisma Studio
```bash
npm run prisma:studio
```

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm run build
npm start
```

## 📝 API Endpoints

### Authentification

#### POST /api/auth/register
Créer un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "token": "jwt-token"
}
```

#### POST /api/auth/login
Se connecter.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### GET /api/auth/me
Récupérer l'utilisateur actuel (authentifié).

**Headers:**
```
Authorization: Bearer <token>
```

### Équipements

#### GET /api/equipments
Récupérer tous les équipements avec filtres optionnels.

**Query Params:**
- `sector`: BROADCAST | EVENEMENTIEL | INFORMATIQUE
- `status`: READY | A_REVISER | EN_MAINTENANCE | HS
- `search`: Recherche textuelle

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/equipments/:id
Récupérer un équipement avec son historique.

#### POST /api/equipments (Admin)
Créer un nouvel équipement.

**Body:**
```json
{
  "tag": "TAG-001",
  "localisation": "Studio A",
  "sector": "BROADCAST",
  "type": "Caméra",
  "manufacturer": "Sony",
  "model": "PXW-Z190",
  "status": "READY",
  "serialNumber": "SN123456",
  "notes": "Notes optionnelles"
}
```

#### PUT /api/equipments/:id (Admin)
Modifier un équipement.

#### PATCH /api/equipments/:id/status
Mettre à jour le statut d'un équipement.

**Body:**
```json
{
  "status": "EN_MAINTENANCE",
  "description": "Révision annuelle"
}
```

#### DELETE /api/equipments/:id (Admin)
Supprimer un équipement.

## 🔒 Sécurité

- Authentification JWT
- Mots de passe hashés avec bcrypt (10 rounds)
- Validation des entrées
- Requêtes préparées via Prisma
- CORS configuré
- Rate limiting (à implémenter)

## 📊 Structure du Projet

```
backend/
├── src/
│   ├── controllers/      # Contrôleurs des routes
│   ├── middleware/       # Middlewares (auth, erreurs)
│   ├── routes/          # Définition des routes
│   ├── services/        # Logique métier (optionnel)
│   ├── types/           # Types TypeScript
│   ├── utils/           # Utilitaires (prisma, jwt)
│   └── index.ts         # Point d'entrée
├── prisma/
│   └── schema.prisma    # Schéma de base de données
├── package.json
└── tsconfig.json
```

## 🧪 Tests

```bash
npm test
```

## 📈 Monitoring

Les logs sont affichés dans la console en mode développement.
En production, configurez un système de logging approprié (Winston, Pino, etc.).

## 🐛 Debug

Pour débugger l'application:

```bash
# Voir les requêtes SQL
# Modifier prisma/schema.prisma: log: ['query', 'error', 'warn']

# Activer les logs détaillés
NODE_ENV=development npm run dev
```
