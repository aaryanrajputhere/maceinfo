import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"Calculators" | null>(
    null
  );
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Desktop dropdown toggle
  const toggleDropdown = (dropdown: "Calculators" | null) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Mobile dropdown toggle
  const toggleMobileDropdown = () => {
    setIsMobileDropdownOpen(!isMobileDropdownOpen);
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
    setIsMobileDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-lg border-b-2 border-gray-200 font-['Helvetica Neue'] sticky top-0 z-60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center group">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-200">
                <img
                  src="/logos/logo.svg"
                  alt="MACE Logo"
                  className="h-8 sm:h-10 w-auto"
                />
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-2 lg:space-x-4"
            ref={dropdownRef}
          >
            <a
              href="/materials"
              className="px-4 py-2.5 text-sm lg:text-base font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
            >
              Materials
            </a>

            {/* Calculators Dropdown (Desktop) */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("Calculators")}
                className={`flex items-center px-4 py-2.5 text-sm lg:text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] ${activeDropdown === "Calculators"
                  ? "bg-[#033159] text-white shadow-md"
                  : "text-gray-700 hover:text-white hover:bg-[#033159]"
                  }`}
              >
                Calculators
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform duration-200 ${activeDropdown === "Calculators" ? "rotate-180" : ""
                    }`}
                />
              </button>

              {activeDropdown === "Calculators" && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100"
                  style={{ zIndex: 9999 }}
                >
                  <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                    <a
                      href="/calculators"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#033159] to-[#00598F] rounded-xl transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] mb-2"
                    >
                      <div className="p-1.5 bg-white/20 rounded-lg mr-3">
                        <span className="text-xs">🧮</span>
                      </div>
                      View All Calculators
                    </a>
                    <a
                      href="/calculators/studs"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">🔨</span>
                      </div>
                      Studs
                    </a>
                    <a
                      href="/calculators/osb"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">📊</span>
                      </div>
                      OSB Sheathing
                    </a>
                    <a
                      href="/calculators/housewrap"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">🏠</span>
                      </div>
                      Housewrap
                    </a>
                    <a
                      href="/calculators/siding"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">🎨</span>
                      </div>
                      Siding / Painting
                    </a>
                    <a
                      href="/calculators/drywall"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">⬜</span>
                      </div>
                      Drywall
                    </a>
                    <a
                      href="/calculators/insulation"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">💨</span>
                      </div>
                      Insulation
                    </a>
                    <a
                      href="/calculators/concrete"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">📦</span>
                      </div>
                      Concrete
                    </a>
                    <a
                      href="/calculators/roofing"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">🏘️</span>
                      </div>
                      Roofing
                    </a>
                    <a
                      href="/calculators/deck"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <span className="text-xs">🔲</span>
                      </div>
                      Deck Materials
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                setIsMobileMenuOpen(false); // close mobile menu if open
                setIsMobileDropdownOpen(false); // close mobile dropdown
                // scroll to the footer element if present, otherwise fall back to page bottom
                const footer = document.getElementById("site-footer");
                if (footer) {
                  footer.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: "smooth",
                  });
                }
              }}
              className="px-4 py-2.5 text-sm lg:text-base font-semibold text-gray-700 rounded-xl transition-all duration-200 hover:bg-[#033159] hover:text-white hover:shadow-md transform hover:scale-[1.02]"
            >
              Contact Us
            </a>
          </nav>

          {/* CTA + Mobile Menu Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              type="button"
              onClick={() => {
                // close any open menus/dropdowns before navigating
                setIsMobileMenuOpen(false);
                setActiveDropdown(null);
                navigate("/quote");
                // reload after navigation so the /quote page is fully reloaded
                setTimeout(() => window.location.reload(), 80);
              }}
              className="hidden md:inline-flex items-center px-5 lg:px-6 py-3 text-sm lg:text-base font-bold text-white bg-[#033159] rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="mr-2">💬</span>
              Get Quote
            </button>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center p-3 rounded-xl text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-2 border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <div className="px-3 pt-4 pb-6 space-y-2">
              <a
                href="/materials"
                className="flex items-center px-4 py-3 text-base font-semibold text-gray-700 hover:text-white rounded-xl transition-all duration-200 hover:bg-[#033159]"
              >
                <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                  <span className="text-sm">🏗️</span>
                </div>
                Materials
              </a>

              {/* Calculators Dropdown (Mobile) */}
              <div className="rounded-xl overflow-hidden">
                <button
                  onClick={toggleMobileDropdown}
                  className="w-full flex items-center justify-between px-4 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                      <span className="text-sm">🧮</span>
                    </div>
                    Calculators
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${isMobileDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isMobileDropdownOpen && (
                  <div className="bg-white">
                    <a
                      href="/calculators"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-[#033159] to-[#00598F] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">🧮</span>
                      View All Calculators
                    </a>
                    <a
                      href="/calculators/studs"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">🔨</span>
                      Studs
                    </a>
                    <a
                      href="/calculators/osb"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">📊</span>
                      OSB Sheathing
                    </a>
                    <a
                      href="/calculators/housewrap"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">🏠</span>
                      Housewrap
                    </a>
                    <a
                      href="/calculators/siding"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">🎨</span>
                      Siding / Painting
                    </a>
                    <a
                      href="/calculators/drywall"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">⬜</span>
                      Drywall
                    </a>
                    <a
                      href="/calculators/insulation"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">💨</span>
                      Insulation
                    </a>
                    <a
                      href="/calculators/concrete"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">📦</span>
                      Concrete
                    </a>
                    <a
                      href="/calculators/roofing"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">🏘️</span>
                      Roofing
                    </a>
                    <a
                      href="/calculators/deck"
                      onClick={() => {
                        setIsMobileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 hover:text-white hover:bg-[#033159] transition-all duration-200"
                    >
                      <span className="mr-3 text-sm">🔲</span>
                      Deck Materials
                    </a>
                  </div>
                )}
              </div>

              <a
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  const footer = document.getElementById("site-footer");
                  if (footer) {
                    footer.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  } else {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    });
                  }
                }}
                className="flex items-center px-4 py-3 text-base font-semibold text-gray-700 hover:text-white rounded-xl transition-all duration-200 hover:bg-[#033159]"
              >
                <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                  <span className="text-sm">📞</span>
                </div>
                Contact Us
              </a>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/quote");
                    // reload after navigation so the /quote page is fully reloaded
                    setTimeout(() => window.location.reload(), 80);
                  }}
                  className="w-full flex items-center justify-center px-5 py-4 text-base font-bold text-white bg-[#033159] rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <span className="mr-2">💬</span>
                  Get Quote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
