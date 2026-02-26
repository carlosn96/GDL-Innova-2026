import { evaluationData } from '@/data/evaluation.data';
import { Card } from '@/components/ui/card';
import { GradientBox } from '@/components/ui/gradient-box';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';

export default function Evaluation() {
  return (
    <section id="evaluation" data-section="evaluation" className="site-section py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold theme-font-subheading theme-text-primary mb-4">
            <span className="theme-text-secondary bg-clip-text text-transparent">
              Criterios de Evaluación
            </span>
          </h2>
          <p className="theme-text-muted theme-font-primary text-xl">
            Evaluación holística del prototipo co-creado
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {evaluationData.map((criterion) => (
            <Card 
              key={criterion.id}
              variant="glass"
              className="p-8 rounded-2xl challenge-card text-center group hover:scale-105 transition-transform duration-300"
            >
              <GradientBox
                gradientFrom={criterion.gradient.from}
                gradientTo={criterion.gradient.to}
                icon={criterion.icon}
                className="w-24 h-24 rounded-full mx-auto mb-6"
              />
              <h3 className="text-2xl font-bold theme-font-subheading theme-text-primary mb-4">
                {criterion.title}
              </h3>
              <p className="theme-text-muted theme-font-primary leading-relaxed mb-4">
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
          <Card variant="glass" className="p-8 rounded-2xl challenge-card">
            <h3 className="text-2xl font-bold theme-font-subheading theme-text-primary text-center mb-6">
              <Icon name="fas fa-trophy" className="theme-text-secondary mr-3" />
              Jurado
            </h3>
            <p className="theme-font-primary text-center leading-relaxed">
              El jurado utilizará una Rúbrica de Integridad Simbiótica bajo estos cuatro criterios clave, asegurando que cada prototipo represente una verdadera sinergia entre la lógica computacional y la creatividad visual, con impacto real en el entorno de Guadalajara.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}