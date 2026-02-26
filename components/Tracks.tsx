'use client';

import { useEffect, useState } from 'react';
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
  };

  const closeChallengeModal = () => {
    setModalOpen(false);
    setCurrentChallenge(null);
  };

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalOpen]);

  return (
    <>
      <section id="tracks" data-section="tracks" className="site-section py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold theme-font-subheading theme-text-primary mb-4">
              <span className="theme-text-secondary bg-clip-text text-transparent">
                Reto 2026
              </span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {tracksData.map((challenge) => (
              <Card
                key={challenge.id}
                variant="glass"
                className="p-8 rounded-2xl challenge-card group cursor-pointer focus-within:ring-2 focus-within:ring-white/20"
                onClick={() => openChallengeModal(challenge)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openChallengeModal(challenge);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Abrir detalle del reto ${challenge.title}`}
              >
                <GradientBox
                  gradientFrom={challenge.gradient.from}
                  gradientTo={challenge.gradient.to}
                  icon={challenge.icon}
                  iconSize="2xl"
                  className="w-20 h-20 rounded-xl mx-auto mb-5 morphing-shape"
                />
                <h3 className="text-2xl font-bold theme-font-subheading theme-text-primary text-center mb-3">
                  {challenge.title}
                </h3>
                <p className="theme-font-primary text-center leading-relaxed">
                  {challenge.description}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {challenge.tags.map((tag) => (
                    <Badge
                      key={tag.label}
                      color={tag.color as 'cyan' | 'purple' | 'pink'}
                    >
                      <Icon name="fas fa-tag" className="mr-2" />
                      {tag.label}
                    </Badge>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 theme-text-secondary theme-font-subheading font-bold text-sm">
                  <span>Ver detalles</span>
                  <Icon name="fas fa-arrow-right" size="sm" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for Challenges */}
      {modalOpen && currentChallenge && (
        <div 
          className="modal-overlay theme-overlay-backdrop fixed inset-0 flex items-center justify-center z-50" 
          onClick={closeChallengeModal}
        >
          <Card 
            variant="glass" 
            className="p-8 rounded-2xl challenge-card max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold theme-font-subheading theme-text-primary">{currentChallenge.title}</h3>
              <button 
                onClick={closeChallengeModal} 
                className="theme-interactive text-2xl"
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            </div>
            <p className="theme-text-secondary theme-font-subheading mb-4 font-semibold">{currentChallenge.subtitle}</p>
            
            <h4 className="text-xl font-bold theme-font-subheading theme-text-primary mb-2">Problema:</h4>
            <p className="theme-font-primary mb-6 whitespace-pre-line leading-relaxed">{currentChallenge.problem}</p>
            
            {currentChallenge.objective && (
              <>
                <h4 className="text-xl font-bold theme-font-subheading theme-text-primary mb-2">Objetivo:</h4>
                <p className="theme-font-primary mb-6 leading-relaxed">{currentChallenge.objective}</p>
              </>
            )}

            {currentChallenge.synergy && currentChallenge.synergy.length > 0 && (
              <>
                <h4 className="text-xl font-bold theme-font-subheading theme-text-primary mb-2">Sinergia Interdisciplinaria:</h4>
                <ul className="theme-font-primary mb-6 list-disc list-inside">
                  {currentChallenge.synergy.map((item, index) => (
                    <li key={index}>
                      <strong className={`${item.role === 'IC' ? 'theme-text-secondary' : 'theme-accent-pink-soft'} theme-font-subheading`}>
                        {item.role}:
                      </strong> {item.description}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {currentChallenge.aiValue && (
              <>
                <h4 className="text-xl font-bold theme-font-subheading theme-text-primary mb-2">Valor IA:</h4>
                <p className="theme-text-muted theme-font-primary">{currentChallenge.aiValue}</p>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}