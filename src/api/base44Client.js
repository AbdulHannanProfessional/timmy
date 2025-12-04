// src/api/base44Client.js

// A reusable CRUD factory for each entity
function createEntityApi(entityName) {
  const baseUrl = `/api/${entityName.toLowerCase()}`;

  return {
    list: async () => {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error(`Failed to list ${entityName}`);
      return res.json();
    },

    create: async (data) => {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Failed to create ${entityName}`);
      return res.json();
    },

    update: async (id, data) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Failed to update ${entityName}`);
      return res.json();
    },

    delete: async (id) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`Failed to delete ${entityName}`);
      return res.json();
    }
  };
}


// All entities matching your folder screenshot
export const base44 = {
  auth: {
    logout() {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  },

  entities: {
    Seller: createEntityApi("Seller"),
    Listing: createEntityApi("Listing"),
    Order: createEntityApi("Order"),
    Payment: createEntityApi("Payment"),
    Payout: createEntityApi("Payout"),
    Dispute: createEntityApi("Dispute"),
    FraudAlert: createEntityApi("FraudAlert"),
    AdminLog: createEntityApi("AdminLog"),
    CardCategory: createEntityApi("CardCategory"),

    // The one you are using
    PlatformSettings: createEntityApi("PlatformSettings"),

    Announcement: createEntityApi("Announcement"),
    SupportTicket: createEntityApi("SupportTicket"),
  }
};
