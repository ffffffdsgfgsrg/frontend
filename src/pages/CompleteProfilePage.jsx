import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export default function CompleteProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!displayName.trim()) {
      setError('Por favor ingresa un nombre para mostrar');
      return;
    }

    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No autenticado');
      
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: auth.currentUser.email,
        displayName: displayName.trim(),
        stats: { gamesPlayed: 0, wins: 0, correctAnswers: 0 }
      }, { merge: true });
      
      navigate('/dashboard');
    } catch (err) {
      setError('Error al guardar el perfil. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-full">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">⚡ BrainBlitz</h1>
            <h2 className="text-xl font-semibold text-white mb-2">Completa tu perfil</h2>
            <p className="text-white/70">Elige tu nombre para mostrar en el juego</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-white/80 mb-2">
                  Nombre para mostrar
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Tu nombre de jugador"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={30}
                />
                <p className="text-xs text-white/50 mt-1">
                  Este será tu nombre visible para otros jugadores
                </p>
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                {loading ? 'Guardando...' : 'Guardar y continuar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-white/50">
                Podrás cambiar tu nombre más tarde en tu perfil
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}