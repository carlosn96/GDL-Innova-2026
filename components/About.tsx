import { Card } from '@/components/ui/card';
import { GradientBox } from '@/components/ui/gradient-box';

export default function About() {
  return (
    <section id="about" data-section="about" className="site-section py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black theme-text-primary theme-font-heading mb-4">
            <span className="theme-title-gradient bg-clip-text text-transparent">
              Estrategia de Co-Creación Interdisciplinaria
            </span>
          </h2>
          <p className="theme-text-secondary text-xl max-w-3xl mx-auto">
            Un evento que transforma la IA, de herramienta a puente entre la lógica sistémica y la creatividad visual
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card variant="glass" className="p-8 rounded-2xl challenge-card">
            <GradientBox
              gradientFrom="cyan-500"
              gradientTo="cyan-600"
              icon="fas fa-lightbulb"
              className="w-16 h-16 rounded-xl mb-6"
            />
            <h3 className="text-2xl font-bold theme-accent-cyan-soft mb-4">VISIÓN</h3>
            <p className="theme-text-tertiary leading-relaxed">
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
            <h3 className="text-2xl font-bold theme-accent-purple-soft mb-4">OBJETIVO</h3>
            <p className="theme-text-tertiary leading-relaxed">
              Fomentar la sinergia profesional entre alumnos de Ingeniería en Computación y Diseño Gráfico mediante el desarrollo de una solución digital integral (Web/App). Se busca que los estudiantes apliquen sus conocimientos técnicos en un entorno de alta presión, fortaleciendo sus habilidades de comunicación, trabajo en equipo y resolución de problemas sociales.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
