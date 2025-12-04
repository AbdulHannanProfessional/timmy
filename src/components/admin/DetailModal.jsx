import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

export default function DetailModal({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'default'
}) {
  const sizeClasses = {
    default: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>

        {actions && (
          <DialogFooter className="gap-2">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.className}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}