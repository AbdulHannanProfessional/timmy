import React from 'react';
import { Card } from "@/components/ui/card";
import { ChevronRight } from 'lucide-react';

export default function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  count,
  color = 'blue'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    green: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
    red: 'bg-red-50 text-red-600 group-hover:bg-red-100',
    cyan: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100'
  };

  return (
    <Card 
      className="group p-4 cursor-pointer hover:shadow-md transition-all border-slate-100 hover:border-slate-200"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-colors ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {count !== undefined && (
              <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 truncate">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </div>
    </Card>
  );
}