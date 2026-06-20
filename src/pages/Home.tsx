import { useState } from 'react';
import { Train, Package } from 'lucide-react';
import MetroMap from '@/components/MetroMap';
import RoutePanel from '@/components/RoutePanel';
import RouteResults from '@/components/RouteResults';
import ParcelPanel from '@/components/ParcelPanel';
import DeliveryResults from '@/components/DeliveryResults';
import { cn } from '@/lib/utils';

type Mode = 'navigator' | 'delivery';

export default function Home() {
  const [mode, setMode] = useState<Mode>('navigator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="container px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg',
              mode === 'navigator'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200'
                : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200',
            )}>
              {mode === 'navigator' ? (
                <Train size={22} className="text-white" />
              ) : (
                <Package size={22} className="text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                {mode === 'navigator' ? '地铁迷踪寻路器' : '快递地铁配送规划'}
              </h1>
              <p className="text-xs text-slate-500">
                {mode === 'navigator'
                  ? 'Metro Navigator · 智能图论路径规划'
                  : 'Parcel Delivery · 超时罚分与换乘难度优化'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 rounded-xl p-1 flex">
              <button
                onClick={() => setMode('navigator')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  mode === 'navigator'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <Train size={16} />
                路线导航
              </button>
              <button
                onClick={() => setMode('delivery')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  mode === 'delivery'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <Package size={16} />
                快递配送
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 ml-4">
              <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded-md font-medium">
                20 站点
              </span>
              <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-md font-medium">
                6 线路
              </span>
              <span className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-md font-medium">
                16 换乘通道
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {mode === 'navigator' ? <RoutePanel /> : <ParcelPanel />}
          </div>
          <div className="lg:col-span-6">
            <div className="h-[calc(100vh-140px)] min-h-[560px]">
              <MetroMap />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-4">
            {mode === 'navigator' ? <RouteResults /> : <DeliveryResults />}
          </div>
        </div>
      </main>

      <footer className="mt-8 py-4 border-t border-slate-200 bg-white/50">
        <div className="container px-4 text-center text-xs text-slate-400">
          {mode === 'navigator'
            ? '基于 Dijkstra 算法 · 支持最短时间 / 最少换乘 / 最低票价 多策略规划'
            : '基于超时罚分和换乘难度的综合评分优化 · 智能快递配送规划系统'}
        </div>
      </footer>
    </div>
  );
}
