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

// Endpoint public : envoyer un message au chatbot pour un livret donné
// POST /api/chat/:livretId
router.post('/:livretId', chatLimiter, async (req: express.Request, res: express.Response) => {
  try {
    const { livretId } = req.params;
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

    // Récupérer le livret avec ses informations
    const livret = await prisma.livret.findUnique({
      where: { id: livretId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        modules: {
          where: { isActive: true },
          select: {
            type: true,
            name: true,
            content: true,
          }
        }
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Récupérer les documents de contexte du livret
    const chatDocuments = await prisma.chatDocument.findMany({
      where: { livretId },
      select: {
        title: true,
        content: true,
      }
    });

    // Logs de diagnostic
    console.log(`💬 [CHAT] Livret: "${livret.name}" (ID: ${livretId})`);
    console.log(`💬 [CHAT] Modules actifs: ${livret.modules?.length || 0}`);
    console.log(`💬 [CHAT] Documents chat: ${chatDocuments.length}`);
    if (chatDocuments.length > 0) {
      chatDocuments.forEach((doc, i) => {
        console.log(`💬 [CHAT]   Doc ${i + 1}: "${doc.title}" (${doc.content.length} chars)`);
      });
    } else {
      console.log(`💬 [CHAT] ⚠️ Aucun document trouvé pour ce livret`);
    }

    // Construire le contexte à partir des documents et des modules
    let contextParts: string[] = [];

    // Informations du livret
    contextParts.push(`Nom du logement : ${livret.name}`);
    if (livret.address) {
      contextParts.push(`Adresse : ${livret.address}`);
    }
    if (livret.user) {
      contextParts.push(`Hôte : ${livret.user.firstName || ''} ${livret.user.lastName || ''}`);
    }

    // Ajouter les informations des modules actifs
    if (livret.modules && livret.modules.length > 0) {
      contextParts.push('\n--- INFORMATIONS DES MODULES DU GUIDE ---');
      for (const mod of livret.modules) {
        if (mod.content) {
          let contentStr = '';
          try {
            // Le contenu des modules peut être un JSON stringifié
            const parsed = typeof mod.content === 'string' ? JSON.parse(mod.content) : mod.content;
            contentStr = JSON.stringify(parsed, null, 0);
          } catch {
            contentStr = String(mod.content);
          }
          contextParts.push(`\n[Module ${mod.name || mod.type}]:\n${contentStr}`);
        }
      }
    }

    // Ajouter les documents personnalisés de l'hôte
    if (chatDocuments.length > 0) {
      contextParts.push('\n--- DOCUMENTS ADDITIONNELS DE L\'HÔTE ---');
      for (const doc of chatDocuments) {
        contextParts.push(`\n[${doc.title}]:\n${doc.content}`);
      }
    }

    const contextText = contextParts.join('\n');

    // Limiter le contexte à ~12000 caractères pour rester dans les limites de tokens
    const maxContextLength = 12000;
    const truncatedContext = contextText.length > maxContextLength 
      ? contextText.substring(0, maxContextLength) + '\n\n[... contexte tronqué pour des raisons de longueur ...]'
      : contextText;

    console.log(`💬 [CHAT] Contexte total: ${contextText.length} chars (tronqué: ${contextText.length > maxContextLength})`);
    console.log(`💬 [CHAT] Message utilisateur: "${message.trim().substring(0, 100)}"`);
    // Afficher les premières lignes du contexte pour vérifier
    console.log(`💬 [CHAT] Début du contexte:\n${truncatedContext.substring(0, 500)}...`);

    // Construire les messages pour l'API OpenAI
    const systemPrompt = `Tu es un assistant virtuel serviable et amical pour un logement de vacances. Tu aides les voyageurs à trouver des informations sur leur séjour.

RÈGLES IMPORTANTES :
1. Réponds UNIQUEMENT à partir des informations fournies dans le contexte ci-dessous.
2. Si tu ne trouves pas l'information demandée dans le contexte, dis poliment que tu n'as pas cette information et suggère au voyageur de contacter directement l'hôte.
3. Sois concis, amical et utile. Utilise des emojis quand c'est approprié.
4. Réponds dans la langue utilisée par le voyageur.
5. Ne révèle JAMAIS que tu es un modèle d'IA. Présente-toi comme l'assistant du logement.
6. Ne partage JAMAIS d'informations sensibles (mots de passe, codes d'accès) sauf si elles sont explicitement dans les modules du guide.

CONTEXTE DU LOGEMENT :
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
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 secondes de timeout
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
    console.error('❌ Chat error:', error.response?.data || error.message);
    
    // Gestion des erreurs spécifiques
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
