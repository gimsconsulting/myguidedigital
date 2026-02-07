# Mettre à jour app.myguidedigital.com (voir les changements en production)

Sur **localhost:3000** tu vois les changements car ton PC utilise le code à jour.  
Le site **app.myguidedigital.com** tourne sur un **serveur**. Tant que ce serveur n’a pas reçu le nouveau code et refait un build, il affiche l’ancienne version.

---

## Ce qu’il faut faire : exécuter le déploiement sur le serveur

### 1. Te connecter au serveur en SSH

- Ouvre un terminal sur ton PC (PowerShell, CMD, ou l’app « Terminal »).
- Connecte-toi au serveur où est hébergé **app.myguidedigital.com** avec SSH.

**Exemple (remplace par ton utilisateur et ton domaine ou IP) :**
```bash
ssh root@ton-serveur.com
```
ou
```bash
ssh u513978936@app.myguidedigital.com
```

*(Si tu as un VPS Hostinger / autre : utilise l’utilisateur et l’hôte indiqués dans ton panneau.)*

---

### 2. Aller dans le dossier du projet

Une fois connecté au serveur, va dans le dossier où se trouve le projet My Guide Digital.

**Si ton script `deploy.sh` est déjà sur le serveur (ex. VPS) :**
```bash
cd /root/myguidedigital/myguidedigital
```

**Si ton site est sur un hébergement Hostinger classique**, le chemin peut ressembler à :
```bash
cd ~/domains/app.myguidedigital.com/public_html
```
*(Adapte le chemin à ce que tu vois dans le gestionnaire de fichiers Hostinger.)*

---

### 3. Récupérer le code à jour depuis GitHub

```bash
git pull origin main
```

Cela récupère les derniers commits (dont « dizaines », Contact, tarifs, etc.).

---

### 4. Rebuilder le frontend et redémarrer

**Option A – Tu as le script `deploy.sh` sur le serveur :**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Option B – Tu exécutes les commandes à la main :**
```bash
cd frontend
rm -rf .next
npm install --production=false
npm run build
cd ..
cd backend
npm install --production=false
npm run build
cd ..
pm2 restart all
```

*(Si tu n’utilises pas PM2 mais un autre outil, redémarre le service qui sert le frontend/backend.)*

---

### 5. Vérifier et vider le cache du navigateur

- Attends 1–2 minutes que le serveur redémarre.
- Ouvre **https://app.myguidedigital.com**.
- Fais un **rafraîchissement forcé** : **Ctrl+Shift+R** (Windows) ou **Cmd+Shift+R** (Mac).

Tu devrais alors voir les mêmes changements qu’en local (dizaines, Contact, tarifs en 1 clic, etc.).

---

## Résumé

| Où | Ce qui se passe |
|----|------------------|
| **Ton PC (localhost:3000)** | Code à jour → tu vois les changements. |
| **app.myguidedigital.com** | Serveur = ancien code tant que tu n’as pas fait **git pull** + **build** + **redémarrage** sur ce serveur. |

Donc : **les changements apparaîtront sur app.myguidedigital.com seulement après avoir exécuté ces étapes sur le serveur qui héberge ce domaine.**

Si tu me dis comment tu accèdes au serveur (Hostinger VPS, SSH, ou seulement FTP/panneau), je peux adapter les commandes exactes (chemins, PM2 ou autre).
