import { siteConfig } from '@/config/site.config';
import { Card } from '@/components/ui/card';
import { GradientBox } from '@/components/ui/gradient-box';
import { Icon } from '@/components/ui/icon';

const mentorRoles = [
  {
    id: 'sync',
    icon: 'check-circle',
    gradientFrom: 'cyan-500',
    gradientTo: 'blue-600',
    title: 'Sincronización Interdisciplinaria',
    description: 'Asegurar que el alumno de ingeniería no trabaje solo en la lógica del código y el de diseño solo en la estética, sino que ambos co-diseñen el flujo de usuario (UX) desde el primer minuto.',
    color: 'text-cyan-300'
  },
  {
    id: 'validation',
    icon: 'users-cog',
    gradientFrom: 'purple-500',
    gradientTo: 'pink-600',
    title: 'Validación de Viabilidad (Checkpoints)',
    description: 'Durante los bloques de trabajo, los docentes rotarán para dar "luz verde" a los MVPs, evitando que los equipos se pierdan en alcances inalcanzables para 2 días.',
    color: 'text-purple-300'
  },
  {
    id: 'ethics',
    icon: 'layer-group',
    gradientFrom: 'pink-500',
    gradientTo: 'red-600',
    title: 'Auditoría Ética',
    description: 'Supervisar que el uso de la IA sea responsable, verificando sesgos en los modelos y la procedencia de los datos urbanos utilizados.',
    color: 'text-pink-300'
  }
];

export default function About() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Estrategia de Co-Creación Interdisciplinaria
            </span>
          </h2>
          <p className="text-cyan-200 text-xl max-w-3xl mx-auto">
            Un evento que transforma la IA de herramienta a puente entre la lógica sistémica y la creatividad visual
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card variant="glass" className="p-8 rounded-2xl challenge-card">
            <GradientBox
              gradientFrom="cyan-500"
              gradientTo="blue-600"
              icon="lightbulb"
              className="w-16 h-16 rounded-xl mb-6"
            />
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">La Visión</h3>
            <p className="text-gray-300 leading-relaxed">
              Este evento busca unir a estudiantes de {siteConfig.organization.departments.engineering} y {siteConfig.organization.departments.design} bajo un objetivo común: explorar cómo la IA actúa como puente entre la lógica sistémica y la creatividad visual para resolver retos reales en Guadalajara.
            </p>
          </Card>

          <Card variant="glass" className="p-8 rounded-2xl challenge-card">
            <GradientBox
              gradientFrom="purple-500"
              gradientTo="pink-600"
              icon="rocket"
              className="w-16 h-16 rounded-xl mb-6"
            />
            <h3 className="text-2xl font-bold text-purple-300 mb-4">El Objetivo</h3>
            <p className="text-gray-300 leading-relaxed">
              Crear soluciones reales donde el diseño no sea solo estético y el código no sea solo funcional, sino que ambos convergan en prototipos que impacten la sociedad y la industria local de Guadalajara.
            </p>
          </Card>
        </div>

        {/* Mentores Section */}
        <Card variant="glass" className="p-8 rounded-2xl">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            <Icon name="chalkboard-teacher" className="text-cyan-400 mr-3" />
            El Docente como Facilitador de la Sinergia
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {mentorRoles.map((role) => (
              <div key={role.id} className="text-center">
                <GradientBox
                  gradientFrom={role.gradientFrom}
                  gradientTo={role.gradientTo}
                  icon={role.icon}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h4 className={`${role.color} font-bold text-lg mb-2`}>
                  {role.title}
                </h4>
                <p className="text-gray-300 text-sm">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
