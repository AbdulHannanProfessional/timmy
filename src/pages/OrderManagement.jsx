import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  Eye, 
  Package, 
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  User,
  Calendar
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import DetailModal from '@/components/admin/DetailModal';
import StatCard from '@/components/admin/StatCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowModal(false);
    }
  });

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid');
  const shippedOrders = orders.filter(o => o.status === 'shipped');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const problemOrders = orders.filter(o => o.status === 'disputed' || o.status === 'cancelled');
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const columns = [
    {
      key: 'order_number',
      label: 'Order',
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">{value || `#${row.id?.slice(0, 8)}`}</p>
          <p className="text-sm text-slate-500">{row.card_name}</p>
        </div>
      )
    },
    {
      key: 'buyer_email',
      label: 'Buyer',
      render: (value) => <span className="text-sm text-slate-600">{value}</span>
    },
    {
      key: 'seller_email',
      label: 'Seller',
      render: (value) => <span className="text-sm text-slate-600">{value}</span>
    },
    {
      key: 'total',
      label: 'Total',
      render: (value) => <span className="font-semibold">${value?.toFixed(2)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'tracking_number',
      label: 'Tracking',
      render: (value, row) => value ? (
        <div className="text-sm">
          <p className="font-medium">{value}</p>
          <p className="text-slate-500">{row.shipping_carrier}</p>
        </div>
      ) : (
        <span className="text-slate-400 text-sm">Not shipped</span>
      )
    },
    {
      key: 'created_date',
      label: 'Date',
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : 'N/A'
    }
  ];

  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus) {
      updateMutation.mutate({
        id: selectedOrder.id,
        data: { status: newStatus }
      });
    }
  };

  const actions = [
    { label: 'View Details', icon: Eye, onClick: (row) => { setSelectedOrder(row); setNewStatus(row.status); setShowModal(true); }},
    { label: 'Mark Shipped', icon: Truck, onClick: (row) => updateMutation.mutate({ id: row.id, data: { status: 'shipped' }}) },
    { label: 'Mark Delivered', icon: CheckCircle, onClick: (row) => updateMutation.mutate({ id: row.id, data: { status: 'delivered' }}) }
  ];

  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'disputed', label: 'Disputed' }
      ]
    }
  ];

  return (
    <div>
      <PageHeader
        title="Order Management"
        description="Track and manage all marketplace orders"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          title="Total Orders" 
          value={orders.length} 
          icon={Package} 
          color="blue"
        />
        <StatCard 
          title="Processing" 
          value={pendingOrders.length} 
          icon={Clock} 
          color="orange"
        />
        <StatCard 
          title="Shipped" 
          value={shippedOrders.length} 
          icon={Truck} 
          color="cyan"
        />
        <StatCard 
          title="Delivered" 
          value={deliveredOrders.length} 
          icon={CheckCircle} 
          color="green"
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="purple"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({shippedOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({deliveredOrders.length})</TabsTrigger>
          <TabsTrigger value="problems">Problems ({problemOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={orders}
            loading={isLoading}
            searchPlaceholder="Search orders..."
            actions={actions}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="processing">
          <DataTable
            columns={columns}
            data={pendingOrders}
            loading={isLoading}
            searchPlaceholder="Search processing orders..."
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="shipped">
          <DataTable
            columns={columns}
            data={shippedOrders}
            loading={isLoading}
            searchPlaceholder="Search shipped orders..."
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="delivered">
          <DataTable
            columns={columns}
            data={deliveredOrders}
            loading={isLoading}
            searchPlaceholder="Search delivered orders..."
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="problems">
          <DataTable
            columns={columns}
            data={problemOrders}
            loading={isLoading}
            searchPlaceholder="Search problem orders..."
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      {/* Order Detail Modal */}
      <DetailModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Order Details"
        size="large"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedOrder.order_number || `#${selectedOrder.id?.slice(0, 8)}`}
                </h3>
                <p className="text-slate-500">
                  {selectedOrder.created_date && format(new Date(selectedOrder.created_date), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
              <StatusBadge status={selectedOrder.status} />
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4" /> Buyer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{selectedOrder.buyer_email}</p>
                  {selectedOrder.shipping_address && (
                    <div className="text-sm text-slate-600">
                      <p>{selectedOrder.shipping_address.name}</p>
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                      <p>{selectedOrder.shipping_address.country}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipping</span>
                    <span>${selectedOrder.shipping_cost?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform Fee</span>
                    <span>${selectedOrder.platform_fee?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tracking Number</Label>
                    <Input defaultValue={selectedOrder.tracking_number || ''} placeholder="Enter tracking number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shipping Carrier</Label>
                    <Select defaultValue={selectedOrder.shipping_carrier || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usps">USPS</SelectItem>
                        <SelectItem value="ups">UPS</SelectItem>
                        <SelectItem value="fedex">FedEx</SelectItem>
                        <SelectItem value="dhl">DHL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update Status */}
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdateStatus}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Status
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}