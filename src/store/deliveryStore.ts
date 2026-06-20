import { create } from 'zustand';
import type { Parcel, DeliveryPlan, DeliveryStrategy, TimePeriod } from '@/types/metro';
import { planMultipleDeliveries, defaultDeliveryStrategy } from '@/lib/deliveryPlanning';

interface DeliveryState {
  parcels: Parcel[];
  deliveryPlans: DeliveryPlan[];
  selectedParcelId: string | null;
  deliveryStrategy: DeliveryStrategy;
  timePeriod: TimePeriod;
  blockedStations: string[];
  isCalculating: boolean;
  error: string | null;

  addParcel: (parcel: Omit<Parcel, 'id'>) => void;
  removeParcel: (id: string) => void;
  updateParcel: (id: string, updates: Partial<Parcel>) => void;
  setSelectedParcel: (id: string | null) => void;
  setDeliveryStrategy: (strategy: DeliveryStrategy) => void;
  setTimePeriod: (period: TimePeriod) => void;
  setBlockedStations: (stations: string[]) => void;
  calculateDeliveries: () => void;
  clearAll: () => void;
}

let parcelIdCounter = 1;

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  parcels: [],
  deliveryPlans: [],
  selectedParcelId: null,
  deliveryStrategy: defaultDeliveryStrategy,
  timePeriod: 'off-peak',
  blockedStations: [],
  isCalculating: false,
  error: null,

  addParcel: (parcel) => {
    const newParcel: Parcel = {
      ...parcel,
      id: `P${parcelIdCounter++}`,
    };
    set((state) => ({
      parcels: [...state.parcels, newParcel],
      deliveryPlans: [],
    }));
  },

  removeParcel: (id) => {
    set((state) => ({
      parcels: state.parcels.filter((p) => p.id !== id),
      deliveryPlans: [],
      selectedParcelId: state.selectedParcelId === id ? null : state.selectedParcelId,
    }));
  },

  updateParcel: (id, updates) => {
    set((state) => ({
      parcels: state.parcels.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
      deliveryPlans: [],
    }));
  },

  setSelectedParcel: (id) => {
    set({ selectedParcelId: id });
  },

  setDeliveryStrategy: (strategy) => {
    set({ deliveryStrategy: strategy, deliveryPlans: [] });
  },

  setTimePeriod: (period) => {
    set({ timePeriod: period, deliveryPlans: [] });
  },

  setBlockedStations: (stations) => {
    set({ blockedStations: stations, deliveryPlans: [] });
  },

  calculateDeliveries: () => {
    const { parcels, deliveryStrategy, blockedStations, timePeriod } = get();

    if (parcels.length === 0) {
      set({ error: '请先添加快递包裹' });
      return;
    }

    set({ isCalculating: true, error: null });

    try {
      const plans = planMultipleDeliveries(
        parcels,
        deliveryStrategy,
        blockedStations,
        timePeriod,
      );

      if (plans.length === 0) {
        set({
          isCalculating: false,
          error: '无法为任何包裹找到配送路线',
          deliveryPlans: [],
        });
        return;
      }

      set({
        isCalculating: false,
        deliveryPlans: plans,
      });
    } catch (e) {
      set({
        isCalculating: false,
        error: '配送规划计算出错，请重试',
      });
    }
  },

  clearAll: () => {
    set({
      parcels: [],
      deliveryPlans: [],
      selectedParcelId: null,
      isCalculating: false,
      error: null,
    });
  },
}));
