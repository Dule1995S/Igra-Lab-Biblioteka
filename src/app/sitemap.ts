import type { MetadataRoute } from "next";
import { SAJT } from "@/lib/sajt";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/cene", "/kontakt", "/demo/brojevi-do-20", "/uslovi", "/privatnost", "/prijava", "/registracija"].map((p) => ({ url: `${SAJT.url}${p}` }));
}
