import { techStackData } from '@/data/tech-stack.data';
import { Card } from '@/components/ui/card';
import { GradientBox } from '@/components/ui/gradient-box';
import { Icon } from '@/components/ui/icon';

export default function Tech() {
  return (
    <section id="tech" className="py-20 px-4 bg-black bg-opacity-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Stack Tecnológico
            </span>
          </h2>
          <p className="text-cyan-200 text-xl mb-4">
            Herramientas de capa gratuita 2026
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {techStackData.map((category) => (
            <Card key={category.id} variant="glass" className="p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <GradientBox
                  gradientFrom={category.gradient.from}
                  gradientTo={category.gradient.to}
                  icon={category.icon.replace('fas fa-', '')}
                  className="w-16 h-16 rounded-xl mr-4"
                />
                <h3 className={`text-2xl font-bold ${
                  category.id === 'engineering' ? 'text-cyan-300' :
                  category.id === 'design' ? 'text-purple-300' : 'text-pink-300'
                }`}>
                  {category.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {category.items.map((tool, index) => (
                  <li key={index} className="flex items-start">
                    <Icon 
                      name="chevron-right" 
                      className={`mr-3 mt-1 ${
                        category.id === 'engineering' ? 'text-cyan-400' :
                        category.id === 'design' ? 'text-purple-400' : 'text-pink-400'
                      }`}
                    />
                    <span className="text-gray-300">
                      <strong className="text-white">{tool.name}:</strong> {tool.description}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}