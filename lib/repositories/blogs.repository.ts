import { FirebaseRepository, deserializeTimestamps } from "@mohasinac/db-firebase";
import type { Blog, BlogCategory } from "@/lib/types";

function normalizeBlog(b: Blog): Blog {
  return {
    ...b,
    tags: b.tags ?? [],
    relatedProducts: b.relatedProducts ?? [],
  };
}

export class BlogRepository extends FirebaseRepository<Blog> {
  constructor() {
    super("blogs");
  }

  async findPublished(category?: BlogCategory, limit?: number): Promise<Blog[]> {
    let q = this.db
      .collection("blogs")
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc") as FirebaseFirestore.Query;
    if (category) q = q.where("category", "==", category);
    if (limit) q = q.limit(limit);
    const snap = await q.get();
    return snap.docs.map((d) =>
      normalizeBlog(
        deserializeTimestamps({ id: d.id, ...d.data() }) as Blog,
      ),
    );
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    const snap = await this.db
      .collection("blogs")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();
    if (snap.empty) return null;
    return normalizeBlog(
      deserializeTimestamps({
        id: snap.docs[0]!.id,
        ...snap.docs[0]!.data(),
      }) as Blog,
    );
  }

  /** Admin: all blogs, optionally filtered by status. */
  async findAllAdmin(status?: Blog["status"]): Promise<Blog[]> {
    let q = this.db
      .collection("blogs")
      .orderBy("publishedAt", "desc") as FirebaseFirestore.Query;
    if (status) q = q.where("status", "==", status);
    const snap = await q.get();
    return snap.docs.map((d) =>
      normalizeBlog(
        deserializeTimestamps({ id: d.id, ...d.data() }) as Blog,
      ),
    );
  }
}

export const blogRepository = new BlogRepository();
