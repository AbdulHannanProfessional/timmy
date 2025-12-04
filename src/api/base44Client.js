// src/api/base44Client.js

function createEntityApi(entityName) {
  // json file name → lowercase and plural
  const jsonFile = `/public/Entities/${entityName.toLowerCase()}s.json`;

  return {
    list: async () => {
      const res = await fetch(jsonFile);
      if (!res.ok) throw new Error(`Failed to load ${jsonFile}`);
      return res.json();
    },

    create: async (data) => {
      console.warn("CREATE not supported in public-mode. Data: ", data);
      return { success: true, mock: true };
    },

    update: async (id, data) => {
      console.warn("UPDATE not supported in public-mode. Data: ", id, data);
      return { success: true, mock: true };
    },

    delete: async (id) => {
      console.warn("DELETE not supported in public-mode. ID: ", id);
      return { success: true, mock: true };
    }
  };
}

export const base44 = {
  auth: {
    logout() {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  },

  entities: {
    Seller: createEntityApi("seller"),
    Listing: createEntityApi("listing"),
    Order: createEntityApi("order"),
    Payment: createEntityApi("payment"),
    Payout: createEntityApi("payout"),
    Dispute: createEntityApi("dispute"),
    FraudAlert: createEntityApi("fraudalert"),
    AdminLog: createEntityApi("adminlog"),
    CardCategory: createEntityApi("cardcategory"),
    PlatformSettings: createEntityApi("platformsettings"),
    Announcement: createEntityApi("announcement"),
    SupportTicket: createEntityApi("supportticket"),
  }
};
