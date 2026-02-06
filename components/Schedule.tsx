'use client';

import { scheduleData } from '@/data';
import { siteConfig } from '@/config';
import { Card, GradientBox, Icon } from './ui';
import { buildGradientClass, formatTimeRange } from '@/lib/utils';

export default function Schedule() {
  return (
    <section id="schedule" className="py-20 px-4 bg-black bg-opacity-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Cronograma Intensivo
            </span>
          </h2>
          <p className="text-cyan-200 text-xl">
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
                    gradientTo={day.dayNumber === 1 ? 'blue-600' : 'pink-600'}
                    size="lg"
                    shape="circle"
                  >
                    <span className="text-white font-black text-2xl">{day.dayNumber}</span>
                  </GradientBox>
                </div>
                <h3 className={`text-3xl font-bold text-center mb-2 ${
                  day.dayNumber === 1 ? 'text-cyan-300' : 'text-pink-300'
                }`}>{day.title}</h3>
                <p className="text-center text-gray-300 mb-8">{day.subtitle}</p>
                <p className={`text-center text-lg font-semibold mb-8 ${
                  day.dayNumber === 1 ? 'text-cyan-200' : 'text-pink-200'
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
                    className={`timeline-item-3d ${activity.isSpecial ? 'border-2 border-cyan-500' : ''}`}
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
                          <h4 className="font-bold text-lg text-cyan-300">{activity.title}</h4>
                          <p className="text-gray-400 text-sm">
                            {formatTimeRange(activity.timeRange.start, activity.timeRange.end)}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm md:ml-16">{activity.description}</p>
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