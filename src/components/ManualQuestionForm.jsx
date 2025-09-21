import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardContent } from './ui/Card';

const ManualQuestionForm = ({ topics, onQuestionCreated, onCancel }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(topics[0] || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!question.trim() || options.some(opt => !opt.trim())) {
      setError('Completa la pregunta y todas las opciones.');
      return;
    }

    if (!user || !user.getIdToken) {
      setError('Debes iniciar sesión para crear preguntas.');
      return;
    }

    setLoading(true);
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      let token = await user.getIdToken();

      const payload = {
        text: question,
        options,
        correctAnswerIndex: correctIndex,
        category: selectedTopic,
        explanation: ''
      };

      const res = await fetch(`${apiBase}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success !== false) {
        onQuestionCreated && onQuestionCreated(
          data.question || { question, options, correctAnswerIndex: correctIndex, category: selectedTopic }
        );
        // Reset form
        setQuestion('');
        setOptions(['', '', '', '']);
        setCorrectIndex(0);
      } else {
        setError(data.error || 'Error al guardar la pregunta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Crear pregunta manual
            </h3>
          </div>

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
              Pregunta:
            </label>
            <Input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Escribe tu pregunta aquí..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-4">
              Opciones de respuesta:
            </label>
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={opt}
                      onChange={e => handleOptionChange(idx, e.target.value)}
                      placeholder={`Opción ${idx + 1}`}
                      required
                    />
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      className="w-4 h-4 text-primary-600 bg-white/10 border-white/20 focus:ring-primary-500"
                    />
                    <span className="text-sm text-white/70 flex items-center gap-1">
                      <CheckCircleIcon className="h-4 w-4" />
                      Correcta
                    </span>
                  </label>
                </motion.div>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="flex-1"
            >
              {loading ? 'Guardando...' : 'Guardar pregunta'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualQuestionForm;