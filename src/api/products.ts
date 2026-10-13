import axios from 'axios';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Category {
  id: number;
  name: string;
  slug: string;
  position?: number;
  products_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  products_count?: number;
}

export interface ProductImage {
  id: number;
  path: string;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  label: string | null;
  description: string | null;
  /** Selling (sale) price */
  price: string;
  /** Maximum retail price, shown crossed out when higher than the sale price */
  mrp?: string | null;
  quantity: number;
  image: string;
  category_id: number;
  category: Category | null;
  brand_id?: number | null;
  brand?: Brand | null;
  images?: ProductImage[];
}

export const API_URL = import.meta.env.VITE_API_URL;

export const storageUrl = (path: string) => `${API_URL}/storage/${path}`;

export const productImage = (product: Pick<Product, 'image'>) => storageUrl(product.image);

// Every photo for a product in display order; the first is the cover
export const productImages = (product: Pick<Product, 'image' | 'images'>): string[] => {
  if (product.images?.length) return product.images.map((img) => storageUrl(img.path));
  return product.image ? [storageUrl(product.image)] : [];
};

// "189000.00" -> "Rs. 1,89,000"; null when there is no usable price
export const formatPrice = (price: string | number | null | undefined): string | null => {
  const value = typeof price === 'number' ? price : parseFloat(price ?? '');
  if (!Number.isFinite(value) || value <= 0) return null;
  return `Rs. ${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export type StockStatus = 'in' | 'low' | 'out';

export const stockStatus = (quantity: number): StockStatus => {
  if (quantity <= 0) return 'out';
  if (quantity <= 5) return 'low';
  return 'in';
};

export const stockLabel: Record<StockStatus, string> = {
  in: 'In stock',
  low: 'Limited stock',
  out: 'Sold out',
};

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name';

export interface ProductQuery {
  page?: number;
  perPage?: number;
  category?: string | null;
  brands?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  inStock?: boolean;
  q?: string;
  sort?: SortKey;
  ids?: number[];
}

// Only send the filters that are set, in the API's parameter names
const toParams = (query: ProductQuery) => {
  const params: Record<string, string | number> = {};
  if (query.page) params.page = query.page;
  if (query.perPage) params.per_page = query.perPage;
  if (query.category) params.category = query.category;
  if (query.brands?.length) params.brand = query.brands.join(',');
  if (query.minPrice != null) params.min_price = query.minPrice;
  if (query.maxPrice != null) params.max_price = query.maxPrice;
  if (query.inStock) params.in_stock = 1;
  if (query.q?.trim()) params.q = query.q.trim();
  if (query.sort && query.sort !== 'newest') params.sort = query.sort;
  if (query.ids?.length) params.ids = query.ids.join(',');
  return params;
};

/** One page of products matching the filters */
export const useProductPage = (query: ProductQuery, enabled = true) =>
  useQuery({
    queryKey: ['products', 'page', toParams({ perPage: 12, page: 1, ...query })],
    queryFn: async () =>
      (await axios.get<Paginated<Product>>(`${API_URL}/products`, { params: toParams({ perPage: 12, page: 1, ...query }) }))
        .data,
    enabled,
    // Keep showing the current page while the next one loads
    placeholderData: keepPreviousData,
  });

export interface FacetOption {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  /** Products matching the other active filters */
  count: number;
  /** Products in the whole catalogue */
  total: number;
}

export interface Facets {
  categories: FacetOption[];
  brands: FacetOption[];
  price: { min: number; max: number };
  total: number;
}

/** Filter options with counts for the current selection */
export const useFacets = (query: ProductQuery, enabled = true) =>
  useQuery({
    queryKey: ['products', 'facets', toParams({ ...query, page: undefined, perPage: undefined, sort: undefined })],
    queryFn: async () =>
      (
        await axios.get<Facets>(`${API_URL}/products/facets`, {
          params: toParams({ ...query, page: undefined, perPage: undefined, sort: undefined }),
        })
      ).data,
    enabled,
    placeholderData: keepPreviousData,
  });

export interface CategorySection {
  category: Category;
  total: number;
  products: Product[];
}

/** Every category with a few of its products, for browsing by type */
export const useCatalogOverview = (limit = 4) =>
  useQuery({
    queryKey: ['products', 'overview', limit],
    queryFn: async () =>
      (await axios.get<CategorySection[]>(`${API_URL}/products/overview`, { params: { limit } })).data,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get<Category[]>(`${API_URL}/categories`)).data,
  });

// Find a product in anything already fetched, so product pages can render instantly
const findCached = (queryClient: ReturnType<typeof useQueryClient>, id: number): Product | undefined => {
  for (const [, data] of queryClient.getQueriesData<unknown>({ queryKey: ['products'] })) {
    const lists: Product[][] = [];
    if (Array.isArray(data)) lists.push(...(data as CategorySection[]).map((s) => s.products ?? []));
    else if (data && typeof data === 'object' && 'data' in data) lists.push((data as Paginated<Product>).data);
    for (const list of lists) {
      const hit = list.find((p) => p?.id === id);
      if (hit) return hit;
    }
  }
  return undefined;
};

export const priceValue = (product: Pick<Product, 'price'>): number | null => {
  const value = parseFloat(product.price);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export interface PriceInfo {
  price: number;
  /** Only set when it's higher than the sale price */
  mrp: number | null;
  save: number;
  percentOff: number;
}

/** Sale price plus the MRP and discount when there is one; null when the product has no price */
export const priceInfo = (product: Pick<Product, 'price' | 'mrp'>): PriceInfo | null => {
  const price = priceValue(product);
  if (price === null) return null;
  const mrp = parseFloat(product.mrp ?? '');
  if (!Number.isFinite(mrp) || mrp <= price) return { price, mrp: null, save: 0, percentOff: 0 };
  return { price, mrp, save: mrp - price, percentOff: Math.round(((mrp - price) / mrp) * 100) };
};

export const useBrands = () =>
  useQuery({
    queryKey: ['brands'],
    queryFn: async () => (await axios.get<Brand[]>(`${API_URL}/brands`)).data,
  });

export const useProduct = (id: number) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await axios.get<Product>(`${API_URL}/products/${id}`)).data,
    enabled: Number.isFinite(id),
    // A missing product won't appear on retry, so only retry other failures
    retry: (count, error) => (error as { response?: { status?: number } }).response?.status !== 404 && count < 2,
    // Show the copy from the catalogue instantly if we already have it
    placeholderData: () => findCached(queryClient, id),
  });
};
