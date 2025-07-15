import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserFilters } from '../../types';
import { dbHelpers } from '../../utils/supabaseClient.ts';

const InterestForm: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const questions = [
    {
      title: "1. ¿Qué tipo de negocio tenés actualmente?",
      subtitle: "Selecciona la opción que mejor te describa",
      options: [
        "Tienda física",
        "Tienda online / eCommerce",
        "Vendo por redes sociales o WhatsApp",
        "Hago ventas mayoristas o por catálogo",
        "Estoy arrancando / validando una idea",
        "Tienda física y online",
      ]
    },
    {
      title: "2. ¿Dónde realizás la mayoría de tus ventas hoy?",
      subtitle: "Selecciona tu canal principal de ventas",
      options: [
        "En mi local o showroom",
        "A través de una tienda online",
        "Por redes sociales (Instagram, Facebook, etc.)",
        "Por WhatsApp u otros chats",
        "No tengo un canal principal todavía",
        "Marketplaces (MercadoLibre, Amazon, etc.)",
      ]
    },
    {
      title: "3. ¿Cuál es tu principal desafío en ventas?",
      subtitle: "Identifica tu mayor obstáculo actual",
      options: [
        "Generar más tráfico/visitas",
        "Convertir visitantes en clientes",
        "Retener clientes existentes",
        "Gestionar el inventario",
        "Competir con precios",
        "Llegar a nuevos mercados",
      ]
    },
    {
      title: "4. ¿Qué te gustaría mejorar en tu negocio?",
      subtitle: "Selecciona tu prioridad principal",
      options: [
        "Tener más ventas en fechas clave",
        "Planificar mejor mis promociones",
        "Mejorar mi presencia online / redes sociales",
        "Automatizar procesos (cobros, envíos, campañas)",
        "No estoy seguro, pero quiero crecer",
      ]
    }
  ];

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const filters: UserFilters = {
        question_1: answers[0],
        question_2: answers[1],
        question_3: answers[2],
        question_4: answers[3],
      };

      const { error } = await dbHelpers.saveUserFilters(user.id, filters);
      
      if (error) {
        console.error('Error saving filters:', error);
        return;
      }

      const updatedUser = { 
        ...user, 
        filters, 
        hasCompletedSegmentation: true 
      };
      updateUser(updatedUser);
    } catch (error) {
      console.error('Error updating user interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    return answers[currentStep] && answers[currentStep].length > 0;
  };

  const currentQuestion = questions[currentStep];
  const selectedAnswer = answers[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Personaliza tu experiencia
            </h1>
            <p className="text-gray-300">
              Ayúdanos a adaptar el contenido a tus intereses
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-purple-400">
                Paso {currentStep + 1} de {questions.length}
              </span>
              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index <= currentStep ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {currentQuestion.title}
            </h2>
            <p className="text-gray-400">{currentQuestion.subtitle}</p>
          </div>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-black/30 border-white/20 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {currentStep === questions.length - 1 ? 'Completar configuración' : 'Siguiente'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestForm;