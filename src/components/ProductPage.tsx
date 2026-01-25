import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Search, Loader2, ChevronRight, ChevronLeft, Tag } from "lucide-react";

// 1. Define the Product Interface
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  label: string;
  description: string;
  price: string;
  quantity: number;
  image: string;
  category_id: number;
  category: Category;
}

interface CacheData {
  data: Product[];
  timestamp: number;
  page: number;
  hasMore: boolean;
}

const CACHE_KEY = 'products_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  const backendUrl = import.meta.env.VITE_API_URL;
  const itemsPerPage = 12;

  // Cache management functions
  const getCachedData = (): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const cacheData: CacheData = JSON.parse(cached);
      const isCacheValid = Date.now() - cacheData.timestamp < CACHE_DURATION;
      
      return isCacheValid ? cacheData : null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  const setCacheData = (products: Product[], page: number, hasMore: boolean) => {
    try {
      const cacheData: CacheData = {
        data: products,
        timestamp: Date.now(),
        page,
        hasMore
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  // Extract distinct categories from products
  const categories = products.reduce((acc: Category[], product) => {
    const exists = acc.find(cat => cat.id === product.category.id);
    if (!exists) {
      acc.push(product.category);
    }
    return acc;
  }, []);

  // Initial fetch with cache support
  useEffect(() => {
    const fetchInitialProducts = async () => {
    //   setLoading(true);
      window.scrollTo(0, 0);

      // Check cache first
      const cachedData = getCachedData();
      
      if (cachedData && !search.trim() && !selectedCategory) {
        // Use cached data if available and no filters applied
        setProducts(cachedData.data);
        setPage(cachedData.page);
        setHasMore(cachedData.hasMore);
        setLoading(false);
        
        // Still fetch fresh data in background
        fetchFreshProducts(1, true);
      } else {
        // No valid cache or filters applied - fetch fresh
        setLoading(true);
        await fetchFreshProducts(1, false);
      }
    };

    fetchInitialProducts();
  }, []); // Empty dependency array - only runs on mount

  // Fetch fresh products (with optional cache update)
  const fetchFreshProducts = async (targetPage: number, isBackgroundRefresh: boolean = false) => {
    try {
      const response = await axios.get<Product[]>(
        `${backendUrl}/products?page=${targetPage}&per_page=${itemsPerPage}`
      );
      
      if (targetPage === 1) {
        setProducts(response.data);
        setPage(1);
        setHasMore(response.data.length === itemsPerPage);
        
        // Cache only the first page data when no filters applied
        if (!search.trim() && !selectedCategory) {
          setCacheData(response.data, 1, response.data.length === itemsPerPage);
        }
      } else {
        setProducts(prev => [...prev, ...response.data]);
        setPage(targetPage);
        setHasMore(response.data.length === itemsPerPage);
      }
      
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      
      // If this was a background refresh that failed, don't show error to user
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreProducts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, selectedCategory, search]);

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    
    // setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const response = await axios.get<Product[]>(
        `${backendUrl}/products?page=${nextPage}&per_page=${itemsPerPage}`
      );
      
      if (response.data.length > 0) {
        setProducts(prev => [...prev, ...response.data]);
        setPage(nextPage);
        setHasMore(response.data.length === itemsPerPage);
        
        // Don't cache paginated results to keep cache simple
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle category filter
  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug === selectedCategory) {
      // If clicking the already selected category, clear filter
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categorySlug);
    }
  };

  // Handle search changes with debouncing
  useEffect(() => {
    if (search.trim() || selectedCategory) {
      // When search or category filter is applied, fetch from server
    //   setLoading(true);
      const timer = setTimeout(() => {
        axios
          .get<Product[]>(`${backendUrl}/products?page=1&per_page=${itemsPerPage}${selectedCategory ? `&category=${selectedCategory}` : ''}${search.trim() ? `&search=${search.trim()}` : ''}`)
          .then((res) => {
            setProducts(res.data);
            setPage(1);
            setHasMore(res.data.length === itemsPerPage);
          })
          .catch((error) => console.error("Error fetching filtered products:", error))
          .finally(() => setLoading(false));
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    } else {
      // When no filters, check cache or fetch fresh
      const cachedData = getCachedData();
      if (cachedData) {
        setProducts(cachedData.data);
        setPage(cachedData.page);
        setHasMore(cachedData.hasMore);
        setLoading(false);
        
        // Background refresh
        fetchFreshProducts(1, true);
      } else {
        fetchFreshProducts(1, false);
      }
    }
  }, [search, selectedCategory]);

  // Scroll categories horizontally
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Truncation Function
  const Truncate = useCallback((string: string | null | undefined, number: number): string => {
    if (!string) return "";
    if (string.length <= number) return string;
    return string.slice(0, number) + "...";
  }, []);

  // Format price
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return isNaN(num) ? "N/A" : `$${num.toFixed(2)}`;
  };

  // Filter Products based on search term and category
  const filteredProducts = products.filter((product) => {
    // Apply category filter if selected
    if (selectedCategory && product.category.slug !== selectedCategory) {
      return false;
    }
    
    // Apply search filter if search term exists
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category?.name?.toLowerCase().includes(searchTerm) ||
        product.price.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });

  // Clear all filters
  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory(null);
  };

  return (
    <section className="min-h-screen  pt-20 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Our Products
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find the perfect items from our curated collection
          </p>
          {/* Cache status indicator (optional, for debugging) */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-sm text-gray-500">
              Cache: {getCachedData() ? '✅ Loaded from cache' : '❌ No cache'}
            </div>
          )} */}
        </div>

        {/* Search Input */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 placeholder-gray-500"
              placeholder="Search products by name, category, or price..."
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              aria-label="Search products"
            />
          </div>
        </div>

        {/* Categories Carousel */}
        {!loading && categories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-500" />
                Browse Categories
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCategories('left')}
                  className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition duration-200"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scrollCategories('right')}
                  className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition duration-200"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div 
                ref={categoriesRef}
                className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full border transition-all duration-200 whitespace-nowrap ${
                    !selectedCategory 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  All Products
                </button>

                {/* Category Buttons */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className={`flex-shrink-0 px-6 py-3 rounded-full border transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                      selectedCategory === category.slug 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    {category.name}
                    {selectedCategory === category.slug && (
                      <span className="ml-1 text-xs bg-white text-blue-600 px-2 py-0.5 rounded-full">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Fade effects for scroll indicators */}
              <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-blue-500/10 via-blue-100/10 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-blue-500/10 via-blue-100/10 to-transparent pointer-events-none" />
            </div>
            
            {/* Selected Category Indicator */}
            {selectedCategory && (
              <div className="mt-4 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                  <span className="text-blue-700 font-medium">
                    Showing: {categories.find(c => c.slug === selectedCategory)?.name || 'Category'}
                  </span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Clear filter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-white rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {search.trim() 
                  ? `No products matching "${search}"`
                  : selectedCategory
                  ? `No products in "${categories.find(c => c.slug === selectedCategory)?.name}" category`
                  : "No products available at the moment"
                }
              </p>
              {(search.trim() || selectedCategory) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {!loading && filteredProducts.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredProducts.length}</span> products
                {selectedCategory && (
                  <span className="text-blue-600"> in "{categories.find(c => c.slug === selectedCategory)?.name}"</span>
                )}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div 
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 hover:border-blue-200"
                  key={product.id}
                >
                  {/* Image Container */}
                  <div className="relative h-48 sm:h-56 p-4 bg-gradient-to-b from-gray-50 to-white group-hover:from-blue-50 transition duration-300">
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <img
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        src={`${backendUrl}/storage/${product.image}`}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Category Badge */}
                    {/* <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        {product.category.name}
                      </span>
                    </div> */}

                     {/* BOTTOM LEFT: Stock Status Badge (New) */}
                      <div className="absolute bottom-3 right-3">
                        {product.quantity <= 0 ? (
                          <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                            Sold Out
                          </span>
                        ) : product.quantity <= 5 ? (
                          <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md animate-pulse">
                            Limited Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-400 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md ">
                            In Stock
                          </span>
                        )}
                      </div>
                  </div>

                 
                  
                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                      {Truncate(product.description, 80)}
                    </p>


                    
                    {/* Optional: Uncomment to add price and view button */}
                    {/* <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <button 
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition duration-200 group/btn"
                        onClick={() => console.log('View product', product.id)}
                      >
                        View
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More / Infinite Scroll Trigger */}
            {!selectedCategory && search === "" && (
              <div ref={observerTarget} className="mt-12 text-center">
                {loadingMore ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    <span className="text-gray-700">Loading more products...</span>
                  </div>
                ) : hasMore ? (
                  <p className="text-gray-500">Scroll down to load more products</p>
                ) : (
                  <p className="text-gray-500">All products loaded</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Back to Top Button */}
        {filteredProducts.length > 8 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition duration-200 hover:shadow-xl z-10"
            aria-label="Back to top"
          >
            <ChevronRight className="h-5 w-5 -rotate-90" />
          </button>
        )}
      </div>
      
      {/* Custom scrollbar hide style */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default Products;