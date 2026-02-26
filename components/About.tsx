import { Card } from '@/components/ui/card';

export default function About() {
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
              <p className="theme-font-primary leading-relaxed text-xl text-center" >
                El HACKATHON es un evento de innovación donde diferentes personas se reúnen para crear y diseñar soluciones a una o más problemáticas que existen en la sociedad actualmente o dentro de una empresa u organización.
                <br></br>
                En este 2026, transformaremos la IA, de herramienta a puente entre la lógica sistémica y la creatividad visual.
              </p>
            </article>
          </Card>
        </div>
      </div>
    </section>
  );
}
