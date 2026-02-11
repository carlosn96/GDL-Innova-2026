/**
 * Challenge Types - Tipos relacionados con los retos del hackathon
 */

import { ColorVariant, IconProps } from './common.types';

export interface ChallengeSynergy {
  role: 'IC' | 'LDGM';
  description: string;
}

export interface ChallengeTag {
  label: string;
  color: ColorVariant;
}

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: {
    from: string;
    to: string;
  };
  description: string;
  problem: string;
  objective?: string;
  synergy?: ChallengeSynergy[];
  aiValue?: string;
  tags: ChallengeTag[];
  animationDelay?: string;
}

export interface ChallengeCardProps {
  challenge: Challenge;
  onClick: (id: string) => void;
}

export interface ChallengeModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
}
