# Quick Start LXC - Déploiement en 10 Minutes

Guide ultra-rapide pour déployer ElkaRec sur Proxmox avec LXC + Docker.

## 🚀 Déploiement Express

### 1. Créer le Conteneur LXC (2 min)

**Sur le serveur Proxmox** (SSH) :

```bash
# Télécharger le template (si pas déjà fait)
pveam update
pveam download local ubuntu-22.04-standard_22.04-1_amd64.tar.zst

# Créer le conteneur avec Docker-ready
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

# Démarrer
pct start 100

# Obtenir l'IP
pct exec 100 -- ip -4 addr show eth0 | grep inet
```

### 2. Installer Docker (2 min)

**Se connecter au LXC** :

```bash
pct enter 100
```

**Installer Docker** :

```bash
# Mise à jour et installation
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin git

# Vérifier
docker --version && docker compose version
```

### 3. Déployer l'Application (5 min)

```bash
# Cloner le projet
mkdir -p /opt/elkarec-storage-manager && cd /opt/elkarec-storage-manager
git clone https://github.com/Zizar64/ElkaRec_Storage_Manager.git .

# Configuration rapide
cp .env.production.example .env.production
nano .env.production
```

**Copier/coller cette config** (remplacez les valeurs) :

```env
MYSQL_ROOT_PASSWORD=ChangeMe123!
MYSQL_PASSWORD=ChangeMe456!
JWT_SECRET=$(openssl rand -base64 32)
VITE_API_URL=http://VOTRE_IP_LXC/api
FRONTEND_URL=http://VOTRE_IP_LXC
SERVER_HOST=VOTRE_IP_LXC
```

**Déployer** :

```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Créer un Admin (1 min)

```bash
# Créer l'utilisateur
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elkarec.com","password":"Admin123!","firstName":"Admin","lastName":"ElkaRec"}'

# Le promouvoir admin
docker exec -it elkarec-db-prod mysql -u root -p
```

Dans MySQL :
```sql
USE elkarec_db;
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@elkarec.com';
EXIT;
```

### 5. Accéder 🎉

Ouvrez : `http://votre_ip_lxc`

---

## 📋 Checklist Rapide

- [ ] LXC créé avec `nesting=1`
- [ ] Docker installé et fonctionnel
- [ ] `.env.production` configuré avec VOS valeurs
- [ ] Application déployée avec `./deploy.sh`
- [ ] Utilisateur admin créé et promu
- [ ] Application accessible dans le navigateur

---

## 🔧 Commandes Utiles

```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs -f

# Redémarrer
docker compose -f docker-compose.prod.yml restart

# Arrêter
docker compose -f docker-compose.prod.yml down

# Statut
docker ps

# Depuis Proxmox - Entrer dans le LXC
pct enter 100

# Depuis Proxmox - IP du LXC
pct exec 100 -- hostname -I
```

---

## ⚡ Comparaison Ressources

| Type | RAM | Disque | Démarrage |
|------|-----|--------|-----------|
| **LXC + Docker** | 2 GB | 16 GB | 5-10s |
| VM + Docker | 4 GB | 32 GB | 30-60s |

**Économie** : 50% de RAM, 50% de disque ! 🎯

---

## 🆘 Problèmes Courants

**Docker ne démarre pas** :
```bash
# Vérifier nesting depuis Proxmox
pct config 100 | grep nesting
# Si absent :
pct stop 100 && pct set 100 -features nesting=1,keyctl=1 && pct start 100
```

**Pas d'accès réseau** :
```bash
# Vérifier l'IP
ip addr show eth0
# Ping test
ping -c 3 8.8.8.8
```

**Conteneurs ne démarrent pas** :
```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs
# Vérifier l'espace disque
df -h
```

---

## 📖 Documentation Complète

- Guide détaillé : `DEPLOYMENT_PROXMOX_LXC.md`
- Guide VM : `DEPLOYMENT_PROXMOX.md`
- README : `README.md`

---

**Temps total** : ~10 minutes
**Difficulté** : Facile
**Prérequis** : Proxmox avec accès SSH

Bon déploiement ! 🚀
