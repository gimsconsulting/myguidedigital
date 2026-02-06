import express from 'express';
import axios from 'axios';
import { authenticateToken } from './auth';

const router = express.Router();

// Service de traduction avec Google Translate API
class TranslationService {
  // Méthode pour traduire avec Google Translate
  async translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }

    if (sourceLang === targetLang) {
      return text;
    }

    // Vérifier que la clé API est configurée
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    console.log('🔑 Vérification clé API:', apiKey ? `Clé présente (${apiKey.substring(0, 10)}...)` : 'Clé ABSENTE');
    
    if (!apiKey) {
      console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non configurée, retour du texte original');
      return text;
    }

    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      console.log('🌐 Appel Google Translate:', { text, sourceLang, targetLang });
      
      // Utiliser axios pour l'appel API (plus fiable que fetch)
      const response = await axios.post(url, {
        q: text,
        source: sourceLang,
        target: targetLang,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Réponse Google Translate status:', response.status);

      const translatedText = response.data.data.translations[0].translatedText;
      console.log('✅ Traduction réussie:', { original: text, translated: translatedText });
      return translatedText;
    } catch (error: any) {
      console.error('❌ Erreur Google Translate:', error.response?.data || error.message);
      if (error.response?.data?.error) {
        console.error('Détails erreur:', JSON.stringify(error.response.data.error, null, 2));
      }
      // En cas d'erreur, retourner le texte original
      return text;
    }
  }

  // Méthode principale (utilise Google Translate)
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    return this.translateWithGoogle(text, sourceLang, targetLang);
  }

  async translateBatch(texts: string[], sourceLang: string, targetLang: string): Promise<string[]> {
    if (texts.length === 0) {
      return [];
    }

    if (sourceLang === targetLang) {
      return texts;
    }

    // Vérifier que la clé API est configurée
    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      console.warn('GOOGLE_TRANSLATE_API_KEY non configurée, retour des textes originaux');
      return texts;
    }

    try {
      const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      
      // Traduire tous les textes en une seule requête avec axios
      const response = await axios.post(url, {
        q: texts,
        source: sourceLang,
        target: targetLang,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.data.translations.map((t: any) => t.translatedText);
    } catch (error: any) {
      console.error('Erreur Google Translate (batch):', error.response?.data || error.message);
      return texts;
    }
  }
}

const translationService = new TranslationService();

// Route pour traduire un texte
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { text, sourceLang = 'fr', targetLang = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Le texte à traduire est requis' });
    }

    if (!sourceLang || !targetLang) {
      return res.status(400).json({ message: 'Les langues source et cible sont requises' });
    }

    const translatedText = await translationService.translate(text, sourceLang, targetLang);

    res.json({
      translatedText,
      sourceLang,
      targetLang,
    });
  } catch (error: any) {
    console.error('Erreur lors de la traduction:', error);
    res.status(500).json({ message: 'Erreur lors de la traduction' });
  }
});

// Route pour traduire plusieurs textes en une seule requête
router.post('/batch', authenticateToken, async (req: any, res) => {
  try {
    const { texts, sourceLang = 'fr', targetLang = 'en' } = req.body;

    if (!Array.isArray(texts)) {
      return res.status(400).json({ message: 'Les textes doivent être un tableau' });
    }

    if (!sourceLang || !targetLang) {
      return res.status(400).json({ message: 'Les langues source et cible sont requises' });
    }

    const translations = await translationService.translateBatch(texts, sourceLang, targetLang);

    res.json({
      translations,
      sourceLang,
      targetLang,
    });
  } catch (error: any) {
    console.error('Erreur lors de la traduction multiple:', error);
    res.status(500).json({ message: 'Erreur lors de la traduction multiple' });
  }
});

export default router;
