import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { format } from "date-fns";
import {
  Eye,
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  PauseCircle,
  Download,
  Send,
  Calendar,
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

export default function PayoutManagement() {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const queryClient = useQueryClient();

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["payouts"],
    queryFn: () => base44.entities.Payout.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Payout.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      setShowModal(false);
      setDelayReason("");
    },
  });

  const pendingPayouts = payouts.filter((p) => p.status === "pending");
  const processingPayouts = payouts.filter((p) => p.status === "processing");
  const completedPayouts = payouts.filter((p) => p.status === "completed");
  const delayedPayouts = payouts.filter((p) => p.status === "delayed");
  const totalPending = pendingPayouts.reduce(
    (sum, p) => sum + (p.net_amount || 0),
    0
  );
  const totalCompleted = completedPayouts.reduce(
    (sum, p) => sum + (p.net_amount || 0),
    0
  );

  const columns = [
    {
      key: "seller_email",
      label: "Seller",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "amount",
      label: "Gross",
      render: (value) => (
        <span className="text-slate-600">${value?.toFixed(2)}</span>
      ),
    },
    {
      key: "platform_fee",
      label: "Fee",
      render: (value) => (
        <span className="text-slate-500">${value?.toFixed(2)}</span>
      ),
    },
    {
      key: "net_amount",
      label: "Net Payout",
      render: (value) => (
        <span className="font-semibold text-emerald-600">
          ${value?.toFixed(2)}
        </span>
      ),
    },
    {
      key: "payout_method",
      label: "Method",
      render: (value) => (
        <span className="text-sm capitalize">{value?.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "scheduled_date",
      label: "Scheduled",
      render: (value) =>
        value ? format(new Date(value), "MMM d, yyyy") : "N/A",
    },
  ];

  const handleRelease = (payout) => {
    updateMutation.mutate({
      id: payout.id,
      data: { status: "processing" },
    });
  };

  const handleComplete = (payout) => {
    updateMutation.mutate({
      id: payout.id,
      data: {
        status: "completed",
        completed_date: new Date().toISOString().split("T")[0],
      },
    });
  };

  const handleDelay = () => {
    if (selectedPayout && delayReason) {
      updateMutation.mutate({
        id: selectedPayout.id,
        data: {
          status: "delayed",
          delay_reason: delayReason,
        },
      });
    }
  };

  const actions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (row) => {
        setSelectedPayout(row);
        setShowModal(true);
      },
    },
    { label: "Release Payout", icon: Send, onClick: handleRelease },
    { label: "Mark Completed", icon: CheckCircle, onClick: handleComplete },
  ];

  return (
    <div>
      <PageHeader
        title="Payout Management"
        description="Manage seller payouts and release funds"
        action={() => console.log("Export")}
        actionLabel="Export Report"
        actionIcon={Download}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Pending Payouts"
          value={`$${totalPending.toLocaleString()}`}
          icon={Clock}
          color="orange"
          subtitle={`${pendingPayouts.length} sellers`}
        />
        <StatCard
          title="Processing"
          value={processingPayouts.length}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={`$${totalCompleted.toLocaleString()}`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Delayed"
          value={delayedPayouts.length}
          icon={PauseCircle}
          color="red"
        />
        <StatCard
          title="Total Payouts"
          value={payouts.length}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="pending">
            Pending ({pendingPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({processingPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="delayed">
            Delayed ({delayedPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({payouts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <DataTable
            columns={columns}
            data={pendingPayouts}
            loading={isLoading}
            searchPlaceholder="Search pending payouts..."
            selectable
            actions={actions}
            emptyMessage="No pending payouts"
          />
        </TabsContent>

        <TabsContent value="processing">
          <DataTable
            columns={columns}
            data={processingPayouts}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="completed">
          <DataTable
            columns={columns}
            data={completedPayouts}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="delayed">
          <DataTable
            columns={columns}
            data={delayedPayouts}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={payouts}
            loading={isLoading}
            selectable
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      {/* Payout Detail Modal */}
      <DetailModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setDelayReason("");
        }}
        title="Payout Details"
        size="large"
      >
        {selectedPayout && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedPayout.seller_email}
                </h3>
                <p className="text-slate-500">
                  Order: {selectedPayout.order_id?.slice(0, 12)}
                </p>
              </div>
              <StatusBadge status={selectedPayout.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Payout Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Amount</span>
                    <span>${selectedPayout.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform Fee</span>
                    <span className="text-red-600">
                      -${selectedPayout.platform_fee?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Net Payout</span>
                    <span className="text-emerald-600">
                      ${selectedPayout.net_amount?.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method</span>
                    <span className="capitalize">
                      {selectedPayout.payout_method?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled</span>
                    <span>
                      {selectedPayout.scheduled_date
                        ? format(
                            new Date(selectedPayout.scheduled_date),
                            "MMM d, yyyy"
                          )
                        : "N/A"}
                    </span>
                  </div>
                  {selectedPayout.completed_date && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Completed</span>
                      <span>
                        {format(
                          new Date(selectedPayout.completed_date),
                          "MMM d, yyyy"
                        )}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {selectedPayout.delay_reason && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="py-3">
                  <p className="text-amber-700 font-medium">Delay Reason:</p>
                  <p className="text-amber-600">
                    {selectedPayout.delay_reason}
                  </p>
                </CardContent>
              </Card>
            )}

            {selectedPayout.status === "pending" && (
              <div className="space-y-2">
                <Label>Delay Reason (if delaying)</Label>
                <Textarea
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  placeholder="Enter reason for delaying payout..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              {selectedPayout.status === "pending" && (
                <>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleRelease(selectedPayout)}
                    disabled={updateMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Release Payout
                  </Button>
                  <Button
                    variant="outline"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                    onClick={handleDelay}
                    disabled={updateMutation.isPending || !delayReason}
                  >
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Delay Payout
                  </Button>
                </>
              )}
              {selectedPayout.status === "processing" && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleComplete(selectedPayout)}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Completed
                </Button>
              )}
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
