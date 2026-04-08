import { useRouter } from "vue-router";

export const adminNavLinks = [
  { key: "dashboard", label: "Dashboard" },
  { key: "builder", label: "Builder" },
  { key: "menu", label: "Menu" },
  { key: "reservations", label: "Reservations" },
  { key: "qr-codes", label: "QR Codes" },
  { key: "venue-settings", label: "Venue Settings" },
];

const adminRoutes = {
  dashboard: "/admin/dashboard",
  builder: "/admin/floor-plan",
  menu: "/admin/menu",
  reservations: "/admin/reservations",
  "qr-codes": "/admin/qr-codes",
  "venue-settings": "/admin/venue-settings",
};

export function useAdminNav() {
  const router = useRouter();
  const handleNav = (key) => {
    if (adminRoutes[key]) router.push(adminRoutes[key]);
  };
  return { adminNavLinks, handleNav };
}
