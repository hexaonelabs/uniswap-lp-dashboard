import { NavLink } from "react-router";
import { useState, useEffect } from "react";
import { CalculatorIcon } from "lucide-react";

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

// const AnalyticsIcon = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
//   </svg>
// );

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


interface NavMenuProps {
  linkToDashboard: string;
}

export function NavMenu({ linkToDashboard }: NavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = [
    {
      to: linkToDashboard,
      icon: HomeIcon,
      label: "Dashboard",
      shortLabel: "Home"
    },
    {
      to: "/explore",
      icon: SearchIcon,
      label: "Explore Pools",
      shortLabel: "Explore"
    },
    {
      to: "/estimate",
      icon: CalculatorIcon,
      label: "Estimate Earnings",
      shortLabel: "Estimate"
    },
    {
      to: "/builder",
      icon: CalculatorIcon,
      label: "LP Portfolio Builder",
      shortLabel: "Builder"
    }
    // {
    //   to: "/analytics",
    //   icon: AnalyticsIcon,
    //   label: "Analytics",
    //   shortLabel: "Stats"
    // }
  ];

  // Détecter le scroll pour adapter l'apparence
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.mobile-nav-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${isScrolled 
        ? `sm:py-1`
        : `sm:py-6`
    }`}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
        {/* Desktop Navigation */}
        <nav className={`hidden sm:block border border-gray-200/50 rounded-2xl p-2 shadow-lg transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-xl shadow-blue-500/20' 
            : 'bg-white/80 backdrop-blur-sm shadow-blue-500/10'
        }`}>
          <div className="flex items-center gap-1 justify-center">
            {navItems.map((item, index) => (
              <div key={item.to} className="flex items-center">
                {index > 0 && (
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-1" />
                )}
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-md hover:scale-[1.01]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                      />
                      <span className="font-semibold">{item.label}</span>
                      <div className="ml-auto">
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            isActive
                              ? "bg-white shadow-sm"
                              : "bg-transparent group-hover:bg-blue-400/50"
                          }`}
                        />
                      </div>
                    </>
                  )}
                </NavLink>
              </div>
            ))}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="sm:hidden mobile-nav-container relative">
          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full border border-gray-200/50 rounded-2xl p-4 shadow-lg transition-all duration-300 bg-white/95 backdrop-blur-lg shadow-blue-500/20' 
            ${isOpen ? "rounded-b-none border-b-transparent" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <CloseIcon className="w-6 h-6 text-gray-700" />
                ) : (
                  <MenuIcon className="w-6 h-6 text-gray-700" />
                )}
                <span className="font-semibold text-gray-700">Navigation</span>
              </div>
              <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </button>

          {/* Mobile Dropdown Menu */}
          <div
            className={`absolute left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border border-gray-200/50 border-t-0 rounded-b-2xl shadow-xl shadow-blue-500/20 overflow-hidden transition-all duration-500 ease-out ${
              isOpen 
                ? "max-h-96 opacity-100 translate-y-0" 
                : "max-h-0 opacity-0 -translate-y-2"
            }`}
          >
            <div className="p-2">
              {navItems.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => {
                    if (isActive) setActiveIndex(index);
                    return `group flex items-center gap-4 px-4 py-4 mb-2 last:mb-0 text-sm font-medium rounded-xl transition-all duration-300 transform ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-md hover:scale-[1.01]"
                    }`;
                  }}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isOpen ? `slideInFromTop 0.4s ease-out forwards` : 'none'
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-blue-100"
                      }`}>
                        <item.icon
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isActive ? "scale-110 text-white" : "text-gray-600 group-hover:text-blue-600 group-hover:scale-110"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.label}</div>
                        <div className={`text-xs mt-0.5 transition-colors duration-200 ${
                          isActive ? "text-blue-100" : "text-gray-500 group-hover:text-blue-500"
                        }`}>
                          Navigate to {item.shortLabel.toLowerCase()}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        isActive ? "bg-white shadow-sm" : "bg-transparent group-hover:bg-blue-400"
                      }`} />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}