import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, MessageCircle, Trash2, Wind, Heart, Brain, Sparkles, Menu, X } from 'lucide-react';
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

// Suggested prompts for new chats
const suggestedPrompts = [
  { emoji: '😔', text: "I'm feeling down today", color: 'from-blue-50 to-indigo-50', border: 'border-blue-200' },
  { emoji: '😰', text: "I'm anxious about something", color: 'from-amber-50 to-orange-50', border: 'border-amber-200' },
  { emoji: '🤔', text: "I need someone to talk to", color: 'from-purple-50 to-pink-50', border: 'border-purple-200' },
  { emoji: '💭', text: "Help me process my thoughts", color: 'from-emerald-50 to-teal-50', border: 'border-emerald-200' },
];

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
  const [showSidebar, setShowSidebar] = useState(false);
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
      if (Array.isArray(data)) {
        setConversations(data);
      } else if (data && typeof data === 'object') {
        const apiResponse = data as { results?: Conversation[]; conversations?: Conversation[] };
        const arrayData = apiResponse.results || apiResponse.conversations || [];
        setConversations(Array.isArray(arrayData) ? arrayData : []);
      } else {
        setConversations([]);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    }
  };

  const loadConversation = async (id: number) => {
    try {
      const data = await chatService.getConversation(id);
      setCurrentConversation(id);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setCopingSuggestion(null);
      setError(null);
      setShowSidebar(false);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Failed to load conversation. Please try again.');
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setCopingSuggestion(null);
    setShowSidebar(false);
    inputRef.current?.focus();
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    const tempUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      detected_emotion: null,
      is_crisis: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await chatService.sendMessage(text, currentConversation || undefined);
      const chatResponse = response as { conversation_id: number; user_message: Message; assistant_message: Message; coping_suggestion?: CopingSuggestion };
      
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        const userMsg = chatResponse.user_message || { ...tempUserMsg, id: Math.random() };
        const assistantMsg = chatResponse.assistant_message;
        return assistantMsg ? [...filtered, userMsg, assistantMsg] : [...filtered, userMsg];
      });

      if (chatResponse.coping_suggestion) {
        setCopingSuggestion(chatResponse.coping_suggestion);
      } else {
        setCopingSuggestion(null);
      }

      if (!currentConversation) {
        setCurrentConversation(chatResponse.conversation_id);
        loadConversations();
      }
      setError(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto h-[calc(100vh-120px)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              Chat with Dost <span className="text-2xl">💜</span>
            </h1>
            <p className="text-gray-500 mt-1">Your safe space to share and be heard</p>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </motion.div>

        {/* Main Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex overflow-hidden"
        >
          {/* Sidebar - Conversations */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-r border-gray-100 flex flex-col bg-gray-50 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Conversations</h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="p-3">
                  <button
                    onClick={startNewConversation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    New Conversation
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 pt-0">
                  {conversations.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => loadConversation(conv.id)}
                          className={clsx(
                            'p-3 rounded-xl cursor-pointer group transition-all',
                            currentConversation === conv.id
                              ? 'bg-white border border-violet-200 shadow-sm'
                              : 'hover:bg-white hover:shadow-sm border border-transparent'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={clsx(
                                'font-medium truncate text-sm',
                                currentConversation === conv.id ? 'text-violet-700' : 'text-gray-700'
                              )}>
                                {conv.title || 'New conversation'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {format(new Date(conv.updated_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            <button
                              onClick={(e) => deleteConversation(conv.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Dost</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-sm text-gray-500">Always here for you</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                /* Empty State - Welcome Screen */
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-200">
                      <span className="text-4xl">🤗</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Hey there! I'm Dost 👋
                    </h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                      Your safe space to share, vent, or just talk. 
                      I'm here to listen without judgment.
                    </p>

                    {/* Suggested Prompts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggestedPrompts.map((prompt, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          onClick={() => sendMessage(prompt.text)}
                          className={clsx(
                            'flex items-center gap-3 p-4 rounded-xl border transition-all text-left group hover:shadow-md',
                            `bg-gradient-to-r ${prompt.color} ${prompt.border}`
                          )}
                        >
                          <span className="text-2xl">{prompt.emoji}</span>
                          <span className="text-sm text-gray-700 font-medium">{prompt.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Messages List */
                <div className="p-4 space-y-4">
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
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-md">
                            <Heart className="w-4 h-4 text-white fill-white" />
                          </div>
                        )}
                        <div
                          className={clsx(
                            'max-w-[75%] rounded-2xl px-4 py-3',
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md shadow-md'
                              : 'bg-gray-50 text-gray-800 rounded-bl-md border border-gray-100'
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          {message.detected_emotion && message.role === 'user' && (
                            <p className="text-xs opacity-80 mt-2 flex items-center gap-1">
                              💭 Feeling: {message.detected_emotion}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                        <Heart className="w-4 h-4 text-white fill-white" />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Coping Suggestion Card */}
                  {copingSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                        <Heart className="w-4 h-4 text-white fill-white" />
                      </div>
                      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl rounded-bl-md p-4 max-w-sm border border-violet-100">
                        <p className="text-gray-700 font-medium mb-3 text-sm">{copingSuggestion.message}</p>
                        <div className="space-y-2">
                          {copingSuggestion.exercises.map((exercise) => (
                            <button
                              key={exercise.id}
                              onClick={() => navigate(`/coping?exercise=${exercise.id}&category=${copingSuggestion.category}`)}
                              className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-violet-50 transition-all border border-violet-100 hover:border-violet-200 group shadow-sm"
                            >
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 group-hover:bg-violet-200 transition-colors">
                                {categoryIcons[copingSuggestion.category] || <Wind className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-gray-800 text-sm">{exercise.name}</p>
                                <p className="text-xs text-gray-500">{exercise.duration}</p>
                              </div>
                              <span className="text-violet-500 text-xs font-medium">Try →</span>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCopingSuggestion(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 mt-3 w-full text-center"
                        >
                          Maybe later
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-end gap-3 bg-gray-50 rounded-xl p-2 border border-gray-100">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what's on your mind..."
                  className="flex-1 bg-transparent resize-none px-3 py-2.5 focus:outline-none text-gray-700 placeholder-gray-400 min-h-[44px] max-h-32"
                  rows={1}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className={clsx(
                    'p-3 rounded-xl transition-all flex-shrink-0',
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">
                Dost is here to support you, not replace professional help.
                <span className="text-red-400 ml-1 cursor-pointer hover:underline" onClick={() => window.open('tel:9152987821')}>
                  In crisis? Get help →
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
