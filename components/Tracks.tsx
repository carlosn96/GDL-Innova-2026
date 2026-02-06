'use client';

import { useState } from 'react';
import { tracksData } from '@/data/tracks.data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { GradientBox } from '@/components/ui/gradient-box';
import type { Challenge } from '@/types';

export default function Tracks() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  const openChallengeModal = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeChallengeModal = () => {
    setModalOpen(false);
    setCurrentChallenge(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <section id="tracks" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Retos Estratégicos
              </span>
            </h2>
            <p className="text-cyan-200 text-xl">
              Los equipos deberán elegir uno de los ejes temáticos basados en las necesidades reales del municipio para este año
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {tracksData.map((challenge) => (
              <Card
                key={challenge.id}
                variant="glass"
                className="p-8 challenge-card group cursor-pointer"
                onClick={() => openChallengeModal(challenge)}
              >
                <GradientBox
                  gradientFrom={challenge.gradient.from}
                  gradientTo={challenge.gradient.to}
                  icon={challenge.icon.replace('fas fa-', '')}
                  className="w-20 h-20 rounded-xl mx-auto mb-6 morphing-shape"
                />
                <h3 className={`text-2xl font-bold text-center mb-4 ${
                  challenge.id === 'escuelas-corresponsabilidad' ? 'text-cyan-300' : 
                  challenge.id === 'corazon-contento' ? 'text-purple-300' :
                  challenge.id === 'guardianes-ciudad' ? 'text-pink-300' : 'text-cyan-300'
                }`}>
                  {challenge.title}
                </h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  {challenge.description}
                </p>
                <div className="mt-6 text-center">
                  {challenge.tags.map((tag) => (
                    <Badge
                      key={tag.label}
                      color={tag.color as 'cyan' | 'purple' | 'pink'}
                      className="mx-1"
                    >
                      <Icon name="tag" className="mr-2" />
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card variant="glass" className="inline-block px-8 py-4 rounded-full">
              <p className="text-cyan-200">
                <Icon name="lightbulb" className="text-yellow-400 mr-2" />
                Los equipos tienen <span className="text-white font-bold">libertad creativa</span> dentro de estos ejes
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Modal for Challenges */}
      {modalOpen && currentChallenge && (
        <div 
          className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={closeChallengeModal}
        >
          <Card 
            variant="glass" 
            className="p-8 rounded-2xl max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-cyan-300">{currentChallenge.title}</h3>
              <button 
                onClick={closeChallengeModal} 
                className="text-gray-400 hover:text-white text-2xl"
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            </div>
            <p className="text-gray-300 mb-4 font-semibold text-purple-300">{currentChallenge.subtitle}</p>
            <h4 className="text-xl font-bold text-cyan-400 mb-2">Problema:</h4>
            <p className="text-gray-300 mb-4">{currentChallenge.problem}</p>
            <h4 className="text-xl font-bold text-purple-400 mb-2">Sinergia Interdisciplinaria:</h4>
            <ul className="text-gray-300 mb-4 list-disc list-inside">
              {currentChallenge.synergy.map((item, index) => (
                <li key={index}>
                  <strong className={item.role === 'IC' ? 'text-cyan-300' : 'text-pink-300'}>
                    {item.role}:
                  </strong> {item.description}
                </li>
              ))}
            </ul>
            <h4 className="text-xl font-bold text-pink-400 mb-2">Valor IA:</h4>
            <p className="text-gray-300">{currentChallenge.aiValue}</p>
          </Card>
        </div>
      )}
    </>
  );
}