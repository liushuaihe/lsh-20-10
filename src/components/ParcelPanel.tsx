import { useState } from 'react';
import { Package, Plus, Trash2, MapPin, Scale, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { stations, getStationById } from '@/data/metroNetwork';
import { useDeliveryStore } from '@/store/deliveryStore';
import { cn } from '@/lib/utils';
import { formatClockTime } from '@/lib/deliveryPlanning';

export default function ParcelPanel() {
  const { parcels, selectedParcelId, addParcel, removeParcel, setSelectedParcel } = useDeliveryStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedParcelId, setExpandedParcelId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [pickupStation, setPickupStation] = useState('');
  const [deliveryStation, setDeliveryStation] = useState('');
  const [weight, setWeight] = useState('1');
  const [pickupTime, setPickupTime] = useState('480');
  const [deadline, setDeadline] = useState('600');

  const handleAddParcel = () => {
    if (!name || !pickupStation || !deliveryStation) return;

    addParcel({
      name,
      pickupStation,
      deliveryStation,
      weight: parseFloat(weight) || 1,
      pickupTime: parseInt(pickupTime) || 480,
      deadline: parseInt(deadline) || 600,
    });

    setName('');
    setPickupStation('');
    setDeliveryStation('');
    setWeight('1');
    setPickupTime('480');
    setDeadline('600');
    setShowAddForm(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedParcelId(expandedParcelId === id ? null : id);
  };

  const handleParcelClick = (id: string) => {
    setSelectedParcel(selectedParcelId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package size={18} className="text-amber-500" />
            快递包裹管理
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              showAddForm
                ? 'bg-slate-100 text-slate-600'
                : 'bg-amber-500 text-white hover:bg-amber-600',
            )}
          >
            <Plus size={16} />
            {showAddForm ? '取消' : '添加包裹'}
          </button>
        </div>

        {showAddForm && (
          <div className="space-y-3 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">包裹名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：生鲜食品"
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                  <MapPin size={12} className="text-green-500" />
                  取件站
                </label>
                <select
                  value={pickupStation}
                  onChange={(e) => setPickupStation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                >
                  <option value="">选择取件站</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                  <MapPin size={12} className="text-red-500" />
                  送达站
                </label>
                <select
                  value={deliveryStation}
                  onChange={(e) => setDeliveryStation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                >
                  <option value="">选择送达站</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                  <Scale size={12} className="text-slate-500" />
                  重量(kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                  <Clock size={12} className="text-blue-500" />
                  取件时间
                </label>
                <input
                  type="time"
                  value={formatClockTime(parseInt(pickupTime) || 0)}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    setPickupTime((h * 60 + m).toString());
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                  <AlertCircle size={12} className="text-amber-500" />
                  截止时间
                </label>
                <input
                  type="time"
                  value={formatClockTime(parseInt(deadline) || 0)}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    setDeadline((h * 60 + m).toString());
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleAddParcel}
              disabled={!name || !pickupStation || !deliveryStation}
              className="w-full py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              确认添加
            </button>
          </div>
        )}

        {parcels.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Package size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无包裹，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {parcels.map((parcel) => {
              const pickupStationName = getStationById(parcel.pickupStation)?.name;
              const deliveryStationName = getStationById(parcel.deliveryStation)?.name;
              const isExpanded = expandedParcelId === parcel.id;
              const isSelected = selectedParcelId === parcel.id;

              return (
                <div
                  key={parcel.id}
                  className={cn(
                    'border rounded-xl overflow-hidden transition-all cursor-pointer',
                    isSelected
                      ? 'border-amber-400 bg-amber-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                  onClick={() => handleParcelClick(parcel.id)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          isSelected ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600',
                        )}>
                          <Package size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-800">{parcel.name}</div>
                          <div className="text-xs text-slate-500">
                            {pickupStationName} → {deliveryStationName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeParcel(parcel.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(parcel.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50 rounded-lg p-2">
                          <div className="text-slate-400">重量</div>
                          <div className="font-semibold text-slate-700">{parcel.weight} kg</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                          <div className="text-blue-400">取件时间</div>
                          <div className="font-semibold text-blue-700">{formatClockTime(parcel.pickupTime)}</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2">
                          <div className="text-amber-400">截止时间</div>
                          <div className="font-semibold text-amber-700">{formatClockTime(parcel.deadline)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" />
          评分规则说明
        </h3>
        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0"></span>
            <span>超时罚分：每超时1分钟扣2分</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 mt-1 shrink-0"></span>
            <span>换乘难度：每次换乘、步行时间、枢纽站点都会增加难度分</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 mt-1 shrink-0"></span>
            <span>重量罚分：包裹越重罚分越高</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 mt-1 shrink-0"></span>
            <span>综合得分越低，配送方案越优</span>
          </div>
        </div>
      </div>
    </div>
  );
}
