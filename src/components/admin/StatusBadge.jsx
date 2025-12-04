import React from 'react';
import { Badge } from "@/components/ui/badge";

const statusStyles = {
  // General
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  
  // Orders
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  shipped: 'bg-blue-100 text-blue-700 border-blue-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  refunded: 'bg-purple-100 text-purple-700 border-purple-200',
  disputed: 'bg-red-100 text-red-700 border-red-200',
  
  // Payments
  authorized: 'bg-blue-100 text-blue-700 border-blue-200',
  captured: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  chargeback: 'bg-red-100 text-red-700 border-red-200',
  
  // Payouts
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delayed: 'bg-amber-100 text-amber-700 border-amber-200',
  
  // Disputes
  open: 'bg-amber-100 text-amber-700 border-amber-200',
  under_review: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved_buyer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  resolved_seller: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  
  // Verification
  verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  unverified: 'bg-amber-100 text-amber-700 border-amber-200',
  
  // Fraud
  new: 'bg-red-100 text-red-700 border-red-200',
  investigating: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  dismissed: 'bg-slate-100 text-slate-600 border-slate-200',
  
  // Severity
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
  
  // Listings
  sold: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expired: 'bg-slate-100 text-slate-600 border-slate-200',
  
  // Tickets
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  waiting_response: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function StatusBadge({ status, className = '' }) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
  const style = statusStyles[normalizedStatus] || 'bg-slate-100 text-slate-600 border-slate-200';
  
  const displayText = status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <Badge 
      variant="outline" 
      className={`${style} border font-medium ${className}`}
    >
      {displayText}
    </Badge>
  );
}