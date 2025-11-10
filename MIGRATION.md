# Guide de Migration - Ancien vers Nouveau Système

Ce guide vous aidera à migrer de l'ancien système PHP/MySQL/JavaScript vanilla vers la nouvelle architecture moderne.

## 📊 Comparaison des Architectures

### Ancien Système
- **Frontend**: HTML/CSS/JavaScript vanilla
- **Backend**: PHP sans framework
- **Base de données**: MySQL avec requêtes directes
- **Authentification**: Aucune
- **Architecture**: Monolithique

### Nouveau Système
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de données**: MySQL avec Prisma ORM
- **Authentification**: JWT sécurisé
- **Architecture**: Séparation frontend/backend (API REST)

## 🗄️ Migration de la Base de Données

### Étape 1: Exporter les données existantes

```sql
-- Exporter les équipements
SELECT * FROM equipments INTO OUTFILE '/tmp/equipments.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

### Étape 2: Créer la nouvelle base de données

```bash
cd backend
npx prisma migrate dev
```

### Étape 3: Importer les données

Créez un script d'import `backend/scripts/import-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as csv from 'csv-parser';

const prisma = new PrismaClient();

async function importEquipments() {
  const equipments: any[] = [];

  fs.createReadStream('equipments.csv')
    .pipe(csv())
    .on('data', (row) => {
      equipments.push({
        tag: row.tag,
        localisation: row.localisation,
        sector: row.sector.toUpperCase(),
        type: row.type,
        manufacturer: row.manufacturer,
        model: row.model,
        status: row.status || 'READY',
      });
    })
    .on('end', async () => {
      for (const equipment of equipments) {
        await prisma.equipment.create({ data: equipment });
      }
      console.log(`${equipments.length} équipements importés`);
    });
}

importEquipments()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Exécutez:
```bash
npx tsx scripts/import-data.ts
```

## 👥 Création des Utilisateurs

L'ancien système n'avait pas d'authentification. Vous devez créer des comptes utilisateurs:

### Créer un administrateur

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elkarec.com",
    "password": "VotreMotDePasseSecurisé123!",
    "firstName": "Admin",
    "lastName": "ElkaRec"
  }'
```

### Promouvoir en admin (via Prisma Studio)

```bash
cd backend
npm run prisma:studio
```

Modifiez le champ `role` de l'utilisateur en `ADMIN`.

## 🔄 Mapping des Fonctionnalités

### Ancien: Filtrage des équipements
**Avant** (fetchEquipments.php):
```php
$sector = $_GET['sector'];
$status = $_GET['status'];
$sql = "SELECT * FROM equipments WHERE sector = ? AND status = ?";
```

**Maintenant** (API REST):
```typescript
GET /api/equipments?sector=BROADCAST&status=READY
```

### Ancien: Mise à jour du statut
**Avant** (updateEquipmentStatus.php):
```php
$equipmentId = $_GET['equipmentId'];
$status = $_GET['status'];
// Mise à jour directe sans historique
```

**Maintenant** (API REST):
```typescript
PATCH /api/equipments/:id/status
Body: { "status": "EN_MAINTENANCE", "description": "Révision" }
// Création automatique d'un historique
```

## 📝 Checklist de Migration

### Préparation
- [ ] Sauvegarder l'ancienne base de données
- [ ] Exporter toutes les données en CSV
- [ ] Documenter les règles métier spécifiques

### Installation
- [ ] Installer Node.js 18+
- [ ] Cloner le nouveau projet
- [ ] Configurer les fichiers `.env`
- [ ] Installer les dépendances (backend + frontend)

### Migration des données
- [ ] Créer la nouvelle base de données
- [ ] Exécuter les migrations Prisma
- [ ] Importer les équipements
- [ ] Vérifier l'intégrité des données

### Configuration
- [ ] Créer les comptes utilisateurs
- [ ] Configurer les rôles (Admin/User)
- [ ] Tester l'authentification
- [ ] Vérifier les permissions

### Tests
- [ ] Tester la connexion/déconnexion
- [ ] Tester l'affichage des équipements
- [ ] Tester les filtres (secteur, statut, recherche)
- [ ] Tester la mise à jour des statuts
- [ ] Tester les opérations CRUD (Admin)

### Déploiement
- [ ] Configurer le serveur de production
- [ ] Déployer le backend
- [ ] Déployer le frontend
- [ ] Configurer HTTPS
- [ ] Mettre en place les sauvegardes

## 🔒 Nouvelles Fonctionnalités de Sécurité

1. **Authentification JWT**
   - Tokens expirables (7 jours par défaut)
   - Stockage sécurisé dans localStorage
   - Refresh automatique

2. **Rôles et Permissions**
   - `USER`: Peut voir et mettre à jour les statuts
   - `ADMIN`: Accès complet (CRUD)

3. **Mots de passe sécurisés**
   - Hashage bcrypt avec 10 rounds
   - Validation côté serveur

4. **Protection des routes**
   - Toutes les routes API nécessitent une authentification
   - Validation des tokens à chaque requête

## 📈 Améliorations Apportées

### Fonctionnalités
- ✅ Authentification et autorisation
- ✅ Historique complet des modifications
- ✅ Recherche textuelle avancée
- ✅ Interface utilisateur moderne et responsive
- ✅ Feedback en temps réel
- ✅ Validation des données côté client et serveur

### Architecture
- ✅ Séparation frontend/backend
- ✅ API REST documentée
- ✅ TypeScript pour la sûreté des types
- ✅ ORM Prisma pour les migrations
- ✅ Code modulaire et maintenable
- ✅ Tests unitaires (à implémenter)

### DevOps
- ✅ Docker pour le déploiement
- ✅ Variables d'environnement
- ✅ Logs structurés
- ✅ Gestion des erreurs

## 🚨 Points d'Attention

1. **Schéma de base de données différent**
   - Les noms de champs peuvent différer
   - Nouveau système d'IDs (UUID vs auto-increment)

2. **Format des valeurs**
   - Secteur: Majuscules (`BROADCAST` vs `Broadcast`)
   - Status: Snake_case avec underscore (`A_REVISER` vs `A réviser`)

3. **Authentification obligatoire**
   - Toutes les pages nécessitent une connexion
   - Prévoir une formation des utilisateurs

4. **URLs différentes**
   - Ancien: `document.html`, `fetchEquipments.php`
   - Nouveau: `/`, `/api/equipments`

## 💡 Conseils

1. **Migration progressive**
   - Gardez l'ancien système en parallèle pendant la transition
   - Testez intensivement avant de basculer complètement

2. **Formation des utilisateurs**
   - Créez des comptes de test
   - Préparez une documentation utilisateur
   - Organisez des sessions de formation

3. **Monitoring**
   - Surveillez les logs pendant les premiers jours
   - Collectez les retours utilisateurs
   - Corrigez rapidement les bugs

4. **Sauvegarde**
   - Sauvegardez régulièrement la base de données
   - Conservez l'ancien système pendant au moins 1 mois

## 📞 Support

En cas de problème pendant la migration, consultez:
- Le README principal
- La documentation de l'API
- Les logs du serveur
- Ouvrez une issue sur GitHub
