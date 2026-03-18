import { FirebaseRepository } from "@mohasinac/db-firebase";
import type { Category } from "@/lib/types";

export class CategoryRepository extends FirebaseRepository<Category> {
  constructor() {
    super("categories");
  }
}

export const categoryRepository = new CategoryRepository();
