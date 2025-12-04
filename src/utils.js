// src/utils/createPageUrl.js

// Central list of every page in the system.
// This becomes your single source of truth.

export const pages = {
  AdminDashboard: 'AdminDashboard',

  // Users
  UserManagement: 'UserManagement',
  SellerVerification: 'SellerVerification',
  RolesPermissions: 'RolesPermissions',

  // Marketplace
  ListingManagement: 'ListingManagement',
  CategoryManagement: 'CategoryManagement',
  PricingEngine: 'PricingEngine',

  // Orders
  OrderManagement: 'OrderManagement',

  // Payments
  PaymentManagement: 'PaymentManagement',
  PayoutManagement: 'PayoutManagement',
  FeeSettings: 'FeeSettings',
  RefundManagement: 'RefundManagement',

  // Disputes
  DisputeManagement: 'DisputeManagement',

  // Fraud & Security
  FraudMonitoring: 'FraudMonitoring',
  SecurityLogs: 'SecurityLogs',
  AdminActivityLogs: 'AdminActivityLogs',

  // Communications
  Announcements: 'Announcements',
  SupportTickets: 'SupportTickets',

  // Settings
  PlatformSettings: 'PlatformSettings'
};

// This converts the page name to a route URL.
// All pages become `/app/page-name`

export function createPageUrl(pageName) {
  return `/app/${pageName}`;
}
