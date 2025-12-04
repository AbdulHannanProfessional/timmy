import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { format } from "date-fns";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Bell,
  Megaphone,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import DetailModal from "@/components/admin/DetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ANNOUNCEMENT_TYPES = {
  info: { label: "Info", color: "bg-blue-100 text-blue-700" },
  warning: { label: "Warning", color: "bg-amber-100 text-amber-700" },
  promotion: { label: "Promotion", color: "bg-purple-100 text-purple-700" },
  maintenance: { label: "Maintenance", color: "bg-orange-100 text-orange-700" },
  update: { label: "Update", color: "bg-emerald-100 text-emerald-700" },
};

const TARGET_AUDIENCES = {
  all: "All Users",
  buyers: "Buyers Only",
  sellers: "Sellers Only",
  verified_sellers: "Verified Sellers",
};

export default function Announcements() {
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    target_audience: "all",
    is_active: true,
    start_date: "",
    end_date: "",
    banner_url: "",
  });
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Announcement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Announcement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      content: "",
      type: "info",
      target_audience: "all",
      is_active: true,
      start_date: "",
      end_date: "",
      banner_url: "",
    });
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target_audience: announcement.target_audience,
      is_active: announcement.is_active,
      start_date: announcement.start_date || "",
      end_date: announcement.end_date || "",
      banner_url: announcement.banner_url || "",
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-sm text-slate-500 truncate max-w-[200px]">
            {row.content}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <Badge className={ANNOUNCEMENT_TYPES[value]?.color}>
          {ANNOUNCEMENT_TYPES[value]?.label}
        </Badge>
      ),
    },
    {
      key: "target_audience",
      label: "Audience",
      render: (value) => (
        <span className="text-sm">{TARGET_AUDIENCES[value]}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (value) => (
        <Badge
          className={
            value
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }
        >
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "start_date",
      label: "Schedule",
      render: (value, row) => (
        <span className="text-sm text-slate-600">
          {value ? format(new Date(value), "MMM d") : "Now"}
          {row.end_date ? ` - ${format(new Date(row.end_date), "MMM d")}` : ""}
        </span>
      ),
    },
    {
      key: "created_date",
      label: "Created",
      render: (value) =>
        value ? format(new Date(value), "MMM d, yyyy") : "N/A",
    },
  ];

  const actions = [
    { label: "Edit", icon: Edit, onClick: handleEdit },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (row) => deleteMutation.mutate(row.id),
      destructive: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Manage platform announcements and notifications"
        action={() => setShowModal(true)}
        actionLabel="New Announcement"
        actionIcon={Plus}
      />

      <DataTable
        columns={columns}
        data={announcements}
        loading={isLoading}
        searchPlaceholder="Search announcements..."
        actions={actions}
        emptyMessage="No announcements yet"
      />

      {/* Create/Edit Modal */}
      <DetailModal
        open={showModal}
        onClose={resetForm}
        title={editingAnnouncement ? "Edit Announcement" : "New Announcement"}
        size="large"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Announcement title..."
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Announcement content..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ANNOUNCEMENT_TYPES).map(
                    ([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={formData.target_audience}
                onValueChange={(value) =>
                  setFormData({ ...formData, target_audience: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TARGET_AUDIENCES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date (optional)</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date (optional)</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Banner URL (optional)</Label>
            <Input
              value={formData.banner_url}
              onChange={(e) =>
                setFormData({ ...formData, banner_url: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label>Active</Label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !formData.title ||
                !formData.content
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingAnnouncement ? "Update" : "Create"} Announcement
            </Button>
          </div>
        </div>
      </DetailModal>
    </div>
  );
}
