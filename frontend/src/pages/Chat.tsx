import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, MessageCircle, Trash2, Wind, Heart, Brain, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { Message, Conversation } from '../types';
import clsx from 'clsx';
import { format } from 'date-fns';

interface CopingSuggestion {
  show_coping: boolean;
  message: string;
  category: string;
  exercises: Array<{
    name: string;
    id: number;
    duration: string;
  }>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  breathing: <Wind className="w-4 h-4" />,
  grounding: <Heart className="w-4 h-4" />,
  mindfulness: <Brain className="w-4 h-4" />,
  relaxation: <Sparkles className="w-4 h-4" />,
};

export default function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copingSuggestion, setCopingSuggestion] = useState<CopingSuggestion | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setConversations(data);
      } else if (data && typeof data === 'object') {
        // If response is paginated or wrapped, try to extract array
        const arrayData = data.results || data.conversations || [];
        setConversations(Array.isArray(arrayData) ? arrayData : []);
      } else {
        setConversations([]);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError('Failed to load conversations. Please try again.');
      setConversations([]);
    }
  };

  const loadConversation = async (id: number) => {
    try {
      const data = await chatService.getConversation(id);
      setCurrentConversation(id);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setError(null);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Failed to load conversation. Please try again.');
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      detected_emotion: null,
      is_crisis: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await chatService.sendMessage(userMessage, currentConversation || undefined);
      
      // Update with actual messages
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        const userMsg = response.user_message || { ...tempUserMsg, id: Math.random() };
        const assistantMsg = response.assistant_message;
        return assistantMsg ? [...filtered, userMsg, assistantMsg] : [...filtered, userMsg];
      });

      // Check for coping suggestion
      if (response.coping_suggestion) {
        setCopingSuggestion(response.coping_suggestion);
      } else {
        setCopingSuggestion(null);
      }

      // Update current conversation
      if (!currentConversation) {
        setCurrentConversation(response.conversation_id);
        loadConversations();
      }
      setError(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const deleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteConversation(id);
      if (currentConversation === id) {
        startNewConversation();
      }
      loadConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar - Conversations List */}
      <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={startNewConversation}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={clsx(
                  'w-full p-3 rounded-xl text-left mb-1 group transition-all cursor-pointer',
                  currentConversation === conv.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-800 truncate flex-1">
                    {conv.title || 'New conversation'}
                  </p>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(conv.updated_at), 'MMM d, h:mm a')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-calm-cream to-white">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-white text-lg">🤗</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">Dost</h1>
              <p className="text-sm text-green-500">Online • Here to listen</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <img src="/dost-logo.svg" alt="Dost" className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Hey, I'm Dost! 👋
                </h2>
                <p className="text-gray-600">
                  I'm here to listen and support you. Share whatever's on your mind — 
                  there's no judgment here. How are you feeling today?
                </p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={clsx(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.detected_emotion && message.role === 'user' && (
                    <p className="text-xs opacity-70 mt-2">
                      Feeling: {message.detected_emotion}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="chat-bubble-assistant">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Coping Suggestion Card */}
          {copingSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 max-w-sm border border-indigo-100 shadow-sm">
                <p className="text-gray-700 font-medium mb-3">{copingSuggestion.message}</p>
                <div className="space-y-2">
                  {copingSuggestion.exercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => navigate(`/coping?exercise=${exercise.id}&category=${copingSuggestion.category}`)}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-indigo-50 transition-all border border-indigo-100 hover:border-indigo-200 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                        {categoryIcons[copingSuggestion.category] || <Wind className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-800 text-sm">{exercise.name}</p>
                        <p className="text-xs text-gray-500">{exercise.duration}</p>
                      </div>
                      <span className="text-indigo-500 text-xs font-medium">Try now →</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCopingSuggestion(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-2 w-full text-center"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-100 p-4">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind..."
                className="input-field resize-none min-h-[52px] max-h-32 pr-12"
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={clsx(
                'p-3 rounded-xl transition-all',
                input.trim() && !isLoading
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Dost is here to support you, but not a replacement for professional help.
          </p>
        </div>
      </div>
    </div>
  );
}
