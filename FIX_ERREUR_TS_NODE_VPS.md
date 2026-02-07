# Corriger l'erreur « Cannot find package 'ts-node' » sur le VPS

Cette erreur apparaît quand le serveur essaie de lancer l’application en **TypeScript** (avec `ts-node`) au lieu du **JavaScript compilé**. En production, il faut **toujours** lancer le build compilé, pas le code TypeScript.

---

## À faire dans le terminal Hostinger VPS

Exécute les commandes **dans l’ordre**, en étant connecté au VPS.

### 1. Aller dans le projet

```bash
cd ~/myguidedigital/myguidedigital
```

### 2. Arrêter tous les processus PM2

```bash
pm2 delete all
```

(Si tu as une erreur « No process found », c’est normal, continue.)

### 3. Vérifier qu’aucun script ne lance ts-node

Sur le serveur, il ne doit pas y avoir de commande qui utilise `ts-node` ou `npm run dev` pour la prod. On va repartir uniquement sur notre config.

Vérifie le fichier de config PM2 :

```bash
cat ecosystem.config.js
```

Tu dois voir pour le backend une ligne du type :  
`script: './backend/dist/index.js'`  
et **pas** de `ts-node` ni `src/index.ts`.

### 4. Builder le backend (générer le JavaScript)

```bash
cd backend
npm install --production=false
npm run build
cd ..
```

À la fin, vérifie que le fichier compilé existe :

```bash
ls -la backend/dist/index.js
```

Tu dois voir le fichier listé.

### 5. Démarrer avec la config du projet (sans ts-node)

Depuis la **racine** du projet (`~/myguidedigital/myguidedigital`) :

```bash
pm2 start ecosystem.config.js
```

### 6. Vérifier le statut

```bash
pm2 list
```

- **my-guidedigital-backend** et **my-guidedigital-frontend** doivent être **online**.
- S’il existe encore un processus nommé **my-guide** (sans « digital »), c’est peut‑être une ancienne config qui utilisait ts-node : supprime-le avec  
  `pm2 delete my-guide`  
  puis relance :  
  `pm2 start ecosystem.config.js`

### 7. Sauvegarder la config PM2

```bash
pm2 save
```

---

## En résumé

- **En production** : on lance **uniquement** `node backend/dist/index.js` (via `ecosystem.config.js`), jamais `ts-node` ni `npm run dev`.
- L’erreur « ts-node » vient en général d’un ancien script ou d’une ancienne app PM2 (par ex. « my-guide ») qui essayait de lancer le TypeScript. En utilisant seulement `pm2 start ecosystem.config.js` après un `npm run build` dans `backend`, le backend tourne en JavaScript compilé et l’erreur disparaît.

Si après ces étapes tu as encore une erreur, envoie la sortie de :

```bash
pm2 logs my-guidedigital-backend --lines 30
```
