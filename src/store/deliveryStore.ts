import { create } from 'zustand';
import type { Parcel, DeliveryPlan, DeliveryStrategy, TimePeriod } from '@/types/metro';
import { planMultipleDeliveries, defaultDeliveryStrategy } from '@/lib/deliveryPlanning';
import { useMetroStore } from '@/store/metroStore';

const STORAGE_KEY = 'metro-delivery-store';
const COUNTER_KEY = 'metro-delivery-counter';

function loadParcelsFromStorage(): Parcel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveParcelsToStorage(parcels: Parcel[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
  } catch {
    /* ignore */
  }
}

function loadCounterFromStorage(): number {
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    if (!raw) return 1;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  } catch {
    return 1;
  }
}

function saveCounterToStorage(counter: number) {
  try {
    localStorage.setItem(COUNTER_KEY, counter.toString());
  } catch {
    /* ignore */
  }
}

function syncHighlightedRouteByParcelId(parcelId: string | null, plans: DeliveryPlan[]) {
  try {
    const setHighlighted = useMetroStore.getState().setHighlightedRoute;
    if (!parcelId) {
      setHighlighted(null);
      return;
    }
    const plan = plans.find((p) => p.parcel.id === parcelId);
    setHighlighted(plan?.route ?? null);
  } catch {
    /* ignore */
  }
}

let parcelIdCounter = loadCounterFromStorage();

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

const initialParcels = loadParcelsFromStorage();
if (initialParcels.length > 0) {
  const maxIdNum = initialParcels.reduce((max, p) => {
    const m = /^P(\d+)$/.exec(p.id);
    if (!m) return max;
    return Math.max(max, parseInt(m[1], 10));
  }, 0);
  if (maxIdNum >= parcelIdCounter) {
    parcelIdCounter = maxIdNum + 1;
    saveCounterToStorage(parcelIdCounter);
  }
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  parcels: initialParcels,
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
      id: `P${parcelIdCounter}`,
    };
    parcelIdCounter++;
    saveCounterToStorage(parcelIdCounter);

    set((state) => {
      const nextParcels = [...state.parcels, newParcel];
      saveParcelsToStorage(nextParcels);
      return {
        parcels: nextParcels,
        deliveryPlans: [],
      };
    });

    try {
      useMetroStore.getState().setHighlightedRoute(null);
    } catch {
      /* ignore */
    }
  },

  removeParcel: (id) => {
    set((state) => {
      const nextParcels = state.parcels.filter((p) => p.id !== id);
      saveParcelsToStorage(nextParcels);
      const nextSelected = state.selectedParcelId === id ? null : state.selectedParcelId;
      return {
        parcels: nextParcels,
        deliveryPlans: [],
        selectedParcelId: nextSelected,
      };
    });

    try {
      useMetroStore.getState().setHighlightedRoute(null);
    } catch {
      /* ignore */
    }
  },

  updateParcel: (id, updates) => {
    set((state) => {
      const nextParcels = state.parcels.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      );
      saveParcelsToStorage(nextParcels);
      return {
        parcels: nextParcels,
        deliveryPlans: [],
      };
    });
  },

  setSelectedParcel: (id) => {
    set({ selectedParcelId: id });
    syncHighlightedRouteByParcelId(id, get().deliveryPlans);
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
    const { parcels, deliveryStrategy, blockedStations, timePeriod, selectedParcelId } = get();

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
        try {
          useMetroStore.getState().setHighlightedRoute(null);
        } catch {
          /* ignore */
        }
        return;
      }

      let nextSelectedId = selectedParcelId;
      if (!nextSelectedId || !plans.find((p) => p.parcel.id === nextSelectedId)) {
        nextSelectedId = plans[0].parcel.id;
      }

      set({
        isCalculating: false,
        deliveryPlans: plans,
        selectedParcelId: nextSelectedId,
      });

      syncHighlightedRouteByParcelId(nextSelectedId, plans);
    } catch (e) {
      set({
        isCalculating: false,
        error: '配送规划计算出错，请重试',
      });
    }
  },

  clearAll: () => {
    parcelIdCounter = 1;
    saveCounterToStorage(parcelIdCounter);
    saveParcelsToStorage([]);
    try {
      useMetroStore.getState().setHighlightedRoute(null);
    } catch {
      /* ignore */
    }
    set({
      parcels: [],
      deliveryPlans: [],
      selectedParcelId: null,
      isCalculating: false,
      error: null,
    });
  },
}));
