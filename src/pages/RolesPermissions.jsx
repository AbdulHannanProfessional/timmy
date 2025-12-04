import React, { useState } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  Eye,
  Settings,
  DollarSign,
  Package,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import DetailModal from '@/components/admin/DetailModal';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PERMISSIONS = {
  users: {
    label: 'User Management',
    icon: Users,
    permissions: [
      { key: 'users.view', label: 'View users' },
      { key: 'users.edit', label: 'Edit users' },
      { key: 'users.suspend', label: 'Suspend/ban users' },
      { key: 'users.delete', label: 'Delete users' }
    ]
  },
  listings: {
    label: 'Listings',
    icon: Package,
    permissions: [
      { key: 'listings.view', label: 'View listings' },
      { key: 'listings.approve', label: 'Approve/reject listings' },
      { key: 'listings.edit', label: 'Edit listings' },
      { key: 'listings.delete', label: 'Delete listings' }
    ]
  },
  orders: {
    label: 'Orders',
    icon: Package,
    permissions: [
      { key: 'orders.view', label: 'View orders' },
      { key: 'orders.update', label: 'Update order status' },
      { key: 'orders.refund', label: 'Process refunds' }
    ]
  },
  payments: {
    label: 'Payments & Payouts',
    icon: DollarSign,
    permissions: [
      { key: 'payments.view', label: 'View payments' },
      { key: 'payouts.view', label: 'View payouts' },
      { key: 'payouts.process', label: 'Process payouts' },
      { key: 'fees.manage', label: 'Manage fees' }
    ]
  },
  disputes: {
    label: 'Disputes',
    icon: AlertTriangle,
    permissions: [
      { key: 'disputes.view', label: 'View disputes' },
      { key: 'disputes.resolve', label: 'Resolve disputes' }
    ]
  },
  support: {
    label: 'Support',
    icon: MessageSquare,
    permissions: [
      { key: 'tickets.view', label: 'View tickets' },
      { key: 'tickets.respond', label: 'Respond to tickets' },
      { key: 'announcements.manage', label: 'Manage announcements' }
    ]
  },
  settings: {
    label: 'Settings',
    icon: Settings,
    permissions: [
      { key: 'settings.view', label: 'View settings' },
      { key: 'settings.edit', label: 'Edit settings' },
      { key: 'roles.manage', label: 'Manage roles' }
    ]
  }
};

const DEFAULT_ROLES = [
  { 
    id: '1', 
    name: 'Super Admin', 
    description: 'Full access to all features',
    permissions: Object.values(PERMISSIONS).flatMap(cat => cat.permissions.map(p => p.key)),
    users: 2,
    color: 'bg-purple-100 text-purple-700'
  },
  { 
    id: '2', 
    name: 'Finance Admin', 
    description: 'Access to payments, payouts, and financial reports',
    permissions: ['payments.view', 'payouts.view', 'payouts.process', 'fees.manage', 'orders.view', 'orders.refund'],
    users: 3,
    color: 'bg-emerald-100 text-emerald-700'
  },
  { 
    id: '3', 
    name: 'Support Agent', 
    description: 'Handle user support and disputes',
    permissions: ['users.view', 'orders.view', 'disputes.view', 'disputes.resolve', 'tickets.view', 'tickets.respond'],
    users: 8,
    color: 'bg-blue-100 text-blue-700'
  },
  { 
    id: '4', 
    name: 'Moderator', 
    description: 'Review and moderate listings',
    permissions: ['listings.view', 'listings.approve', 'listings.edit', 'users.view'],
    users: 5,
    color: 'bg-amber-100 text-amber-700'
  }
];

export default function RolesPermissions() {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setShowModal(true);
  };

  const togglePermission = (key) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key]
    }));
  };

  const handleSave = () => {
    if (editingRole) {
      setRoles(prev => prev.map(r => 
        r.id === editingRole.id 
          ? { ...r, name: formData.name, description: formData.description, permissions: formData.permissions }
          : r
      ));
    } else {
      setRoles(prev => [...prev, {
        id: String(Date.now()),
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        users: 0,
        color: 'bg-slate-100 text-slate-700'
      }]);
    }
    resetForm();
  };

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Manage admin roles and access levels"
        action={() => setShowModal(true)}
        actionLabel="Create Role"
        actionIcon={Plus}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${role.color}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{role.users} users</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 6).map((perm) => (
                  <Badge key={perm} variant="secondary" className="text-xs">
                    {perm.split('.')[1]}
                  </Badge>
                ))}
                {role.permissions.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{role.permissions.length - 6} more
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {role.name !== 'Super Admin' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setRoles(prev => prev.filter(r => r.id !== role.id))}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <DetailModal
        open={showModal}
        onClose={resetForm}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        size="xlarge"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Content Moderator"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this role"
              />
            </div>
          </div>

          <div>
            <Label className="mb-4 block">Permissions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PERMISSIONS).map(([key, category]) => (
                <Card key={key}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <category.icon className="w-4 h-4" />
                      {category.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 py-2">
                    {category.permissions.map((perm) => (
                      <div key={perm.key} className="flex items-center gap-2">
                        <Checkbox
                          id={perm.key}
                          checked={formData.permissions.includes(perm.key)}
                          onCheckedChange={() => togglePermission(perm.key)}
                        />
                        <label htmlFor={perm.key} className="text-sm cursor-pointer">
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingRole ? 'Update' : 'Create'} Role
            </Button>
          </div>
        </div>
      </DetailModal>
    </div>
  );
}