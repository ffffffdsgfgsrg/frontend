import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { 
  XMarkIcon, 
  SparklesIcon, 
  CpuChipIcon,
  PencilIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { Card, CardContent } from './ui/Card';
import ManualQuestionForm from './ManualQuestionForm';

const AIQuestionGenerator = ({ onQuestionsGenerated, onClose }) => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [useAI, setUseAI] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualCount, setManualCount] = useState(1);
  const [manualStep, setManualStep] = useState(0);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [manualTopic, setManualTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  useEffect(() => {
    fetchTopics();
    fetchDifficultyLevels();
  }, []);

  const fetchTopics = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/ai/topics`);
      const data = await response.json();
      if (data.success && Array.isArray(data.topics) && data.topics.length > 0) {
        setTopics(data.topics);
        setSelectedTopic(data.topics[0]);
      } else {
        setTopics([]);
        setSelectedTopic('');
        setError('No hay temas disponibles. Contacta al administrador.');
      }
    } catch (error) {
      setTopics([]);
      setSelectedTopic('');
      setError('Error obteniendo temas. Verifica tu conexión.');
      console.error('Error fetching topics:', error);
    }
  };

  const fetchDifficultyLevels = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/ai/difficulty-levels`);
      const data = await response.json();
      if (data.success) {
        setDifficultyLevels(data.levels);
      }
    } catch (error) {
      console.error('Error fetching difficulty levels:', error);
    }
  };

  const generateQuestions = async () => {
    if (!selectedTopic) {
      setError('Por favor selecciona un tema válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = user && user.getIdToken ? await user.getIdToken() : null;
      const response = await fetch(`${apiBase}/api/ai/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          count: questionCount,
          useAI: useAI
        }),
      });

      const data = await response.json();
      console.log('Respuesta de /api/ai/generate-questions:', data);
      if (data.success) {
        const questionsWithMeta = data.questions.map(q => ({
          ...(() => {
            if (!Array.isArray(q.options) || typeof q.correctAnswerIndex !== 'number') return q;
            const optionsWithIndex = q.options.map((opt, idx) => ({ opt, origIdx: idx }));
            for (let i = optionsWithIndex.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
            }
            const newCorrectIndex = optionsWithIndex.findIndex(o => o.origIdx === q.correctAnswerIndex);
            return {
              ...q,
              options: optionsWithIndex.map(o => o.opt),
              correctAnswerIndex: newCorrectIndex
            };
          })(),
          createdBy: user?.uid || 'anon',
          createdAt: Date.now(),
          category: selectedTopic,
          difficulty: selectedDifficulty
        }));
        
        let saveOk = false;
        try {
          const bulkToken = user && user.getIdToken ? await user.getIdToken() : null;
          const response = await fetch(`${apiBase}/api/questions/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(bulkToken ? { Authorization: `Bearer ${bulkToken}` } : {})
            },
            body: JSON.stringify({ questions: questionsWithMeta })
          });
          const result = await response.json();
          if (!result.success) {
            setError((prev) => (prev ? prev + ' | ' : '') + (result.error || 'Error guardando preguntas en Firestore'));
            console.error('Error guardando preguntas en Firestore:', result.error);
          } else {
            saveOk = true;
          }
        } catch (e) {
          setError((prev) => (prev ? prev + ' | ' : '') + 'Error guardando preguntas en Firestore');
          console.error('Error guardando preguntas en Firestore:', e);
        }
        
        if (!saveOk) {
          setLoading(false);
          return;
        }
        
        onQuestionsGenerated(data.questions);
        setLoading(false);
      } else {
        setError(data.error || 'Error generando preguntas');
        console.error('Error generando preguntas:', data.error);
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualQuestionCreated = (q) => {
    const next = manualQuestions.concat([{ ...q, category: manualTopic }]);
    if (next.length < manualCount) {
      setManualQuestions(next);
      setManualStep(manualStep + 1);
    } else {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      user.getIdToken().then(token => {
        fetch(`${apiBase}/api/questions/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ questions: next })
        })
          .then(res => res.json())
          .then(data => {
            setShowManualForm(false);
            setError('');
            setGeneratedQuestions(gqs => [...gqs, ...next]);
            onQuestionsGenerated && onQuestionsGenerated(next);
          })
          .catch(() => {
            setError('Error guardando preguntas en Firestore');
            setShowManualForm(false);
          });
      });
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-full">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Generador de Preguntas</h2>
          <p className="text-white/70">Crea preguntas personalizadas para tu partida</p>
        </div>

        {showManualForm ? (
          <div className="space-y-6">
            {manualStep === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Configurar preguntas manuales
                  </h3>
                  <form onSubmit={e => { 
                    e.preventDefault(); 
                    setManualStep(1); 
                    setManualQuestions([]); 
                    setManualTopic(selectedTopic); 
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Tema:
                      </label>
                      <select 
                        value={selectedTopic} 
                        onChange={e => setSelectedTopic(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Número de preguntas:
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={manualCount}
                        onChange={e => setManualCount(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1">
                        Comenzar
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => setShowManualForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white font-medium">
                    Pregunta {manualQuestions.length + 1} de {manualCount}
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                      style={{ width: `${((manualQuestions.length + 1) / manualCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <ManualQuestionForm
                  topics={[manualTopic]}
                  onQuestionCreated={handleManualQuestionCreated}
                  onCancel={() => setShowManualForm(false)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Generation Form */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Tema:
                  </label>
                  <select 
                    value={selectedTopic} 
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={topics.length === 0}
                  >
                    {topics.length === 0 ? (
                      <option value="">No hay temas disponibles</option>
                    ) : (
                      topics.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Dificultad:
                  </label>
                  <select 
                    value={selectedDifficulty} 
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Cantidad de preguntas:
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="useAI"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="useAI" className="text-sm text-white/80">
                    Usar IA avanzada (requiere API key)
                  </label>
                </div>
              </CardContent>
            </Card>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200"
              >
                {error}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={generateQuestions}
                disabled={loading || topics.length === 0}
                loading={loading}
                className="flex items-center justify-center gap-2"
              >
                <CpuChipIcon className="h-5 w-5" />
                {loading ? 'Generando...' : 'Generar con IA'}
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setShowManualForm(true)}
                disabled={loading || topics.length === 0}
                className="flex items-center justify-center gap-2"
              >
                <PencilIcon className="h-5 w-5" />
                Crear manual
              </Button>
              
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <SparklesIcon className="h-6 w-6 text-primary-400 mx-auto mb-2" />
                <p className="text-white/70">Genera preguntas con IA o créalas manualmente</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <CheckCircleIcon className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="text-white/70">Dificultad: Fácil, Medio, Difícil</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <CpuChipIcon className="h-6 w-6 text-secondary-400 mx-auto mb-2" />
                <p className="text-white/70">{topics.length} temas disponibles</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AIQuestionGenerator;