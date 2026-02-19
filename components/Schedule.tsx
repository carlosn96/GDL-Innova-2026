'use client';

import { scheduleData } from '@/data';
import { useSiteConfig } from '@/lib/site-context';
import { Card, GradientBox, Icon } from './ui';
import { formatTimeRange } from '@/lib/utils';

export default function Schedule() {
  const { siteConfig } = useSiteConfig();
  return (
    <section id="schedule" data-section="schedule" className="site-section py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black theme-text-primary mb-4">
            <span className="theme-title-gradient bg-clip-text text-transparent">
              Cronograma Intensivo
            </span>
          </h2>
          <p className="theme-text-secondary text-xl">
            {siteConfig.event.duration.schedule} • Dos días de colaboración y ejecución
          </p>
        </div>

        <div id="scheduleContent">
          {scheduleData.map(day => (
            <div key={day.dayNumber} className={day.dayNumber === 1 ? 'mb-12' : ''}>
              <Card variant="glass" padding="lg" className="mb-8">
                <div className="flex items-center justify-center mb-6">
                  <GradientBox
                    gradientFrom={day.dayNumber === 1 ? 'cyan-500' : 'purple-500'}
                    gradientTo={day.dayNumber === 1 ? 'cyan-600' : 'pink-600'}
                    size="lg"
                    shape="circle"
                  >
                    <span className="theme-text-primary font-black text-2xl">{day.dayNumber}</span>
                  </GradientBox>
                </div>
                <h3 className={`text-3xl font-bold text-center mb-2 ${
                  day.dayNumber === 1 ? 'theme-accent-cyan-soft' : 'theme-accent-pink-soft'
                }`}>{day.title}</h3>
                <p className="text-center theme-text-tertiary mb-8">{day.subtitle}</p>
                <p className={`text-center text-lg font-semibold mb-8 ${
                  day.dayNumber === 1 ? 'theme-text-secondary' : 'theme-accent-pink-soft'
                }`}>
                  <Icon name="fas fa-bullseye" className="mr-2" />
                  {day.objective}
                </p>
              </Card>

              <div className="space-y-4 timeline-3d">
                {day.activities.map((activity) => (
                  <Card 
                    key={activity.id} 
                    variant="glass" 
                    padding="md" 
                    className={`timeline-item-3d ${activity.isSpecial ? 'border-2 theme-border-muted' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center mb-4 md:mb-0">
                        <GradientBox
                          icon={activity.icon}
                          gradientFrom={activity.gradient.from}
                          gradientTo={activity.gradient.to}
                          size="md"
                          shape="rounded"
                          className="mr-4"
                        />
                        <div>
                          <h4 className="font-bold text-lg theme-accent-cyan-soft">{activity.title}</h4>
                          <p className="theme-text-muted text-sm">
                            {formatTimeRange(activity.timeRange.start, activity.timeRange.end)}
                          </p>
                        </div>
                      </div>
                      <p className="theme-text-tertiary text-sm md:ml-16">{activity.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}