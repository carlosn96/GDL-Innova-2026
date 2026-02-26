'use client';

import { scheduleData } from '@/data';
import { Card, GradientBox } from './ui';
import { formatTimeRange } from '@/lib/utils';

export default function Schedule() {
  return (
    <section id="schedule" data-section="schedule" className="site-section py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold theme-text-primary theme-font-subheading mb-4">
            <span className="theme-text-secondary bg-clip-text text-transparent">
              Cronograma
            </span>
          </h2>
        </div>

        <div id="scheduleContent" className="space-y-12">
          {scheduleData.map((day) => (
            <Card key={day.dayNumber} variant="glass" padding="lg" className="overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                {/* Left: Date & Location Panel with purple→pink gradient */}
                <div className="lg:w-64 flex-shrink-0">
                  <div
                    className="rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center text-center h-full"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #035164 80%, #009E9A 70%)',
                    }}
                  >
                    <span
                      className="text-[10rem] md:text-[12rem] theme-text-primary theme-font-heading font-black leading-none mb-1"
                    >
                      {day.dayOfMonth}
                    </span>
                    <span className="text-3xl font-semibold theme-text-primary theme-font-subheading uppercase tracking-wide">{day.month}</span>

                    <div className="w-12 border border-white/10 my-4" />

                    <span className="text-xl font-bold theme-text-primary uppercase tracking-widest">
                      {day.location}
                    </span>
                  </div>
                </div>

                {/* Right: Activity List */}
                <div className="flex-1 min-w-0">
                  <h3 className="theme-font-subheading font-bold text-xl theme-text-primary mb-3">
                    {day.title}
                  </h3>

                  <div className="space-y-3">
                    {day.activities.map((activity) => (
                      <div key={activity.id} className={`rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] ${activity.isSpecial ? 'border theme-border-muted' : 'border border-white/5'}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_7rem_1fr] sm:items-center sm:gap-4">
                          <GradientBox icon={activity.icon} gradientFrom={activity.gradient.from} gradientTo={activity.gradient.to} size="md" shape="rounded" iconColor="theme-text" />
                          <p className="text-xl">{formatTimeRange(activity.timeRange.start, activity.timeRange.end)}</p>
                          <div className="flex flex-col items-start text-left gap-1">
                            <h4 className="theme-font-subheading font-bold text-xl theme-text-primary">{activity.title}</h4>
                            <p className="theme-text-muted theme-font-primary text-xs max-w-none">{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}