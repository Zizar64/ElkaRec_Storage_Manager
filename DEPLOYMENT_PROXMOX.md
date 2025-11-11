# Guide de Déploiement sur Proxmox

Guide complet pour déployer ElkaRec Storage Manager sur un serveur Proxmox.

## Table des Matières

1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Création de la VM sur Proxmox](#création-de-la-vm-sur-proxmox)
4. [Installation des Dépendances](#installation-des-dépendances)
5. [Configuration de l'Application](#configuration-de-lapplication)
6. [Déploiement](#déploiement)
7. [Configuration SSL (Optionnel)](#configuration-ssl-optionnel)
8. [Maintenance et Monitoring](#maintenance-et-monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

L'application est déployée avec Docker Compose et comprend :

- **Nginx** : Reverse proxy (port 80/443)
- **Frontend** : Application React (conteneur interne sur port 5173)
- **Backend** : API Node.js (conteneur interne sur port 3000)
- **MySQL** : Base de données (conteneur interne sur port 3306)

```
Internet
   ↓
[Proxmox Host]
   ↓
[VM Ubuntu/Debian]
   ↓
[Docker Network]
   ├── Nginx (80/443) ←→ Frontend (5173)
   ├── Backend (3000) ←→ MySQL (3306)
```

---

## Prérequis

### Sur votre machine de développement
- Accès SSH au serveur Proxmox
- Git installé
- Le code source de l'application

### Sur le serveur Proxmox
- Proxmox VE 7.0 ou supérieur
- Espace disque suffisant (minimum 20 GB recommandé)
- Connexion Internet

---

## Création de la VM sur Proxmox

### Option A : Via l'Interface Web Proxmox

1. **Télécharger l'ISO Ubuntu Server**
   ```bash
   # Sur le serveur Proxmox
   cd /var/lib/vz/template/iso
   wget https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso
   ```

2. **Créer la VM**
   - Allez dans l'interface web Proxmox (https://votre-ip-proxmox:8006)
   - Cliquez sur "Create VM"
   - Configuration recommandée :
     - **Node** : Votre nœud Proxmox
     - **VM ID** : 100 (ou un ID libre)
     - **Name** : elkarec-prod
     - **OS** : Ubuntu 22.04 ISO
     - **System** : Par défaut (UEFI si disponible)
     - **Disks** : 32 GB (minimum 20 GB)
     - **CPU** : 2 cores
     - **Memory** : 4096 MB (4 GB)
     - **Network** : vmbr0 (bridge)

3. **Démarrer la VM et installer Ubuntu**
   - Suivez l'assistant d'installation Ubuntu
   - Créez un utilisateur (ex: `elkarec`)
   - Installez OpenSSH Server lors de l'installation
   - Une fois l'installation terminée, notez l'adresse IP

### Option B : Utiliser un Conteneur LXC (Alternative plus légère)

```bash
# Sur le serveur Proxmox
pct create 100 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname elkarec-prod \
  --memory 4096 \
  --cores 2 \
  --rootfs local-lvm:32 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --features nesting=1 \
  --unprivileged 1 \
  --password

# Démarrer le conteneur
pct start 100

# Se connecter au conteneur
pct enter 100
```

**Note** : Si vous utilisez LXC, activez le nesting pour Docker :
```bash
# Sur Proxmox
pct set 100 -features nesting=1
pct reboot 100
```

---

## Installation des Dépendances

### 1. Se connecter à la VM/Conteneur

```bash
# Depuis votre machine
ssh elkarec@IP_DE_LA_VM
```

### 2. Mettre à jour le système

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Installer Docker

```bash
# Installer les prérequis
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le dépôt Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Se déconnecter et reconnecter pour appliquer les changements
exit
# Reconnectez-vous
ssh elkarec@IP_DE_LA_VM
```

### 4. Installer Docker Compose

```bash
# Méthode 1 : Via le gestionnaire de paquets (recommandé pour Ubuntu 22.04+)
sudo apt install -y docker-compose-plugin

# Méthode 2 : Installation manuelle (si la méthode 1 ne fonctionne pas)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker compose version
# ou
docker-compose version
```

### 5. Installer Git

```bash
sudo apt install -y git
```

### 6. Installer des outils utiles (optionnel)

```bash
sudo apt install -y htop nano curl wget
```

---

## Configuration de l'Application

### 1. Créer le répertoire de déploiement

```bash
sudo mkdir -p /opt/elkarec-storage-manager
sudo chown $USER:$USER /opt/elkarec-storage-manager
cd /opt/elkarec-storage-manager
```

### 2. Cloner le dépôt

```bash
git clone https://github.com/Zizar64/ElkaRec_Storage_Manager.git .
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.production.example .env.production

# Éditer le fichier
nano .env.production
```

**Configuration minimale requise** :

```env
# MySQL
MYSQL_ROOT_PASSWORD=VotreMotDePasseRootTresSecurise123!
MYSQL_DATABASE=elkarec_db
MYSQL_USER=elkarec_user
MYSQL_PASSWORD=VotreMotDePasseUserSecurise456!

# JWT
JWT_SECRET=VotreCleJWTTresLongueEtAleatoire789!
JWT_EXPIRES_IN=7d

# URLs (remplacez par votre IP ou domaine)
VITE_API_URL=http://192.168.1.100/api
FRONTEND_URL=http://192.168.1.100

# Server
SERVER_HOST=192.168.1.100
TZ=Europe/Paris
```

**Génération de secrets sécurisés** :

```bash
# Générer un JWT_SECRET aléatoire
openssl rand -base64 32

# Générer des mots de passe MySQL
openssl rand -base64 24
```

### 4. Configurer Nginx (si nécessaire)

Si vous avez un nom de domaine :

```bash
nano nginx/conf.d/elkarec.conf
```

Remplacez `server_name localhost;` par votre domaine :
```nginx
server_name elkarec.votredomaine.com;
```

---

## Déploiement

### Méthode 1 : Déploiement Automatisé (Recommandé)

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Lancer le déploiement
sudo ./deploy.sh
```

Le script va :
1. Vérifier les prérequis
2. Créer une sauvegarde (si une version existe)
3. Construire les images Docker
4. Démarrer les conteneurs
5. Exécuter les migrations de base de données
6. Afficher le statut du déploiement

### Méthode 2 : Déploiement Manuel

```bash
# 1. Construire et démarrer les conteneurs
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 2. Attendre que la base de données soit prête (environ 30 secondes)
sleep 30

# 3. Exécuter les migrations
docker exec elkarec-backend-prod npx prisma migrate deploy

# 4. Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

### Vérifier le déploiement

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Vérifier que tous les conteneurs sont en cours d'exécution
docker ps

# Tester l'accès
curl http://localhost/health
```

### Créer un utilisateur administrateur

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elkarec.com",
    "password": "VotreMotDePasse123!",
    "firstName": "Admin",
    "lastName": "ElkaRec"
  }'
```

**Définir le rôle admin** :

```bash
# Méthode 1 : Via Prisma Studio
docker exec -it elkarec-backend-prod npx prisma studio
# Ouvrez http://localhost:5555 et changez le role de USER à ADMIN

# Méthode 2 : Via MySQL
docker exec -it elkarec-db-prod mysql -u root -p
# Entrez le mot de passe root
USE elkarec_db;
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@elkarec.com';
EXIT;
```

---

## Configuration SSL (Optionnel)

### Option A : Let's Encrypt avec Certbot

1. **Installer Certbot**

```bash
sudo apt install -y certbot
```

2. **Arrêter temporairement Nginx**

```bash
docker-compose -f docker-compose.prod.yml stop nginx
```

3. **Obtenir le certificat**

```bash
sudo certbot certonly --standalone -d elkarec.votredomaine.com
```

4. **Copier les certificats**

```bash
sudo mkdir -p /opt/elkarec-storage-manager/nginx/ssl
sudo cp /etc/letsencrypt/live/elkarec.votredomaine.com/fullchain.pem /opt/elkarec-storage-manager/nginx/ssl/
sudo cp /etc/letsencrypt/live/elkarec.votredomaine.com/privkey.pem /opt/elkarec-storage-manager/nginx/ssl/
sudo chown -R $USER:$USER /opt/elkarec-storage-manager/nginx/ssl
```

5. **Activer HTTPS dans Nginx**

```bash
nano nginx/conf.d/elkarec.conf
```

Décommentez la section HTTPS et configurez le domaine.

6. **Redémarrer Nginx**

```bash
docker-compose -f docker-compose.prod.yml start nginx
```

7. **Renouvellement automatique**

```bash
# Créer un cron job
sudo crontab -e

# Ajouter cette ligne pour renouveler tous les lundis à 3h
0 3 * * 1 certbot renew --quiet && cp /etc/letsencrypt/live/elkarec.votredomaine.com/*.pem /opt/elkarec-storage-manager/nginx/ssl/ && docker restart elkarec-nginx
```

### Option B : Certificat Auto-signé (pour tests)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=FR/ST=France/L=Paris/O=ElkaRec/CN=elkarec.local"
```

---

## Maintenance et Monitoring

### Commandes Utiles

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Logs d'un service spécifique
docker logs elkarec-backend-prod -f

# Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart

# Arrêter l'application
docker-compose -f docker-compose.prod.yml down

# Mise à jour de l'application
cd /opt/elkarec-storage-manager
git pull
sudo ./deploy.sh

# Voir l'utilisation des ressources
docker stats

# Sauvegarder la base de données
docker exec elkarec-db-prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" elkarec_db > backup_$(date +%Y%m%d).sql
```

### Backup Automatisé

Créez un script de backup :

```bash
sudo nano /usr/local/bin/backup-elkarec.sh
```

Contenu :

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/elkarec"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MySQL
docker exec elkarec-db-prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --all-databases > "$BACKUP_DIR/db_$DATE.sql"

# Backup volumes
tar -czf "$BACKUP_DIR/volumes_$DATE.tar.gz" /var/lib/docker/volumes/elkarec*

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Rendre le script exécutable :

```bash
sudo chmod +x /usr/local/bin/backup-elkarec.sh
```

Créer un cron job :

```bash
sudo crontab -e

# Backup tous les jours à 2h du matin
0 2 * * * /usr/local/bin/backup-elkarec.sh >> /var/log/elkarec-backup.log 2>&1
```

### Monitoring avec Portainer (Optionnel)

```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Accédez à Portainer : `http://votre-ip:9000`

---

## Troubleshooting

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### Erreur de connexion à la base de données

```bash
# Vérifier que MySQL est démarré
docker ps | grep mysql

# Se connecter à MySQL
docker exec -it elkarec-db-prod mysql -u root -p

# Vérifier les variables d'environnement
docker exec elkarec-backend-prod env | grep DATABASE_URL
```

### L'application n'est pas accessible

```bash
# Vérifier que Nginx est démarré
docker ps | grep nginx

# Tester depuis le serveur
curl http://localhost/health

# Vérifier les règles de firewall (si ufw est activé)
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Erreur de migration Prisma

```bash
# Réinitialiser la base de données (ATTENTION : efface toutes les données!)
docker exec elkarec-backend-prod npx prisma migrate reset

# Ou manuellement
docker exec -it elkarec-db-prod mysql -u root -p
DROP DATABASE elkarec_db;
CREATE DATABASE elkarec_db;
EXIT;

# Puis relancer les migrations
docker exec elkarec-backend-prod npx prisma migrate deploy
```

### Problèmes de performance

```bash
# Augmenter la mémoire allouée à MySQL
# Éditer docker-compose.prod.yml et ajouter sous le service db :
environment:
  - MYSQL_INNODB_BUFFER_POOL_SIZE=512M

# Redémarrer
docker-compose -f docker-compose.prod.yml restart db
```

---

## Configuration du Firewall Proxmox (si nécessaire)

Sur le serveur Proxmox :

```bash
# Autoriser le traffic vers la VM
iptables -A FORWARD -p tcp --dport 80 -j ACCEPT
iptables -A FORWARD -p tcp --dport 443 -j ACCEPT

# Sauvegarder les règles
iptables-save > /etc/iptables/rules.v4
```

---

## Accès à l'Application

Une fois déployée, l'application est accessible via :

- **HTTP** : `http://votre-ip-vm`
- **HTTPS** (si configuré) : `https://votre-domaine.com`

Connectez-vous avec le compte administrateur que vous avez créé.

---

## Support

Pour toute question ou problème :

1. Vérifiez les logs : `docker-compose logs -f`
2. Consultez ce guide de troubleshooting
3. Ouvrez une issue sur GitHub : https://github.com/Zizar64/ElkaRec_Storage_Manager/issues

---

**Bon déploiement !** 🚀
