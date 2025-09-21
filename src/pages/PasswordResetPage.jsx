import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('¡Correo de restablecimiento enviado! Revisa tu bandeja de entrada.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico');
      } else {
        setError('Error al enviar el correo. Inténtalo de nuevo.');
      }
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
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">⚡ BrainBlitz</h1>
            <h2 className="text-xl font-semibold text-white mb-2">Restablecer contraseña</h2>
            <p className="text-white/70">Ingresa tu correo para recibir un enlace de restablecimiento</p>
          </CardHeader>

          <CardContent>
            {!message ? (
              <form onSubmit={handleReset} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
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
                  {loading ? 'Enviando...' : 'Enviar correo de restablecimiento'}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className="bg-green-500/20 p-3 rounded-full">
                    <CheckCircleIcon className="h-12 w-12 text-green-400" />
                  </div>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-200">
                  {message}
                </div>
                <p className="text-white/70 text-sm">
                  Si no ves el correo, revisa tu carpeta de spam.
                </p>
              </motion.div>
            )}

            <div className="mt-8 text-center">
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}