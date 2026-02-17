import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { chatLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const prisma = new PrismaClient();

// Interface pour les messages de chat
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Endpoint public : envoyer un message au chatbot de l'application
// POST /api/app-chat
router.post('/', chatLimiter, async (req: express.Request, res: express.Response) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Le message est requis' });
    }

    // Vérifier que la clé API OpenAI est configurée
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY non configurée');
      return res.status(500).json({ 
        message: 'Le service de chat n\'est pas configuré. Contactez l\'administrateur.',
        fallback: true
      });
    }

    // Récupérer la configuration du chatbot
    const config = await prisma.appChatbotConfig.findFirst();

    if (!config || !config.isActive) {
      return res.status(503).json({ 
        message: 'Le chatbot n\'est pas disponible pour le moment.',
        fallback: true
      });
    }

    if (!config.context || config.context.trim() === '') {
      return res.status(503).json({ 
        message: 'Le chatbot n\'est pas encore configuré. Revenez bientôt !',
        fallback: true
      });
    }

    console.log(`💬 [APP-CHAT] Message reçu: "${message.trim().substring(0, 100)}"`);
    console.log(`💬 [APP-CHAT] Contexte admin: ${config.context.length} chars`);

    // Limiter le contexte pour éviter de dépasser les limites de tokens
    const maxContextLength = 60000;
    const truncatedContext = config.context.length > maxContextLength 
      ? config.context.substring(0, maxContextLength) + '\n\n[... contexte tronqué ...]'
      : config.context;

    // Construire les messages pour l'API OpenAI
    const systemPrompt = `Tu es l'assistant commercial de My Guide Digital, une plateforme de création de livrets d'accueil digitaux pour les professionnels du tourisme (locations courtes durées, hôtels, campings, conciergeries).

RÈGLES IMPORTANTES :
1. Tu dois répondre en utilisant UNIQUEMENT les informations fournies dans le contexte ci-dessous. Ce sont les informations que l'administrateur de My Guide Digital a préparées pour toi.
2. Sois professionnel, chaleureux et enthousiaste. Tu représentes la marque My Guide Digital.
3. Ton objectif principal est de donner envie au prospect de demander une démonstration de l'application.
4. Réponds dans la langue utilisée par le prospect.
5. Ne révèle JAMAIS que tu es un modèle d'IA. Présente-toi comme l'assistant My Guide Digital.
6. Si le prospect demande une démo, guide-le vers la prise de contact (email, formulaire, etc.) selon les informations du contexte.
7. Utilise des emojis quand c'est approprié pour rendre la conversation plus conviviale.
8. Si tu ne connais pas la réponse à une question, oriente le prospect vers l'email de contact.

CONTEXTE ET INFORMATIONS DE MY GUIDE DIGITAL :
${truncatedContext}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Ajouter l'historique de conversation (limité aux 10 derniers messages)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      }
    }

    // Ajouter le message actuel de l'utilisateur
    messages.push({ role: 'user', content: message.trim() });

    // Appeler l'API OpenAI
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const assistantMessage = openaiResponse.data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      console.error('❌ Réponse OpenAI invalide:', openaiResponse.data);
      return res.status(500).json({ 
        message: 'Erreur lors de la génération de la réponse',
        fallback: true
      });
    }

    console.log(`💬 [APP-CHAT] Réponse générée (${openaiResponse.data.usage?.total_tokens} tokens)`);

    // Retourner la réponse
    res.json({
      response: assistantMessage.trim(),
      usage: {
        promptTokens: openaiResponse.data.usage?.prompt_tokens,
        completionTokens: openaiResponse.data.usage?.completion_tokens,
        totalTokens: openaiResponse.data.usage?.total_tokens,
      }
    });

  } catch (error: any) {
    console.error('❌ App chat error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
        fallback: true
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        message: 'Erreur de configuration du service de chat.',
        fallback: true
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        message: 'Le service met trop de temps à répondre. Veuillez réessayer.',
        fallback: true
      });
    }

    res.status(500).json({ 
      message: error.message || 'Erreur lors du traitement du message',
      fallback: true
    });
  }
});

export default router;
