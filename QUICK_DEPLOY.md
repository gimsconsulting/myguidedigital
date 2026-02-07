# 🚀 Déploiement Rapide sur Hostinger - Checklist

## ✅ Checklist de Déploiement

### Avant de Commencer
- [ ] Avoir un compte Hostinger avec VPS/Cloud Hosting
- [ ] Avoir accès SSH à votre serveur
- [ ] Avoir Node.js 18+ installé sur le serveur
- [ ] Avoir configuré vos domaines dans Hostinger

### Préparation Locale
- [ ] Build du frontend : `cd frontend && npm run build`
- [ ] Tester que tout fonctionne localement
- [ ] Préparer les fichiers `.env` avec vos vraies valeurs

### Sur le Serveur Hostinger
- [ ] Se connecter en SSH
- [ ] Installer Node.js : `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
- [ ] Installer PM2 : `sudo npm install -g pm2`
- [ ] Installer Nginx : `sudo apt-get install nginx`
- [ ] Transférer les fichiers (Git, FTP, ou SCP)
- [ ] Installer les dépendances : `cd backend && npm install --production && cd ../frontend && npm install --production`
- [ ] Configurer les fichiers `.env` (backend et frontend)
- [ ] Initialiser la base de données : `cd backend && npx prisma generate && npx prisma db push`
- [ ] Build du frontend : `cd frontend && npm run build`
- [ ] Démarrer avec PM2 : `pm2 start ecosystem.config.js && pm2 save`
- [ ] Configurer Nginx (voir guide complet)
- [ ] Configurer SSL avec Let's Encrypt : `sudo certbot --nginx -d votre-domaine.com`

### Vérification
- [ ] Backend accessible : `curl http://localhost:3001/health`
- [ ] Frontend accessible : Ouvrir `http://votre-domaine.com`
- [ ] API accessible : `curl https://api.votre-domaine.com/health`
- [ ] Vérifier les logs : `pm2 logs`

## 📚 Guides Complets

- **Guide Détaillé** : `docs/DEPLOIEMENT_HOSTINGER.md`
- **Guide Simplifié** : `docs/DEPLOIEMENT_HOSTINGER_SIMPLIFIE.md`

## 🔧 Commandes Utiles

```bash
# Voir les processus PM2
pm2 list

# Voir les logs
pm2 logs

# Redémarrer
pm2 restart all

# Mise à jour du code
cd /var/www/my-guidedigital
./deploy.sh
```

## ⚠️ Points Importants

1. **Ne jamais commiter les `.env`** - Ils contiennent des secrets
2. **Utiliser HTTPS** - Configurer SSL avec Let's Encrypt
3. **Sauvegarder régulièrement** - La base de données et les uploads
4. **Surveiller les logs** - `pm2 logs` et logs Nginx
5. **Mettre à jour régulièrement** - Le système et les dépendances

## 🆘 En Cas de Problème

1. Vérifier les logs : `pm2 logs`
2. Vérifier Nginx : `sudo nginx -t` et `sudo tail -f /var/log/nginx/error.log`
3. Vérifier que les services tournent : `pm2 list`
4. Vérifier les ports : `netstat -tulpn | grep -E '3000|3001'`
5. Consulter le guide de dépannage dans `docs/DEPLOIEMENT_HOSTINGER.md`

---

**Bon déploiement ! 🎉**
