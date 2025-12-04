import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  Package,
  Shield,
  Bell,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Layers,
  FileText,
  AlertTriangle,
  Wallet,
  MessageSquare,
  Database,
} from "lucide-react";
import { base44 } from "./api/base44Client";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    page: "AdminDashboard",
  },
  {
    name: "Users & Sellers",
    icon: Users,
    page: "UserManagement",
    subItems: [
      { name: "All Users", page: "UserManagement" },
      { name: "Seller Verification", page: "SellerVerification" },
      { name: "Roles & Permissions", page: "RolesPermissions" },
    ],
  },
  {
    name: "Marketplace",
    icon: ShoppingBag,
    page: "ListingManagement",
    subItems: [
      { name: "Listings", page: "ListingManagement" },
      { name: "Categories", page: "CategoryManagement" },
      { name: "Pricing Engine", page: "PricingEngine" },
    ],
  },
  {
    name: "Orders",
    icon: Package,
    page: "OrderManagement",
  },
  {
    name: "Payments",
    icon: CreditCard,
    page: "PaymentManagement",
    subItems: [
      { name: "Transactions", page: "PaymentManagement" },
      { name: "Payouts", page: "PayoutManagement" },
      { name: "Fees & Commissions", page: "FeeSettings" },
      { name: "Refunds", page: "RefundManagement" },
    ],
  },
  {
    name: "Disputes",
    icon: AlertTriangle,
    page: "DisputeManagement",
  },
  {
    name: "Fraud & Security",
    icon: Shield,
    page: "FraudMonitoring",
    subItems: [
      { name: "Fraud Alerts", page: "FraudMonitoring" },
      { name: "Security Logs", page: "SecurityLogs" },
      { name: "Admin Activity", page: "AdminActivityLogs" },
    ],
  },
  {
    name: "Communications",
    icon: Bell,
    page: "Announcements",
    subItems: [
      { name: "Announcements", page: "Announcements" },
      { name: "Support Tickets", page: "SupportTickets" },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    page: "PlatformSettings",
  },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (name) => {
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --primary: #0f172a;
          --primary-light: #1e293b;
          --accent: #3b82f6;
          --accent-light: #60a5fa;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 2px;
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-7 h-7 text-blue-400" />
          <span className="font-bold text-lg">Demo by TAD</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300
        ${sidebarOpen ? "w-64" : "w-20"}
        ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="animate-fadeIn">
                <h1 className="font-bold text-lg">Demo by TAD</h1>
                <p className="text-xs text-slate-400">Management Console</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)] scrollbar-thin">
          {navItems.map((item) => {
            const isActive =
              currentPageName === item.page ||
              (item.subItems &&
                item.subItems.some((sub) => sub.page === currentPageName));
            const isExpanded = expandedItems[item.name];

            return (
              <div key={item.name}>
                {item.subItems ? (
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">
                          {item.name}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                )}

                {/* Sub Items */}
                {item.subItems && isExpanded && sidebarOpen && (
                  <div className="ml-8 mt-1 space-y-1 animate-fadeIn">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.page}
                        to={createPageUrl(subItem.page)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          block px-3 py-2 rounded-lg text-sm transition-colors
                          ${
                            currentPageName === subItem.page
                              ? "text-blue-400 bg-slate-800"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          }
                        `}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
        transition-all duration-300 min-h-screen
        ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}
        pt-16 lg:pt-0
      `}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
