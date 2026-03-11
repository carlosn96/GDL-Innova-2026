'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Taller2Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPromptExamples, setShowPromptExamples] = useState(false);

  const slides = getSlides(() => setShowPromptExamples(true));

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Header/Nav overlay */}
      <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-10">
        <Image src="/logo.svg" alt="HACKATHON 2026 Logo" width={120} height={40} className="opacity-80 drop-shadow-md" />
        <Link href="/#schedule" className="text-gray-400 hover:text-cyan-400 text-sm tracking-widest uppercase transition-colors flex items-center gap-2">
          Volver al Cronograma <i className="fas fa-times"></i>
        </Link>
      </div>

      {/* Main Slide Content */}
      <main className="flex-1 flex items-center justify-center relative w-full h-full">
        <div className="w-full max-w-5xl px-8 md:px-16 flex items-center justify-center min-h-[600px]">
          {slides[currentSlide]}
        </div>
      </main>

      {/* Prompt Examples Modal */}
      {showPromptExamples && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0f16] border border-cyan-500/30 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.15)] relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/10 px-8 py-6 bg-slate-900/50">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                <i className="fas fa-layer-group text-cyan-500 mr-3"></i> 
                Ejemplos de Prompt Maestro
              </h3>
              <button onClick={() => setShowPromptExamples(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                 <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="overflow-y-auto p-8 space-y-8 min-h-[400px]">
               {/* Example 1 */}
               <div className="space-y-3">
                 <h4 className="text-emerald-400 font-semibold tracking-wide uppercase text-sm"><i className="fas fa-shopping-cart"></i> Caso: E-Commerce de Ropa</h4>
                 <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 shadow-inner">
                    <p className="font-mono text-slate-300 text-sm leading-relaxed">
                      &quot;<span className="text-emerald-400">Actúa como Senior Frontend.</span> <span className="text-cyan-400">Crea la estructura base</span> <span className="text-purple-400">para un MVP de </span> <span className="text-blue-400">tienda en línea con Vite + React.</span> <span className="text-rose-400 font-bold">NO uses un backend real, usa un JSON local con 5 prendas.</span> <span className="text-cyan-400">Entrégame solo los componentes vacíos pero enlazados para el Catálogo (Home) y el Carrito de Compras.</span>&quot;
                    </p>
                 </div>
               </div>
               
               {/* Example 2 */}
               <div className="space-y-3">
                 <h4 className="text-purple-400 font-semibold tracking-wide uppercase text-sm"><i className="fas fa-briefcase-medical"></i> Caso: Citas Médicas Simples</h4>
                 <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 shadow-inner">
                    <p className="font-mono text-slate-300 text-sm leading-relaxed">
                      &quot;<span className="text-emerald-400">Asume el rol de Tech Lead.</span> <span className="text-cyan-400">Levanta el esqueleto de directorios</span> <span className="text-purple-400">para un sistema</span> <span className="text-blue-400">clínico usando Next.js.</span> <span className="text-rose-400 font-bold">Prohibido crear validaciones de Auth complejas o BDD. Usa lógica mock.</span> <span className="text-cyan-400">Solo dame el layout principal y una vista estática para agendar cita.</span>&quot;
                    </p>
                 </div>
               </div>

               {/* Example 3 */}
               <div className="space-y-3">
                 <h4 className="text-amber-400 font-semibold tracking-wide uppercase text-sm"><i className="fas fa-film"></i> Caso: Tracker de Películas</h4>
                 <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 shadow-inner">
                    <p className="font-mono text-slate-300 text-sm leading-relaxed">
                      &quot;<span className="text-emerald-400">Actúa como Ingeniero de UI.</span> <span className="text-cyan-400">Estructura un cascarón</span> <span className="text-purple-400">para hacer seguimiento de películas para un reto de 2 días</span> <span className="text-blue-400">en React.</span> <span className="text-rose-400 font-bold">NO uses estado externo complejo ni bases de datos.</span> <span className="text-cyan-400">Genera los componentes esqueleto de la lista de películas y un modal o página en blanco para agregar.</span>&quot;
                    </p>
                 </div>
               </div>
            </div>
            <div className="border-t border-white/10 px-8 py-4 bg-slate-900/50 flex justify-end">
               <button onClick={() => setShowPromptExamples(false)} className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-lg hover:from-cyan-500 hover:to-cyan-400 text-white font-medium transition-all shadow-lg shadow-cyan-500/20">
                 Cerrar y Continuar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer & Controls */}
      <footer className="absolute bottom-6 left-8 right-8 flex justify-between items-center z-10">
        <div className="text-xs text-slate-500 max-w-[50%]">
          Organizado por: Diseño Gráfico e Ingeniería en Computación | Universidad UNE
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-slate-600 font-mono text-sm tracking-widest">
            {currentSlide + 1} / {slides.length}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 disabled:opacity-20 flex items-center justify-center transition-all text-slate-300"
              aria-label="Anterior"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 disabled:opacity-20 flex items-center justify-center transition-all text-slate-300"
              aria-label="Siguiente"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const getSlides = (onOpenPromptExamples: () => void) => [
  // Slide 1: Portada (Hero)
  (
    <div key="1" className="flex flex-col items-center text-center space-y-8 w-full transition-opacity duration-500 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none z-0 flex items-center justify-center">
        <Image src="/orquesta.png" alt="Orquesta" width={600} height={600} className="object-cover rounded-full mix-blend-screen blur-[2px]" />
      </div>
      <div className="mb-4 relative z-10">
        <Image src="/logo-completo.svg" alt="Logo" width={300} height={120} className="opacity-90 drop-shadow-2xl mx-auto" />
      </div>
      <div className="flex flex-col items-center relative z-10 w-full max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 leading-tight drop-shadow-md">
          Taller 2: IA como<br/>herramienta auxiliar en codificación.
        </h1>
        <h2 className="text-2xl md:text-3xl text-gray-300 font-light mb-8 mt-6 bg-black/40 px-8 py-3 rounded-full backdrop-blur-md border border-white/5">
          De la herramienta técnica al puente de co-creación.
        </h2>
      </div>
      <div className="mt-8 w-2/3 mx-auto flex items-center justify-center gap-4 text-slate-400 relative z-10">
        <div className="h-px bg-white/10 flex-1"></div>
        <p className="text-base font-mono tracking-wide uppercase">
          Acelerando el MVP sin comprometer la lógica de negocio
        </p>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>
    </div>
  ),

  // Slide 2: El Reto de Hoy (Contexto)
  (
    <div key="2" className="flex flex-col justify-center w-full h-full text-left space-y-12">
      <h2 className="text-5xl font-bold mb-4 flex items-center gap-4 text-cyan-400">
        <i className="fas fa-crosshairs opacity-50"></i> Escuelas Seguras: El Reloj Corre
      </h2>
      <div className="space-y-10 pl-4 border-l-2 border-slate-800 ml-4">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex flex-col items-center justify-center flex-shrink-0">
             <i className="fas fa-laptop-code text-2xl text-cyan-400"></i>
          </div>
          <div className="pt-2">
             <h3 className="text-2xl font-semibold mb-2 text-white">Objetivo</h3>
             <p className="text-slate-400 text-xl">Desarrollar un MVP de gestión de seguridad (Web/App).</p>
          </div>
        </div>

        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex flex-col items-center justify-center flex-shrink-0">
             <i className="fas fa-stopwatch text-2xl text-purple-400"></i>
          </div>
          <div className="pt-2">
             <h3 className="text-2xl font-semibold mb-2 text-white">El desafío real</h3>
             <p className="text-slate-400 text-xl">Tienen menos de 2 días.</p>
          </div>
        </div>

        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex flex-col items-center justify-center flex-shrink-0">
             <i className="fas fa-brain text-2xl text-emerald-400"></i>
          </div>
          <div className="pt-2">
             <h3 className="text-2xl font-semibold mb-2 text-white">La solución</h3>
             <p className="text-slate-400 text-xl">Acelerar el proceso técnico delegando la talacha (boilerplate) a la Inteligencia Artificial.</p>
          </div>
        </div>
      </div>
    </div>
  ),

  // Slide 3: La Regla de Oro (⚠️ Importante)
  (
    <div key="3" className="flex flex-col justify-center w-full h-full text-left">
      <h2 className="text-5xl font-bold mb-16 text-center text-white">Reglas del Juego con la IA</h2>
      <div className="grid grid-cols-2 gap-12 w-full">
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-10 flex flex-col items-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fas fa-check text-9xl text-emerald-500"></i>
           </div>
           <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 relative z-10 border border-emerald-500/20">
             <i className="fas fa-check text-2xl text-emerald-400"></i>
           </div>
           <h3 className="text-3xl font-semibold mb-8 text-emerald-400 relative z-10">Lo que SÍ se vale</h3>
           <ul className="space-y-6 text-xl text-slate-300 w-full relative z-10">
             <li className="flex gap-4 items-start"><i className="fas fa-check-circle text-emerald-500 mt-1"></i> <span>Generar el esqueleto (boilerplate) del proyecto.</span></li>
             <li className="flex gap-4 items-start"><i className="fas fa-check-circle text-emerald-500 mt-1"></i> <span>Crear componentes vacíos y rutas base.</span></li>
             <li className="flex gap-4 items-start"><i className="fas fa-check-circle text-emerald-500 mt-1"></i> <span>Generar Mock Data rápida (Juan Pérez, Escuela 1).</span></li>
           </ul>
        </div>
        <div className="bg-rose-950/20 border border-rose-500/20 rounded-3xl p-10 flex flex-col items-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fas fa-times text-9xl text-rose-500"></i>
           </div>
           <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 relative z-10 border border-rose-500/20">
             <i className="fas fa-times text-2xl text-rose-400"></i>
           </div>
           <h3 className="text-3xl font-semibold mb-8 text-rose-400 relative z-10">Causa DESCALIFICACIÓN</h3>
           <ul className="space-y-6 text-xl text-slate-300 w-full relative z-10">
             <li className="flex gap-4 items-start"><i className="fas fa-times-circle text-rose-500 mt-1"></i> <span>Copiar software que ya existe (Cero plagio).</span></li>
             <li className="flex gap-4 items-start"><i className="fas fa-times-circle text-rose-500 mt-1"></i> <span className="text-rose-200">Dejar que la IA dicte la Lógica de Negocio (Esa la piensan ustedes).</span></li>
             <li className="flex gap-4 items-start"><i className="fas fa-times-circle text-rose-500 mt-1"></i> <span>Usar datos reales y sensibles.</span></li>
           </ul>
        </div>
      </div>
    </div>
  ),

  // Slide 4: La Anatomía del Prompt Perfecto
  (
    <div key="4" className="flex flex-col justify-center w-full h-full text-left space-y-10 relative">
      <div className="absolute -right-32 top-[65%] -translate-y-1/2 w-[600px] h-[600px] opacity-40 pointer-events-none z-0 mix-blend-screen overflow-hidden rounded-full mask-image-radial">
         <Image src="/orquesta.png" alt="Director Orquesta" width={600} height={600} className="object-cover w-full h-full" />
      </div>
      <h2 className="text-5xl font-bold mb-4 text-cyan-400 flex items-center gap-6 relative z-10">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
          <Image src="/orquesta.png" alt="Director" width={128} height={128} className="object-cover w-full h-full" />
        </div>
        No le pidas, ¡Dirígela!
      </h2>
      <div className="bg-[#0a0f16] border border-cyan-500/20 rounded-2xl p-8 font-mono text-xl md:text-2xl text-center flex flex-wrap justify-center gap-4">
        <span className="text-purple-400 bg-purple-500/10 px-3 py-1 rounded">[Contexto]</span>
        <span className="text-slate-500 py-1">+</span>
        <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded">[Rol]</span>
        <span className="text-slate-500 py-1">+</span>
        <span className="text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded">[Tarea]</span>
        <span className="text-slate-500 py-1">+</span>
        <span className="text-blue-400 bg-blue-500/10 px-3 py-1 rounded">[Stack]</span>
        <span className="text-slate-500 py-1">+</span>
        <span className="text-rose-400 bg-rose-500/10 px-3 py-1 rounded">[Restricciones]</span>
      </div>
      <div className="mt-8 flex flex-col w-full relative z-10">
        <div className="flex justify-between items-center mb-4 pl-4 pr-1">
           <h3 className="text-xl text-slate-400 font-semibold uppercase tracking-widest text-sm text-center">Ejemplo</h3>
           <button onClick={onOpenPromptExamples} className="text-sm px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/10">
             <i className="fas fa-lightbulb text-amber-300"></i> Ver más escenarios interactivos
           </button>
        </div>
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-10 shadow-2xl relative">
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <p className="text-slate-300 text-2xl leading-relaxed mt-4 font-mono">
            &quot;<span className="text-emerald-400">Actúa como Senior Dev.</span> <span className="text-cyan-400">Crea la estructura de carpetas</span> <span className="text-purple-400">para un MVP en</span> <span className="text-blue-400">React + Next.js</span> <span className="text-purple-400">para adopción de mascotas.</span> <span className="text-rose-400 font-bold underline decoration-rose-500/30 underline-offset-4">NO incluyas lógica de BD, usa Mock Data.</span> <span className="text-cyan-400">Dame solo los componentes vacíos para Catálogo y Perfil.</span>&quot;
          </p>
        </div>
      </div>
    </div>
  ),

  // Slide 5: Live Coding - Construyendo el Esqueleto
  (
    <div key="5" className="flex flex-col items-center justify-center text-center space-y-12 w-full h-full relative">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
       <div className="w-56 h-56 rounded-3xl overflow-hidden border border-cyan-500/30 mb-4 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          <Image src="/blueprint.png" alt="Blueprint Arquitectura" width={224} height={224} className="object-cover w-full h-full" />
       </div>
       <h2 className="text-6xl font-bold tracking-tight text-white mb-4">
         Demostración en Vivo:<br/>
         <span className="text-cyan-400 block mt-4">Arquitectura Base</span>
       </h2>
       <p className="text-xl text-slate-500 font-mono tracking-widest uppercase mt-4 border border-slate-800 bg-slate-900/50 px-6 py-2 rounded-full">
         (Ir al Editor de Código)
       </p>
    </div>
  ),

  // Slide 6: El Arte de Iterar (El Seguimiento)
  (
    <div key="6" className="flex flex-col justify-center w-full h-full text-left space-y-10">
      <h2 className="text-5xl font-bold mb-4 text-purple-400">Iteración: Capa por Capa</h2>
      
      <div className="grid gap-6">
         <div className="flex items-center gap-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors">
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-black text-cyan-400 shadow-lg shadow-cyan-900/20">1</div>
            <div>
               <h3 className="text-2xl text-white font-semibold">Estructura y Vistas</h3>
               <p className="text-slate-400 text-lg mt-1">Construcción de los cimientos. (HTML/JSX vacíos).</p>
            </div>
         </div>
         <div className="flex items-center gap-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-black text-purple-400 shadow-lg shadow-purple-900/20">2</div>
            <div>
               <h3 className="text-2xl text-white font-semibold">Interacciones Locales</h3>
               <p className="text-slate-400 text-lg mt-1">Añadir dinamismo estático (Estados, Hooks, Navegaciones).</p>
            </div>
         </div>
         <div className="flex items-center gap-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-black text-emerald-400 shadow-lg shadow-emerald-900/20">3</div>
            <div>
               <h3 className="text-2xl text-white font-semibold">Mock Data y Conexión</h3>
               <p className="text-slate-400 text-lg mt-1">Simular la entrada y salida de datos como si existiera un Backend real.</p>
            </div>
         </div>
      </div>

      <div className="mt-8 border-l-4 border-rose-500 bg-rose-500/10 p-6 rounded-r-2xl flex items-start gap-4">
         <i className="fas fa-exclamation-triangle text-rose-500 text-2xl mt-1"></i>
         <p className="text-2xl text-rose-200 font-light leading-snug">
            &quot;Si pides la App completa en el <strong className="font-semibold text-rose-400">primer prompt</strong>, el código será un desastre inmanejable.&quot;
         </p>
      </div>
    </div>
  ),

  // Slide 7: Live Coding - El Componente Clave
  (
    <div key="7" className="flex flex-col items-center justify-center text-center space-y-12 w-full h-full relative">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>
       <i className="fas fa-file-signature text-7xl text-purple-400/50 mb-4 animate-pulse"></i>
       <h2 className="text-6xl font-bold tracking-tight text-white mb-4">
         Demostración en Vivo:<br/>
         <span className="text-purple-400 block mt-4">Formulario de Adopción</span>
       </h2>
       <p className="text-xl text-slate-500 font-mono tracking-widest uppercase mt-8 border border-slate-800 bg-slate-900/50 px-6 py-2 rounded-full">
         (Ir al Editor de Código)
       </p>
    </div>
  ),

  // Slide 8: Sinergia Interdisciplinaria (Integración)
  (
    <div key="8" className="flex justify-center w-full h-full text-left space-x-12 items-center">
      <div className="flex-1 space-y-10">
        <h2 className="text-5xl font-bold mb-4 text-emerald-400 leading-tight">El Código es Frío<br/>sin Diseño</h2>
        
        <div className="space-y-8 text-xl text-slate-300 leading-relaxed font-light">
           <div className="border-l-4 border-cyan-500 bg-cyan-900/20 p-8 rounded-r-2xl shadow-lg">
              <p className="text-3xl text-cyan-300 italic font-semibold">&quot;La tecnología sin estética es fría&quot;.</p>
           </div>
           
           <p className="text-2xl pl-4 py-4">
              Todo el esqueleto que la IA les ayude a generar hoy, mañana deberá vestirse con la 
              <span className="font-semibold text-emerald-400 inline-flex items-center gap-2 mx-2 bg-emerald-500/10 px-3 py-1 rounded">
                 <i className="fas fa-palette"></i> Paleta de Colores
              </span> 
              que el equipo de DG entregará.
           </p>

           <div className="bg-[#0a0f16] border border-cyan-500/20 p-6 rounded-2xl mt-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full"></div>
              <h4 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                 <i className="fas fa-lightbulb"></i> Consejo Técnico
              </h4>
              <p className="text-white text-xl relative z-10">
                 Usen variables (CSS/Tailwind) desde el inicio para que integrar el diseño de sus compañeros tome 
                 <strong className="text-cyan-300 text-2xl block mt-2 font-black">minutos, no horas.</strong>
              </p>
           </div>
        </div>
      </div>
      
      <div className="w-[450px] flex-shrink-0 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="w-full aspect-square rounded-[40px] overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.3)] relative z-10">
           <Image src="/design_code.png" alt="Diseño y Código" width={500} height={500} className="object-cover w-full h-full" />
        </div>
      </div>
    </div>
  ),

  // Slide 9: Checklist de Cierre para el Reto
  (
    <div key="9" className="flex flex-col justify-center w-full h-full text-left">
      <h2 className="text-5xl font-bold mb-12 text-white text-center">Antes de Entregar su MVP...</h2>
      
      <div className="grid gap-6 max-w-4xl mx-auto w-full">
         {[
            "¿El esqueleto usa Mock Data? (Sin datos reales de la UNE)",
            "¿Los roles simulados funcionan? (Alumno vs Autoridad)",
            "¿Integraron fielmente el manual de identidad de Diseño Gráfico?",
            "¿La lógica de negocio fue pensada/desarrollada por ustedes?"
         ].map((item, i) => (
            <div key={i} className="flex items-center gap-6 bg-slate-900/80 border border-slate-700/50 p-6 rounded-2xl text-2xl text-slate-200 shadow-xl group hover:border-cyan-500/50 transition-colors">
               <div className="w-10 h-10 rounded-xl border-2 border-slate-600 flex items-center justify-center flex-shrink-0 cursor-pointer group-hover:border-cyan-400 group-hover:bg-cyan-400/20 transition-all text-transparent group-hover:text-cyan-400">
                  <i className="fas fa-check"></i>
               </div>
               <span className="font-light">{item}</span>
            </div>
         ))}
      </div>
    </div>
  ),

  // Slide 10: Cierre (Outro)
  (
    <div key="10" className="flex flex-col items-center justify-center text-center space-y-12 w-full h-full relative">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none z-0 flex items-center justify-center">
         <Image src="/rocket.png" alt="Rocket Background" width={800} height={800} className="object-cover rounded-full mix-blend-screen blur-[2px]" />
       </div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-[150px] rounded-full pointer-events-none"></div>
       
       <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.3)] relative z-10 bg-black/50">
          <Image src="/rocket.png" alt="Lanzamiento" width={192} height={192} className="object-cover w-full h-full" />
       </div>
       
       <h2 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 relative z-10 drop-shadow-lg leading-tight">
         ¡A Codificar!
       </h2>
       
       <p className="text-3xl font-light text-cyan-300 relative z-10 max-w-3xl leading-relaxed bg-black/40 px-8 py-3 rounded-full backdrop-blur-md border border-white/5">
         &quot;El límite es el tiempo, pero la herramienta la controlan ustedes.&quot;
       </p>
       
       <div className="pt-16 flex items-center gap-8 mx-auto px-12 relative z-10">
          <Image src="/logo-completo.svg" alt="Hackathon 2026" width={240} height={100} className="opacity-80 drop-shadow-2xl" />
       </div>
    </div>
  )
];
