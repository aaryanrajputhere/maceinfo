import React, { useState, useEffect } from "react";
import {
  Hammer,
  Plus,
  Info,
  Ruler,
  Package,
  DollarSign,
  Home,
} from "lucide-react";
import { useMaterials } from "../../hooks/useMaterials";
import { addToQuoteWithDeduplication, showQuoteButtonFeedback } from "../../utils/quoteUtils";

const StudCalculator: React.FC = () => {
  const { materials } = useMaterials();
  const [wallLength, setWallLength] = useState<number>(0);
  const [wallHeight, setWallHeight] = useState<number>(0);
  const [studSpacing, setStudSpacing] = useState<number>(16); // default 16"
  const [lumberSize, setLumberSize] = useState<string>("2x4"); // 2x4 or 2x6
  const [openingWidth, setOpeningWidth] = useState<number>(0);
  const [waste, setWaste] = useState<number>(10);
  const [result, setResult] = useState<{
    studs: number;
    plates: number;
    totalLinearFeet: number;
    studLength: number;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Auto-calculate when inputs change
    if (wallLength > 0 && wallHeight > 0) {
      calculate();
    } else {
      setResult(null);
    }
  }, [wallLength, wallHeight, studSpacing, openingWidth, waste, lumberSize]);

  const calculate = () => {
    if (wallLength <= 0 || wallHeight <= 0) return;

    const spacingFt = studSpacing / 12; // convert inches to feet

    // Calculate studs along length (including end studs)
    let studs = Math.floor(wallLength / spacingFt) + 1;

    // Add studs for openings (king studs, jack studs, etc.)
    if (openingWidth > 0) {
      studs += Math.ceil(openingWidth / spacingFt) * 2; // approximate framing studs for openings
    }

    // Apply waste factor
    studs = Math.ceil(studs * (1 + waste / 100));

    // Calculate plates (top + bottom plates, linear feet)
    const plates = Math.ceil(2 * wallLength * (1 + waste / 100));

    // Determine stud length based on wall height
    let studLength = 8; // default 8ft studs
    if (wallHeight > 8) {
      studLength = Math.ceil(wallHeight);
    }

    // Total linear feet of lumber
    const totalLinearFeet = studs * studLength + plates;

    setResult({
      studs,
      plates,
      totalLinearFeet,
      studLength,
    });
  };

  const getLumberPrice = (size: string) => {
    return size === "2x4" ? 3.25 : 4.75; // $3.25 for 2x4, $4.75 for 2x6
  };

  const addToQuote = () => {
    if (!result) return;

    const price = getLumberPrice(lumberSize);

    // Add Studs
    const res1 = addToQuoteWithDeduplication(
      {
        category: "Framing",
        name: `Stud ${lumberSize}`,
        size: `${result.studLength}ft`,
        unit: "pcs",
        price: price,
        quantity: result.studs,
        vendors: "Home Depot, Lowes, Menards",
        selectedVendors: ["Home Depot", "Lowes", "Menards"],
      },
      materials
    );

    // Add Top Plate
    const res2 = addToQuoteWithDeduplication(
      {
        category: "Framing",
        name: `Top Plate ${lumberSize}`,
        size: `${result.studLength}ft`,
        unit: "pcs",
        price: price,
        quantity: Math.ceil(result.plates / 2),
        vendors: "Home Depot, Lowes, Menards",
        selectedVendors: ["Home Depot", "Lowes", "Menards"],
      },
      materials
    );

    // Add Bottom Plate
    const res3 = addToQuoteWithDeduplication(
      {
        category: "Framing",
        name: `Bottom Plate ${lumberSize}`,
        size: `${result.studLength}ft`,
        unit: "pcs",
        price: price,
        quantity: Math.ceil(result.plates / 2),
        vendors: "Home Depot, Lowes, Menards",
        selectedVendors: ["Home Depot", "Lowes", "Menards"],
      },
      materials
    );

    const anyUpdated = !res1.isNewItem || !res2.isNewItem || !res3.isNewItem;
    showQuoteButtonFeedback("[data-stud-quote-btn]", anyUpdated);
  };



  const clearInputs = () => {
    setWallLength(0);
    setWallHeight(0);
    setStudSpacing(16);
    setLumberSize("2x4");
    setOpeningWidth(0);
    setWaste(10);
  };

  const getStudSpacingLabel = (spacing: number) => {
    switch (spacing) {
      case 12:
        return '12" O.C. (Heavy Load)';
      case 16:
        return '16" O.C. (Standard)';
      case 24:
        return '24" O.C. (Light Load)';
      default:
        return `${spacing}" O.C.`;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6">
      <div
        className={`bg-white rounded-2xl border-2 p-6 sm:p-8 transition-all duration-300 ${isHovered
          ? "shadow-2xl -translate-y-2 border-blue-200"
          : "shadow-lg border-gray-100 hover:shadow-xl hover:-translate-y-1"
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className={`p-3 rounded-xl transition-all duration-300 ${isHovered
                ? "bg-gradient-to-br from-[#00598F] to-[#033159] shadow-lg"
                : "bg-gradient-to-br from-[#033159] to-[#00598F] shadow-md"
                }`}
            >
              <Hammer className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Stud Calculator
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 pl-1">
            Calculate wall framing materials needed
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-800">
                <Ruler className="h-4 w-4 text-gray-500 mr-2" />
                Wall Length (ft)
                <div className="relative group inline-block">
                  <Info className="h-3.5 w-3.5 text-gray-400 ml-2 cursor-help hover:text-gray-600 transition-colors" />
                  <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-gray-900 text-xs text-white rounded-xl shadow-xl z-10">
                    Enter the total length of the wall in feet. For multiple
                    walls, calculate each separately.
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>

              <input
                type="number"
                value={wallLength || ""}
                onChange={(e) => setWallLength(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-800">
                <Home className="h-4 w-4 text-gray-500 mr-2" />
                Wall Height (ft)
                <div className="relative group inline-block">
                  <Info className="h-3.5 w-3.5 text-gray-400 ml-2 cursor-help hover:text-gray-600 transition-colors" />
                  <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 p-3 bg-gray-900 text-xs text-white rounded-xl shadow-xl z-10">
                    Standard wall height is 8ft. For taller walls, additional
                    considerations may apply.
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>

              <input
                type="number"
                value={wallHeight || ""}
                onChange={(e) => setWallHeight(Number(e.target.value) || 0)}
                placeholder="8"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
              />
            </div>
          </div>

          {/* Lumber Size Selection */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-800">
              <Package className="h-4 w-4 text-gray-500 mr-2" />
              Lumber Size
              <div className="relative group inline-block">
                <Info className="h-3.5 w-3.5 text-gray-400 ml-2 cursor-help hover:text-gray-600 transition-colors" />
                <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-gray-900 text-xs text-white rounded-xl shadow-xl z-10">
                  2x4 for standard walls, 2x6 for insulation or structural
                  requirements
                  <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
            <div className="flex space-x-3">
              {["2x4", "2x6"].map((size) => (
                <button
                  key={size}
                  onClick={() => setLumberSize(size)}
                  className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 ${lumberSize === size
                    ? "bg-[#033159] text-white border-[#033159] shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 pl-1">
              {lumberSize === "2x4" ? "$3.25 per piece" : "$4.75 per piece"}
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Package className="h-4 w-4 text-gray-400 mr-2" />
              Stud Spacing
            </label>
            <div className="flex space-x-3">
              {[12, 16, 24].map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => setStudSpacing(spacing)}
                  className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 ${studSpacing === spacing
                    ? "bg-[#033159] text-white border-[#033159] shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                    }`}
                >
                  {spacing}"
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 pl-1">
              {getStudSpacingLabel(studSpacing)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-800">
                Opening Width (ft)
                <div className="relative group inline-block">
                  <Info className="h-3.5 w-3.5 text-gray-400 ml-2 cursor-help hover:text-gray-600 transition-colors" />
                  <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-gray-900 text-xs text-white rounded-xl shadow-xl z-10">
                    Total width of doors, windows, or other openings. Additional
                    framing will be calculated automatically.
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>

              <input
                type="number"
                value={openingWidth || ""}
                onChange={(e) => setOpeningWidth(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 pl-1">Doors, windows, etc.</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-800">
                <Info className="h-4 w-4 text-gray-500 mr-2" />
                Waste Factor (%)
                <div className="relative group inline-block">
                  <Info className="h-3.5 w-3.5 text-gray-400 ml-2 cursor-help hover:text-gray-600 transition-colors" />
                  <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-gray-900 text-xs text-white rounded-xl shadow-xl z-10">
                    Accounts for cutting waste and extra materials. 10% is
                    standard, increase for complex layouts.
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>
              <input
                type="number"
                value={waste}
                onChange={(e) => setWaste(Number(e.target.value) || 0)}
                min="0"
                max="50"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {result !== null && wallLength > 0 && wallHeight > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200 mb-8 shadow-inner">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
              Material Requirements ({lumberSize})
            </h3>

            <div className="space-y-4">
              {/* Studs */}
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-800 text-base">
                    Studs Required:
                  </span>
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-[#033159]" />
                    <span className="text-xl font-black text-[#033159]">
                      {result.studs}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  <span>
                    Length: {result.studLength}ft {lumberSize}
                  </span>
                  <span className="mx-3">•</span>
                  <span>Spacing: {studSpacing}" O.C.</span>
                  <span className="mx-3">•</span>
                  <span>${getLumberPrice(lumberSize)} each</span>
                </div>
              </div>

              {/* Plates */}
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-800 text-base">
                    Top/Bottom Plates:
                  </span>
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-5 w-5 text-[#033159]" />
                    <span className="text-xl font-black text-[#033159]">
                      {result.plates} LF
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Linear feet of {lumberSize} plate material needed
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-[#033159] to-[#00598F] text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">
                    Total Linear Feet:
                  </span>
                  <span className="text-2xl font-black">
                    {result.totalLinearFeet} LF
                  </span>
                </div>
                <div className="text-sm text-blue-200 mt-2 font-medium">
                  Total {lumberSize} lumber needed for framing
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-100 rounded-xl border-2 border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    Calculations include:
                  </p>
                  <ul className="mt-2 text-xs sm:text-sm text-blue-800 space-y-1.5 font-medium">
                    <li>• {waste}% waste factor for cutting and extras</li>
                    <li>• Standard framing practices and spacing</li>
                    <li>• Additional framing for openings</li>
                    <li>• {lumberSize} lumber sizing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {result && (
            <button
              onClick={addToQuote}
              data-stud-quote-btn
              className="flex-1 px-6 py-4 text-base font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-[#033159] to-[#00598F] hover:from-[#022244] hover:to-[#044a73] active:scale-98"
            >
              <Plus className="h-5 w-5" />
              <span>Add to Quote</span>
            </button>
          )}

          <button
            onClick={clearInputs}
            className="px-6 py-4 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:-translate-y-0.5 border-2 border-gray-200 hover:border-gray-300 active:scale-98"
          >
            Clear
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span className="font-medium">
              {lumberSize} framing lumber calculation
            </span>
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudCalculator;
