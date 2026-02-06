/**
 * Service de traduction automatique pour le contenu dynamique
 * Utilise l'API backend pour traduire le contenu des livrets et modules
 */

import api from './api';
import { translateApi } from './api';

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

class TranslationService {
  /**
   * Traduit un texte d'une langue source vers une langue cible
   */
  async translateText(
    text: string,
    sourceLang: string = 'fr',
    targetLang: string = 'en'
  ): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }

    // Si la langue source et cible sont identiques, retourner le texte original
    if (sourceLang === targetLang) {
      return text;
    }

    try {
      console.log('🌐 Appel traduction:', { text, sourceLang, targetLang });
      const response = await translateApi.translate({
        text,
        sourceLang,
        targetLang,
      });

      console.log('✅ Réponse traduction:', response.data);
      return response.data.translatedText;
    } catch (error: any) {
      console.error('❌ Erreur lors de la traduction:', error);
      console.error('Détails erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      // Propager l'erreur pour que l'interface puisse l'afficher
      throw error;
    }
  }

  /**
   * Traduit plusieurs textes en une seule requête
   */
  async translateMultiple(
    texts: string[],
    sourceLang: string = 'fr',
    targetLang: string = 'en'
  ): Promise<string[]> {
    if (texts.length === 0) {
      return [];
    }

    if (sourceLang === targetLang) {
      return texts;
    }

    try {
      const response = await translateApi.translateBatch({
        texts,
        sourceLang,
        targetLang,
      });

      return response.data.translations;
    } catch (error) {
      console.error('Erreur lors de la traduction multiple:', error);
      return texts;
    }
  }

  /**
   * Traduit le contenu d'un livret dans toutes les langues sélectionnées
   */
  async translateLivretContent(
    livret: {
      welcomeTitle?: string;
      welcomeSubtitle?: string;
      address?: string;
    },
    sourceLang: string = 'fr',
    targetLanguages: string[] = []
  ): Promise<Record<string, { welcomeTitle?: string; welcomeSubtitle?: string; address?: string }>> {
    const translations: Record<string, any> = {};

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLang) {
        translations[targetLang] = livret;
        continue;
      }

      const [welcomeTitle, welcomeSubtitle, address] = await this.translateMultiple(
        [
          livret.welcomeTitle || '',
          livret.welcomeSubtitle || '',
          livret.address || '',
        ],
        sourceLang,
        targetLang
      );

      translations[targetLang] = {
        welcomeTitle: welcomeTitle || livret.welcomeTitle,
        welcomeSubtitle: welcomeSubtitle || livret.welcomeSubtitle,
        address: address || livret.address,
      };
    }

    return translations;
  }
}

export const translationService = new TranslationService();
