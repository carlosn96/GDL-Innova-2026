import { evaluationData } from '@/data/evaluation.data';
import { Card } from '@/components/ui/card';
import { GradientBox } from '@/components/ui/gradient-box';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';

export default function Evaluation() {
  return (
    <section id="evaluation" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Criterios de Evaluación
            </span>
          </h2>
          <p className="text-cyan-200 text-xl">
            Evaluación holística del prototipo co-creado
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {evaluationData.map((criterion) => (
            <Card 
              key={criterion.id}
              variant="glass"
              className="p-8 rounded-2xl text-center group hover:scale-105 transition-transform duration-300"
            >
              <GradientBox
                gradientFrom={criterion.gradient.from}
                gradientTo={criterion.gradient.to}
                icon={criterion.icon.replace('fas fa-', '')}
                className="w-24 h-24 rounded-full mx-auto mb-6"
              />
              <h3 className={`text-2xl font-bold mb-4 ${
                criterion.id === 'value-proposition' ? 'text-cyan-300' :
                criterion.id === 'interdependence' ? 'text-purple-300' :
                criterion.id === 'ai-execution' ? 'text-pink-300' : 'text-cyan-300'
              }`}>
                {criterion.title}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                {criterion.description}
              </p>
              <Badge 
                color={
                  criterion.id === 'value-proposition' ? 'cyan' :
                  criterion.id === 'interdependence' ? 'purple' :
                  criterion.id === 'ai-execution' ? 'pink' : 'cyan'
                }
              >
                {criterion.weight}%
              </Badge>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card variant="glass" className="p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              <Icon name="trophy" className="text-yellow-400 mr-3" />
              Jurado Docente
            </h3>
            <p className="text-gray-300 text-center leading-relaxed">
              El jurado docente utilizará una Rúbrica de Integridad Simbiótica bajo estos cuatro criterios clave, asegurando que cada prototipo represente una verdadera sinergia entre la lógica computacional y la creatividad visual, con impacto real en el entorno de Guadalajara.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}