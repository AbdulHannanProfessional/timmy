import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';

// All your pages
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import SellerVerification from './pages/SellerVerification';
import RolesPermissions from './pages/RolesPermissions';

import ListingManagement from './pages/ListingManagement';
import CategoryManagement from './pages/CategoryManagement';
import PricingEngine from './pages/PricingEngine';

import OrderManagement from './pages/OrderManagement';

import PaymentManagement from './pages/PaymentManagement';
import PayoutManagement from './pages/PayoutManagement';
import FeeSettings from './pages/FeeSettings';
import RefundManagement from './pages/RefundManagement';

import DisputeManagement from './pages/DisputeManagement';

import FraudMonitoring from './pages/FraudMonitoring';
import SecurityLogs from './pages/SecurityLogs';
import AdminActivityLogs from './pages/AdminActivityLogs';

import Announcements from './pages/Announcements';
import SupportTickets from './pages/SupportTickets';

import PlatformSettings from './pages/PlatformSettings';

import { createPageUrl } from './utils/createPageUrl.js';

function App() {
  return (
    <Router>
      <Routes>

        {/* Dashboard */}
        <Route
          path={createPageUrl('AdminDashboard')}
          element={
            <Layout currentPageName="AdminDashboard">
              <AdminDashboard />
            </Layout>
          }
        />

        {/* Users & Sellers */}
        <Route
          path={createPageUrl('UserManagement')}
          element={
            <Layout currentPageName="UserManagement">
              <UserManagement />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('SellerVerification')}
          element={
            <Layout currentPageName="SellerVerification">
              <SellerVerification />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('RolesPermissions')}
          element={
            <Layout currentPageName="RolesPermissions">
              <RolesPermissions />
            </Layout>
          }
        />

        {/* Marketplace */}
        <Route
          path={createPageUrl('ListingManagement')}
          element={
            <Layout currentPageName="ListingManagement">
              <ListingManagement />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('CategoryManagement')}
          element={
            <Layout currentPageName="CategoryManagement">
              <CategoryManagement />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('PricingEngine')}
          element={
            <Layout currentPageName="PricingEngine">
              <PricingEngine />
            </Layout>
          }
        />

        {/* Orders */}
        <Route
          path={createPageUrl('OrderManagement')}
          element={
            <Layout currentPageName="OrderManagement">
              <OrderManagement />
            </Layout>
          }
        />

        {/* Payments */}
        <Route
          path={createPageUrl('PaymentManagement')}
          element={
            <Layout currentPageName="PaymentManagement">
              <PaymentManagement />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('PayoutManagement')}
          element={
            <Layout currentPageName="PayoutManagement">
              <PayoutManagement />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('FeeSettings')}
          element={
            <Layout currentPageName="FeeSettings">
              <FeeSettings />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('RefundManagement')}
          element={
            <Layout currentPageName="RefundManagement">
              <RefundManagement />
            </Layout>
          }
        />

        {/* Disputes */}
        <Route
          path={createPageUrl('DisputeManagement')}
          element={
            <Layout currentPageName="DisputeManagement">
              <DisputeManagement />
            </Layout>
          }
        />

        {/* Fraud & Security */}
        <Route
          path={createPageUrl('FraudMonitoring')}
          element={
            <Layout currentPageName="FraudMonitoring">
              <FraudMonitoring />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('SecurityLogs')}
          element={
            <Layout currentPageName="SecurityLogs">
              <SecurityLogs />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('AdminActivityLogs')}
          element={
            <Layout currentPageName="AdminActivityLogs">
              <AdminActivityLogs />
            </Layout>
          }
        />

        {/* Communications */}
        <Route
          path={createPageUrl('Announcements')}
          element={
            <Layout currentPageName="Announcements">
              <Announcements />
            </Layout>
          }
        />
        <Route
          path={createPageUrl('SupportTickets')}
          element={
            <Layout currentPageName="SupportTickets">
              <SupportTickets />
            </Layout>
          }
        />

        {/* Settings */}
        <Route
          path={createPageUrl('PlatformSettings')}
          element={
            <Layout currentPageName="PlatformSettings">
              <PlatformSettings />
            </Layout>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
