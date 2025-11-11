# Déploiement sur Proxmox avec LXC + Docker

Guide optimisé pour déployer ElkaRec Storage Manager sur Proxmox avec un conteneur LXC et Docker.

## Pourquoi LXC + Docker ?

✅ **Avantages** :
- **Léger** : Pas de surcharge d'une VM complète
- **Performant** : Virtualisation au niveau conteneur
- **Portable** : Garde Docker Compose pour faciliter la gestion
- **Économe** : Consomme moins de RAM et CPU qu'une VM
- **Rapide** : Démarrage quasi-instantané

⚠️ **Par rapport à une VM** : Isolation légèrement moins forte (mais suffisante pour un homelab)

---

## Table des Matières

1. [Création du Conteneur LXC](#création-du-conteneur-lxc)
2. [Configuration du LXC pour Docker](#configuration-du-lxc-pour-docker)
3. [Installation de Docker](#installation-de-docker)
4. [Déploiement de l'Application](#déploiement-de-lapplication)
5. [Réseau et Accès](#réseau-et-accès)
6. [Maintenance](#maintenance)

---

## Création du Conteneur LXC

### Option 1 : Via l'Interface Web Proxmox (Recommandé pour débutants)

1. **Télécharger le template Ubuntu** (si pas déjà fait)
   - Connectez-vous à l'interface Proxmox : `https://votre-ip-proxmox:8006`
   - Allez dans votre nœud → `local (pve)` → `CT Templates`
   - Cliquez sur `Templates`
   - Recherchez et téléchargez : `ubuntu-22.04-standard`

2. **Créer le conteneur**
   - Cliquez sur `Create CT` en haut à droite
   - **General** :
     - CT ID : `100` (ou un ID libre)
     - Hostname : `elkarec-prod`
     - Password : Choisissez un mot de passe root fort
     - ☑️ Unprivileged container (recommandé)

   - **Template** :
     - Template : `ubuntu-22.04-standard`

   - **Root Disk** :
     - Storage : `local-lvm` (ou votre stockage)
     - Disk size : `16 GB` (suffisant avec LXC, peut être étendu plus tard)

   - **CPU** :
     - Cores : `2`

   - **Memory** :
     - Memory : `2048 MB` (2 GB suffit, contrairement à une VM)
     - Swap : `512 MB`

   - **Network** :
     - Bridge : `vmbr0`
     - IPv4 : `DHCP` (ou Static si vous préférez)
     - IPv6 : `DHCP` ou désactivé

   - **DNS** :
     - Utilisez les paramètres de l'hôte

3. **IMPORTANT : Activer le nesting AVANT de démarrer**
   - Dans l'interface Proxmox, sélectionnez votre conteneur (100)
   - Allez dans `Options`
   - Double-cliquez sur `Features`
   - ☑️ Cochez `nesting` (obligatoire pour Docker)
   - ☑️ Cochez `keyctl` (recommandé pour Docker)
   - Cliquez sur `OK`

4. **Démarrer le conteneur**
   - Sélectionnez le conteneur → `Start`

### Option 2 : Via la Ligne de Commande (Plus rapide)

Connectez-vous en SSH à votre serveur Proxmox :

```bash
# Télécharger le template Ubuntu 22.04 (si pas déjà fait)
pveam update
pveam download local ubuntu-22.04-standard_22.04-1_amd64.tar.zst

# Créer le conteneur avec toutes les options
pct create 100 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname elkarec-prod \
  --memory 2048 \
  --swap 512 \
  --cores 2 \
  --rootfs local-lvm:16 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --features nesting=1,keyctl=1 \
  --unprivileged 1 \
  --password

# Démarrer le conteneur
pct start 100

# Obtenir l'IP du conteneur
pct exec 100 -- ip addr show eth0 | grep inet
```

---

## Configuration du LXC pour Docker

### 1. Se connecter au conteneur

```bash
# Option A : Depuis Proxmox (console)
pct enter 100

# Option B : Via SSH (une fois que vous avez l'IP)
ssh root@ip_du_conteneur
```

### 2. Mettre à jour le système

```bash
apt update && apt upgrade -y
```

### 3. Installer les prérequis

```bash
apt install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  software-properties-common
```

---

## Installation de Docker

### Méthode Automatique (Recommandée)

```bash
# Script d'installation officiel Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Vérifier l'installation
docker --version
docker run hello-world
```

### Installation de Docker Compose

```bash
# Docker Compose Plugin (méthode moderne)
apt install -y docker-compose-plugin

# Vérifier
docker compose version
```

### Démarrage Automatique de Docker

```bash
# Activer le démarrage automatique
systemctl enable docker
systemctl start docker

# Vérifier le statut
systemctl status docker
```

---

## Déploiement de l'Application

### 1. Installer Git

```bash
apt install -y git nano
```

### 2. Créer le répertoire et cloner le projet

```bash
# Créer le répertoire
mkdir -p /opt/elkarec-storage-manager
cd /opt/elkarec-storage-manager

# Cloner le dépôt
git clone https://github.com/Zizar64/ElkaRec_Storage_Manager.git .
```

### 3. Configurer l'environnement

```bash
# Copier le template
cp .env.production.example .env.production

# Éditer la configuration
nano .env.production
```

**Configuration recommandée** :

```env
# MySQL - Changez ces mots de passe !
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
MYSQL_DATABASE=elkarec_db
MYSQL_USER=elkarec_user
MYSQL_PASSWORD=$(openssl rand -base64 32)

# JWT - Générez une clé aléatoire
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# URLs - Remplacez par l'IP de votre conteneur LXC
VITE_API_URL=http://192.168.X.X/api
FRONTEND_URL=http://192.168.X.X
SERVER_HOST=192.168.X.X

# Timezone
TZ=Europe/Paris
```

**Astuce** : Générer des mots de passe sécurisés :
```bash
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)"
echo "MYSQL_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
```

### 4. Déployer avec le script automatique

```bash
chmod +x deploy.sh
./deploy.sh
```

### 5. OU Déploiement Manuel

```bash
# Construire et démarrer les conteneurs
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Attendre que MySQL soit prêt (30-40 secondes)
sleep 40

# Exécuter les migrations
docker exec elkarec-backend-prod npx prisma migrate deploy

# Vérifier le statut
docker ps
```

### 6. Créer un utilisateur administrateur

```bash
# Créer l'utilisateur
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
```

Dans MySQL :
```sql
USE elkarec_db;
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@elkarec.com';
EXIT;
```

---

## Réseau et Accès

### Trouver l'IP du conteneur

```bash
# Depuis Proxmox
pct exec 100 -- ip addr show eth0 | grep "inet "

# Depuis le conteneur
ip addr show eth0 | grep "inet "
```

### Accéder à l'application

- **URL** : `http://ip_du_conteneur`
- **Santé** : `http://ip_du_conteneur/health`

### Configuration d'une IP Statique (Recommandé)

**Depuis Proxmox** :

```bash
# Arrêter le conteneur
pct stop 100

# Configurer l'IP statique
pct set 100 -net0 name=eth0,bridge=vmbr0,ip=192.168.1.50/24,gw=192.168.1.1

# Démarrer le conteneur
pct start 100
```

**OU depuis le conteneur** :

```bash
nano /etc/netplan/00-installer-config.yaml
```

Contenu :
```yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 192.168.1.50/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

Appliquer :
```bash
netplan apply
```

### Redirection de Port depuis Proxmox (Optionnel)

Si vous voulez accéder via l'IP du serveur Proxmox :

```bash
# Sur le serveur Proxmox
iptables -t nat -A PREROUTING -i vmbr0 -p tcp --dport 8080 -j DNAT --to-destination IP_LXC:80
iptables -t nat -A POSTROUTING -s IP_LXC/32 -o vmbr0 -j MASQUERADE

# Sauvegarder les règles
iptables-save > /etc/iptables/rules.v4
```

Accès : `http://ip_proxmox:8080`

---

## Maintenance

### Commandes Utiles

```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs -f

# Redémarrer l'application
docker compose -f docker-compose.prod.yml restart

# Arrêter
docker compose -f docker-compose.prod.yml down

# Mettre à jour
cd /opt/elkarec-storage-manager
git pull
./deploy.sh

# Backup base de données
docker exec elkarec-db-prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" elkarec_db > backup_$(date +%Y%m%d).sql
```

### Gestion du Conteneur LXC depuis Proxmox

```bash
# Démarrer/Arrêter/Redémarrer
pct start 100
pct stop 100
pct reboot 100

# Voir les ressources utilisées
pct status 100

# Entrer dans le conteneur
pct enter 100

# Voir les logs du conteneur
pct logs 100

# Backup du conteneur complet
vzdump 100 --mode snapshot --storage local
```

### Augmenter les Ressources si Nécessaire

```bash
# Augmenter la RAM (arrêt requis)
pct stop 100
pct set 100 -memory 4096
pct start 100

# Augmenter le CPU (à chaud)
pct set 100 -cores 4

# Augmenter le disque (à chaud)
pct resize 100 rootfs +8G
```

### Snapshot et Backup

```bash
# Créer un snapshot
pct snapshot 100 avant-mise-a-jour

# Lister les snapshots
pct listsnapshot 100

# Restaurer un snapshot
pct rollback 100 avant-mise-a-jour

# Backup complet
vzdump 100 --storage local
```

---

## Avantages de LXC vs VM pour ce Projet

| Critère | LXC + Docker | VM + Docker |
|---------|--------------|-------------|
| **RAM utilisée** | ~1.5 GB | ~2.5 GB |
| **Démarrage** | 5-10 sec | 30-60 sec |
| **Performance** | Native | Légère surcharge |
| **Isolation** | Bonne | Excellente |
| **Portabilité Docker** | ✅ | ✅ |
| **Facilité** | ✅ | ✅ |

---

## Troubleshooting Spécifique LXC

### Docker ne démarre pas

**Erreur** : `Failed to start docker.service`

**Solution** : Vérifier que le nesting est activé
```bash
# Depuis Proxmox
pct config 100 | grep features
# Devrait afficher : features: keyctl=1,nesting=1

# Si absent, l'activer (conteneur éteint)
pct stop 100
pct set 100 -features keyctl=1,nesting=1
pct start 100
```

### Problème de réseau dans les conteneurs Docker

**Solution** : Vérifier les modules kernel
```bash
# Dans le LXC
lsmod | grep overlay
lsmod | grep br_netfilter

# Si absents, les charger
modprobe overlay
modprobe br_netfilter
```

### Espace disque insuffisant

```bash
# Depuis Proxmox, augmenter le disque
pct resize 100 rootfs +10G

# Dans le LXC, vérifier
df -h
```

---

## Comparaison avec d'autres Architectures

### Architecture 1 : LXC + Docker (CE GUIDE) ⭐

```
Proxmox
  └─ LXC Container (2 GB RAM, 16 GB Disk)
      └─ Docker
          ├─ Nginx
          ├─ Frontend
          ├─ Backend
          └─ MySQL
```

**Ressources totales** : ~2 GB RAM, 16 GB disque
**Consommation réelle** : ~1.5 GB RAM utilisée

### Architecture 2 : VM + Docker

```
Proxmox
  └─ VM Ubuntu (4 GB RAM, 32 GB Disk)
      └─ Docker
          ├─ Nginx
          ├─ Frontend
          ├─ Backend
          └─ MySQL
```

**Ressources totales** : ~4 GB RAM, 32 GB disque
**Consommation réelle** : ~2.5 GB RAM utilisée

### Architecture 3 : LXC Natifs (Sans Docker)

```
Proxmox
  ├─ LXC Nginx (256 MB RAM)
  ├─ LXC Frontend (512 MB RAM)
  ├─ LXC Backend (512 MB RAM)
  └─ LXC MySQL (1 GB RAM)
```

**Ressources totales** : ~2.3 GB RAM, 4x4 GB disques
**Consommation réelle** : ~1.8 GB RAM utilisée
**Complexité** : Haute (pas de docker-compose)

---

## Conclusion

Le déploiement avec **LXC + Docker** est le meilleur compromis pour un homelab :

✅ **Léger et performant** comme du LXC natif
✅ **Simple à gérer** grâce à Docker Compose
✅ **Portable** : même configuration qu'en dev local
✅ **Économe** : 40% moins de RAM qu'une VM

**Temps de déploiement estimé** : 15-20 minutes

---

## Prochaines Étapes

1. ✅ Créer le conteneur LXC avec nesting
2. ✅ Installer Docker
3. ✅ Déployer l'application
4. 🔧 Configurer une IP statique
5. 🔒 Configurer SSL (voir DEPLOYMENT_PROXMOX.md)
6. 📊 Configurer les backups automatiques
7. 🌐 (Optionnel) Configurer un nom de domaine

---

**Besoin d'aide ?** Consultez le guide principal : `DEPLOYMENT_PROXMOX.md`

Bon déploiement ! 🚀
