'use client';

import { useState, useRef, useEffect } from 'react';
import { appChatApi } from '@/lib/api';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  isLoading?: boolean;
}

export default function AppChatWidget() {
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

  const sendMessage = async (text: string) => {
    const trimmedMessage = text.trim();
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
      const response = await appChatApi.sendMessage({
        message: trimmedMessage,
        conversationHistory: updatedHistory.slice(-10),
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
      console.error('App chat error:', error);

      let fallbackMessage = 'Désolé, je ne suis pas disponible pour le moment. N\'hésitez pas à nous contacter à info@gims-consulting.be';
      
      if (error.response?.data?.message) {
        fallbackMessage = error.response.data.message;
      }

      const botMessage: ChatMessage = { text: fallbackMessage, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    await sendMessage(inputValue);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
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
      {/* Bouton flottant du chat — style premium */}
      <button
        onClick={handleToggle}
        className="fixed bottom-20 right-6 z-50 bg-gradient-to-br from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white rounded-full p-4 shadow-2xl shadow-primary/30 transition-all transform hover:scale-110 group"
        aria-label="Ouvrir le chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {/* Badge notification */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
          </>
        )}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 z-50 w-[340px] sm:w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4">
          {/* En-tête premium */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm">My Guide Digital</div>
                <div className="text-xs text-white/60 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span>
                  Assistant en ligne
                </div>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="text-white/60 hover:text-white transition-colors relative z-10"
              aria-label="Fermer le chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-pink-500/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl">👋</span>
                </div>
                <p className="font-semibold text-gray-800 text-base">Bonjour !</p>
                <p className="mt-1 text-gray-500 text-sm">
                  Comment puis-je vous aider ?
                </p>
                <div className="mt-5 space-y-2.5">
                  {[
                    { icon: '🎯', text: 'Demander une démo de l\'application' },
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="block w-full text-left text-sm bg-white border border-primary/20 rounded-xl px-4 py-3 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm transition-all text-gray-700 font-medium"
                    >
                      <span className="mr-2">{suggestion.icon}</span>
                      {suggestion.text}
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
                      <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full flex items-center justify-center mr-2 mt-1">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-primary to-pink-500 text-white rounded-br-md shadow-lg shadow-primary/20'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full flex items-center justify-center mr-2 mt-1">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="bg-white text-gray-500 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm text-gray-900 bg-gray-50 placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-br from-primary to-pink-500 text-white px-4 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Propulsé par My Guide Digital
            </p>
          </div>
        </div>
      )}
    </>
  );
}
