import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  Eye, 
  Edit, 
  Ban, 
  RefreshCw, 
  KeyRound, 
  LogOut,
  Mail,
  Calendar,
  MapPin,
  Shield,
  UserCheck,
  UserX,
  Plus
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import DetailModal from '@/components/admin/DetailModal';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => base44.entities.Seller.list()
  });

  // Combine user and seller data
  const usersWithSellerInfo = users.map(user => {
    const sellerInfo = sellers.find(s => s.user_email === user.email);
    return {
      ...user,
      is_seller: !!sellerInfo,
      seller_status: sellerInfo?.verification_status,
      total_sales: sellerInfo?.total_sales || 0,
      is_suspended: sellerInfo?.is_suspended || false
    };
  });

  const columns = [
    {
      key: 'full_name',
      label: 'User',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
              {value?.charAt(0)?.toUpperCase() || row.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">{value || 'N/A'}</p>
            <p className="text-sm text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          value === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
        }`}>
          <Shield className="w-3 h-3" />
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
      )
    },
    {
      key: 'is_seller',
      label: 'Type',
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          {value ? (
            <>
              <StatusBadge status={row.seller_status || 'pending'} />
              <span className="text-xs text-slate-500">${row.total_sales?.toLocaleString()} sales</span>
            </>
          ) : (
            <span className="text-sm text-slate-500">Buyer</span>
          )}
        </div>
      )
    },
    {
      key: 'created_date',
      label: 'Joined',
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : 'N/A'
    },
    {
      key: 'is_suspended',
      label: 'Status',
      render: (value) => (
        <StatusBadge status={value ? 'suspended' : 'active'} />
      )
    }
  ];

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const actions = [
    { label: 'View Details', icon: Eye, onClick: handleViewUser },
    { label: 'Edit User', icon: Edit, onClick: handleViewUser },
    { label: 'Force Logout', icon: LogOut, onClick: (row) => console.log('Force logout', row) },
    { label: 'Suspend Account', icon: Ban, onClick: (row) => console.log('Suspend', row), destructive: true }
  ];

  const filters = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' }
      ]
    }
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="View and manage all platform users"
      />

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="buyers">Buyers ({usersWithSellerInfo.filter(u => !u.is_seller).length})</TabsTrigger>
          <TabsTrigger value="sellers">Sellers ({usersWithSellerInfo.filter(u => u.is_seller).length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({users.filter(u => u.role === 'admin').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={usersWithSellerInfo}
            loading={isLoading}
            searchPlaceholder="Search users by name or email..."
            selectable
            actions={actions}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="buyers">
          <DataTable
            columns={columns}
            data={usersWithSellerInfo.filter(u => !u.is_seller)}
            loading={isLoading}
            searchPlaceholder="Search buyers..."
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="sellers">
          <DataTable
            columns={columns}
            data={usersWithSellerInfo.filter(u => u.is_seller)}
            loading={isLoading}
            searchPlaceholder="Search sellers..."
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="admins">
          <DataTable
            columns={columns}
            data={users.filter(u => u.role === 'admin')}
            loading={isLoading}
            searchPlaceholder="Search admins..."
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      {/* User Detail Modal */}
      <DetailModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="User Details"
        size="large"
        actions={[
          { label: 'Close', variant: 'outline', onClick: () => setShowEditModal(false) },
          { label: 'Save Changes', onClick: () => setShowEditModal(false), className: 'bg-blue-600 hover:bg-blue-700' }
        ]}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                  {selectedUser.full_name?.charAt(0) || selectedUser.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{selectedUser.full_name || 'N/A'}</h3>
                <p className="text-slate-500">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedUser.is_suspended ? 'suspended' : 'active'} />
                  {selectedUser.is_seller && <StatusBadge status={selectedUser.seller_status} />}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={selectedUser.full_name} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={selectedUser.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Joined Date</Label>
                <Input 
                  value={selectedUser.created_date ? format(new Date(selectedUser.created_date), 'MMM d, yyyy') : 'N/A'} 
                  disabled 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" size="sm">
                <KeyRound className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Force Logout
              </Button>
              <Button variant="destructive" size="sm">
                <Ban className="w-4 h-4 mr-2" />
                Suspend Account
              </Button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}