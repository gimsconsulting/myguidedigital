'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([]);
  const [inputValue, setInputValue] = useState('');

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    
    // Réponses contextuelles selon le message
    if (message.includes('bonjour') || message.includes('salut') || message.includes('hello')) {
      return 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?';
    }
    if (message.includes('wifi') || message.includes('internet') || message.includes('connexion')) {
      return 'Pour les informations Wi-Fi, consultez le module "Wi-fi" dans le guide. Vous y trouverez le mot de passe et les instructions de connexion.';
    }
    if (message.includes('arrivée') || message.includes('check-in') || message.includes('arriver')) {
      return 'Pour les informations sur votre arrivée, consultez le module "Infos arrivée" dans le guide.';
    }
    if (message.includes('départ') || message.includes('check-out') || message.includes('partir')) {
      return 'Pour les informations sur votre départ, consultez le module "Infos départ" dans le guide.';
    }
    if (message.includes('merci') || message.includes('thanks')) {
      return 'De rien ! N\'hésitez pas si vous avez d\'autres questions. 😊';
    }
    if (message.includes('urgence') || message.includes('urgent') || message.includes('problème')) {
      return 'Pour toute urgence, consultez le module "Sécurité et secours" dans le guide ou contactez directement votre hôte.';
    }
    
    // Réponse par défaut avec variations
    const defaultResponses = [
      'Merci pour votre message ! Je suis là pour vous aider. Pour plus d\'informations, consultez les différents modules du guide.',
      'Je comprends votre question. N\'hésitez pas à explorer les modules du guide pour trouver les informations dont vous avez besoin.',
      'Pour toute question spécifique, je vous recommande de consulter les modules correspondants dans le guide. Si besoin, contactez directement votre hôte.',
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = { text: inputValue, sender: 'user' as const };
    setMessages([...messages, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Réponse automatique avec délai réaliste
    setTimeout(() => {
      const botMessage = {
        text: getBotResponse(currentInput),
        sender: 'bot' as const,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800 + Math.random() * 400); // Délai variable entre 800ms et 1200ms
  };

  return (
    <>
      {/* Bouton flottant du chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110"
        aria-label="Ouvrir le chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200">
          {/* En-tête */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">😊</span>
              </div>
              <div>
                <div className="font-semibold">Assistance</div>
                <div className="text-xs text-white/80">En ligne</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <p>Bonjour ! 👋</p>
                <p className="mt-2">Comment puis-je vous aider ?</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 bg-white placeholder:text-gray-400"
              />
              <button
                onClick={handleSend}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
