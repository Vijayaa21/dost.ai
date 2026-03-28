import { useState, useEffect } from 'react';
import { getFriends } from '../../services/friendService';
import gamesService from '../../services/gamesService';
import { User, Loader2, Gamepad2, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

// A simplified User type for the frontend
interface Friend {
  id: number;
  username: string;
  avatar: string | null;
}

interface ChallengingFriend {
  friendId: number;
  roomCode: string;
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [challenging, setChallengingId] = useState<number | null>(null);
  const [activeChallenges, setActiveChallenges] = useState<ChallengingFriend[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const friendsData = await getFriends();
        setFriends(friendsData);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
        toast.error("Could not load your friends list.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleChallenge = async (friendId: number, friendUsername: string) => {
    setChallengingId(friendId);
    try {
      const session = await gamesService.createGameRoom('tic-tac-toe');
      setActiveChallenges(prev => [...prev, { friendId, roomCode: session.room_code }]);
      toast.success(`Game room created! Share the link with ${friendUsername}.`);
    } catch (error) {
      toast.error('Failed to create game room.');
    } finally {
      setChallengingId(null);
    }
  };

  const handleCopyLink = (friendId: number, roomCode: string) => {
    const link = `${window.location.origin}/games/join?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopiedId(friendId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Game link copied!');
  };

  const getActiveChallenge = (friendId: number) => {
    return activeChallenges.find(c => c.friendId === friendId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin text-[#d97c6f]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-1">
      <h3 className="text-xl font-semibold text-[#5c3d36] mb-4 px-3">Your Friends</h3>
      {friends.length === 0 ? (
        <div className="text-center py-10 px-4 bg-[#fff7eb] rounded-2xl border border-dashed border-[#f2ded4]">
          <User className="mx-auto text-[#d99f8f] mb-3" size={40}/>
          <h4 className="font-semibold text-[#5c3d36]">No friends yet</h4>
          <p className="text-sm text-[#8d6a60] mt-1">Use the "Invite Friends" button to add friends and play together!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {friends.map(friend => {
            const challenge = getActiveChallenge(friend.id);
            return (
              <li key={friend.id} className="p-3 bg-white/90 rounded-xl shadow-sm border border-[#f2ded4]">
                <div className="flex items-center">
                  <img 
                    src={friend.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${friend.username}`} 
                    alt={friend.username}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white ring-2 ring-[#f0b8a7]"
                  />
                  <span className="font-medium text-[#5c3d36] flex-1">{friend.username}</span>
                  
                  {challenge ? (
                    <button
                      onClick={() => handleCopyLink(friend.id, challenge.roomCode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        copiedId === friend.id 
                          ? 'bg-green-500 text-white' 
                          : 'bg-[#f6e7de] text-[#c86b60] hover:bg-[#f0d9ce]'
                      }`}
                    >
                      {copiedId === friend.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === friend.id ? 'Copied!' : 'Copy Link'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChallenge(friend.id, friend.username)}
                      disabled={challenging === friend.id}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#d97c6f] to-[#c86b60] text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {challenging === friend.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Gamepad2 size={14} />
                      )}
                      Challenge
                    </button>
                  )}
                </div>
                {challenge && (
                  <p className="text-xs text-[#8d6a60] mt-2 pl-13">
                    Waiting for {friend.username} to join...
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
