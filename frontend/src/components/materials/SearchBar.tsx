import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  ChevronDown,
  RotateCcw,
  Filter,
  ChevronUp,
} from "lucide-react";

interface SearchFilterBarProps {
  onFiltersChange: (filters: {
    searchTerm: string;
    sortBy: string;
    availability: string;
    priceRange: string;
  }) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  onFiltersChange,
}) => {
  // Search state
  const [searchValue, setSearchValue] = useState("");

  // Filter state
  const [sortBy, setSortBy] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // UI state
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const sortOptions = [
    { value: "", label: "Default (Best Match)" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "newest", label: "Newest First" },
  ];

  const priceRanges = [
    { value: "", label: "Any Price Range" },
    { value: "0-50", label: "Under $50" },
    { value: "50-100", label: "$50 - $100" },
    { value: "100-500", label: "$100 - $500" },
    { value: "500+", label: "$500+" },
  ];

  const hasActiveFilters = !!sortBy || !!priceRange;
  const activeFiltersCount = [sortBy, priceRange].filter(Boolean).length;

  useEffect(() => {
    onFiltersChange({
      searchTerm: searchValue,
      sortBy,
      availability: "",
      priceRange,
    });
  }, [searchValue, sortBy, priceRange, onFiltersChange]);

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

  const clearAllFilters = () => {
    setSortBy("");
    setPriceRange("");
  };

  const clearIndividualFilter = (filterType: "sort" | "price"): void => {
    if (filterType === "sort") {
      setSortBy("");
    } else if (filterType === "price") {
      setPriceRange("");
    }
  };

  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full mx-auto">
      {/* Main Search Row */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <label htmlFor="material-search" className="sr-only">
              Search materials
            </label>
            <input
              id="material-search"
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search materials..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50/50 outline-none focus:border-[#033159] focus:bg-white transition-all"
              aria-label="Search materials"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Button */}
          {searchValue && (
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-[#033159] text-white rounded-lg text-sm font-medium hover:bg-[#034169] transition-all"
            >
              Search
            </button>
          )}

          {/* Filter Toggle */}
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${filtersExpanded || hasActiveFilters
                ? "bg-gray-100 border-gray-200 text-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 text-[10px] bg-[#033159] text-white rounded-md font-bold leading-none">
                {activeFiltersCount}
              </span>
            )}
            {filtersExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Filters Section */}
      {filtersExpanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort By */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all focus:border-[#033159] appearance-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Price Range
              </label>
              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm transition-all focus:border-[#033159] appearance-none cursor-pointer"
                >
                  {priceRanges.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-5 pt-5 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Active Filters ({activeFiltersCount})
                </h4>
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 uppercase tracking-widest"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {sortBy && (
                  <div className="inline-flex items-center bg-white border border-gray-200 rounded-md py-1 pl-2.5 pr-1 shadow-sm">
                    <span className="text-xs text-gray-600 mr-2">
                      <span className="font-medium text-gray-400 mr-1">Sort:</span>
                      {sortOptions.find((opt) => opt.value === sortBy)?.label}
                    </span>
                    <button
                      onClick={() => clearIndividualFilter("sort")}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
                      title="Remove filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {priceRange && (
                  <div className="inline-flex items-center bg-white border border-gray-200 rounded-md py-1 pl-2.5 pr-1 shadow-sm">
                    <span className="text-xs text-gray-600 mr-2">
                      <span className="font-medium text-gray-400 mr-1">Price:</span>
                      {priceRanges.find((opt) => opt.value === priceRange)?.label}
                    </span>
                    <button
                      onClick={() => clearIndividualFilter("price")}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
                      title="Remove filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
