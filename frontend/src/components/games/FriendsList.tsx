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
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-1">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 px-3">Your Friends</h3>
      {friends.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed">
          <User className="mx-auto text-gray-400 mb-3" size={40}/>
          <h4 className="font-semibold text-gray-700">No friends yet</h4>
          <p className="text-sm text-gray-500 mt-1">Use the "Invite Friends" button to add friends and play together!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {friends.map(friend => {
            const challenge = getActiveChallenge(friend.id);
            return (
              <li key={friend.id} className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <img 
                    src={friend.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${friend.username}`} 
                    alt={friend.username}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white ring-2 ring-purple-200"
                  />
                  <span className="font-medium text-gray-800 flex-1">{friend.username}</span>
                  
                  {challenge ? (
                    <button
                      onClick={() => handleCopyLink(friend.id, challenge.roomCode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        copiedId === friend.id 
                          ? 'bg-green-500 text-white' 
                          : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                      }`}
                    >
                      {copiedId === friend.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === friend.id ? 'Copied!' : 'Copy Link'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChallenge(friend.id, friend.username)}
                      disabled={challenging === friend.id}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
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
                  <p className="text-xs text-gray-500 mt-2 pl-13">
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
