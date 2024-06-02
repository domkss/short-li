import { Role } from "@/lib/common/Types";

export const NAV_BAR_LINKS: { title: string; path: string; requiredRole?: Role }[] = [
  { title: "URL Shortener", path: "/" },
  { title: "Admin", path: "/admin", requiredRole: Role.Admin },
  { title: "My Links", path: "/user/links", requiredRole: Role.User },
  { title: "Link-in-bio", path: "/user/links/link-in-bio", requiredRole: Role.User },
];

export const PATHS_WITH_HIDDEN_NAVBAR = ["/s/", "/api"];

export const COLOR_PICKER_SUGGESTED_COLORS = [
  "#90cdf4",
  "#64eddf",
  "#c6f6d5",
  "#c3dafe",
  "#f9a8d4",
  "#b794f4",
  "#fc8181",
  "#faf089",
  "#ffc299",
  "#ffffff",
];
