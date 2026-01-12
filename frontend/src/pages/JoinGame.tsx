import { useNavigate } from 'react-router-dom';
import TicTacToe from '../components/games/TicTacToe';
import { toast } from 'react-toastify';

export default function JoinGame() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/games');
  };

  const handleComplete = (wasHelpful: boolean) => {
    toast.success(wasHelpful ? 'Glad you enjoyed it! 🎉' : 'Thanks for playing! 💙');
    navigate('/games');
  };

  // TicTacToe component will read room code from URL params
  return <TicTacToe onBack={handleBack} onComplete={handleComplete} />;
}
