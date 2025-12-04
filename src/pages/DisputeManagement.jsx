import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { format } from "date-fns";
import {
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  DollarSign,
  Clock,
  UserCheck,
  Scale,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import DetailModal from "@/components/admin/DetailModal";
import StatCard from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DISPUTE_TYPES = {
  item_not_received: "Item Not Received",
  item_not_as_described: "Not As Described",
  damaged: "Damaged Item",
  counterfeit: "Counterfeit",
  wrong_item: "Wrong Item",
  other: "Other",
};

export default function DisputeManagement() {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resolution, setResolution] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["disputes"],
    queryFn: () => base44.entities.Dispute.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Dispute.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      setShowModal(false);
      setResolution("");
      setRefundAmount("");
    },
  });

  const openDisputes = disputes.filter((d) => d.status === "open");
  const underReviewDisputes = disputes.filter(
    (d) => d.status === "under_review"
  );
  const resolvedDisputes = disputes.filter(
    (d) => d.status.includes("resolved") || d.status === "closed"
  );
  const totalRefunded = disputes.reduce(
    (sum, d) => sum + (d.refund_amount || 0),
    0
  );

  const columns = [
    {
      key: "type",
      label: "Dispute Type",
      render: (value) => (
        <Badge variant="outline" className="font-medium">
          {DISPUTE_TYPES[value] || value}
        </Badge>
      ),
    },
    {
      key: "buyer_email",
      label: "Buyer",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "seller_email",
      label: "Seller",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "order_id",
      label: "Order",
      render: (value) => (
        <span className="text-sm font-mono">{value?.slice(0, 8)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "refund_amount",
      label: "Refund",
      render: (value) => (value ? `$${value.toFixed(2)}` : "-"),
    },
    {
      key: "created_date",
      label: "Opened",
      render: (value) =>
        value ? format(new Date(value), "MMM d, yyyy") : "N/A",
    },
  ];

  const handleResolve = (decision) => {
    if (selectedDispute) {
      updateMutation.mutate({
        id: selectedDispute.id,
        data: {
          status: decision,
          resolution: resolution,
          refund_amount:
            decision === "resolved_buyer" ? parseFloat(refundAmount) || 0 : 0,
        },
      });
    }
  };

  const actions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (row) => {
        setSelectedDispute(row);
        setShowModal(true);
      },
    },
    {
      label: "Start Review",
      icon: Scale,
      onClick: (row) =>
        updateMutation.mutate({ id: row.id, data: { status: "under_review" } }),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dispute Management"
        description="Resolve buyer vs seller disputes and issue refunds"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Open Disputes"
          value={openDisputes.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Under Review"
          value={underReviewDisputes.length}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Resolved"
          value={resolvedDisputes.length}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Refunded"
          value={`$${totalRefunded.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="open">Open ({openDisputes.length})</TabsTrigger>
          <TabsTrigger value="review">
            Under Review ({underReviewDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({disputes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <DataTable
            columns={columns}
            data={openDisputes}
            loading={isLoading}
            searchPlaceholder="Search open disputes..."
            actions={actions}
            emptyMessage="No open disputes"
          />
        </TabsContent>

        <TabsContent value="review">
          <DataTable
            columns={columns}
            data={underReviewDisputes}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="resolved">
          <DataTable
            columns={columns}
            data={resolvedDisputes}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={disputes}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      {/* Dispute Detail Modal */}
      <DetailModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setResolution("");
          setRefundAmount("");
        }}
        title="Dispute Details"
        size="xlarge"
      >
        {selectedDispute && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {DISPUTE_TYPES[selectedDispute.type]}
                </Badge>
                <p className="text-slate-500 mt-2">
                  Opened{" "}
                  {selectedDispute.created_date &&
                    format(
                      new Date(selectedDispute.created_date),
                      "MMMM d, yyyy"
                    )}
                </p>
              </div>
              <StatusBadge status={selectedDispute.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Buyer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{selectedDispute.buyer_email}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Seller
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{selectedDispute.seller_email}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Dispute Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  {selectedDispute.description || "No description provided"}
                </p>
              </CardContent>
            </Card>

            {/* Evidence */}
            <div>
              <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Submitted Evidence
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedDispute.evidence?.length > 0 ? (
                  selectedDispute.evidence.map((item, idx) => (
                    <Card key={idx} className="bg-slate-50">
                      <CardContent className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.submitted_by}</p>
                          <p className="text-sm text-slate-500">
                            {item.description}
                          </p>
                        </div>
                        <Badge>{item.type}</Badge>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">
                    No evidence submitted
                  </p>
                )}
              </div>
            </div>

            {/* Resolution */}
            {(selectedDispute.status === "open" ||
              selectedDispute.status === "under_review") && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-slate-900">Resolution</h4>
                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe the resolution..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Refund Amount (if refunding buyer)</Label>
                  <Input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-48"
                  />
                </div>
              </div>
            )}

            {selectedDispute.resolution && (
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="py-3">
                  <p className="text-emerald-700 font-medium">Resolution:</p>
                  <p className="text-emerald-600">
                    {selectedDispute.resolution}
                  </p>
                  {selectedDispute.refund_amount > 0 && (
                    <p className="text-emerald-700 mt-2">
                      Refunded: ${selectedDispute.refund_amount.toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              {(selectedDispute.status === "open" ||
                selectedDispute.status === "under_review") && (
                <>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleResolve("resolved_buyer")}
                    disabled={updateMutation.isPending || !resolution}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve for Buyer
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleResolve("resolved_seller")}
                    disabled={updateMutation.isPending || !resolution}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve for Seller
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleResolve("closed")}
                    disabled={updateMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Close Without Resolution
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
