import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  UserGroupIcon, 
  SparklesIcon,
  PlayIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import AIQuestionGenerator from '../components/AIQuestionGenerator';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [publicGames, setPublicGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  useEffect(() => {
    fetchPublicGames();
  }, []);

  const fetchPublicGames = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/games`);
      const data = await response.json();
      const gamesArray = Array.isArray(data) ? data : [];
      setPublicGames(gamesArray);
    } catch (error) {
      console.error('Error fetching games:', error);
      setPublicGames([]);
    }
  };

  const handleCreateGame = async () => {
    if (!selectedTopic) {
      alert('Por favor selecciona un tema antes de crear la partida.');
      return;
    }
    if (!generatedQuestions.length) {
      alert('Primero debes generar preguntas con IA antes de crear la partida.');
      return;
    }
    setLoading(true);
    socket.connect();
    
    let token = null;
    if (user && user.getIdToken) {
      token = await user.getIdToken();
    }
    
    socket.emit('createGame', {
      hostId: user.uid,
      displayName: user.displayName || user.email,
      isPublic: true,
      token,
      topic: selectedTopic,
      questions: generatedQuestions,
      count: generatedQuestions.length
    });
    
    socket.on('gameCreated', ({ gameId, questions }) => {
      setLoading(false);
      alert(`¡Partida creada con ${questions?.length || 0} preguntas!`);
      navigate(`/lobby/${gameId}`);
    });
    
    socket.on('error', ({ error }) => {
      setLoading(false);
      alert('Error creating game: ' + error);
    });
  };

  const handleJoinGame = () => {
    if (!gameCode.trim()) {
      alert('Please enter a game code');
      return;
    }
    navigate(`/lobby/${gameCode}`);
  };

  const handleJoinPublicGame = (gameId) => {
    navigate(`/lobby/${gameId}`);
  };

  const handleQuestionsGenerated = (questions) => {
    console.log('Preguntas generadas:', questions);
    setGeneratedQuestions(questions);
    if (questions && questions.length > 0 && questions[0].category) {
      setSelectedTopic(questions[0].category);
    }
    alert(`¡Se generaron ${questions.length} preguntas! Tema seleccionado: ${questions[0]?.category || ''}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  ¡Bienvenido, {user?.displayName || user?.email}!
                </h1>
                <p className="text-white/60 text-sm">Listo para demostrar tu conocimiento</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Create Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-lg">
                    <PlusIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Crear nueva partida</h3>
                    <p className="text-white/60">Inicia una partida y invita a tus amigos</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleCreateGame}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  <PlayIcon className="h-5 w-5" />
                  {loading ? 'Creando...' : 'Crear partida'}
                </Button>
                
                <Button
                  onClick={() => setShowAIGenerator(true)}
                  variant="accent"
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Generar preguntas con IA
                </Button>
                
                <div className="bg-white/5 rounded-lg p-4 text-sm text-white/70">
                  <p className="font-medium mb-2">💡 Ayuda:</p>
                  <p>Antes de crear una partida, genera tus propias preguntas con IA. Así tu juego tendrá contenido personalizado y reciente.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-accent-500 to-orange-500 p-2 rounded-lg">
                    <CodeBracketIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Unirse a partida</h3>
                    <p className="text-white/60">Ingresa un código de 6 dígitos para unirte</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Código de partida"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                    maxLength="6"
                    className="flex-1 text-center text-lg font-mono"
                  />
                  <Button onClick={handleJoinGame} size="lg">
                    Unirse
                  </Button>
                </div>
                <p className="text-xs text-white/50 text-center">
                  Pide el código a quien creó la partida
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Public Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                  <GlobeAltIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Partidas públicas</h3>
                  <p className="text-white/60">Únete a partidas abiertas para todos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!Array.isArray(publicGames) || publicGames.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No hay partidas públicas disponibles por ahora</p>
                  <p className="text-white/40 text-sm mt-2">¡Sé el primero en crear una!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicGames.map((game) => (
                    <motion.div
                      key={game.id}
                      whileHover={{ y: -2 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">Partida #{game.id}</h4>
                          <p className="text-sm text-white/60">
                            Jugadores: {game.players?.length || 0}
                          </p>
                          <p className="text-sm text-white/60">
                            Anfitrión: {game.players?.[0]?.displayName || 'Desconocido'}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleJoinPublicGame(game.id)}
                          size="sm"
                        >
                          Unirse
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* AI Question Generator Modal */}
      {showAIGenerator && (
        <AIQuestionGenerator
          onQuestionsGenerated={(qs) => {
            handleQuestionsGenerated(qs);
            setShowAIGenerator(false);
          }}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}