import React from 'react';
import { Button } from "@/components/ui/button";

export default function PageHeader({ 
  title, 
  description, 
  action, 
  actionLabel, 
  actionIcon: ActionIcon,
  children 
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && (
            <p className="text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {children}
          {action && (
            <Button onClick={action} className="bg-blue-600 hover:bg-blue-700">
              {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}