import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Flag,
  ShoppingBag,
  DollarSign,
  Clock,
  Image,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TCG_CATEGORIES = {
  pokemon: { label: "Pokémon", color: "bg-yellow-100 text-yellow-700" },
  mtg: {
    label: "Magic: The Gathering",
    color: "bg-purple-100 text-purple-700",
  },
  yugioh: { label: "Yu-Gi-Oh!", color: "bg-blue-100 text-blue-700" },
  one_piece: { label: "One Piece", color: "bg-red-100 text-red-700" },
  disney_lorcana: {
    label: "Disney Lorcana",
    color: "bg-indigo-100 text-indigo-700",
  },
  other: { label: "Other", color: "bg-slate-100 text-slate-700" },
};

export default function ListingManagement() {
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedListings, setSelectedListings] = useState([]);
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: () => base44.entities.Listing.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Listing.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      setShowModal(false);
      setRejectionReason("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Listing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });

  const pendingListings = listings.filter((l) => l.status === "pending");
  const approvedListings = listings.filter((l) => l.status === "approved");
  const flaggedListings = listings.filter((l) => l.is_flagged);
  const totalValue = listings.reduce(
    (sum, l) => sum + l.price * (l.quantity || 1),
    0
  );

  const columns = [
    {
      key: "card_name",
      label: "Card",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.image_url ? (
            <img
              src={row.image_url}
              alt={value}
              className="w-12 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{row.card_set}</p>
            {row.is_flagged && (
              <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                <Flag className="w-3 h-3" />
                Flagged
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "tcg_category",
      label: "Category",
      render: (value) => {
        const cat = TCG_CATEGORIES[value];
        return cat ? <Badge className={cat.color}>{cat.label}</Badge> : value;
      },
    },
    {
      key: "price",
      label: "Price",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-slate-900">${value?.toFixed(2)}</p>
          {row.market_price && (
            <p
              className={`text-xs ${
                value < row.market_price * 0.7
                  ? "text-red-600"
                  : value > row.market_price * 1.3
                  ? "text-amber-600"
                  : "text-slate-500"
              }`}
            >
              Market: ${row.market_price?.toFixed(2)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "condition",
      label: "Condition",
      render: (value) => (
        <span className="text-sm text-slate-600 capitalize">
          {value?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "seller_email",
      label: "Seller",
      render: (value) => (
        <span className="text-sm text-slate-600">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "created_date",
      label: "Listed",
      render: (value) =>
        value ? format(new Date(value), "MMM d, yyyy") : "N/A",
    },
  ];

  const handleApprove = (listing) => {
    updateMutation.mutate({
      id: listing.id,
      data: { status: "approved", is_flagged: false },
    });
  };

  const handleReject = () => {
    if (selectedListing) {
      updateMutation.mutate({
        id: selectedListing.id,
        data: {
          status: "rejected",
          rejection_reason: rejectionReason,
        },
      });
    }
  };

  const handleBulkApprove = () => {
    selectedListings.forEach((listing) => {
      updateMutation.mutate({
        id: listing.id,
        data: { status: "approved" },
      });
    });
    setSelectedListings([]);
  };

  const actions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (row) => {
        setSelectedListing(row);
        setShowModal(true);
      },
    },
    { label: "Approve", icon: CheckCircle, onClick: handleApprove },
    {
      label: "Reject",
      icon: XCircle,
      onClick: (row) => {
        setSelectedListing(row);
        setShowModal(true);
      },
      destructive: true,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (row) => deleteMutation.mutate(row.id),
      destructive: true,
    },
  ];

  const filters = [
    {
      key: "tcg_category",
      label: "Category",
      options: Object.entries(TCG_CATEGORIES).map(([value, { label }]) => ({
        value,
        label,
      })),
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "sold", label: "Sold" },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Listing Management"
        description="Review, approve, and manage marketplace listings"
      >
        {selectedListings.length > 0 && (
          <Button
            onClick={handleBulkApprove}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Selected ({selectedListings.length})
          </Button>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Pending Review"
          value={pendingListings.length}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Active Listings"
          value={approvedListings.length}
          icon={ShoppingBag}
          color="green"
        />
        <StatCard
          title="Flagged Listings"
          value={flaggedListings.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="pending">
            Pending ({pendingListings.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedListings.length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({flaggedListings.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <DataTable
            columns={columns}
            data={pendingListings}
            loading={isLoading}
            searchPlaceholder="Search pending listings..."
            selectable
            onSelectionChange={setSelectedListings}
            actions={actions}
            filters={filters}
            emptyMessage="No pending listings"
          />
        </TabsContent>

        <TabsContent value="approved">
          <DataTable
            columns={columns}
            data={approvedListings}
            loading={isLoading}
            searchPlaceholder="Search approved listings..."
            actions={actions}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="flagged">
          <DataTable
            columns={columns}
            data={flaggedListings}
            loading={isLoading}
            searchPlaceholder="Search flagged listings..."
            actions={actions}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={listings}
            loading={isLoading}
            searchPlaceholder="Search all listings..."
            selectable
            onSelectionChange={setSelectedListings}
            actions={actions}
            filters={filters}
          />
        </TabsContent>
      </Tabs>

      {/* Listing Detail Modal */}
      <DetailModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setRejectionReason("");
        }}
        title="Listing Details"
        size="large"
      >
        {selectedListing && (
          <div className="space-y-6">
            <div className="flex gap-6">
              {/* Card Image */}
              <div className="w-48 flex-shrink-0">
                {selectedListing.image_url ? (
                  <img
                    src={selectedListing.image_url}
                    alt={selectedListing.card_name}
                    className="w-full rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-slate-100 rounded-xl flex items-center justify-center">
                    <Image className="w-12 h-12 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Card Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedListing.card_name}
                  </h3>
                  <p className="text-slate-500">
                    {selectedListing.card_set} • {selectedListing.card_number}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Price</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${selectedListing.price?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Market Price</p>
                    <p className="text-lg font-semibold text-slate-600">
                      ${selectedListing.market_price?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Condition</p>
                    <p className="font-medium capitalize">
                      {selectedListing.condition?.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Quantity</p>
                    <p className="font-medium">
                      {selectedListing.quantity || 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Category</p>
                    <Badge
                      className={
                        TCG_CATEGORIES[selectedListing.tcg_category]?.color
                      }
                    >
                      {TCG_CATEGORIES[selectedListing.tcg_category]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <StatusBadge status={selectedListing.status} />
                  </div>
                </div>

                {selectedListing.description && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Description</p>
                    <p className="text-slate-700">
                      {selectedListing.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-500">Seller</p>
                  <p className="font-medium">{selectedListing.seller_email}</p>
                </div>

                {selectedListing.is_flagged && (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Flagged:</span>
                        <span>
                          {selectedListing.flag_reason ||
                            "Suspicious activity detected"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {selectedListing.status === "pending" && (
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
              {selectedListing.status === "pending" && (
                <>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(selectedListing)}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Listing
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
              <Button
                variant="outline"
                onClick={() => {
                  deleteMutation.mutate(selectedListing.id);
                  setShowModal(false);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Listing
              </Button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
