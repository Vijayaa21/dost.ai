import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { getInviteCode } from '../../services/friendService';
import { toast } from 'react-toastify';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteFriendsModal({ isOpen, onClose }: InviteFriendsModalProps) {
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      const fetchInviteCode = async () => {
        try {
          setLoading(true);
          const code = await getInviteCode();
          setInviteCode(code);
        } catch (error) {
          console.error("Failed to fetch invite code:", error);
          toast.error("Could not load your invite link. Please try again.");
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchInviteCode();
    }
  }, [isOpen, onClose]);

  const inviteLink = inviteCode 
    ? `${window.location.origin}/signup?invite=${inviteCode}`
    : '';

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <Share2 size={32} className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Invite Friends to Play</h2>
              <p className="text-gray-500 mb-6">Share this link with your friends. When they sign up, you can play games together!</p>

              <div className="w-full h-14 bg-gray-100 border border-gray-200 rounded-lg p-2 flex items-center gap-2 mb-4">
                {loading ? (
                  <div className="w-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      readOnly 
                      value={inviteLink}
                      className="bg-transparent w-full text-gray-600 text-sm outline-none"
                    />
                    <button 
                      onClick={handleCopy}
                      className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-xs text-gray-400">
                This is just the first step! Multiplayer games are coming soon.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
