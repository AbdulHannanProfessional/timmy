import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  Eye, 
  CreditCard,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Flag
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import DetailModal from '@/components/admin/DetailModal';
import StatCard from '@/components/admin/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaymentManagement() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list()
  });

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'authorized');
  const capturedPayments = payments.filter(p => p.status === 'captured');
  const failedPayments = payments.filter(p => p.status === 'failed' || p.status === 'chargeback');
  const flaggedPayments = payments.filter(p => p.is_flagged);
  const totalProcessed = capturedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const columns = [
    {
      key: 'transaction_id',
      label: 'Transaction',
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900 font-mono">{value || row.id?.slice(0, 12)}</p>
          <p className="text-sm text-slate-500">Order: {row.order_id?.slice(0, 8)}</p>
        </div>
      )
    },
    {
      key: 'buyer_email',
      label: 'Buyer',
      render: (value) => <span className="text-sm text-slate-600">{value}</span>
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => <span className="font-semibold">${value?.toFixed(2)}</span>
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (value) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span className="text-sm capitalize">{value?.replace(/_/g, ' ')}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'fraud_score',
      label: 'Risk',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.is_flagged && <Flag className="w-4 h-4 text-red-500" />}
          <span className={`text-sm font-medium ${
            value > 70 ? 'text-red-600' : value > 40 ? 'text-amber-600' : 'text-green-600'
          }`}>
            {value ? `${value}%` : 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'created_date',
      label: 'Date',
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy h:mm a') : 'N/A'
    }
  ];

  const actions = [
    { label: 'View Details', icon: Eye, onClick: (row) => { setSelectedPayment(row); setShowModal(true); }}
  ];

  return (
    <div>
      <PageHeader
        title="Payment Management"
        description="Monitor and manage all payment transactions"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          title="Total Transactions" 
          value={payments.length} 
          icon={CreditCard} 
          color="blue"
        />
        <StatCard 
          title="Pending" 
          value={pendingPayments.length} 
          icon={Clock} 
          color="orange"
        />
        <StatCard 
          title="Captured" 
          value={`$${totalProcessed.toLocaleString()}`} 
          icon={CheckCircle} 
          color="green"
        />
        <StatCard 
          title="Failed/Chargeback" 
          value={failedPayments.length} 
          icon={XCircle} 
          color="red"
        />
        <StatCard 
          title="Flagged" 
          value={flaggedPayments.length} 
          icon={AlertTriangle} 
          color="purple"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="all">All ({payments.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
          <TabsTrigger value="captured">Captured ({capturedPayments.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedPayments.length})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({flaggedPayments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={payments}
            loading={isLoading}
            searchPlaceholder="Search payments..."
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="pending">
          <DataTable
            columns={columns}
            data={pendingPayments}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="captured">
          <DataTable
            columns={columns}
            data={capturedPayments}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="failed">
          <DataTable
            columns={columns}
            data={failedPayments}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="flagged">
          <DataTable
            columns={columns}
            data={flaggedPayments}
            loading={isLoading}
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      {/* Payment Detail Modal */}
      <DetailModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Payment Details"
        size="large"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-mono">
                  {selectedPayment.transaction_id || selectedPayment.id}
                </h3>
                <p className="text-slate-500">
                  {selectedPayment.created_date && format(new Date(selectedPayment.created_date), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
              <StatusBadge status={selectedPayment.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Payment Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-bold text-xl">${selectedPayment.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method</span>
                    <span className="capitalize">{selectedPayment.payment_method?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buyer</span>
                    <span>{selectedPayment.buyer_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order ID</span>
                    <span className="font-mono">{selectedPayment.order_id?.slice(0, 12)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Fraud Score</span>
                    <Badge className={
                      selectedPayment.fraud_score > 70 ? 'bg-red-100 text-red-700' :
                      selectedPayment.fraud_score > 40 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }>
                      {selectedPayment.fraud_score ? `${selectedPayment.fraud_score}%` : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Flagged</span>
                    {selectedPayment.is_flagged ? (
                      <Badge className="bg-red-100 text-red-700">Yes</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">No</Badge>
                    )}
                  </div>
                  {selectedPayment.flag_reason && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-red-600">{selectedPayment.flag_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              {selectedPayment.status === 'authorized' && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Capture Payment
                </Button>
              )}
              {(selectedPayment.status === 'captured') && (
                <Button variant="destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Issue Refund
                </Button>
              )}
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}