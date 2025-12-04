import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  Download,
  Shield,
  Globe,
  Smartphone,
  AlertTriangle,
  Lock,
  LogIn,
  LogOut
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import StatCard from '@/components/admin/StatCard';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityLogs() {
  // Mock security events data
  const securityEvents = [
    { 
      id: '1', 
      type: 'login_success', 
      user_email: 'user@example.com', 
      ip_address: '192.168.1.1', 
      device: 'Chrome on Windows', 
      location: 'New York, US',
      created_date: new Date().toISOString()
    },
    { 
      id: '2', 
      type: 'login_failed', 
      user_email: 'test@example.com', 
      ip_address: '10.0.0.1', 
      device: 'Firefox on Mac', 
      location: 'London, UK',
      created_date: new Date(Date.now() - 3600000).toISOString()
    },
    { 
      id: '3', 
      type: 'account_locked', 
      user_email: 'blocked@example.com', 
      ip_address: '172.16.0.1', 
      device: 'Mobile Safari', 
      location: 'Unknown',
      created_date: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const EVENT_TYPES = {
    login_success: { label: 'Login Success', icon: LogIn, color: 'bg-emerald-100 text-emerald-700' },
    login_failed: { label: 'Login Failed', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
    logout: { label: 'Logout', icon: LogOut, color: 'bg-slate-100 text-slate-700' },
    password_reset: { label: 'Password Reset', icon: Lock, color: 'bg-blue-100 text-blue-700' },
    account_locked: { label: 'Account Locked', icon: Lock, color: 'bg-red-100 text-red-700' }
  };

  const columns = [
    {
      key: 'type',
      label: 'Event',
      render: (value) => {
        const eventInfo = EVENT_TYPES[value] || { label: value, color: 'bg-slate-100 text-slate-700' };
        return (
          <Badge className={eventInfo.color}>
            {eventInfo.label}
          </Badge>
        );
      }
    },
    {
      key: 'user_email',
      label: 'User',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'ip_address',
      label: 'IP Address',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'device',
      label: 'Device',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => <span className="text-sm text-slate-600">{value}</span>
    },
    {
      key: 'created_date',
      label: 'Timestamp',
      render: (value) => value ? format(new Date(value), 'MMM d, h:mm:ss a') : 'N/A'
    }
  ];

  return (
    <div>
      <PageHeader
        title="Security Logs"
        description="Monitor login attempts, IP addresses, and device activity"
        action={() => console.log('Export')}
        actionLabel="Export Logs"
        actionIcon={Download}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Login Attempts (24h)" 
          value="1,234" 
          icon={LogIn} 
          color="blue"
        />
        <StatCard 
          title="Failed Logins (24h)" 
          value="23" 
          icon={AlertTriangle} 
          color="red"
        />
        <StatCard 
          title="Unique IPs (24h)" 
          value="456" 
          icon={Globe} 
          color="purple"
        />
        <StatCard 
          title="Locked Accounts" 
          value="3" 
          icon={Lock} 
          color="orange"
        />
      </div>

      {/* Suspicious Activity */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Suspicious Activity Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div>
              <p className="font-medium text-amber-900">Multiple failed login attempts detected</p>
              <p className="text-sm text-amber-700">3 accounts with 5+ failed attempts in the last hour</p>
            </div>
            <Badge className="bg-amber-100 text-amber-700">Review Required</Badge>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={securityEvents}
        searchPlaceholder="Search by user or IP..."
        emptyMessage="No security events"
      />
    </div>
  );
}