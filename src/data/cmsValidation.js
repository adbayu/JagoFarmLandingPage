export const PRODUCT_CATEGORIES = ["akuakultur", "nutrisi", "tanaman", "teknologi"];
export const PRODUCT_STATUSES = ["prototype", "riset"];
export const PROJECT_STATUSES = ["berjalan", "selesai"];

const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateProduct(product) {
  if (!product || typeof product !== "object") {
    throw new Error("Product must be an object");
  }
  if (!product.id || typeof product.id !== "string" || !product.id.trim()) {
    throw new Error(`Product id must be a non-empty string, got: ${JSON.stringify(product.id)}`);
  }
  if (!product.name || typeof product.name !== "string" || !product.name.trim()) {
    throw new Error(`Product name must be a non-empty string for id: ${product.id}`);
  }
  if (!product.description || typeof product.description !== "string" || !product.description.trim()) {
    throw new Error(`Product description must be a non-empty string for id: ${product.id}`);
  }
  if (!product.image || typeof product.image !== "string" || !product.image.trim()) {
    throw new Error(`Product image must be a non-empty string for id: ${product.id}`);
  }
  if (!PRODUCT_CATEGORIES.includes(product.category)) {
    throw new Error(
      `Product category for "${product.id}" must be one of ${JSON.stringify(PRODUCT_CATEGORIES)}, got: ${product.category}`
    );
  }
  if (!PRODUCT_STATUSES.includes(product.status)) {
    throw new Error(
      `Product status for "${product.id}" must be one of ${JSON.stringify(PRODUCT_STATUSES)}, got: ${product.status}`
    );
  }
  return true;
}

export function validateProject(project) {
  if (!project || typeof project !== "object") {
    throw new Error("Project must be an object");
  }
  if (!project.slug || typeof project.slug !== "string" || !KEBAB_CASE_REGEX.test(project.slug)) {
    throw new Error(`Project slug must be a valid kebab-case string, got: ${JSON.stringify(project.slug)}`);
  }
  if (!project.number || typeof project.number !== "string" || !project.number.trim()) {
    throw new Error(`Project number must be a non-empty string for slug: ${project.slug}`);
  }
  if (!project.name || typeof project.name !== "string" || !project.name.trim()) {
    throw new Error(`Project name must be a non-empty string for slug: ${project.slug}`);
  }
  if (!project.description || typeof project.description !== "string" || !project.description.trim()) {
    throw new Error(`Project description must be a non-empty string for slug: ${project.slug}`);
  }
  if (!PROJECT_STATUSES.includes(project.status)) {
    throw new Error(
      `Project status for "${project.slug}" must be one of ${JSON.stringify(PROJECT_STATUSES)}, got: ${project.status}`
    );
  }
  if (!Array.isArray(project.gallery)) {
    throw new Error(`Project gallery for "${project.slug}" must be an array`);
  }
  project.gallery.forEach((photo, idx) => {
    if (!photo || typeof photo !== "object") {
      throw new Error(`Photo at index ${idx} in project "${project.slug}" must be an object`);
    }
    if (!photo.title || typeof photo.title !== "string" || !photo.title.trim()) {
      throw new Error(`Photo title missing or empty at index ${idx} in project "${project.slug}"`);
    }
    if (!photo.image || typeof photo.image !== "string" || !photo.image.trim()) {
      throw new Error(`Photo image missing or empty at index ${idx} in project "${project.slug}"`);
    }
    if (!photo.alt || typeof photo.alt !== "string" || !photo.alt.trim()) {
      throw new Error(`Photo alt missing or empty at index ${idx} in project "${project.slug}"`);
    }
  });

  if (project.cover && typeof project.cover === "object") {
    if (!project.cover.title || !project.cover.image || !project.cover.alt) {
      throw new Error(`Project cover for "${project.slug}" must have title, image, and alt if provided`);
    }
  }

  return true;
}
