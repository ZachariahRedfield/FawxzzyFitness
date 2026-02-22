import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fawxzzy Fitness",
    short_name: "Fawxzzy",
    description: "Foundation app for logging gym sessions.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    icons: [],
  };
}
