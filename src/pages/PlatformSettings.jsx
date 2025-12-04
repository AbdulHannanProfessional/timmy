import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import {
  Save,
  Settings,
  DollarSign,
  Percent,
  Bell,
  Shield,
  Sliders,
} from "lucide-react";
import PageHeader from "../components/admin/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

export default function PlatformSettings() {
  const [settings, setSettings] = useState({
    // Fees
    marketplace_commission: 10,
    transaction_fee: 0.5,
    listing_fee: 0,
    boosted_listing_fee: 5,

    // Thresholds
    min_listing_price: 0.99,
    max_listing_price: 100000,
    payout_delay_days: 3,
    min_payout_amount: 10,

    // Features
    ai_scanning_enabled: true,
    auto_price_sync: true,
    fraud_detection_enabled: true,
    seller_verification_required: true,

    // Notifications
    email_notifications: true,
    push_notifications: true,
    order_alerts: true,
    dispute_alerts: true,
  });

  const { data: platformSettings = [] } = useQuery({
    queryKey: ["platformSettings"],
    queryFn: () => base44.entities.PlatformSettings.list(),
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (settingsData) => {
      // Save each setting
      for (const [key, value] of Object.entries(settingsData)) {
        const existing = platformSettings.find((s) => s.setting_key === key);
        if (existing) {
          await base44.entities.PlatformSettings.update(existing.id, {
            setting_value: String(value),
          });
        } else {
          await base44.entities.PlatformSettings.create({
            setting_key: key,
            setting_value: String(value),
            setting_type:
              key.includes("fee") || key.includes("commission")
                ? "fee"
                : key.includes("enabled") || key.includes("required")
                ? "feature_flag"
                : "threshold",
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformSettings"] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  return (
    <div>
      <PageHeader
        title="Platform Settings"
        description="Configure marketplace fees, thresholds, and features"
        action={handleSave}
        actionLabel="Save Changes"
        actionIcon={Save}
      />

      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Thresholds
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Fees Tab */}
        <TabsContent value="fees">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-600" />
                  Commission Settings
                </CardTitle>
                <CardDescription>
                  Set the platform's cut from sales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Marketplace Commission (%)</Label>
                  <Input
                    type="number"
                    value={settings.marketplace_commission}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        marketplace_commission: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-slate-500">
                    Percentage taken from each sale
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Transaction Fee ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.transaction_fee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        transaction_fee: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                  />
                  <p className="text-xs text-slate-500">
                    Fixed fee per transaction
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Listing Fees
                </CardTitle>
                <CardDescription>
                  Fees for creating and promoting listings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Listing Fee ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.listing_fee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        listing_fee: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                  />
                  <p className="text-xs text-slate-500">
                    Fee to create a listing (0 = free)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Boosted Listing Fee ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.boosted_listing_fee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        boosted_listing_fee: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                  />
                  <p className="text-xs text-slate-500">
                    Fee for promoted listings
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Limits</CardTitle>
                <CardDescription>
                  Set minimum and maximum listing prices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Minimum Listing Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.min_listing_price}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        min_listing_price: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Listing Price ($)</Label>
                  <Input
                    type="number"
                    value={settings.max_listing_price}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        max_listing_price: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payout Settings</CardTitle>
                <CardDescription>
                  Configure seller payout thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payout Delay (Days)</Label>
                  <Input
                    type="number"
                    value={settings.payout_delay_days}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payout_delay_days: parseInt(e.target.value),
                      })
                    }
                    min="0"
                  />
                  <p className="text-xs text-slate-500">
                    Days to hold funds before payout
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Payout Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.min_payout_amount}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        min_payout_amount: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Features</CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">AI Card Scanning</p>
                  <p className="text-sm text-slate-500">
                    Allow users to scan cards with AI
                  </p>
                </div>
                <Switch
                  checked={settings.ai_scanning_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, ai_scanning_enabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Auto Price Sync</p>
                  <p className="text-sm text-slate-500">
                    Automatically sync market prices
                  </p>
                </div>
                <Switch
                  checked={settings.auto_price_sync}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, auto_price_sync: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Fraud Detection</p>
                  <p className="text-sm text-slate-500">
                    Enable AI-powered fraud monitoring
                  </p>
                </div>
                <Switch
                  checked={settings.fraud_detection_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      fraud_detection_enabled: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Seller Verification Required</p>
                  <p className="text-sm text-slate-500">
                    Require KYC for sellers
                  </p>
                </div>
                <Switch
                  checked={settings.seller_verification_required}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      seller_verification_required: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-500">
                    Send email alerts to users
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-slate-500">
                    Enable in-app push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, push_notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Order Alerts</p>
                  <p className="text-sm text-slate-500">
                    Notify admins of new orders
                  </p>
                </div>
                <Switch
                  checked={settings.order_alerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, order_alerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Dispute Alerts</p>
                  <p className="text-sm text-slate-500">
                    Notify admins of new disputes
                  </p>
                </div>
                <Switch
                  checked={settings.dispute_alerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, dispute_alerts: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
