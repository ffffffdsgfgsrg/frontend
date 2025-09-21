import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  BoltIcon, 
  UserGroupIcon, 
  TrophyIcon,
  PlayIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: BoltIcon,
      title: 'Juego en tiempo real',
      description: 'Juega con amigos con puntuación instantánea y rankings en vivo'
    },
    {
      icon: UserGroupIcon,
      title: 'Fácil de unirse',
      description: 'Únete con códigos de 6 dígitos o explora partidas públicas'
    },
    {
      icon: TrophyIcon,
      title: 'Competitivo',
      description: 'Sigue tus estadísticas, sube en el ranking y sé el campeón de BrainBlitz'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
                <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-full">
                  <SparklesIcon className="h-16 w-16 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl md:text-7xl font-bold text-white mb-6 text-shadow"
            >
              ⚡ BrainBlitz
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto"
            >
              La experiencia definitiva de trivia multijugador. Desafía a tus amigos, 
              demuestra tu conocimiento y conviértete en el campeón definitivo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {user ? (
                <>
                  <Button asChild size="xl" className="group">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <PlayIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Ir al panel
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="xl">
                    <Link to="/profile" className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Ver perfil
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="xl" className="group">
                    <Link to="/login" className="flex items-center gap-2">
                      <PlayIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Iniciar sesión
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="xl">
                    <Link to="/register">
                      Registrarse
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow">
              Características
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Descubre por qué BrainBlitz es la mejor plataforma de trivia multijugador
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full p-8 text-center hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="mb-6">
                      <div className="inline-flex p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-shadow">
              ¿Listo para el desafío?
            </h2>
            <p className="text-xl text-white/70 mb-12">
              Únete a miles de jugadores y demuestra que eres el más inteligente
            </p>
            {!user && (
              <Button asChild size="xl" className="group">
                <Link to="/register" className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Comenzar ahora
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}