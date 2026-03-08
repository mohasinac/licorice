import type { Metadata } from "next";
import { getConcerns } from "@/lib/db";
import { ConcernsClient } from "./ConcernsClient";

export const metadata: Metadata = { title: "Concerns — Admin — Licorice Herbals" };

export default async function AdminConcernsPage() {
  const concerns = await getConcerns();

  return <ConcernsClient initialConcerns={concerns} />;
}
