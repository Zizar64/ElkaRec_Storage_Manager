# 🚀 Guide de Démarrage Rapide

Bienvenue dans la nouvelle version d'ElkaRec Storage Manager!

## ✅ Ce qui a été créé

### Architecture Complète
- ✅ **Backend API** (Node.js + Express + TypeScript + Prisma)
- ✅ **Frontend React** (React + TypeScript + Vite + Tailwind CSS)
- ✅ **Base de données** (Schéma Prisma pour MySQL)
- ✅ **Authentification** (JWT sécurisé)
- ✅ **Docker** (Configuration complète)
- ✅ **Documentation** (README détaillés + guide de migration)

### Fonctionnalités Implémentées
- ✅ Système d'authentification complet
- ✅ Gestion CRUD des équipements
- ✅ Filtrage par secteur et statut
- ✅ Recherche textuelle
- ✅ Mise à jour des statuts avec historique
- ✅ Interface moderne avec thème sombre
- ✅ Design responsive

## 🏃 Démarrage en 5 Minutes

### 1. Prérequis
Assurez-vous d'avoir installé:
- Node.js 18+ ([Download](https://nodejs.org))
- MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/))
- npm (inclus avec Node.js)

### 2. Configuration de la Base de Données

Créez une base de données MySQL:

```sql
CREATE DATABASE elkarec_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'elkarec_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON elkarec_db.* TO 'elkarec_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configuration du Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos informations de base de données
# DATABASE_URL="mysql://elkarec_user:votre_mot_de_passe@localhost:3306/elkarec_db"

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev --name init

# (Optionnel) Ouvrir Prisma Studio pour voir la base de données
npx prisma studio
```

### 4. Configuration du Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Le fichier .env devrait contenir:
# VITE_API_URL=http://localhost:3000/api
```

### 5. Lancer l'Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Créer votre Premier Utilisateur

Ouvrez un navigateur et allez sur http://localhost:5173

Comme il n'y a pas encore d'utilisateur, créez-en un via l'API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elkarec.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "ElkaRec"
  }'
```

**Important**: Pour donner les droits admin à cet utilisateur:
1. Ouvrez Prisma Studio: `cd backend && npx prisma studio`
2. Allez dans la table `users`
3. Changez le champ `role` de `USER` à `ADMIN`

### 7. Se Connecter

Allez sur http://localhost:5173/login et connectez-vous avec:
- Email: admin@elkarec.com
- Password: Admin123!

🎉 **Félicitations!** Vous êtes maintenant prêt à utiliser l'application!

## 📋 Prochaines Étapes

### Migration des Données
Si vous avez des données dans l'ancien système:
1. Consultez le fichier `MIGRATION.md`
2. Exportez vos données existantes
3. Utilisez le script d'import fourni

### Ajouter des Équipements
Deux options:
1. **Via l'interface** (si vous êtes admin)
2. **Via Prisma Studio**: `npx prisma studio`

Exemple d'équipement:
```json
{
  "tag": "CAM-001",
  "localisation": "Studio A",
  "sector": "BROADCAST",
  "type": "Caméra",
  "manufacturer": "Sony",
  "model": "PXW-Z190",
  "status": "READY"
}
```

### Personnalisation

#### Changer les Couleurs
Éditez `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
}
```

#### Ajouter des Champs
1. Modifiez `backend/prisma/schema.prisma`
2. Exécutez `npx prisma migrate dev`
3. Mettez à jour les types TypeScript
4. Ajoutez les champs dans l'interface

## 🐳 Alternative: Démarrage avec Docker

Si vous préférez utiliser Docker:

```bash
# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Lancer tous les services
docker-compose up -d

# Exécuter les migrations
docker-compose exec backend npx prisma migrate dev

# Créer un utilisateur admin
docker-compose exec backend node -e "
const bcrypt = require('bcryptjs');
console.log('Use this in Prisma Studio:', bcrypt.hashSync('Admin123!', 10));
"

# Voir les logs
docker-compose logs -f
```

## 🔧 Commandes Utiles

### Backend
```bash
npm run dev          # Mode développement
npm run build        # Build production
npm start            # Démarrer en production
npm run prisma:studio  # Ouvrir Prisma Studio
```

### Frontend
```bash
npm run dev          # Mode développement
npm run build        # Build production
npm run preview      # Prévisualiser le build
```

### Docker
```bash
docker-compose up -d              # Démarrer
docker-compose down               # Arrêter
docker-compose logs -f            # Voir les logs
docker-compose exec backend sh    # Shell dans le backend
```

## 🆘 Résolution des Problèmes

### Le backend ne démarre pas
```bash
# Vérifier que MySQL est lancé
# Windows: Services → MySQL
# Linux/Mac: systemctl status mysql

# Vérifier les logs
cd backend
npm run dev
```

### Erreur de connexion à la base de données
- Vérifiez `DATABASE_URL` dans `backend/.env`
- Testez la connexion MySQL: `mysql -u elkarec_user -p`
- Vérifiez que la base de données existe

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend est lancé (http://localhost:3000/health)
- Vérifiez `VITE_API_URL` dans `frontend/.env`
- Ouvrez la console du navigateur pour voir les erreurs

### Erreur CORS
- Vérifiez `FRONTEND_URL` dans `backend/.env`
- Relancez le backend après modification

## 📚 Documentation

- `README.md` - Vue d'ensemble et documentation principale
- `backend/README.md` - Documentation de l'API
- `frontend/README.md` - Documentation du frontend
- `MIGRATION.md` - Guide de migration depuis l'ancien système
- `docker-compose.yml` - Configuration Docker

## 🎯 Fonctionnalités Avancées (À Implémenter)

Suggestions pour améliorer l'application:

1. **Export Excel/PDF** des équipements
2. **Import en masse** via CSV
3. **Notifications** par email
4. **Tableau de bord** avec statistiques
5. **Code QR** pour chaque équipement
6. **Application mobile** (React Native)
7. **Rapports** de maintenance
8. **Calendrier** de maintenance préventive
9. **Multi-tenancy** pour plusieurs entreprises
10. **Gestion des pièces détachées**

## 💬 Support

- Consultez la documentation
- Vérifiez les logs serveur
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

## 🎉 Bon Développement!

Vous avez maintenant une application moderne, sécurisée et évolutive!

N'hésitez pas à personnaliser et à étendre les fonctionnalités selon vos besoins.
