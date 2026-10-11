import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';
import { useNavigate ,  useLocation} from "react-router-dom";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const goToProducts = () => {
    navigate("/products");
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

const scrollToSection = (id: string) => {
  if (location.pathname !== "/") {
    navigate("/");
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  setIsOpen(false);
};





  const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'products', label: 'Products' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' },
];


  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 bg-white shadow-md`}>
    {/* <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Chitwan Computer Logo"
              className="w-12 h-12 mr-4 object-contain rounded-md"
            />
            <span className={`text-xl lg:text-3xl font-bold text-gray-800 ${
        isScrolled
          ? 'text-gray-800 hover:text-blue-600'
          : 'text-gray-800 hover:text-blue-300'
      }`}>Chitwan Computer</span>
          </div>
          <div className="hidden md:block">
           <div className="ml-10 flex items-center space-x-4">
  {/* {navItems.map((item) => (
    <button
      key={item.id}
      onClick={() => scrollToSection(item.id)}
      className={`px-3 py-2 text-xl rounded-md text-sm font-medium transition-colors ${
        isScrolled
          ? 'text-gray-800 hover:text-blue-600'
          : 'text-white hover:text-blue-300'
      }`}
    >
      {item.label}
    </button>
  ))} */}
  {navItems.map((item) => (
  item.id === "products" ? (
    // PRODUCTS → goToProducts()
    <button
      key={item.id}
      onClick={goToProducts}
      className={`px-3 py-2 text-xl rounded-md text-sm font-medium transition-colors ${
        isScrolled
          ? "text-gray-800 hover:text-blue-600"
          : "text-gray-800 hover:text-blue-300"
      }`}
    >
      {item.label}
    </button>
  ) : (
    // Others → scrollToSection()
    <button
      key={item.id}
      onClick={() => scrollToSection(item.id)}
      className={`px-3 py-2 text-xl rounded-md text-sm font-medium transition-colors ${
        isScrolled
          ? "text-gray-800 hover:text-blue-600"
          : "text-gray-800 hover:text-blue-300"
      }`}
    >
      {item.label}
    </button>
  )
))}

</div>


          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <button onClick={() => scrollToSection('home')} className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Home</button>
          <button onClick={() => scrollToSection('about')} className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">About</button>
          <button onClick={() => scrollToSection('services')} className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Services</button>
          <button  onClick={goToProducts} className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Products</button>
          <button onClick={() => scrollToSection('testimonials')} className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Testimonials</button>
          <button onClick={() => scrollToSection('contact')} className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium w-full text-left">Contact</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 