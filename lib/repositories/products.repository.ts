import { FirebaseRepository, deserializeTimestamps } from "@mohasinac/db-firebase";
import type { Product } from "@/lib/types";

export interface ProductFilters {
  category?: string;
  concern?: string;
  isFeatured?: boolean;
  isCombo?: boolean;
  isActive?: boolean;
  limit?: number;
}

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    inStock: p.inStock ?? false,
    sortOrder: p.sortOrder ?? 0,
    images: p.images ?? [],
    variants: (p.variants ?? []).map((v) => ({
      ...v,
      reservedStock: v.reservedStock ?? 0,
    })),
    relatedProducts: p.relatedProducts ?? [],
    upsellProducts: p.upsellProducts ?? [],
    certifications: p.certifications ?? [],
    concerns: p.concerns ?? [],
    benefits: p.benefits ?? [],
    ingredients: p.ingredients ?? [],
    faqs: p.faqs ?? [],
    howToUse: p.howToUse ?? [],
    tags: p.tags ?? [],
  };
}

export class ProductRepository extends FirebaseRepository<Product> {
  constructor() {
    super("products");
  }

  async findActive(filters?: ProductFilters): Promise<Product[]> {
    let q = this.db
      .collection("products")
      .where("isActive", "==", true) as FirebaseFirestore.Query;
    if (filters?.category) q = q.where("category", "==", filters.category);
    if (filters?.isFeatured !== undefined)
      q = q.where("isFeatured", "==", filters.isFeatured);
    if (filters?.isCombo !== undefined)
      q = q.where("isCombo", "==", filters.isCombo);
    // Fetch extra when also filtering by concern (client-side filter)
    if (filters?.limit && filters?.concern) {
      q = q.limit(filters.limit * 3);
    } else if (filters?.limit) {
      q = q.limit(filters.limit);
    }
    const snap = await q.get();
    let results = snap.docs.map((d) =>
      normalizeProduct(deserializeTimestamps(d.data() as Product)),
    );
    if (filters?.concern)
      results = results.filter((p) => p.concerns.includes(filters.concern!));
    if (filters?.limit) results = results.slice(0, filters.limit);
    return results.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const snap = await this.db
      .collection("products")
      .where("slug", "==", slug)
      .where("isActive", "==", true)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return normalizeProduct(
      deserializeTimestamps(snap.docs[0]!.data() as Product),
    );
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await this.db.collection("products").doc(id).get();
    if (!doc.exists) return null;
    return normalizeProduct(deserializeTimestamps(doc.data() as Product));
  }

  /** Admin: all products ordered by sortOrder. */
  async findAllAdmin(): Promise<Product[]> {
    const snap = await this.db
      .collection("products")
      .orderBy("sortOrder", "asc")
      .get();
    return snap.docs.map((d) =>
      normalizeProduct(
        deserializeTimestamps({ id: d.id, ...d.data() } as Product),
      ),
    );
  }
}

export const productRepository = new ProductRepository();
