import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  FileText,
  Download,
  Clock,
  Shield,
  User,
  Building,
  FileCheck,
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

export default function SellerVerification() {
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => base44.entities.Seller.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Seller.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      setShowModal(false);
      setRejectionReason("");
    },
  });

  const pendingSellers = sellers.filter(
    (s) => s.verification_status === "pending"
  );
  const approvedSellers = sellers.filter(
    (s) => s.verification_status === "approved"
  );
  const rejectedSellers = sellers.filter(
    (s) => s.verification_status === "rejected"
  );
  const highRiskSellers = sellers.filter((s) => s.risk_level === "high");

  const columns = [
    {
      key: "user_email",
      label: "Seller",
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">
            {row.business_name || "N/A"}
          </p>
          <p className="text-sm text-slate-500">{value}</p>
        </div>
      ),
    },
    {
      key: "verification_status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "risk_level",
      label: "Risk Level",
      render: (value) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            value === "high"
              ? "bg-red-100 text-red-700"
              : value === "medium"
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <Shield className="w-3 h-3" />
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
      ),
    },
    {
      key: "kyc_documents",
      label: "Documents",
      render: (value) => (
        <span className="text-sm text-slate-600">
          {value?.length || 0} files
        </span>
      ),
    },
    {
      key: "total_sales",
      label: "Total Sales",
      render: (value) => `$${(value || 0).toLocaleString()}`,
    },
    {
      key: "created_date",
      label: "Applied",
      render: (value) =>
        value ? format(new Date(value), "MMM d, yyyy") : "N/A",
    },
  ];

  const handleApprove = (seller) => {
    updateMutation.mutate({
      id: seller.id,
      data: { verification_status: "approved" },
    });
  };

  const handleReject = () => {
    if (selectedSeller) {
      updateMutation.mutate({
        id: selectedSeller.id,
        data: {
          verification_status: "rejected",
          notes: rejectionReason,
        },
      });
    }
  };

  const actions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (row) => {
        setSelectedSeller(row);
        setShowModal(true);
      },
    },
    { label: "Approve", icon: CheckCircle, onClick: handleApprove },
    {
      label: "Reject",
      icon: XCircle,
      onClick: (row) => {
        setSelectedSeller(row);
        setShowModal(true);
      },
      destructive: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Seller Verification"
        description="Review and verify seller KYC documents"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Pending Review"
          value={pendingSellers.length}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Approved Sellers"
          value={approvedSellers.length}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Rejected"
          value={rejectedSellers.length}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="High Risk"
          value={highRiskSellers.length}
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="pending">
            Pending ({pendingSellers.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedSellers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedSellers.length})
          </TabsTrigger>
          <TabsTrigger value="high-risk">
            High Risk ({highRiskSellers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <DataTable
            columns={columns}
            data={pendingSellers}
            loading={isLoading}
            searchPlaceholder="Search pending sellers..."
            actions={actions}
            emptyMessage="No pending verifications"
          />
        </TabsContent>

        <TabsContent value="approved">
          <DataTable
            columns={columns}
            data={approvedSellers}
            loading={isLoading}
            searchPlaceholder="Search approved sellers..."
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <DataTable
            columns={columns}
            data={rejectedSellers}
            loading={isLoading}
            searchPlaceholder="Search rejected sellers..."
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="high-risk">
          <DataTable
            columns={columns}
            data={highRiskSellers}
            loading={isLoading}
            searchPlaceholder="Search high risk sellers..."
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      {/* Verification Modal */}
      <DetailModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setRejectionReason("");
        }}
        title="Seller Verification Details"
        size="large"
      >
        {selectedSeller && (
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4" /> Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <span className="text-slate-500">Email:</span>{" "}
                    {selectedSeller.user_email}
                  </p>
                  <p>
                    <span className="text-slate-500">Business:</span>{" "}
                    {selectedSeller.business_name || "N/A"}
                  </p>
                  <p>
                    <span className="text-slate-500">Status:</span>{" "}
                    <StatusBadge status={selectedSeller.verification_status} />
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <span className="text-slate-500">Risk Level:</span>{" "}
                    <StatusBadge status={selectedSeller.risk_level} />
                  </p>
                  <p>
                    <span className="text-slate-500">Total Sales:</span> $
                    {(selectedSeller.total_sales || 0).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-slate-500">Rating:</span>{" "}
                    {selectedSeller.rating || "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Documents */}
            <div>
              <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> Submitted Documents
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedSeller.kyc_documents?.length > 0 ? (
                  selectedSeller.kyc_documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-medium">{doc.type}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">
                    No documents submitted
                  </p>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {selectedSeller.verification_status === "pending" && (
              <div className="space-y-2">
                <Label>Rejection Reason (if rejecting)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              {selectedSeller.verification_status === "pending" && (
                <>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(selectedSeller)}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Seller
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={updateMutation.isPending || !rejectionReason}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
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
