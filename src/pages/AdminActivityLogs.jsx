import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { format } from "date-fns";
import {
  Download,
  Activity,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
  DollarSign,
  User,
} from "lucide-react";
import PageHeader from "../components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ACTION_ICONS = {
  create: { icon: Activity, color: "text-blue-600 bg-blue-100" },
  update: { icon: Edit, color: "text-amber-600 bg-amber-100" },
  delete: { icon: Trash2, color: "text-red-600 bg-red-100" },
  approve: { icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
  reject: { icon: XCircle, color: "text-red-600 bg-red-100" },
  suspend: { icon: Ban, color: "text-orange-600 bg-orange-100" },
  ban: { icon: Ban, color: "text-red-600 bg-red-100" },
  refund: { icon: DollarSign, color: "text-purple-600 bg-purple-100" },
  payout: { icon: DollarSign, color: "text-emerald-600 bg-emerald-100" },
  resolve_dispute: { icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
  other: { icon: Activity, color: "text-slate-600 bg-slate-100" },
};

export default function AdminActivityLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: () => base44.entities.AdminLog.list("-created_date", 100),
  });

  const columns = [
    {
      key: "action",
      label: "Action",
      render: (value) => {
        const actionInfo = ACTION_ICONS[value] || ACTION_ICONS.other;
        const Icon = actionInfo.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${actionInfo.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="font-medium capitalize">
              {value?.replace(/_/g, " ")}
            </span>
          </div>
        );
      },
    },
    {
      key: "admin_email",
      label: "Admin",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "entity_type",
      label: "Entity",
      render: (value, row) => (
        <div>
          <Badge variant="outline">{value}</Badge>
          {row.entity_id && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {row.entity_id.slice(0, 12)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-sm text-slate-600 truncate max-w-[300px] block">
          {value}
        </span>
      ),
    },
    {
      key: "ip_address",
      label: "IP Address",
      render: (value) => (
        <span className="text-sm font-mono text-slate-500">
          {value || "N/A"}
        </span>
      ),
    },
    {
      key: "created_date",
      label: "Timestamp",
      render: (value) =>
        value ? format(new Date(value), "MMM d, h:mm:ss a") : "N/A",
    },
  ];

  const filters = [
    {
      key: "action",
      label: "Action",
      options: [
        { value: "create", label: "Create" },
        { value: "update", label: "Update" },
        { value: "delete", label: "Delete" },
        { value: "approve", label: "Approve" },
        { value: "reject", label: "Reject" },
        { value: "suspend", label: "Suspend" },
        { value: "refund", label: "Refund" },
        { value: "payout", label: "Payout" },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Activity Logs"
        description="Track all administrative actions for auditing"
        action={() => console.log("Export logs")}
        actionLabel="Export Logs"
        actionIcon={Download}
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        searchPlaceholder="Search logs..."
        filters={filters}
        emptyMessage="No activity logs"
      />
    </div>
  );
}
