import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import {
  Plus,
  Edit,
  Trash2,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DetailModal from "@/components/admin/DetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CategoryManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon_url: "",
    is_active: true,
    sets: [],
  });
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["cardCategories"],
    queryFn: () => base44.entities.CardCategory.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CardCategory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardCategories"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CardCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardCategories"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CardCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardCategories"] });
    },
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon_url: "",
      is_active: true,
      sets: [],
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon_url: category.icon_url || "",
      is_active: category.is_active,
      sets: category.sets || [],
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <PageHeader
        title="Category Management"
        description="Manage TCG categories and card sets"
        action={() => setShowModal(true)}
        actionLabel="Add Category"
        actionIcon={Plus}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No categories yet
            </h3>
            <p className="text-slate-500 mb-4">
              Add your first TCG category to get started
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {category.icon_url ? (
                      <img
                        src={category.icon_url}
                        alt={category.name}
                        className="w-10 h-10 rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Layers className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-slate-500">{category.slug}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      category.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.description && (
                  <p className="text-sm text-slate-600">
                    {category.description}
                  </p>
                )}

                {category.sets?.length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      {category.sets.length} Sets
                    </button>
                    {expandedCategories[category.id] && (
                      <div className="mt-2 pl-6 space-y-1">
                        {category.sets.slice(0, 5).map((set, idx) => (
                          <p key={idx} className="text-sm text-slate-600">
                            {set.name}{" "}
                            <span className="text-slate-400">({set.code})</span>
                          </p>
                        ))}
                        {category.sets.length > 5 && (
                          <p className="text-sm text-slate-400">
                            +{category.sets.length - 5} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(category.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <DetailModal
        open={showModal}
        onClose={resetForm}
        title={editingCategory ? "Edit Category" : "New Category"}
        size="large"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Pokémon"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="e.g., pokemon"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Category description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon URL (optional)</Label>
            <Input
              value={formData.icon_url}
              onChange={(e) =>
                setFormData({ ...formData, icon_url: e.target.value })
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
                !formData.name ||
                !formData.slug
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingCategory ? "Update" : "Create"} Category
            </Button>
          </div>
        </div>
      </DetailModal>
    </div>
  );
}
