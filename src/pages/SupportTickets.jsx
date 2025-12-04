import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { format } from "date-fns";
import {
  Eye,
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Inbox,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import DetailModal from "@/components/admin/DetailModal";
import StatCard from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const CATEGORIES = {
  account: "Account",
  order: "Order",
  payment: "Payment",
  listing: "Listing",
  shipping: "Shipping",
  technical: "Technical",
  other: "Other",
};

export default function SupportTickets() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["supportTickets"],
    queryFn: () => base44.entities.SupportTicket.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    },
  });

  const openTickets = tickets.filter((t) => t.status === "open");
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress");
  const waitingTickets = tickets.filter((t) => t.status === "waiting_response");
  const resolvedTickets = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  );

  const columns = [
    {
      key: "subject",
      label: "Subject",
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{row.user_email}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value) => (
        <Badge variant="outline">{CATEGORIES[value] || value}</Badge>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "messages",
      label: "Messages",
      render: (value) => (
        <div className="flex items-center gap-1 text-slate-600">
          <MessageSquare className="w-4 h-4" />
          <span>{value?.length || 0}</span>
        </div>
      ),
    },
    {
      key: "created_date",
      label: "Created",
      render: (value) =>
        value ? format(new Date(value), "MMM d, h:mm a") : "N/A",
    },
  ];

  const handleSendReply = async () => {
    if (selectedTicket && replyMessage.trim()) {
      const newMessage = {
        sender: "admin@tcgmarket.com",
        content: replyMessage,
        timestamp: new Date().toISOString(),
        is_admin: true,
      };

      const updatedMessages = [...(selectedTicket.messages || []), newMessage];

      await updateMutation.mutateAsync({
        id: selectedTicket.id,
        data: {
          messages: updatedMessages,
          status: "waiting_response",
        },
      });

      setReplyMessage("");
      setSelectedTicket({
        ...selectedTicket,
        messages: updatedMessages,
        status: "waiting_response",
      });
    }
  };

  const handleStatusChange = (status) => {
    if (selectedTicket) {
      updateMutation.mutate({
        id: selectedTicket.id,
        data: { status },
      });
      setSelectedTicket({ ...selectedTicket, status });
    }
  };

  const actions = [
    {
      label: "View & Reply",
      icon: Eye,
      onClick: (row) => {
        setSelectedTicket(row);
        setNewStatus(row.status);
        setShowModal(true);
      },
    },
  ];

  const filters = [
    {
      key: "category",
      label: "Category",
      options: Object.entries(CATEGORIES).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { value: "urgent", label: "Urgent" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Manage and respond to user support requests"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Open"
          value={openTickets.length}
          icon={Inbox}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgressTickets.length}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Awaiting Response"
          value={waitingTickets.length}
          icon={AlertCircle}
          color="purple"
        />
        <StatCard
          title="Resolved"
          value={resolvedTickets.length}
          icon={CheckCircle}
          color="green"
        />
      </div>

      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="open">Open ({openTickets.length})</TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressTickets.length})
          </TabsTrigger>
          <TabsTrigger value="waiting">
            Awaiting ({waitingTickets.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <DataTable
            columns={columns}
            data={openTickets}
            loading={isLoading}
            searchPlaceholder="Search tickets..."
            actions={actions}
            filters={filters}
            emptyMessage="No open tickets"
          />
        </TabsContent>

        <TabsContent value="in_progress">
          <DataTable
            columns={columns}
            data={inProgressTickets}
            loading={isLoading}
            actions={actions}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="waiting">
          <DataTable
            columns={columns}
            data={waitingTickets}
            loading={isLoading}
            actions={actions}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="resolved">
          <DataTable
            columns={columns}
            data={resolvedTickets}
            loading={isLoading}
            actions={actions}
            filters={filters}
          />
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      <DetailModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setReplyMessage("");
        }}
        title="Support Ticket"
        size="xlarge"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedTicket.subject}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline">
                    {CATEGORIES[selectedTicket.category]}
                  </Badge>
                  <StatusBadge status={selectedTicket.priority} />
                  <StatusBadge status={selectedTicket.status} />
                </div>
              </div>
              <Select
                value={selectedTicket.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_response">
                    Awaiting Response
                  </SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <User className="w-4 h-4" />
                  <span>{selectedTicket.user_email}</span>
                  <span>•</span>
                  <span>
                    {selectedTicket.created_date &&
                      format(
                        new Date(selectedTicket.created_date),
                        "MMM d, yyyy h:mm a"
                      )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <div>
              <Label className="mb-3 block">Conversation</Label>
              <ScrollArea className="h-[300px] border rounded-xl p-4 bg-slate-50">
                {selectedTicket.messages?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTicket.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${
                          msg.is_admin ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback
                            className={
                              msg.is_admin
                                ? "bg-blue-100 text-blue-600"
                                : "bg-slate-200 text-slate-600"
                            }
                          >
                            {msg.is_admin ? "A" : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[70%] ${
                            msg.is_admin ? "text-right" : ""
                          }`}
                        >
                          <div
                            className={`rounded-2xl p-3 ${
                              msg.is_admin
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-white border rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {msg.timestamp &&
                              format(new Date(msg.timestamp), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">
                    No messages yet
                  </p>
                )}
              </ScrollArea>
            </div>

            {/* Reply */}
            <div className="space-y-2">
              <Label>Reply</Label>
              <div className="flex gap-2">
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="flex-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Close
                </Button>
                <Button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
