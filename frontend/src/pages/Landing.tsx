import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, BarChart3, BookOpen, Heart, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Empathetic Conversations',
    description: 'Talk to Dost anytime. No judgment, just understanding and support.',
  },
  {
    icon: BarChart3,
    title: 'Mood Tracking',
    description: 'Track your emotional journey with daily check-ins and insights.',
  },
  {
    icon: BookOpen,
    title: 'Guided Journaling',
    description: 'Express yourself with AI-powered prompts and reflections.',
  },
  {
    icon: Heart,
    title: 'Coping Tools',
    description: 'Access breathing exercises, grounding techniques, and more.',
  },
  {
    icon: Shield,
    title: 'Safe & Private',
    description: 'Your conversations are private. Delete anytime you want.',
  },
  {
    icon: Clock,
    title: '24/7 Available',
    description: 'Dost is always here, whenever you need someone to talk to.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-cream to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/dost-logo.svg" alt="Dost AI" className="w-10 h-10" />
          <span className="text-2xl font-semibold text-primary-600">Dost AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">
            Login
          </Link>
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Your Mental Health{' '}
            <span className="text-transparent bg-clip-text gradient-primary bg-gradient-to-r from-primary-500 to-lavender-500">
              Companion
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Meet Dost — your supportive AI friend who listens without judgment, helps you reflect, 
            and encourages healthy mental habits. Available 24/7.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Start Chatting Free
            </Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-3">
              I have an account
            </Link>
          </div>
        </motion.div>

        {/* Chat Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="card shadow-lg">
            <div className="space-y-4">
              <div className="chat-bubble-user">
                I've been feeling really overwhelmed lately...
              </div>
              <div className="chat-bubble-assistant">
                I hear you, and that sounds really tough. Feeling overwhelmed can be exhausting. 
                Would you like to tell me more about what's been weighing on you? 
                I'm here to listen. 💙
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          How Dost Can Help
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="gradient-primary rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Feel Supported?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands who have found comfort in talking to Dost. 
            It's free, private, and always available.
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p className="mb-2">
            <strong>Note:</strong> Dost AI is not a replacement for professional mental health care.
          </p>
          <p className="text-sm">
            If you're in crisis, please contact a helpline: iCall (9152987821) | Vandrevala Foundation (1860-2662-345)
          </p>
          <p className="mt-4 text-sm">© 2024 Dost AI. Made with 💙 for mental wellness.</p>
        </div>
      </footer>
    </div>
  );
}
