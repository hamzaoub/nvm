import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { FaOctopusDeploy } from "react-icons/fa";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
const navigateToAuth = (isLogin: boolean = true) => {
    window.location.href = `/auth${isLogin ? "" : "?mode=register"}`;
  };
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#051e2f]/80 backdrop-blur-md shadow-md border-b border-[#0077b6]/30"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center space-x-2">
              <FaOctopusDeploy className="text-2xl text-[#00b4d8]" />
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] to-[#0077b6]">
                Aquariza
              </span>
            </a>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-[#ade8f4] hover:text-[#00b4d8] transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-[#ade8f4] hover:text-[#00b4d8] transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-[#ade8f4] hover:text-[#00b4d8] transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="flex p-2 items-center space-x-4">
            <Button 
              onClick={() => navigateToAuth(true)} 
              variant="ghost" 
              className="text-[#ade8f4] hover:text-[#00b4d8] hover:bg-[#0a3a5a]/50"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigateToAuth(false)} 
              className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] p-2 text-white hover:opacity-90 rounded-lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
