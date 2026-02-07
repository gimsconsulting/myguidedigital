# Faire apparaître les corrections sur le site

Si vous avez déployé mais que les corrections (phrase « dizaines », menu Contact, scroll tarifs) ne s’affichent pas, suivez ces étapes dans l’ordre.

---

## 1. Vérifier que le code est à jour (sur votre PC)

```powershell
cd "c:\Users\conta\projet egeed"
git status
git log -1 --oneline
```

- Si des fichiers modifiés ne sont pas commités : faites un commit puis un push (voir plus bas).

---

## 2. Déployer sur le serveur

Connectez-vous en **SSH** à votre serveur (Hostinger ou autre), puis :

```bash
cd /root/myguidedigital/myguidedigital
git pull origin main
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

**Ou** en une commande si vous êtes déjà dans le dossier du projet :

```bash
./deploy.sh
```

Le script `deploy.sh` fait tout (y compris suppression de `.next` pour un build propre).

---

## 3. Vider le cache du navigateur

Même après un bon déploiement, l’ancienne version peut rester en cache :

- **Windows / Linux :** `Ctrl + Shift + R` (ou `Ctrl + F5`)
- **Mac :** `Cmd + Shift + R`

Ou : ouvrir le site en **navigation privée** pour tester sans cache.

---

## 4. Résumé des corrections incluses

| Correction | Fichier(s) |
|------------|------------|
| « dizaines » au lieu de « centaines » | `frontend/i18n/locales/fr.json` + fallback dans `frontend/app/page.tsx` |
| Menu Contact → page Contact (plus de redirection login) | `frontend/components/Layout.tsx` |
| Nos tarifs → scroll en 1 clic | `frontend/app/page.tsx` (scrollToTarifs) |

---

## 5. Si ça ne marche toujours pas

- Vérifier les logs : `pm2 logs`
- Vérifier que le frontend tourne : `pm2 list` (my-guidedigital-frontend doit être « online »)
- Sur le serveur, vérifier que le dernier commit est bien celui attendu :  
  `git log -1 --oneline`  
  (doit correspondre au dernier commit poussé depuis votre PC)
