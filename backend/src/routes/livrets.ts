import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';
// import QRCode from 'qrcode'; // Temporairement désactivé, on génère juste l'URL
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
    // Ne logger qu'une seule fois au démarrage, pas à chaque appel
    if (!translateText.warned) {
      console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non configurée - Les traductions seront désactivées');
      translateText.warned = true;
    }
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

// Get all livrets for user
router.get('/', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const livrets = await prisma.livret.findMany({
      where: { userId: req.userId },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { modules: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convertir les langues et traductions JSON string en objets pour le frontend
    const livretsWithParsedData = livrets.map(livret => {
      let parsedLanguages = ['fr'];
      let parsedTranslations = {};
      
      try {
        parsedLanguages = livret.languages ? JSON.parse(livret.languages as string) : ['fr'];
      } catch (e) {
        parsedLanguages = ['fr'];
      }
      
      try {
        parsedTranslations = livret.translations ? JSON.parse(livret.translations as string) : {};
      } catch (e) {
        parsedTranslations = {};
      }
      
      return {
        ...livret,
        languages: parsedLanguages,
        translations: parsedTranslations,
      };
    });

    res.json(livretsWithParsedData);
  } catch (error: any) {
    console.error('Get livrets error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livrets' });
  }
});

// Get single livret
router.get('/:id', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const livret = await prisma.livret.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        }
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Convertir les langues et traductions JSON string en objets
    let parsedLanguages = ['fr'];
    let parsedTranslations = {};
    
    try {
      parsedLanguages = livret.languages ? JSON.parse(livret.languages as string) : ['fr'];
    } catch (e) {
      parsedLanguages = ['fr'];
    }
    
    try {
      parsedTranslations = livret.translations ? JSON.parse(livret.translations as string) : {};
    } catch (e) {
      parsedTranslations = {};
    }

    const livretWithParsedData = {
      ...livret,
      languages: parsedLanguages,
      translations: parsedTranslations,
    };

    res.json(livretWithParsedData);
  } catch (error: any) {
    console.error('Get livret error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du livret' });
  }
});

// Create livret
router.post('/', authenticateToken, [
  body('name').notEmpty().trim(),
], async (req: any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, languages } = req.body;

    // Generate QR code URL (on génère juste l'URL, pas l'image pour l'instant)
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Déterminer l'URL de base pour le QR code selon l'environnement
    let qrBaseUrl = process.env.QR_CODE_BASE_URL;
    if (!qrBaseUrl) {
      // En production, utiliser le domaine de production
      if (process.env.NODE_ENV === 'production') {
        qrBaseUrl = 'https://app.myguidedigital.com/guide';
      } else {
        // En développement, utiliser l'IP locale par défaut
        qrBaseUrl = 'http://192.168.0.126:3000/guide';
      }
    }
    const qrCodeUrl = `${qrBaseUrl}/${uniqueId}`;
    
    // Convertir le tableau de langues en JSON string pour SQLite
    const languagesArray = languages || ['fr'];
    const languagesJson = JSON.stringify(languagesArray);

    console.log('Création livret avec:', { name, address, userId: req.userId, languagesJson, qrCodeUrl });

    const livret = await prisma.livret.create({
      data: {
        name,
        address: address || null,
        userId: req.userId,
        languages: languagesJson,
        qrCode: qrCodeUrl,
      },
      include: {
        modules: true
      }
    });

    console.log('Livret créé avec succès:', livret.id);

    // Convertir les langues JSON string en tableau pour la réponse
    const livretWithParsedLanguages = {
      ...livret,
      languages: livret.languages ? JSON.parse(livret.languages as string) : ['fr']
    };

    res.status(201).json(livretWithParsedLanguages);
  } catch (error: any) {
    console.error('Create livret error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de la création du livret',
      error: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update livret
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().trim(),
], async (req: any, res: express.Response) => {
  console.log('🔄 ===== DÉBUT MISE À JOUR LIVRET =====');
  console.log('📥 Requête PUT reçue pour livret:', req.params.id);
  console.log('📦 Données reçues:', {
    name: req.body.name,
    welcomeTitle: req.body.welcomeTitle,
    welcomeSubtitle: req.body.welcomeSubtitle,
    languages: req.body.languages,
  });
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Erreurs de validation:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, welcomeTitle, welcomeSubtitle, languages, isActive, ...personalization } = req.body;

    // Verify ownership
    console.log('🔍 Recherche du livret dans la base de données...');
    const existingLivret = await prisma.livret.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!existingLivret) {
      console.error('❌ Livret non trouvé');
      return res.status(404).json({ message: 'Livret non trouvé' });
    }
    
    console.log('✅ Livret trouvé:', {
      id: existingLivret.id,
      name: existingLivret.name,
      hasTranslations: !!existingLivret.translations,
    });

    // Préparer les langues avec gestion d'erreur robuste
    let languagesArray: string[] = ['fr'];
    
    if (languages) {
      try {
        if (typeof languages === 'string') {
          languagesArray = JSON.parse(languages);
        } else if (Array.isArray(languages)) {
          languagesArray = languages;
        } else {
          languagesArray = ['fr'];
        }
      } catch (e) {
        console.error('❌ Erreur parsing languages depuis req.body:', e);
        languagesArray = ['fr'];
      }
    } else if (existingLivret.languages) {
      try {
        if (typeof existingLivret.languages === 'string') {
          languagesArray = JSON.parse(existingLivret.languages);
        } else if (Array.isArray(existingLivret.languages)) {
          languagesArray = existingLivret.languages;
        } else {
          languagesArray = ['fr'];
        }
      } catch (e) {
        console.error('❌ Erreur parsing languages depuis existingLivret:', e);
        languagesArray = ['fr'];
      }
    }
    
    // S'assurer que languagesArray est toujours un tableau valide
    if (!Array.isArray(languagesArray) || languagesArray.length === 0) {
      console.warn('⚠️ languagesArray invalide, utilisation de ["fr"] par défaut');
      languagesArray = ['fr'];
    }
    
    const languagesJson = JSON.stringify(languagesArray);
    console.log('✅ Langues préparées:', { languagesArray, languagesJson });

    // Traduire automatiquement welcomeTitle et welcomeSubtitle dans toutes les langues
    let translations: Record<string, { welcomeTitle?: string; welcomeSubtitle?: string }> = {};
    const sourceLang = 'fr'; // Langue source par défaut

    // Récupérer les traductions existantes si elles existent
    if (existingLivret.translations && existingLivret.translations.trim() !== '') {
      try {
        translations = JSON.parse(existingLivret.translations as string);
        console.log('📚 Traductions existantes chargées:', Object.keys(translations));
      } catch (e) {
        console.warn('⚠️ Erreur parsing traductions existantes:', e);
        translations = {};
      }
    } else {
      console.log('📝 Aucune traduction existante, création d\'un nouvel objet');
      translations = {};
    }

    // Déterminer les textes à traduire
    const titleToTranslate = welcomeTitle !== undefined ? welcomeTitle : existingLivret.welcomeTitle || '';
    const subtitleToTranslate = welcomeSubtitle !== undefined ? welcomeSubtitle : existingLivret.welcomeSubtitle || '';

    // Vérifier si les textes ont changé
    const titleChanged = welcomeTitle !== undefined && welcomeTitle !== existingLivret.welcomeTitle;
    const subtitleChanged = welcomeSubtitle !== undefined && welcomeSubtitle !== existingLivret.welcomeSubtitle;
    const shouldRetranslate = titleChanged || subtitleChanged;

    // Vérifier si les traductions existent dans la base de données
    const hasExistingTranslations = existingLivret.translations && existingLivret.translations.trim() !== '';
    let existingTranslationsParsed = {};
    if (hasExistingTranslations) {
      try {
        existingTranslationsParsed = JSON.parse(existingLivret.translations as string);
      } catch (e) {
        existingTranslationsParsed = {};
      }
    }

    // Si les textes ont changé OU si les traductions n'existent pas, traduire
    // FORCER la traduction si les traductions n'existent pas ou sont vides
    const needsTranslation = shouldRetranslate || !hasExistingTranslations || Object.keys(existingTranslationsParsed).length === 0;
    
    console.log('🔍 État des traductions:', {
      titleChanged,
      subtitleChanged,
      shouldRetranslate,
      hasExistingTranslations,
      existingTranslationsCount: Object.keys(existingTranslationsParsed).length,
      needsTranslation,
      languagesArray,
      titleToTranslate,
      subtitleToTranslate,
    });

    // TOUJOURS générer les traductions si on a des textes et des langues
    // Sauf si les traductions existent déjà ET que les textes n'ont pas changé
    const shouldGenerateTranslations = (titleToTranslate || subtitleToTranslate) && 
                                       languagesArray.length > 0 && 
                                       (shouldRetranslate || !hasExistingTranslations || Object.keys(existingTranslationsParsed).length === 0);
    
    console.log('🎯 Décision traduction:', {
      shouldGenerateTranslations,
      hasText: !!(titleToTranslate || subtitleToTranslate),
      hasLanguages: languagesArray.length > 0,
    });

    if (shouldGenerateTranslations) {
      console.log('🌐 Traduction automatique en cours...', { 
        languages: languagesArray, 
        titleToTranslate, 
        subtitleToTranslate,
        shouldRetranslate,
        existingTranslations: Object.keys(translations),
      });

      // Traduire dans toutes les langues sélectionnées avec gestion d'erreur
      try {
        for (const targetLang of languagesArray) {
          if (targetLang === sourceLang) {
            // Pour la langue source, utiliser le texte original
            translations[targetLang] = {
              welcomeTitle: titleToTranslate || undefined,
              welcomeSubtitle: subtitleToTranslate || undefined,
            };
          } else {
            // Si la traduction existe déjà et que les textes n'ont pas changé, la conserver
            if (!shouldRetranslate && translations[targetLang]) {
              console.log(`ℹ️ Traduction existante conservée pour ${targetLang}`);
              continue;
            }

            // Traduire vers la langue cible avec gestion d'erreur
            try {
              const [translatedTitle, translatedSubtitle] = await Promise.all([
                titleToTranslate ? translateText(titleToTranslate, sourceLang, targetLang) : Promise.resolve(''),
                subtitleToTranslate ? translateText(subtitleToTranslate, sourceLang, targetLang) : Promise.resolve(''),
              ]);

              translations[targetLang] = {
                welcomeTitle: translatedTitle || undefined,
                welcomeSubtitle: translatedSubtitle || undefined,
              };

              console.log(`✅ Traduit vers ${targetLang}:`, {
                title: translatedTitle,
                subtitle: translatedSubtitle,
              });
            } catch (translateError: any) {
              console.error(`❌ Erreur traduction pour ${targetLang}:`, translateError);
              // En cas d'erreur de traduction, utiliser le texte original pour cette langue
              translations[targetLang] = {
                welcomeTitle: titleToTranslate || undefined,
                welcomeSubtitle: subtitleToTranslate || undefined,
              };
            }
          }
        }
      } catch (error: any) {
        console.error('❌ Erreur lors de la boucle de traduction:', error);
        // Continuer même en cas d'erreur globale
      }
    } else if (languages && languagesArray.length > 0 && (titleToTranslate || subtitleToTranslate)) {
      // Si seulement les langues ont changé, traduire les textes existants dans les nouvelles langues
      try {
        for (const targetLang of languagesArray) {
          if (targetLang === sourceLang) {
            translations[targetLang] = {
              welcomeTitle: titleToTranslate || undefined,
              welcomeSubtitle: subtitleToTranslate || undefined,
            };
          } else if (!translations[targetLang]) {
            // Traduire seulement si la traduction n'existe pas encore
            console.log(`🌐 Traduction manquante pour ${targetLang}, génération en cours...`);
            try {
              const [translatedTitle, translatedSubtitle] = await Promise.all([
                titleToTranslate ? translateText(titleToTranslate, sourceLang, targetLang) : Promise.resolve(''),
                subtitleToTranslate ? translateText(subtitleToTranslate, sourceLang, targetLang) : Promise.resolve(''),
              ]);

              translations[targetLang] = {
                welcomeTitle: translatedTitle || undefined,
                welcomeSubtitle: translatedSubtitle || undefined,
              };

              console.log(`✅ Traduit vers ${targetLang}:`, {
                title: translatedTitle,
                subtitle: translatedSubtitle,
              });
            } catch (translateError: any) {
              console.error(`❌ Erreur traduction pour ${targetLang}:`, translateError);
              // En cas d'erreur de traduction, utiliser le texte original
              translations[targetLang] = {
                welcomeTitle: titleToTranslate || undefined,
                welcomeSubtitle: subtitleToTranslate || undefined,
              };
            }
          }
        }
      } catch (error: any) {
        console.error('❌ Erreur lors de la boucle de traduction (nouvelles langues):', error);
        // Continuer même en cas d'erreur
      }
    }

    // S'assurer qu'on a au moins les traductions pour la langue source
    if (!translations[sourceLang] && (titleToTranslate || subtitleToTranslate)) {
      translations[sourceLang] = {
        welcomeTitle: titleToTranslate || undefined,
        welcomeSubtitle: subtitleToTranslate || undefined,
      };
    }

    const translationsJson = JSON.stringify(translations);
    
    console.log('💾 Sauvegarde des traductions:', {
      translationsCount: Object.keys(translations).length,
      languages: languagesArray,
      translationsKeys: Object.keys(translations),
      translationsJson: translationsJson.substring(0, 200) + '...',
    });

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (welcomeTitle !== undefined) updateData.welcomeTitle = welcomeTitle;
    if (welcomeSubtitle !== undefined) updateData.welcomeSubtitle = welcomeSubtitle;
    if (languages) updateData.languages = languagesJson;
    if (translationsJson) updateData.translations = translationsJson;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Personnalisation
    if (personalization.showProfilePhoto !== undefined) updateData.showProfilePhoto = personalization.showProfilePhoto;
    if (personalization.titleFont) updateData.titleFont = personalization.titleFont;
    if (personalization.titleColor) updateData.titleColor = personalization.titleColor;
    if (personalization.subtitleColor) updateData.subtitleColor = personalization.subtitleColor;
    if (personalization.tileColor) updateData.tileColor = personalization.tileColor;
    if (personalization.iconColor) updateData.iconColor = personalization.iconColor;
    if (personalization.backgroundImage) updateData.backgroundImage = personalization.backgroundImage;

    console.log('💾 Données de mise à jour:', {
      keys: Object.keys(updateData),
      languagesJson,
      hasTranslations: !!updateData.translations
    });

    const livret = await prisma.livret.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        modules: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Convertir les langues et traductions JSON string en objets
    let parsedLanguages = ['fr'];
    let parsedTranslations = {};
    
    try {
      parsedLanguages = livret.languages ? JSON.parse(livret.languages as string) : ['fr'];
    } catch (e) {
      parsedLanguages = ['fr'];
    }
    
    try {
      parsedTranslations = livret.translations ? JSON.parse(livret.translations as string) : {};
    } catch (e) {
      parsedTranslations = {};
    }

    const livretWithParsedData = {
      ...livret,
      languages: parsedLanguages,
      translations: parsedTranslations,
    };

    res.json(livretWithParsedData);
  } catch (error: any) {
    console.error('Update livret error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du livret' });
  }
});

// Delete livret
router.delete('/:id', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const livret = await prisma.livret.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    await prisma.livret.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Livret supprimé avec succès' });
  } catch (error: any) {
    console.error('Delete livret error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du livret' });
  }
});

// Duplicate livret
router.post('/:id/duplicate', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const originalLivret = await prisma.livret.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        modules: true
      }
    });

    if (!originalLivret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Generate new QR code
    // Déterminer l'URL de base pour le QR code selon l'environnement
    let qrBaseUrl = process.env.QR_CODE_BASE_URL;
    if (!qrBaseUrl) {
      // En production, utiliser le domaine de production
      if (process.env.NODE_ENV === 'production') {
        qrBaseUrl = 'https://app.myguidedigital.com/guide';
      } else {
        // En développement, utiliser l'IP locale par défaut
        qrBaseUrl = 'http://192.168.0.126:3000/guide';
      }
    }
    const qrCodeUrl = `${qrBaseUrl}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Les langues sont déjà en JSON string, on peut les réutiliser directement
    const duplicatedLivret = await prisma.livret.create({
      data: {
        name: `${originalLivret.name} (Copie)`,
        address: originalLivret.address,
        userId: req.userId,
        welcomeTitle: originalLivret.welcomeTitle,
        welcomeSubtitle: originalLivret.welcomeSubtitle,
        backgroundImage: originalLivret.backgroundImage,
        showProfilePhoto: originalLivret.showProfilePhoto,
        titleFont: originalLivret.titleFont,
        titleColor: originalLivret.titleColor,
        subtitleColor: originalLivret.subtitleColor,
        tileColor: originalLivret.tileColor,
        iconColor: originalLivret.iconColor,
        languages: originalLivret.languages || JSON.stringify(['fr']),
        translations: originalLivret.translations || null,
        qrCode: qrCodeUrl,
        modules: {
          create: originalLivret.modules.map(module => ({
            type: module.type,
            name: module.name,
            isActive: module.isActive,
            order: module.order,
            content: module.content,
            translations: module.translations,
          }))
        }
      },
      include: {
        modules: true
      }
    });

    // Convertir les langues et traductions JSON string en objets
    let parsedLanguages = ['fr'];
    let parsedTranslations = {};
    
    try {
      parsedLanguages = duplicatedLivret.languages ? JSON.parse(duplicatedLivret.languages as string) : ['fr'];
    } catch (e) {
      parsedLanguages = ['fr'];
    }
    
    try {
      parsedTranslations = duplicatedLivret.translations ? JSON.parse(duplicatedLivret.translations as string) : {};
    } catch (e) {
      parsedTranslations = {};
    }

    const duplicatedLivretWithParsedData = {
      ...duplicatedLivret,
      languages: parsedLanguages,
      translations: parsedTranslations,
    };

    res.status(201).json(duplicatedLivretWithParsedData);
  } catch (error: any) {
    console.error('Duplicate livret error:', error);
    res.status(500).json({ message: 'Erreur lors de la duplication du livret' });
  }
});

// Get public livret (for traveler view)
router.get('/public/:qrCode', async (req: express.Request, res: express.Response) => {
  try {
    const qrCodeParam = req.params.qrCode;
    console.log('🔍 Recherche livret avec QR code:', qrCodeParam);
    
    // Chercher le livret de plusieurs façons pour être sûr de le trouver
    let livret = await prisma.livret.findFirst({
      where: {
        OR: [
          // Si le qrCode contient le paramètre (URL complète)
          { qrCode: { contains: qrCodeParam } },
          // Si le qrCode se termine par le paramètre (ID à la fin)
          { qrCode: { endsWith: qrCodeParam } },
          // Si le qrCode commence par le paramètre (ID au début - peu probable mais on vérifie)
          { qrCode: { startsWith: qrCodeParam } },
        ],
        isActive: true
      },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            profilePhoto: true
          }
        }
      }
    });

    // Si pas trouvé avec la recherche normale, essayer de chercher juste avec l'ID
    if (!livret) {
      console.log('⚠️ Livret non trouvé avec recherche normale, tentative avec ID seul...');
      // Essayer de trouver avec juste l'ID (au cas où l'URL a changé mais l'ID est le même)
      const idOnly = qrCodeParam.split('/').pop() || qrCodeParam;
      livret = await prisma.livret.findFirst({
        where: {
          OR: [
            { qrCode: { contains: idOnly } },
            { qrCode: { endsWith: idOnly } },
          ],
          isActive: true
        },
        include: {
          modules: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              profilePhoto: true
            }
          }
        }
      });
    }

    if (!livret) {
      console.error('❌ Livret non trouvé avec QR code:', qrCodeParam);
      return res.status(404).json({ message: 'Livret non trouvé' });
    }
    
    console.log('✅ Livret trouvé:', { id: livret.id, name: livret.name });

    // Record statistics
    await prisma.statistic.create({
      data: {
        livretId: livret.id,
        moduleType: null, // Global opening
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }
    });

    // Parser les modules (content et translations)
    const modulesWithParsedContent = livret.modules.map(module => {
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

    // Convertir les langues et traductions JSON string en objets
    let parsedLanguages = ['fr'];
    let parsedTranslations = {};
    
    console.log('📥 Livret récupéré depuis DB:', {
      id: livret.id,
      hasTranslations: !!livret.translations,
      translationsType: typeof livret.translations,
      translationsValue: livret.translations ? (livret.translations as string).substring(0, 100) : 'null',
    });
    
    try {
      parsedLanguages = livret.languages 
        ? (typeof livret.languages === 'string' ? JSON.parse(livret.languages) : livret.languages)
        : ['fr'];
    } catch (e) {
      parsedLanguages = ['fr'];
    }
    
    try {
      if (livret.translations) {
        parsedTranslations = typeof livret.translations === 'string' 
          ? JSON.parse(livret.translations) 
          : livret.translations;
        console.log('✅ Traductions parsées:', {
          keys: Object.keys(parsedTranslations),
          count: Object.keys(parsedTranslations).length,
        });
      } else {
        console.warn('⚠️ Aucune traduction dans la base de données pour ce livret');
        parsedTranslations = {};
      }
    } catch (e) {
      console.error('❌ Erreur parsing translations:', e);
      parsedTranslations = {};
    }

    const livretWithParsedData = {
      ...livret,
      languages: parsedLanguages,
      translations: parsedTranslations,
      modules: modulesWithParsedContent,
    };

    console.log('📤 Envoi livret avec traductions:', {
      hasTranslations: !!livretWithParsedData.translations,
      translationsKeys: Object.keys(livretWithParsedData.translations),
    });

    res.json(livretWithParsedData);
  } catch (error: any) {
    console.error('Get public livret error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du livret' });
  }
});

export default router;
