import type { MetadataRoute } from "next";
import { SAJT } from "@/lib/sajt";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/biblioteka", "/admin"] }, sitemap: `${SAJT.url}/sitemap.xml` };
}
