import React from "react";
import {
  Building2,
  Home,
  Shield,
  Wrench,
  Paintbrush,
  ChevronRight,
} from "lucide-react";

const categories = [
  { name: "Lumber", icon: Building2 },
  { name: "Panels", icon: Building2 },
  { name: "Exterior", icon: Home },
  { name: "Treated Lumber", icon: Building2 },
  { name: "Insulation", icon: Shield },
  { name: "Fasteners", icon: Wrench },
  { name: "Concrete", icon: Building2 },
  { name: "Roofing", icon: Home },
  { name: "Drywall", icon: Paintbrush },
];

interface SidebarProps {
  onCategoryChange: (category: string | null) => void;
  activeCategory?: string | null;
  categoryCounts?: Record<string, number>;
  totalCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  onCategoryChange,
  activeCategory: propActiveCategory,
  categoryCounts = {},
  totalCount = 0,
}) => {
  const handleCategoryClick = (categoryName: string) => {
    const newCategory =
      propActiveCategory === categoryName ? null : categoryName;
    onCategoryChange(newCategory);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900">Categories</h2>
      </div>

      {/* Categories List */}
      <div className="p-2">
        <ul className="space-y-1">
          {categories.map((category) => {
            const isActive = propActiveCategory === category.name;
            const Icon = category.icon;

            return (
              <li key={category.name}>
                <button
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all flex items-center justify-between group ${isActive
                    ? "bg-gray-100 text-[#033159] font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-[#033159]" : "text-gray-400"}`} />
                    <span className="text-sm">{category.name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${isActive ? "bg-white text-[#033159]" : "bg-gray-100 text-gray-500"
                      }`}>
                      {categoryCounts[category.name] || 0}
                    </span>
                    <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? "rotate-90 text-[#033159]" : "text-gray-300"}`} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Stats - Extremely Simple */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span>Total Materials</span>
          <span className="text-gray-900">{totalCount}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
