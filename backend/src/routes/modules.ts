import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';
import { body, validationResult } from 'express-validator';
import axios from 'axios';

const router = express.Router();
const prisma = new PrismaClient();

// Fonction utilitaire pour traduire un texte
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '' || sourceLang === targetLang) {
    return text;
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non configurée, retour du texte original');
    return text;
  }

  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const response = await axios.post(url, {
      q: text,
      source: sourceLang,
      target: targetLang,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.data.translations[0].translatedText;
  } catch (error: any) {
    console.error('❌ Erreur traduction:', error.response?.data || error.message);
    return text; // Retourner le texte original en cas d'erreur
  }
}

// Fonction pour extraire tous les textes d'un objet JSON (récursif)
function extractTexts(obj: any, texts: string[] = []): string[] {
  if (typeof obj === 'string' && obj.trim() !== '') {
    texts.push(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach(item => extractTexts(item, texts));
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach(value => extractTexts(value, texts));
  }
  return texts;
}

// Fonction pour remplacer les textes dans un objet JSON avec les traductions
function replaceTexts(obj: any, translations: Record<string, string>): any {
  if (typeof obj === 'string') {
    return translations[obj] || obj;
  } else if (Array.isArray(obj)) {
    return obj.map(item => replaceTexts(item, translations));
  } else if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceTexts(value, translations);
    }
    return result;
  }
  return obj;
}

// Get modules for a livret
router.get('/livret/:livretId', authenticateToken, async (req: any, res: express.Response) => {
  try {
    // Verify ownership
    const livret = await prisma.livret.findFirst({
      where: {
        id: req.params.livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    const modules = await prisma.module.findMany({
      where: { livretId: req.params.livretId },
      orderBy: { order: 'asc' }
    });

    // Parser le contenu JSON pour chaque module
    const modulesWithParsedContent = modules.map(module => {
      let parsedContent = {};
      let parsedTranslations = {};
      try {
        parsedContent = typeof module.content === 'string' ? JSON.parse(module.content) : (module.content || {});
        parsedTranslations = typeof module.translations === 'string' ? JSON.parse(module.translations) : (module.translations || {});
      } catch (e) {
        // Ignore parse errors
      }
      return {
        ...module,
        content: parsedContent,
        translations: parsedTranslations,
      };
    });

    res.json(modulesWithParsedContent);
  } catch (error: any) {
    console.error('Get modules error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des modules' });
  }
});

// Create module
router.post('/', authenticateToken, [
  body('livretId').notEmpty(),
  body('type').notEmpty(),
], async (req: any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { livretId, type, name, content, translations } = req.body;

    // Verify ownership
    const livret = await prisma.livret.findFirst({
      where: {
        id: livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Get max order
    const maxOrder = await prisma.module.findFirst({
      where: { livretId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    // Convertir content et translations en JSON string pour SQLite
    const contentString = content !== undefined 
      ? (typeof content === 'string' ? content : JSON.stringify(content || {}))
      : JSON.stringify({});
    const translationsString = translations !== undefined
      ? (typeof translations === 'string' ? translations : JSON.stringify(translations || {}))
      : JSON.stringify({});

    console.log('Création module avec:', { livretId, type, name, contentString, translationsString });

    const module = await prisma.module.create({
      data: {
        livretId,
        type,
        name: name || null,
        content: contentString,
        translations: translationsString,
        order: (maxOrder?.order || 0) + 1,
      }
    });

    console.log('Module créé avec succès:', module.id);

    // Parser le contenu pour la réponse
    let parsedContent = {};
    let parsedTranslations = {};
    try {
      parsedContent = typeof module.content === 'string' ? JSON.parse(module.content) : (module.content || {});
      parsedTranslations = typeof module.translations === 'string' ? JSON.parse(module.translations) : (module.translations || {});
    } catch (e) {
      console.error('Erreur parsing contenu:', e);
    }

    const moduleResponse = {
      ...module,
      content: parsedContent,
      translations: parsedTranslations,
    };

    res.status(201).json(moduleResponse);
  } catch (error: any) {
    console.error('Create module error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de la création du module',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Reorder modules (DOIT être avant /:id pour éviter les conflits)
router.put('/reorder', authenticateToken, [
  body('livretId').notEmpty(),
  body('moduleOrders').isArray(),
], async (req: any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { livretId, moduleOrders } = req.body; // [{ id: '...', order: 1 }, ...]

    if (!Array.isArray(moduleOrders) || moduleOrders.length === 0) {
      return res.status(400).json({ message: 'moduleOrders doit être un tableau non vide' });
    }

    // Verify ownership
    const livret = await prisma.livret.findFirst({
      where: {
        id: livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Vérifier que tous les modules appartiennent au livret
    const moduleIds = moduleOrders.map((mo: any) => mo.id);
    const modules = await prisma.module.findMany({
      where: {
        id: { in: moduleIds },
        livretId: livretId
      }
    });

    if (modules.length !== moduleOrders.length) {
      return res.status(400).json({ message: 'Certains modules n\'appartiennent pas à ce livret' });
    }

    // Update all orders in a transaction
    await prisma.$transaction(async (tx) => {
      for (const mo of moduleOrders) {
        await tx.module.update({
          where: { id: mo.id },
          data: { order: mo.order }
        });
      }
    });

    res.json({ message: 'Ordre des modules mis à jour' });
  } catch (error: any) {
    console.error('Reorder modules error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Erreur lors de la réorganisation des modules',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update module
router.put('/:id', authenticateToken, [
  body('type').optional().notEmpty(),
], async (req: any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, name, content, translations, isActive, order } = req.body;

    // Verify ownership through livret
    const module = await prisma.module.findUnique({
      where: { id: req.params.id },
      include: { livret: true }
    });

    if (!module || module.livret.userId !== req.userId) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    // Récupérer les langues du livret
    let livretLanguages: string[] = ['fr'];
    try {
      if (module.livret.languages) {
        livretLanguages = JSON.parse(module.livret.languages as string);
      }
    } catch (e) {
      livretLanguages = ['fr'];
    }

    const sourceLang = 'fr'; // Langue source par défaut

    // Préparer le contenu à sauvegarder
    let contentToSave = content;
    let translationsToSave: Record<string, any> = {};

    // Si le contenu a changé, générer les traductions
    if (content !== undefined) {
      const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
      const existingContent = module.content ? (typeof module.content === 'string' ? JSON.parse(module.content) : module.content) : {};
      
      // Vérifier si le contenu a changé
      const contentChanged = JSON.stringify(contentObj) !== JSON.stringify(existingContent);
      
      // Récupérer les traductions existantes
      if (module.translations) {
        try {
          translationsToSave = typeof module.translations === 'string' 
            ? JSON.parse(module.translations) 
            : module.translations;
        } catch (e) {
          translationsToSave = {};
        }
      }

      // Si le contenu a changé ou si les traductions n'existent pas, traduire
      if (contentChanged || Object.keys(translationsToSave).length === 0) {
        console.log('🌐 Traduction automatique du module en cours...', {
          moduleId: req.params.id,
          moduleType: module.type,
          languages: livretLanguages,
        });

        // Extraire tous les textes du contenu
        const textsToTranslate = extractTexts(contentObj);
        console.log('📝 Textes à traduire:', textsToTranslate);

        // Traduire dans toutes les langues
        for (const targetLang of livretLanguages) {
          if (targetLang === sourceLang) {
            // Pour la langue source, utiliser le contenu original
            translationsToSave[targetLang] = contentObj;
          } else {
            // Traduire tous les textes
            const textTranslations: Record<string, string> = {};
            for (const text of textsToTranslate) {
              if (text && text.trim() !== '') {
                const translated = await translateText(text, sourceLang, targetLang);
                textTranslations[text] = translated;
                console.log(`  ✅ "${text}" → "${translated}" (${targetLang})`);
              }
            }
            
            // Remplacer les textes dans le contenu avec les traductions
            translationsToSave[targetLang] = replaceTexts(contentObj, textTranslations);
          }
        }

        console.log('✅ Traductions du module générées pour', Object.keys(translationsToSave).length, 'langues');
      }
    } else if (translations !== undefined) {
      // Si les traductions sont fournies directement, les utiliser
      translationsToSave = typeof translations === 'string' ? JSON.parse(translations) : translations;
    }

    // Convertir content et translations en JSON string si nécessaire
    const contentString = contentToSave !== undefined 
      ? (typeof contentToSave === 'string' ? contentToSave : JSON.stringify(contentToSave))
      : undefined;
    const translationsString = Object.keys(translationsToSave).length > 0
      ? JSON.stringify(translationsToSave)
      : undefined;

    const updatedModule = await prisma.module.update({
      where: { id: req.params.id },
      data: {
        ...(type && { type }),
        ...(name !== undefined && { name }),
        ...(contentString !== undefined && { content: contentString }),
        ...(translationsString !== undefined && { translations: translationsString }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      }
    });

    // Parser le contenu pour la réponse
    let parsedContent = {};
    let parsedTranslations = {};
    try {
      parsedContent = typeof updatedModule.content === 'string' ? JSON.parse(updatedModule.content) : (updatedModule.content || {});
      parsedTranslations = typeof updatedModule.translations === 'string' ? JSON.parse(updatedModule.translations) : (updatedModule.translations || {});
    } catch (e) {
      // Ignore parse errors
    }

    const moduleResponse = {
      ...updatedModule,
      content: parsedContent,
      translations: parsedTranslations,
    };

    res.json(moduleResponse);
  } catch (error: any) {
    console.error('Update module error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du module' });
  }
});

// Delete module
router.delete('/:id', authenticateToken, async (req: any, res: express.Response) => {
  try {
    // Verify ownership
    const module = await prisma.module.findUnique({
      where: { id: req.params.id },
      include: { livret: true }
    });

    if (!module || module.livret.userId !== req.userId) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    await prisma.module.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Module supprimé avec succès' });
  } catch (error: any) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du module' });
  }
});

export default router;
