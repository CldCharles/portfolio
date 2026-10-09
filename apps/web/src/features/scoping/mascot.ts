import type { MascotPose } from '@/features/mascot/ChibiMascot.vue';
import type { Check } from './checks';

/** The mascot thinks while a check needs attention and gives a thumbs up once everything passes. */
export function mascotPose(checks: Check[]): MascotPose {
  if (checks.some(check => check.level === 'warning')) return 'thinking';
  return checks.length ? 'happy' : 'idle';
}
