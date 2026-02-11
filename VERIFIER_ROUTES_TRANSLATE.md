# 🔍 Vérifier les Routes de Traduction

## 📋 Commandes à Exécuter

Les warnings `GOOGLE_TRANSLATE_API_KEY non configurée` viennent probablement des fonctions `translateText` dans les routes. Vérifions :

```bash
cd /root/myguidedigital/myguidedigital/backend

# 1. Vérifier dans livrets.ts
grep -n "GOOGLE_TRANSLATE_API_KEY non configurée" src/routes/livrets.ts

# 2. Voir le contexte autour de cette ligne
grep -A 5 -B 5 "GOOGLE_TRANSLATE_API_KEY non configurée" src/routes/livrets.ts

# 3. Vérifier dans modules.ts aussi
grep -n "GOOGLE_TRANSLATE_API_KEY non configurée" src/routes/modules.ts
```

## ✅ Solution

Si vous trouvez ces lignes, elles doivent être modifiées pour ajouter le flag `translateText.warned`.

Montrez-moi le résultat de ces commandes et je vous dirai exactement quoi modifier !
