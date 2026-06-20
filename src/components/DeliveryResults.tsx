import { Package, Clock, AlertTriangle, CheckCircle, XCircle, TrendingDown, Repeat, MapPin, Zap, Trophy } from 'lucide-react';
import { useDeliveryStore } from '@/store/deliveryStore';
import { useMetroStore } from '@/store/metroStore';
import { getStationById, getLineById } from '@/data/metroNetwork';
import { cn } from '@/lib/utils';
import { formatClockTime, formatTime } from '@/lib/deliveryPlanning';
import type { DeliveryPlan } from '@/types/metro';

function DeliveryCard({
  plan,
  isActive,
  onClick,
}: {
  plan: DeliveryPlan;
  isActive: boolean;
  onClick: () => void;
}) {
  const pickupStation = getStationById(plan.parcel.pickupStation);
  const deliveryStation = getStationById(plan.parcel.deliveryStation);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all',
        isActive
          ? 'border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-200'
          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            plan.isOnTime ? 'bg-green-100' : 'bg-rose-100',
          )}>
            {plan.isOnTime ? (
              <CheckCircle size={18} className="text-green-600" />
            ) : (
              <XCircle size={18} className="text-rose-600" />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">{plan.parcel.name}</div>
            <div className="text-xs text-slate-500">
              {pickupStation?.name} → {deliveryStation?.name}
            </div>
          </div>
        </div>
        <div className={cn(
          'px-2 py-1 rounded-md text-xs font-bold',
          plan.isOnTime
            ? 'bg-green-100 text-green-700'
            : 'bg-rose-100 text-rose-700',
        )}>
          {plan.isOnTime ? '准点' : '超时'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xs text-slate-400">预计到达</div>
          <div className="font-bold text-slate-700 text-sm">{formatClockTime(plan.arrivalTime)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400">截止时间</div>
          <div className="font-bold text-slate-700 text-sm">{formatClockTime(plan.parcel.deadline)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400">综合评分</div>
          <div className={cn(
            'font-bold text-sm',
            plan.totalScore < 30 ? 'text-green-600' : plan.totalScore < 60 ? 'text-amber-600' : 'text-rose-600',
          )}>
            {plan.totalScore.toFixed(1)}
          </div>
        </div>
      </div>

      {!plan.isOnTime && (
        <div className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-500 shrink-0" />
          <span className="text-xs text-rose-700">
            超时 {formatTime(plan.overtimeMinutes)}，罚分 {plan.overtimePenalty.toFixed(1)}
          </span>
        </div>
      )}
    </button>
  );
}

function DeliveryDetail({ plan }: { plan: DeliveryPlan }) {
  const pickupStation = getStationById(plan.parcel.pickupStation);
  const deliveryStation = getStationById(plan.parcel.deliveryStation);

  const scoreBreakdown = [
    { label: '超时罚分', value: plan.overtimePenalty, color: 'rose' },
    { label: '换乘难度', value: plan.transferDifficulty, color: 'blue' },
    { label: '重量罚分', value: plan.parcel.weight * 0.5, color: 'purple' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium mb-0.5">
            <Clock size={13} /> 行程耗时
          </div>
          <div className="text-xl font-bold text-blue-700">
            {formatTime(plan.totalTime)}
          </div>
        </div>
        <div className={cn(
          'rounded-xl p-3',
          plan.isOnTime
            ? 'bg-gradient-to-br from-green-50 to-green-100'
            : 'bg-gradient-to-br from-rose-50 to-rose-100',
        )}>
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-medium mb-0.5',
            plan.isOnTime ? 'text-green-600' : 'text-rose-600',
          )}>
            {plan.isOnTime ? <CheckCircle size={13} /> : <XCircle size={13} />}
            送达状态
          </div>
          <div className={cn(
            'text-xl font-bold',
            plan.isOnTime ? 'text-green-700' : 'text-rose-700',
          )}>
            {plan.isOnTime ? '准点送达' : '超时送达'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <TrendingDown size={16} className="text-amber-500" />
          评分明细
        </h4>
        <div className="space-y-2">
          {scoreBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className={cn(
                'font-semibold',
                item.color === 'rose' && 'text-rose-600',
                item.color === 'blue' && 'text-blue-600',
                item.color === 'purple' && 'text-purple-600',
              )}>
                {item.value.toFixed(1)} 分
              </span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">综合评分</span>
            <span className={cn(
              'text-lg font-bold',
              plan.totalScore < 30 ? 'text-green-600' : plan.totalScore < 60 ? 'text-amber-600' : 'text-rose-600',
            )}>
              {plan.totalScore.toFixed(1)} 分
            </span>
          </div>
        </div>
      </div>

      {plan.route && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-indigo-500" />
            配送路线
          </h4>
          <div className="space-y-2">
            {plan.route.segments.map((seg, idx) => {
              const line = getLineById(seg.line);
              const from = getStationById(seg.fromStation);
              const to = getStationById(seg.toStation);
              return (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: line?.color }}
                  />
                  <span className="text-slate-600">
                    {from?.name} → {to?.name}
                  </span>
                  <span className="text-slate-400 ml-auto">
                    {seg.stationCount}站 · {seg.travelTime}分钟
                  </span>
                </div>
              );
            })}
            {plan.route.transfers.length > 0 && (
              <div className="mt-2 pt-2 border-t border-dashed border-slate-200">
                <div className="text-xs text-amber-600 font-medium mb-1">换乘信息</div>
                {plan.route.transfers.map((tr, idx) => {
                  const station = getStationById(tr.station);
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                      <Repeat size={12} className="text-amber-500" />
                      <span>{station?.name} · 步行 {tr.walkTime} 分钟</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-slate-400 mb-1">取件站</div>
            <div className="font-semibold text-slate-700">{pickupStation?.name}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">送达站</div>
            <div className="font-semibold text-slate-700">{deliveryStation?.name}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">取件时间</div>
            <div className="font-semibold text-slate-700">{formatClockTime(plan.parcel.pickupTime)}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">截止时间</div>
            <div className="font-semibold text-slate-700">{formatClockTime(plan.parcel.deadline)}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">包裹重量</div>
            <div className="font-semibold text-slate-700">{plan.parcel.weight} kg</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">换乘次数</div>
            <div className="font-semibold text-slate-700">{plan.route?.transferCount ?? 0} 次</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryResults() {
  const { deliveryPlans, selectedParcelId, setSelectedParcel, isCalculating, error, calculateDeliveries, parcels } =
    useDeliveryStore();
  const { setHighlightedRoute } = useMetroStore();

  const selectedPlan = deliveryPlans.find((p) => p.parcel.id === selectedParcelId) ?? null;

  const handleSelectPlan = (plan: DeliveryPlan) => {
    setSelectedParcel(plan.parcel.id);
    if (plan.route) {
      setHighlightedRoute(plan.route);
    }
  };

  const sortedPlans = [...deliveryPlans].sort((a, b) => a.totalScore - b.totalScore);

  if (parcels.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={28} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">暂无包裹</h3>
        <p className="text-sm text-slate-500">请先在左侧添加快递包裹</p>
      </div>
    );
  }

  if (deliveryPlans.length === 0 && !isCalculating) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Package size={18} className="text-amber-500" />
          配送规划
        </h3>
        <div className="text-center py-6">
          <Zap size={32} className="mx-auto mb-3 text-amber-400" />
          <p className="text-sm text-slate-500 mb-4">
            已添加 {parcels.length} 个包裹，点击下方按钮计算配送方案
          </p>
          <button
            onClick={calculateDeliveries}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            计算配送方案
          </button>
        </div>
        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            配送方案
          </h3>
          <span className="text-xs text-slate-500">
            共 {deliveryPlans.length} 个方案
          </span>
        </div>

        {isCalculating ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto mb-3 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">正在计算最优配送方案...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {sortedPlans.map((plan, idx) => (
              <div key={plan.parcel.id} className="relative">
                {idx === 0 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-md">
                      最优
                    </span>
                  </div>
                )}
                <DeliveryCard
                  plan={plan}
                  isActive={selectedParcelId === plan.parcel.id}
                  onClick={() => handleSelectPlan(plan)}
                />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>

      {selectedPlan && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-amber-500" />
            配送详情
          </h3>
          <DeliveryDetail plan={selectedPlan} />
        </div>
      )}
    </div>
  );
}
