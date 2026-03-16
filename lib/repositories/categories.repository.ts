import { FirebaseRepository } from "@mohasinac/db-firebase";
import type { Category, Concern } from "@/lib/types";

export class CategoryRepository extends FirebaseRepository<Category> {
  constructor() {
    super("categories");
  }
}

export class ConcernRepository extends FirebaseRepository<Concern> {
  constructor() {
    super("concerns");
  }
}

export const categoryRepository = new CategoryRepository();
export const concernRepository = new ConcernRepository();
