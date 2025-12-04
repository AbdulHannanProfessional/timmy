import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { format } from "date-fns";
import {
  Eye,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  Zap,
  TrendingUp,
  Users,
  Ban,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import DetailModal from "@/components/admin/DetailModal";
import StatCard from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ALERT_TYPES = {
  suspicious_listing: {
    label: "Suspicious Listing",
    icon: Flag,
    color: "text-orange-600",
  },
  price_anomaly: {
    label: "Price Anomaly",
    icon: TrendingUp,
    color: "text-amber-600",
  },
  multiple_accounts: {
    label: "Multiple Accounts",
    icon: Users,
    color: "text-purple-600",
  },
  scan_anomaly: { label: "Scan Anomaly", icon: Zap, color: "text-blue-600" },
  volume_spike: {
    label: "Volume Spike",
    icon: TrendingUp,
    color: "text-cyan-600",
  },
  chargeback: { label: "Chargeback", icon: XCircle, color: "text-red-600" },
  ip_mismatch: {
    label: "IP Mismatch",
    icon: AlertTriangle,
    color: "text-pink-600",
  },
};

export default function FraudMonitoring() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["fraudAlerts"],
    queryFn: () => base44.entities.FraudAlert.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FraudAlert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraudAlerts"] });
      setShowModal(false);
      setResolutionNotes("");
    },
  });

  const newAlerts = alerts.filter((a) => a.status === "new");
  const investigatingAlerts = alerts.filter(
    (a) => a.status === "investigating"
  );
  const criticalAlerts = alerts.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  );
  const resolvedAlerts = alerts.filter(
    (a) => a.status === "resolved" || a.status === "dismissed"
  );

  const columns = [
    {
      key: "alert_type",
      label: "Alert Type",
      render: (value) => {
        const alertInfo = ALERT_TYPES[value];
        const Icon = alertInfo?.icon || AlertTriangle;
        return (
          <div className="flex items-center gap-2">
            <Icon
              className={`w-4 h-4 ${alertInfo?.color || "text-slate-600"}`}
            />
            <span className="font-medium">{alertInfo?.label || value}</span>
          </div>
        );
      },
    },
    {
      key: "severity",
      label: "Severity",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "user_email",
      label: "User",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-sm text-slate-600 truncate max-w-[200px] block">
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "created_date",
      label: "Detected",
      render: (value) =>
        value ? format(new Date(value), "MMM d, h:mm a") : "N/A",
    },
  ];

  const handleResolve = (status) => {
    if (selectedAlert) {
      updateMutation.mutate({
        id: selectedAlert.id,
        data: {
          status: status,
          resolution_notes: resolutionNotes,
        },
      });
    }
  };

  const actions = [
    {
      label: "Investigate",
      icon: Eye,
      onClick: (row) => {
        setSelectedAlert(row);
        setShowModal(true);
      },
    },
    {
      label: "Mark Resolved",
      icon: CheckCircle,
      onClick: (row) =>
        updateMutation.mutate({ id: row.id, data: { status: "resolved" } }),
    },
    {
      label: "Dismiss",
      icon: XCircle,
      onClick: (row) =>
        updateMutation.mutate({ id: row.id, data: { status: "dismissed" } }),
    },
  ];

  const filters = [
    {
      key: "severity",
      label: "Severity",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      key: "alert_type",
      label: "Type",
      options: Object.entries(ALERT_TYPES).map(([value, { label }]) => ({
        value,
        label,
      })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Fraud Monitoring"
        description="Monitor and investigate suspicious activity"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="New Alerts"
          value={newAlerts.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Investigating"
          value={investigatingAlerts.length}
          icon={Eye}
          color="orange"
        />
        <StatCard
          title="Critical/High"
          value={criticalAlerts.length}
          icon={ShieldAlert}
          color="purple"
        />
        <StatCard
          title="Resolved"
          value={resolvedAlerts.length}
          icon={CheckCircle}
          color="green"
        />
      </div>

      <Tabs defaultValue="new" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="new">New ({newAlerts.length})</TabsTrigger>
          <TabsTrigger value="investigating">
            Investigating ({investigatingAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({criticalAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <DataTable
            columns={columns}
            data={newAlerts}
            loading={isLoading}
            searchPlaceholder="Search alerts..."
            actions={actions}
            filters={filters}
            emptyMessage="No new alerts"
          />
        </TabsContent>

        <TabsContent value="investigating">
          <DataTable
            columns={columns}
            data={investigatingAlerts}
            loading={isLoading}
            actions={actions}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="critical">
          <DataTable
            columns={columns}
            data={criticalAlerts}
            loading={isLoading}
            actions={actions}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="resolved">
          <DataTable
            columns={columns}
            data={resolvedAlerts}
            loading={isLoading}
            actions={actions}
            filters={filters}
          />
        </TabsContent>
      </Tabs>

      {/* Alert Detail Modal */}
      <DetailModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setResolutionNotes("");
        }}
        title="Fraud Alert Investigation"
        size="large"
      >
        {selectedAlert && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {(() => {
                  const alertInfo = ALERT_TYPES[selectedAlert.alert_type];
                  const Icon = alertInfo?.icon || AlertTriangle;
                  return <Icon className={`w-6 h-6 ${alertInfo?.color}`} />;
                })()}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {ALERT_TYPES[selectedAlert.alert_type]?.label}
                  </h3>
                  <p className="text-slate-500">
                    Detected{" "}
                    {selectedAlert.created_date &&
                      format(
                        new Date(selectedAlert.created_date),
                        "MMMM d, yyyy h:mm a"
                      )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={selectedAlert.severity} />
                <StatusBadge status={selectedAlert.status} />
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Alert Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">User</span>
                  <span className="font-medium">
                    {selectedAlert.user_email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP Address</span>
                  <span className="font-mono">
                    {selectedAlert.ip_address || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Device</span>
                  <span>{selectedAlert.device_info || "N/A"}</span>
                </div>
                {selectedAlert.related_entity_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Related {selectedAlert.related_entity_type}
                    </span>
                    <span className="font-mono">
                      {selectedAlert.related_entity_id.slice(0, 12)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{selectedAlert.description}</p>
              </CardContent>
            </Card>

            {selectedAlert.status !== "resolved" &&
              selectedAlert.status !== "dismissed" && (
                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document your findings..."
                    rows={3}
                  />
                </div>
              )}

            {selectedAlert.resolution_notes && (
              <Card className="bg-slate-50">
                <CardContent className="py-3">
                  <p className="text-sm text-slate-500 mb-1">
                    Resolution Notes:
                  </p>
                  <p className="text-slate-700">
                    {selectedAlert.resolution_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              {selectedAlert.status !== "resolved" &&
                selectedAlert.status !== "dismissed" && (
                  <>
                    {selectedAlert.status === "new" && (
                      <Button
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() =>
                          updateMutation.mutate({
                            id: selectedAlert.id,
                            data: { status: "investigating" },
                          })
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Start Investigation
                      </Button>
                    )}
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleResolve("resolved")}
                      disabled={updateMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleResolve("dismissed")}
                      disabled={updateMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => console.log("Ban user")}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </Button>
                  </>
                )}
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
