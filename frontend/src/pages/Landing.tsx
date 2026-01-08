import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, BarChart3, BookOpen, Heart, Shield, Clock, Sparkles, ArrowRight, Star } from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Empathetic Conversations',
    description: 'Talk to Dost anytime. No judgment, just understanding and support.',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
  },
  {
    icon: BarChart3,
    title: 'Mood Tracking',
    description: 'Track your emotional journey with beautiful insights and patterns.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: BookOpen,
    title: 'Guided Journaling',
    description: 'Express yourself with AI-powered prompts and reflections.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Heart,
    title: 'Coping Tools',
    description: 'Access breathing exercises, grounding techniques, and more.',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Shield,
    title: 'Safe & Private',
    description: 'Your conversations are private. Delete anytime you want.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Clock,
    title: '24/7 Available',
    description: 'Dost is always here, whenever you need someone to talk to.',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
  },
];

const testimonials = [
  {
    text: "Dost helped me understand my anxiety better. It's like having a friend who truly listens.",
    author: "Anonymous User",
    rating: 5,
  },
  {
    text: "The mood tracking feature helped me identify patterns I never noticed before.",
    author: "Anonymous User",
    rating: 5,
  },
  {
    text: "Finally, a safe space to express my thoughts without fear of judgment.",
    author: "Anonymous User",
    rating: 5,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/dost-logo.svg" alt="Dost AI" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Dost AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-gray-600 hover:text-violet-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-md shadow-violet-200"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-700">Your AI Mental Health Companion</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                A friend who{' '}
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  truly listens
                </span>
                {' '}to you
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Meet Dost — your supportive AI companion who understands, never judges, 
                and helps you navigate life's emotional moments. Available 24/7.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link 
                  to="/register" 
                  className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-200"
                >
                  Start Chatting Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all"
                >
                  I have an account
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  <span>24/7 Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Free Forever</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Chat Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl shadow-2xl shadow-violet-100 border border-gray-100 p-6 max-w-md mx-auto">
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Dost</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-sm text-gray-500">Online now</span>
                    </div>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end"
                  >
                    <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] shadow-md">
                      I've been feeling really overwhelmed lately...
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div className="bg-gray-50 text-gray-700 px-4 py-3 rounded-2xl rounded-bl-md max-w-[80%] border border-gray-100">
                      I hear you, and that sounds really tough. Feeling overwhelmed can be exhausting. 
                      Would you like to tell me more? I'm here to listen 💜
                    </div>
                  </motion.div>
                </div>

                {/* Input preview */}
                <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-gray-400 flex-1">Share what's on your mind...</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg rotate-12"
              >
                <span className="text-2xl">🤗</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg -rotate-12"
              >
                <span className="text-xl">💚</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                mental wellness
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dost combines AI-powered conversations with practical tools to support your emotional wellbeing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Stories from our{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                community
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Hear from people who found comfort with Dost
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.text}"</p>
                <p className="text-sm text-gray-500 font-medium">— {testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center text-white"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-4xl">🤗</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to feel supported?</h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join thousands who have found comfort in talking to Dost. 
                It's free, private, and always available.
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 bg-white text-purple-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/dost-logo.svg" alt="Dost AI" className="w-10 h-10" />
              <span className="text-xl font-bold text-gray-800">Dost AI</span>
            </div>
            
            <div className="text-center text-gray-500 text-sm">
              <p className="mb-1">
                <strong>Note:</strong> Dost AI is not a replacement for professional mental health care.
              </p>
              <p>
                Crisis helplines: iCall (9152987821) | Vandrevala Foundation (1860-2662-345)
              </p>
            </div>
            
            <p className="text-sm text-gray-400">© 2026 Dost AI. Made with 💜</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
