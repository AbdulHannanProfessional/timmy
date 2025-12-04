import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Settings } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FeeSettings() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="text-center">
        <CardContent className="py-12">
          <Settings className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Fee & Commission Settings</h2>
          <p className="text-slate-500 mb-6">
            Fee settings have been moved to the main Platform Settings page for easier management.
          </p>
          <Link to={createPageUrl('PlatformSettings')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Go to Platform Settings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}