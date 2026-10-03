import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const file = path.join(process.cwd(), "sadrzaj/brojevi-i-kolicine-do-20/radni-list.pdf");
  const bytes = await readFile(file);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="brojevi-i-kolicine-do-20.pdf"',
    },
  });
}
