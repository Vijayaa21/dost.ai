import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, BarChart3, BookOpen, Heart, Shield, Clock, Sparkles, ArrowRight, Star, Github, AlertCircle, Linkedin, Twitter, Code2, Headphones, ShieldCheck, Users } from 'lucide-react';
import Logo from '../components/Logo';

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

const services = [
  {
    icon: Headphones,
    title: '1:1 Supportive Chat',
    description: 'Caring, judgment-free conversations whenever you need to talk.',
  },
  {
    icon: BarChart3,
    title: 'Mood Insights',
    description: 'Daily logs, patterns, and reflections to understand how you feel.',
  },
  {
    icon: BookOpen,
    title: 'Guided Journaling',
    description: 'Prompted writing flows to help you untangle thoughts with ease.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-first',
    description: 'Your data stays yours. Clear, delete, or export anytime.',
  },
  {
    icon: Heart,
    title: 'Coping Toolkit',
    description: 'Grounding, breathing, and CBT-inspired exercises you can use fast.',
  },
  {
    icon: Clock,
    title: 'Always On',
    description: 'Available 24/7 so support is never out of reach.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
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

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-white to-violet-50/60">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-4">
              Services built for care
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">What you get with Dost</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All the essentials to feel heard, supported, and guided on your mental wellness journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="p-6 rounded-2xl bg-white shadow-lg shadow-purple-50 border border-purple-100/60 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 mb-4">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold w-fit">
                About Dost AI
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Built with empathy, guided by safety</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Dost AI is your always-on companion for emotional wellbeing. We blend supportive language models with
                practical mental health tools, keeping privacy at the center of every interaction.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <div className="flex items-center gap-2 mb-2 text-violet-700 font-semibold"><Users className="w-4 h-4" /> Community-first</div>
                  <p className="text-sm text-gray-600">Shaped by user feedback and real-world needs.</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700 font-semibold"><ShieldCheck className="w-4 h-4" /> Privacy & Safety</div>
                  <p className="text-sm text-gray-600">Clear controls to delete, export, or reset anytime.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-4">Why people choose Dost</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3"><span className="mt-1">💜</span> Empathetic responses tuned to support, not judge.</li>
                <li className="flex items-start gap-3"><span className="mt-1">🛡️</span> Private by design with clear data controls.</li>
                <li className="flex items-start gap-3"><span className="mt-1">⏱️</span> Fast access to coping tools when emotions spike.</li>
                <li className="flex items-start gap-3"><span className="mt-1">📈</span> Insightful trends to help you notice patterns early.</li>
              </ul>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="flex-1 text-center bg-white text-purple-700 font-semibold py-3 rounded-xl hover:bg-violet-50 transition-colors">Create free account</Link>
                <Link to="/login" className="flex-1 text-center border border-white/60 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-colors">Login</Link>
              </div>
            </motion.div>
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

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-purple-100 text-sm font-semibold w-fit">
              Need to talk to us?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">We're here to help</h2>
            <p className="text-slate-200 leading-relaxed">
              Questions about Dost, data privacy, or partnerships? Reach out and we’ll respond quickly.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2 font-semibold text-white"><Headphones className="w-4 h-4" /> Support</div>
                <p className="text-sm text-slate-200">support@dost.ai</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2 font-semibold text-white"><Shield className="w-4 h-4" /> Privacy</div>
                <p className="text-sm text-slate-200">privacy@dost.ai</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">Crisis helpline (24/7): <a href="tel:9152987821" className="text-pink-200 hover:text-pink-100 underline">9152987821</a></p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-white text-slate-900 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Message us</h3>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Name</label>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200" placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Email</label>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Message</label>
                <textarea rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200" placeholder="How can we help?" />
              </div>
              <button type="button" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-colors">Send message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-100 via-purple-50 to-indigo-100 border-t border-purple-200 py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo size="md" />
                <div>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600">Dost AI</h3>
                  <p className="text-xs text-gray-500">Your Mental Wellness Companion</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Empathetic conversations, mood tracking, journaling, and guided coping strategies. We are here for you, every step of the way. 💜
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Powered by AI, built with care</span>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <Heart className="w-4 h-4 text-pink-600" />
                Resources
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-purple-600 transition-colors flex items-center gap-2">About Dost AI</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors flex items-center gap-2">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors flex items-center gap-2">Terms of Service</a></li>
                <li>
                  <a href="tel:9152987821" className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Crisis Helpline (24/7)
                  </a>
                </li>
              </ul>
            </div>

            {/* Open Source & Social */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <Github className="w-4 h-4" />
                Open Source
              </h4>
              <p className="text-sm text-gray-600 mb-4">Help us make mental wellness accessible to everyone.</p>
              <div className="space-y-3">
                <a
                  href="https://github.com/Vijayaa21/dost.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 px-4 py-2.5 rounded-xl font-medium text-sm transition-all transform hover:scale-105 w-fit"
                >
                  <Star className="w-4 h-4" />
                  Star on GitHub ⭐
                </a>
                <a
                  href="https://github.com/Vijayaa21/dost.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all w-fit bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Code2 className="w-4 h-4" />
                  Contribute
                </a>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <a href="https://www.linkedin.com/in/vijaya-mishra21/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white text-gray-600 shadow hover:text-purple-600 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://github.com/Vijayaa21/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white text-gray-600 shadow hover:text-purple-600 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="https://x.com/Vijayaa_21" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white text-gray-600 shadow hover:text-purple-600 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 Dost AI. Made with 💜</p>
            <div className="text-center">
              <p className="font-semibold text-gray-700">Note:</p>
              <p>Dost AI is not a replacement for professional mental health care.</p>
              <p>Crisis helplines: iCall (9152987821) | Vandrevala Foundation (1860-2662-345)</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
