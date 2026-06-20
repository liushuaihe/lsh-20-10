import type { Parcel, DeliveryPlan, DeliveryStrategy, RouteResult, TimePeriod } from '@/types/metro';
import { findAllRoutes } from '@/lib/pathfinding';
import { getStationById } from '@/data/metroNetwork';

const defaultDeliveryStrategy: DeliveryStrategy = {
  overtimePenaltyRate: 2.0,
  transferDifficultyWeight: 1.5,
  weightPenaltyRate: 0.5,
};

function calculateTransferDifficulty(route: RouteResult): number {
  let difficulty = 0;
  difficulty += route.transferCount * 10;

  for (const transfer of route.transfers) {
    difficulty += transfer.walkTime * 2;
    difficulty += transfer.penalty * 3;

    const station = getStationById(transfer.station);
    if (station?.isHub) {
      difficulty += 5;
    }
  }

  return difficulty;
}

export function planDelivery(
  parcel: Parcel,
  strategy: DeliveryStrategy = defaultDeliveryStrategy,
  blockedStations: string[] = [],
  timePeriod: TimePeriod = 'off-peak',
): DeliveryPlan | null {
  const routes = findAllRoutes(
    parcel.pickupStation,
    parcel.deliveryStation,
    blockedStations,
    timePeriod,
  );

  const availableRoutes = Array.from(routes.values()).filter(
    (r): r is RouteResult => r !== null,
  );

  if (availableRoutes.length === 0) {
    return null;
  }

  let bestPlan: DeliveryPlan | null = null;
  let bestScore = Infinity;

  for (const route of availableRoutes) {
    const totalTime = route.totalTime;
    const arrivalTime = parcel.pickupTime + totalTime;
    const overtimeMinutes = Math.max(0, arrivalTime - parcel.deadline);
    const isOnTime = overtimeMinutes === 0;

    const overtimePenalty = overtimeMinutes * strategy.overtimePenaltyRate;
    const transferDifficulty = calculateTransferDifficulty(route);
    const weightPenalty = parcel.weight * strategy.weightPenaltyRate;

    const totalScore =
      overtimePenalty +
      transferDifficulty * strategy.transferDifficultyWeight +
      weightPenalty;

    if (totalScore < bestScore) {
      bestScore = totalScore;
      bestPlan = {
        parcel,
        route,
        totalTime,
        arrivalTime,
        isOnTime,
        overtimeMinutes,
        overtimePenalty,
        transferDifficulty,
        totalScore,
      };
    }
  }

  return bestPlan;
}

export function planMultipleDeliveries(
  parcels: Parcel[],
  strategy: DeliveryStrategy = defaultDeliveryStrategy,
  blockedStations: string[] = [],
  timePeriod: TimePeriod = 'off-peak',
): DeliveryPlan[] {
  const plans: DeliveryPlan[] = [];

  for (const parcel of parcels) {
    const plan = planDelivery(parcel, strategy, blockedStations, timePeriod);
    if (plan) {
      plans.push(plan);
    }
  }

  return plans;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
}

export function formatClockTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = Math.floor(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export { defaultDeliveryStrategy };
