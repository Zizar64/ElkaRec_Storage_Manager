# Quick Start - Déploiement Rapide sur Proxmox

Guide express pour déployer rapidement ElkaRec Storage Manager sur Proxmox.

## Résumé en 10 Minutes

### 1. Créer une VM Ubuntu sur Proxmox

**Specs minimales** :
- OS : Ubuntu Server 22.04 LTS
- CPU : 2 cores
- RAM : 4 GB
- Disque : 32 GB
- Réseau : Configuré avec IP fixe ou DHCP

### 2. Installer Docker sur la VM

```bash
# Se connecter à la VM
ssh user@ip_de_la_vm

# Installation Docker en une commande
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Déconnexion/reconnexion pour appliquer les changements
exit
ssh user@ip_de_la_vm

# Installer Docker Compose
sudo apt install -y docker-compose-plugin

# Vérifier
docker --version
docker compose version
```

### 3. Cloner et Configurer l'Application

```bash
# Cloner le dépôt
sudo mkdir -p /opt/elkarec-storage-manager
sudo chown $USER:$USER /opt/elkarec-storage-manager
cd /opt/elkarec-storage-manager
git clone https://github.com/Zizar64/ElkaRec_Storage_Manager.git .

# Configurer l'environnement
cp .env.production.example .env.production
nano .env.production
```

**Configuration minimale dans `.env.production`** :

```env
# Changez ces valeurs !
MYSQL_ROOT_PASSWORD=VotreMotDePasseRoot123!
MYSQL_PASSWORD=VotreMotDePasseUser456!
JWT_SECRET=$(openssl rand -base64 32)

# Remplacez par votre IP
VITE_API_URL=http://192.168.1.X/api
FRONTEND_URL=http://192.168.1.X
SERVER_HOST=192.168.1.X
```

### 4. Déployer

```bash
# Méthode automatique (recommandé)
chmod +x deploy.sh
sudo ./deploy.sh

# OU méthode manuelle
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
sleep 30
docker exec elkarec-backend-prod npx prisma migrate deploy
```

### 5. Créer un Utilisateur Admin

```bash
# Créer un utilisateur
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elkarec.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "ElkaRec"
  }'

# Le promouvoir en admin
docker exec -it elkarec-db-prod mysql -u root -p
# Entrez le mot de passe MySQL root
USE elkarec_db;
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@elkarec.com';
EXIT;
```

### 6. Accéder à l'Application

Ouvrez votre navigateur : `http://ip_de_la_vm`

Connectez-vous avec :
- Email : `admin@elkarec.com`
- Mot de passe : `Admin123!`

---

## Commandes Utiles

```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs -f

# Redémarrer
docker compose -f docker-compose.prod.yml restart

# Arrêter
docker compose -f docker-compose.prod.yml down

# Voir le statut
docker ps

# Backup base de données
docker exec elkarec-db-prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" elkarec_db > backup.sql

# Mettre à jour
cd /opt/elkarec-storage-manager
git pull
sudo ./deploy.sh
```

---

## Checklist de Sécurité

- [ ] Changé tous les mots de passe par défaut
- [ ] Généré un JWT_SECRET aléatoire
- [ ] Configuré le firewall (ufw/iptables)
- [ ] Activé les backups automatiques
- [ ] Configuré SSL/HTTPS (pour la production)
- [ ] Changé le mot de passe admin par défaut
- [ ] Limité l'accès SSH à la VM

---

## Troubleshooting Express

**Problème** : Les conteneurs ne démarrent pas
```bash
docker compose -f docker-compose.prod.yml logs
df -h  # Vérifier l'espace disque
```

**Problème** : Cannot connect to database
```bash
docker ps | grep db
docker exec -it elkarec-db-prod mysql -u root -p
```

**Problème** : Site inaccessible
```bash
curl http://localhost/health
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## Prochaines Étapes

1. Consultez le guide complet : [DEPLOYMENT_PROXMOX.md](DEPLOYMENT_PROXMOX.md)
2. Configurez SSL : Section "Configuration SSL" dans le guide complet
3. Configurez les backups automatiques
4. Configurez un nom de domaine (optionnel)
5. Importez vos données existantes

---

## Support

- Guide complet : `DEPLOYMENT_PROXMOX.md`
- Documentation : `README.md`
- Issues : https://github.com/Zizar64/ElkaRec_Storage_Manager/issues

---

**Temps estimé** : 10-15 minutes pour un déploiement basique
**Prérequis** : VM Ubuntu avec connexion Internet

Bon déploiement ! 🚀
