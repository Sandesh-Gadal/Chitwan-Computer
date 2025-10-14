import React from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';

interface ProductProps {
  image: string;
  category: string;
  name: string;
  price: string;
  rating: number;
}

const ProductCard: React.FC<ProductProps> = ({ image, category, name, price, rating }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden group">
      <div className="relative">
        <img src={image} alt={name} className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500" />
        {/* <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 m-2 rounded">
          New Arrival
        </div> */}
        {/* <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="bg-white text-blue-600 p-3 rounded-full mx-2 transform hover:scale-110 transition">
            <ShoppingCart size={20} />
          </button>
          <button className="bg-white text-red-500 p-3 rounded-full mx-2 transform hover:scale-110 transition">
            <Heart size={20} />
          </button>
        </div> */}
      </div>
      <div className="p-6">
        <div className="text-sm text-blue-600 font-medium mb-1">{category}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
        {/* <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-800">{price}</span>
          <div className="flex items-center">
            {Array(5).fill(0).map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ml-1`} 
              />
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

const FeaturedProducts: React.FC = () => {
  const products = [
    {
      image: "https://gds.jo/image/cache/catalog/Asus/TUF/F16/F16-FX607VU-/ASUS-TUF-Gaming-F16-FX607VU---2-1200x1200.jpg",
      category: "Laptops",
      name: "ASUS TUF Gaming F16 FX608JMR",
      price: "NPR 189,000",
      rating: 5
    },
    {
      image: "https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750",
      category: "Custom PCs",
      name: "Profesionals and gaming Monitors ",
      price: "NPR 210,000",
      rating: 5
    },
    {
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYolFwTgs2WB8aAWyo1ltj4cXTmZsH2u4i2Q&s",
      category: "Printers",
      name: "Gaming PCs",
      price: "NPR 45,000",
      rating: 4
    },
    {
      image: "https://www.uniview.com/res/202505/21/20250521_1965360_2443_1018633_704191_0.png",
      category: "Cameras",
      name: "UNV Cameras",
      price: "IPC(40)K-WP",
      rating: 4
    }
  ];

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Featured Products</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our selection of high-quality products, from powerful laptops to custom-built PCs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              image={product.image}
              category={product.category}
              name={product.name}
              price={product.price}
              rating={product.rating}
            />
          ))}
        </div>

        {/* <div className="mt-16 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium text-lg transition duration-300">
            View All Products
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default FeaturedProducts;