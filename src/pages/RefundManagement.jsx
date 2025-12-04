import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RefundManagement() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="text-center">
        <CardContent className="py-12">
          <RefreshCw className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Refund Management</h2>
          <p className="text-slate-500 mb-6">
            Refunds are handled through the Dispute Management system. Open a dispute to process refunds.
          </p>
          <Link to={createPageUrl('DisputeManagement')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Go to Dispute Management
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}