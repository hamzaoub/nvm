import { FaOctopusDeploy, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { OceanBubbles } from './OceanBubbles';

export function OceanFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0c1630]  text-white mt-auto pt-8 border-t border-[#0077b6]/20">
      {/* Animated bubbles */}
      {/* <OceanBubbles 
        count={20} 
        maxSize={45} 
        minSize={5} 
        randomPlacement={true} 
        maxInitialY={100} 
        maxDuration={25}
        minDuration={10}
        className="absolute inset-0 z-10" 
      /> */}
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
          {/* Logo section */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-[#0c1630]/80 rounded-full flex items-center justify-center">
              <FaOctopusDeploy className="text-[#00b4d8] text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#00b4d8]">Aquariza</h2>
              <p className="text-xs text-gray-400">AI Projects Platform</p>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-[#00b4d8] text-sm font-semibold mb-2">Platform</h3>
              <ul className="space-y-1 text-sm">
                <li><Link to="/dashboard" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">Dashboard</Link></li>
                <li><Link to="/projects/create" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">Create Project</Link></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[#00b4d8] text-sm font-semibold mb-2">Company</h3>
              <ul className="space-y-1 text-sm">
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">About Us</a></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">Careers</a></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[#00b4d8] text-sm font-semibold mb-2">Legal</h3>
              <ul className="space-y-1 text-sm">
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">Privacy Policy</a></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">Terms of Service</a></li>
                <li><a href="#" className="opacity-75 hover:opacity-100 hover:text-[#90e0ef] transition-all">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-6 mt-6 border-t border-[#0077b6]/30 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm opacity-75 mb-4 md:mb-0">
            © {currentYear} Aquariza. All rights reserved.
          </div>
          
          {/* Social icons */}
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-[#00b4d8] transition-colors">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#00b4d8] transition-colors">
              <FaGithub size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#00b4d8] transition-colors">
              <FaLinkedin size={20} />
            </a>
            <a href="mailto:hello@aquariza.com" className="text-gray-400 hover:text-[#00b4d8] transition-colors">
              <HiMail size={20} />
            </a>
            
            {/* Easter egg octopus that shows on hover */}
            <div className="relative group">
              <span className="text-gray-400 cursor-pointer">🐙</span>
              <motion.div 
                className="absolute bottom-full right-0 mb-2 p-2 rounded bg-[#051e2f] text-xs text-[#00b4d8] w-32 pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                Made with 🐙 tentacles!
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ocean wave effect at the bottom */}
      <div className="absolute -bottom-5 left-0 right-0 h-10 bg-[#0077b6]/10">
        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1200 30" preserveAspectRatio="none">
          <path 
            d="M0,0 C300,30 600,0 900,20 L1200,0 L1200,30 L0,30 Z" 
            fill="#0077b6" 
            fillOpacity="0.1"
          />
        </svg>
        <svg className="absolute top-2 left-0 w-full" viewBox="0 0 1200 20" preserveAspectRatio="none">
          <path 
            d="M0,20 C300,5 600,20 900,10 L1200,20 L1200,20 L0,20 Z" 
            fill="#00b4d8" 
            fillOpacity="0.1"
          />
        </svg>
      </div>
    </footer>
  );
}
