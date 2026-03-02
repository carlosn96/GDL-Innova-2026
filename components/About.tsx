"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function About() {
  const [activeModal, setActiveModal] = useState<'vision' | 'objetivo' | null>(null);

  return (
    <section id="about" data-section="about" className="site-section py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold theme-text-primary theme-font-subheading mb-4">
            <span className="theme-text-secondary bg-clip-text text-transparent">
              ¿Qué es el HACKATHON?
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-1 gap-8 mb-12">
          <Card variant="glass" className="p-8 rounded-2xl challenge-card">
            <article aria-label="Descripción del HACKATHON">
              <p className="theme-font-primary leading-relaxed text-xl text-center">
                El HACKATHON es un evento de innovación donde diferentes personas se reúnen para crear y diseñar soluciones a una o más problemáticas que existen en la sociedad actualmente o dentro de una empresa u organización.
                <br></br>
                En este 2026, transformaremos la IA, de herramienta a puente entre la lógica sistémica y la creatividad visual.
              </p>
            </article>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
          <button 
            onClick={() => setActiveModal('vision')}
            className="group relative px-8 py-4 bg-white/5 border border-white/20 hover:border-white/50 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 font-bold font-mono tracking-widest text-lg text-white group-hover:text-purple-300 transition-colors">
              VER VISIÓN
            </span>
          </button>

          <button 
            onClick={() => setActiveModal('objetivo')}
            className="group relative px-8 py-4 bg-white/5 border border-white/20 hover:border-white/50 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 font-bold font-mono tracking-widest text-lg text-white group-hover:text-blue-300 transition-colors">
              VER OBJETIVO
            </span>
          </button>
        </div>

        {/* Modal Overlay */}
        {activeModal && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setActiveModal(null)}
          >
            <div 
              className="max-w-2xl w-full animate-in zoom-in-95 duration-300"
              onClick={e => e.stopPropagation()}
            >
              <Card variant="glass" className="p-8 md:p-12 rounded-2xl relative border border-white/20 shadow-2xl shadow-purple-900/20">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                  aria-label="Cerrar modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                {activeModal === 'vision' ? (
                  <div>
                    <div className="inline-block mb-6 bg-black/50 dark:bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                      <span className="font-bold font-mono tracking-widest text-sm text-white">VISIÓN</span>
                    </div>
                    <article aria-label="Visión del HACKATHON">
                      <p className="theme-font-primary leading-relaxed text-xl md:text-2xl italic border-l-4 border-purple-500/50 pl-6 py-2">
                        "Convertir al Hackathon en el referente universitario de colaboración interdisciplinaria, donde la tecnología y el diseño gráfico se fusionen para crear soluciones disruptivas. Cada edición será un motor de soluciones reales, demostrando que la tecnología sin estética es fría, y que el diseño sin funcionalidad es vacío."
                      </p>
                    </article>
                  </div>
                ) : (
                  <div>
                    <div className="inline-block mb-6 bg-black/50 dark:bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                      <span className="font-bold font-mono tracking-widest text-sm text-white">OBJETIVO</span>
                    </div>
                    <article aria-label="Objetivo del HACKATHON">
                      <p className="theme-font-primary leading-relaxed text-xl md:text-2xl italic border-l-4 border-blue-500/50 pl-6 py-2">
                        "Fomentar la sinergia profesional entre alumnos de Ingeniería en Computación y Diseño Gráfico mediante el desarrollo de una solución digital integral (Web/App). Se busca que los estudiantes apliquen sus conocimientos técnicos en un entorno de alta presión, fortaleciendo sus habilidades de comunicación, trabajo en equipo y resolución de problemas sociales."
                      </p>
                    </article>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
