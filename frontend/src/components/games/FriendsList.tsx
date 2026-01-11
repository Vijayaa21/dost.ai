import { useState, useEffect } from 'react';
import { getFriends } from '../../services/friendService';
import { User, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

// A simplified User type for the frontend
interface Friend {
  id: number;
  username: string;
  avatar: string | null;
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

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
          {friends.map(friend => (
            <li key={friend.id} className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-purple-50 transition-colors">
              <img 
                src={friend.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${friend.username}`} 
                alt={friend.username}
                className="w-10 h-10 rounded-full mr-4 border-2 border-white ring-2 ring-purple-200"
              />
              <span className="font-medium text-gray-800">{friend.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
