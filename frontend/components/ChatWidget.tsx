'use client';

import { useState, useRef, useEffect } from 'react';
import { chatApi } from '@/lib/api';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  isLoading?: boolean;
}

interface ChatWidgetProps {
  livretId: string;
  hostName?: string;
}

export default function ChatWidget({ livretId, hostName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Historique de conversation pour le contexte OpenAI
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isTyping) return;

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = { text: trimmedMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Mettre à jour l'historique de conversation
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: trimmedMessage }
    ];

    try {
      // Appeler l'API du chatbot
      const response = await chatApi.sendMessage(livretId, {
        message: trimmedMessage,
        conversationHistory: updatedHistory.slice(-10), // Garder les 10 derniers messages
      });

      const botResponseText = response.data.response;

      // Ajouter la réponse du bot
      const botMessage: ChatMessage = { text: botResponseText, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

      // Mettre à jour l'historique
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: botResponseText }
      ]);

    } catch (error: any) {
      console.error('Chat error:', error);

      // Réponse de fallback si l'API ne fonctionne pas
      let fallbackMessage = 'Désolé, je ne suis pas disponible pour le moment. N\'hésitez pas à contacter directement votre hôte.';
      
      if (error.response?.data?.message) {
        fallbackMessage = error.response.data.message;
      }

      const botMessage: ChatMessage = { text: fallbackMessage, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Bouton flottant du chat */}
      <button
        onClick={handleToggle}
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
        <div className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <div className="font-semibold text-sm">Assistant du logement</div>
                <div className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                  En ligne
                </div>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Fermer le chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <div className="text-4xl mb-3">👋</div>
                <p className="font-medium text-gray-700">Bonjour !</p>
                <p className="mt-1 text-gray-500">
                  Comment puis-je vous aider pendant votre séjour ?
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    '📶 Comment me connecter au Wi-Fi ?',
                    '🔐 Quels sont les codes d\'accès ?',
                    '🍽️ Y a-t-il des restaurants à proximité ?',
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(suggestion.replace(/^[^\s]+\s/, ''));
                      }}
                      className="block w-full text-left text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-primary/5 hover:border-primary/30 transition-colors text-gray-600"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="flex-shrink-0 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center mr-2 mt-1">
                        <span className="text-xs">🤖</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center mr-2 mt-1">
                      <span className="text-xs">🤖</span>
                    </div>
                    <div className="bg-white text-gray-500 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tapez votre message..."
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-gray-900 bg-gray-50 placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary text-white px-4 py-2.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Propulsé par IA • Les réponses peuvent ne pas être exhaustives
            </p>
          </div>
        </div>
      )}
    </>
  );
}
