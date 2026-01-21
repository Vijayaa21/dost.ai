import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';
import Logo from '../components/Logo';

const toneOptions = [
  { value: 'calm', label: '🌊 Calm', description: 'Gentle, soothing responses' },
  { value: 'friendly', label: '😊 Friendly', description: 'Warm, conversational tone' },
  { value: 'minimal', label: '📝 Minimal', description: 'Brief, to-the-point responses' },
];

const concernOptions = [
  'Anxiety', 'Stress', 'Depression', 'Sleep Issues', 
  'Relationships', 'Work/School', 'Self-esteem', 'Loneliness'
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    preferred_tone: 'friendly' as 'calm' | 'friendly' | 'minimal',
    age_range: '',
    primary_concerns: [] as string[],
  });
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();

  const toggleConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      primary_concerns: prev.primary_concerns.includes(concern)
        ? prev.primary_concerns.filter(c => c !== concern)
        : [...prev.primary_concerns, concern]
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await authService.completeOnboarding(formData);
      await fetchProfile();
      navigate('/chat');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await authService.completeOnboarding({ preferred_tone: 'friendly' });
      await fetchProfile();
      navigate('/chat');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-calm-cream flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={clsx(
                'w-3 h-3 rounded-full transition-colors',
                s <= step ? 'bg-primary-500' : 'bg-gray-200'
              )}
            />
          ))}
        </div>

        <div className="card">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                <Logo size="md" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Welcome to Dost AI! 💙
              </h1>
              <p className="text-gray-600 mb-8">
                I'm your supportive companion, here to listen and help you navigate your emotions. 
                Let me learn a bit about you so I can be more helpful.
              </p>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-3">
                Let's Get Started <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
              <button onClick={handleSkip} className="text-gray-500 mt-4 hover:text-gray-700">
                Skip for now
              </button>
            </motion.div>
          )}

          {/* Step 2: Tone Selection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                How would you like me to talk? 🗣️
              </h2>
              <p className="text-gray-600 mb-6">
                Choose a conversation style that feels comfortable for you.
              </p>

              <div className="space-y-3">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, preferred_tone: option.value as typeof formData.preferred_tone })}
                    className={clsx(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      formData.preferred_tone === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="font-medium text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Concerns */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                What brings you here? 🌱
              </h2>
              <p className="text-gray-600 mb-6">
                Select any areas you'd like support with. This helps me understand you better.
              </p>

              <div className="flex flex-wrap gap-2">
                {concernOptions.map((concern) => (
                  <button
                    key={concern}
                    onClick={() => toggleConcern(concern)}
                    className={clsx(
                      'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                      formData.primary_concerns.includes(concern)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {concern}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3">
                  Back
                </button>
                <button 
                  onClick={handleComplete} 
                  disabled={isLoading}
                  className="btn-primary flex-1 py-3 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Start Chatting 💬</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
