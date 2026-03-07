import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const indexes = [
  // products
  {
    collectionGroup: "products",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "isActive", order: "ASCENDING" },
      { fieldPath: "category", order: "ASCENDING" },
      { fieldPath: "sortOrder", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "products",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "isActive", order: "ASCENDING" },
      { fieldPath: "isFeatured", order: "ASCENDING" },
      { fieldPath: "sortOrder", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "products",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "isActive", order: "ASCENDING" },
      { fieldPath: "isCombo", order: "ASCENDING" },
      { fieldPath: "sortOrder", order: "ASCENDING" },
    ],
  },
  {
    collectionGroup: "products",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "slug", order: "ASCENDING" },
      { fieldPath: "isActive", order: "ASCENDING" },
    ],
  },
  // blogs
  {
    collectionGroup: "blogs",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "publishedAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "blogs",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "category", order: "ASCENDING" },
      { fieldPath: "publishedAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "blogs",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "slug", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
    ],
  },
  // reviews
  {
    collectionGroup: "reviews",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "reviews",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "productId", order: "ASCENDING" },
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  // orders
  {
    collectionGroup: "orders",
    queryScope: "COLLECTION",
    fields: [{ fieldPath: "createdAt", order: "DESCENDING" }],
  },
  {
    collectionGroup: "orders",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "orders",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "orderStatus", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "orders",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "paymentStatus", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "orders",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "orderStatus", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  // inventory sub-collections
  {
    collectionGroup: "timeline",
    queryScope: "COLLECTION_GROUP",
    fields: [{ fieldPath: "createdAt", order: "ASCENDING" }],
  },
  {
    collectionGroup: "movements",
    queryScope: "COLLECTION_GROUP",
    fields: [{ fieldPath: "createdAt", order: "DESCENDING" }],
  },
  {
    collectionGroup: "movements",
    queryScope: "COLLECTION_GROUP",
    fields: [
      { fieldPath: "variantId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  // supportTickets
  {
    collectionGroup: "supportTickets",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "supportTickets",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  // messages sub-collection
  {
    collectionGroup: "messages",
    queryScope: "COLLECTION_GROUP",
    fields: [{ fieldPath: "createdAt", order: "ASCENDING" }],
  },
  // consultations
  {
    collectionGroup: "consultations",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    collectionGroup: "consultations",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  // corporateInquiries
  {
    collectionGroup: "corporateInquiries",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  // couponUsage
  {
    collectionGroup: "couponUsage",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "couponCode", order: "ASCENDING" },
    ],
  },
];

const out = JSON.stringify({ indexes, fieldOverrides: [] }, null, 2);
writeFileSync(resolve(__dirname, "..", "firestore.indexes.json"), out, "utf8");
console.log(`Written firestore.indexes.json with ${indexes.length} indexes (${out.length} bytes)`);
