import { Github, Linkedin, Twitter } from "lucide-react";


export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-50 py-12 mt-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AiPRO</h3>
            <p className="text-gray-600 text-sm">
              Empowering businesses with next-generation AI solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-600 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://github.com" className="text-gray-600 hover:text-primary transition-colors">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" className="text-gray-600 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-600 hover:text-primary text-sm">Features</a></li>
              <li><a href="#pricing" className="text-gray-600 hover:text-primary text-sm">Pricing</a></li>
              <li><a href="#docs" className="text-gray-600 hover:text-primary text-sm">Documentation</a></li>
              <li><a href="#api" className="text-gray-600 hover:text-primary text-sm">API</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-600 hover:text-primary text-sm">About</a></li>
              <li><a href="#blog" className="text-gray-600 hover:text-primary text-sm">Blog</a></li>
              <li><a href="#careers" className="text-gray-600 hover:text-primary text-sm">Careers</a></li>
              <li><a href="#contact" className="text-gray-600 hover:text-primary text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#privacy" className="text-gray-600 hover:text-primary text-sm">Privacy Policy</a></li>
              <li><a href="#terms" className="text-gray-600 hover:text-primary text-sm">Terms of Service</a></li>
              <li><a href="#cookies" className="text-gray-600 hover:text-primary text-sm">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {currentYear} AiPRO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
