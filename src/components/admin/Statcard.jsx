import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  subtitle 
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  const iconBgClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    pink: 'bg-pink-100 text-pink-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`
            inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
            ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}
          `}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
}