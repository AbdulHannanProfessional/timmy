import React from 'react';
import { 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  TrendingUp,
  Sliders
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function PricingEngine() {
  const pricingAPIs = [
    { name: 'TCGPlayer API', status: 'connected', lastSync: '2 min ago', records: 125000 },
    { name: 'CardMarket API', status: 'connected', lastSync: '5 min ago', records: 98000 },
    { name: 'PriceCharting API', status: 'error', lastSync: '2 hours ago', records: 0 }
  ];

  return (
    <div>
      <PageHeader
        title="Pricing Engine"
        description="Manage external pricing APIs and sync settings"
        action={() => console.log('Sync all')}
        actionLabel="Sync All Prices"
        actionIcon={RefreshCw}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Cards Priced" 
          value="223K" 
          icon={Database} 
          color="blue"
        />
        <StatCard 
          title="Last Full Sync" 
          value="2 min ago" 
          icon={RefreshCw} 
          color="green"
        />
        <StatCard 
          title="Sync Errors" 
          value="3" 
          icon={AlertTriangle} 
          color="red"
        />
        <StatCard 
          title="Price Accuracy" 
          value="99.2%" 
          icon={TrendingUp} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Connections */}
        <Card>
          <CardHeader>
            <CardTitle>API Connections</CardTitle>
            <CardDescription>External pricing data sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricingAPIs.map((api) => (
              <div key={api.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {api.status === 'connected' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{api.name}</p>
                    <p className="text-sm text-slate-500">
                      Last sync: {api.lastSync} • {api.records.toLocaleString()} records
                    </p>
                  </div>
                </div>
                <Badge className={api.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                  {api.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Add New API
            </Button>
          </CardContent>
        </Card>

        {/* Price Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Price Thresholds
            </CardTitle>
            <CardDescription>Set alerts for price anomalies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Underpriced Alert Threshold (%)</Label>
              <Input type="number" defaultValue="30" />
              <p className="text-xs text-slate-500">Alert when listing is X% below market</p>
            </div>
            <div className="space-y-2">
              <Label>Overpriced Alert Threshold (%)</Label>
              <Input type="number" defaultValue="50" />
              <p className="text-xs text-slate-500">Alert when listing is X% above market</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">Auto-flag Anomalies</p>
                <p className="text-sm text-slate-500">Automatically flag suspicious prices</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Settings</CardTitle>
            <CardDescription>Configure automatic price updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Auto Sync</p>
                <p className="text-sm text-slate-500">Automatically sync prices</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Sync Interval (minutes)</Label>
              <Input type="number" defaultValue="15" />
            </div>
            <div className="space-y-2">
              <Label>Priority Categories</Label>
              <Input defaultValue="pokemon, mtg" placeholder="Comma-separated" />
              <p className="text-xs text-slate-500">Categories to sync more frequently</p>
            </div>
          </CardContent>
        </Card>

        {/* Manual Adjustments */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Price Adjustment</CardTitle>
            <CardDescription>Override prices for specific cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Card Name / Set</Label>
              <Input placeholder="Search for a card..." />
            </div>
            <div className="space-y-2">
              <Label>New Market Price ($)</Label>
              <Input type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Reason for Override</Label>
              <Input placeholder="e.g., API error, special edition" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Apply Override
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}