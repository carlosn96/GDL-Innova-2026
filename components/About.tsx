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
            Un evento que transforma la IA, de herramienta a puente entre la lógica sistémica y la creatividad visual
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card variant="glass" className="p-8 rounded-2xl challenge-card">
            <GradientBox
              gradientFrom="cyan-500"
              gradientTo="blue-600"
              icon="fas fa-lightbulb"
              className="w-16 h-16 rounded-xl mb-6"
            />
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">VISIÓN</h3>
            <p className="text-gray-300 leading-relaxed">
              Convertir al Hackathon en el referente universitario de colaboración interdisciplinaria, donde la tecnología y el diseño gráfico se fusionen para crear soluciones disruptivas. Cada edición será un motor de soluciones reales, demostrando que la tecnología sin estética es fría, y que el diseño sin funcionalidad es vacío.
            </p>
          </Card>

          <Card variant="glass" className="p-8 rounded-2xl challenge-card">
            <GradientBox
              gradientFrom="purple-500"
              gradientTo="pink-600"
              icon="fas fa-rocket"
              className="w-16 h-16 rounded-xl mb-6"
            />
            <h3 className="text-2xl font-bold text-purple-300 mb-4">OBJETIVO</h3>
            <p className="text-gray-300 leading-relaxed">
              Fomentar la sinergia profesional entre alumnos de Ingeniería en Computación y Diseño Gráfico mediante el desarrollo de una solución digital integral (Web/App). Se busca que los estudiantes apliquen sus conocimientos técnicos en un entorno de alta presión, fortaleciendo sus habilidades de comunicación, trabajo en equipo y resolución de problemas sociales.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
