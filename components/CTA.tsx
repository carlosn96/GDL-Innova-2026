import { siteConfig } from '@/config/site.config';
import { EVENT_STATS } from '@/config/constants';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
      <div className="max-w-4xl mx-auto text-center">
        <Card variant="glass" className="p-12 rounded-3xl">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            ¿Listo para el <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Hackathon?</span>
          </h2>
          <p className="text-cyan-200 text-xl mb-8 max-w-2xl mx-auto">
            ¡Prepárate para una experiencia electrizante que fusione la creatividad humana con la inteligencia artificial! Sumérgete en el epicentro de la innovación, donde tus ideas cobrarán vida en proyectos reales que transformarán Guadalajara y catapultarán tu carrera hacia el futuro digital.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={siteConfig.external.calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <Icon name="calendar-plus" className="mr-2" />
              Agendar Evento!
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-black text-cyan-400 mb-2">{EVENT_STATS.DAYS}</div>
              <div className="text-gray-300 text-sm">Días Intensivos</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-400 mb-2">{EVENT_STATS.CAREERS}</div>
              <div className="text-gray-300 text-sm">Carreras</div>
            </div>
            <div>
              <div className="text-3xl font-black text-pink-400 mb-2">{EVENT_STATS.TRACKS}</div>
              <div className="text-gray-300 text-sm">Ejes Temáticos</div>
            </div>
            <div>
              <div className="text-3xl font-black text-cyan-400 mb-2">{EVENT_STATS.POSSIBILITIES}</div>
              <div className="text-gray-300 text-sm">Posibilidades</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}