/**
 * Schedule Types - Tipos relacionados con el cronograma del HACKATHON
 */

import { ColorVariant, TimeRange } from './common.types';

export interface ScheduleActivity {
  id: string;
  icon: string;
  gradient: {
    from: string;
    to: string;
  };
  title: string;
  timeRange: TimeRange;
  description: string;
  isSpecial?: boolean;
}

export interface ScheduleDay {
  dayNumber: 1 | 2;
  title: string;
  subtitle: string;
  dayOfMonth: number;
  month: string;
  location: string;
  objective: string;
  color: ColorVariant;
  activities: ScheduleActivity[];
}

export interface ScheduleDayProps {
  day: ScheduleDay;
}

export interface ScheduleActivityCardProps {
  activity: ScheduleActivity;
}
