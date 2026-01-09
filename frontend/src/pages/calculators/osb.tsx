import React, { useState, useEffect } from "react";
import {
  Calculator,
  Plus,
  Info,
  Ruler,
  Package,
  DollarSign,
} from "lucide-react";
import { useMaterials } from "../../hooks/useMaterials";
import { addToQuoteWithDeduplication, showQuoteButtonFeedback } from "../../utils/quoteUtils";

const OSBCalculator: React.FC = () => {
  const { materials } = useMaterials();
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [waste, setWaste] = useState<number>(10);
  const [result, setResult] = useState<number | null>(null);
  const [totalArea, setTotalArea] = useState<number>(0);
  const [wasteArea, setWasteArea] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (length > 0 && width > 0) {
      calculate();
    } else {
      setResult(null);
      setTotalArea(0);
      setWasteArea(0);
    }
  }, [length, width, waste]);

  const calculate = () => {
    if (length <= 0 || width <= 0) return;

    const area = length * width;
    const sheetArea = 32; // 4x8 feet = 32 sq ft
    const wasteAmount = area * (waste / 100);
    const totalAreaNeeded = area + wasteAmount;
    const sheets = Math.ceil(totalAreaNeeded / sheetArea);

    setTotalArea(area);
    setWasteArea(wasteAmount);
    setResult(sheets);
  };

  const addToQuote = () => {
    if (!result) return;

    const res = addToQuoteWithDeduplication(
      {
        category: "Sheathing",
        name: "OSB Sheathing 7/16 4x8",
        size: "4' x 8'",
        unit: "sheet",
        price: 14.95,
        quantity: result,
        vendors: "Home Depot, Lowes",
        selectedVendors: ["Home Depot", "Lowes"],
      },
      materials
    );

    showQuoteButtonFeedback("[data-quote-btn]", !res.isNewItem);
  };



  const clearInputs = () => {
    setLength(0);
    setWidth(0);
    setWaste(10);
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
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              OSB Sheet Calculator
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 pl-1">
            {isHovered
              ? "Release mouse to reset inputs"
              : "Calculate OSB sheets needed for your project"}
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                Length (ft)
              </label>
              <input
                type="number"
                value={length || ""}
                onChange={(e) => setLength(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                Width (ft)
              </label>
              <input
                type="number"
                value={width || ""}
                onChange={(e) => setWidth(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
              />
            </div>
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
            <p className="text-xs text-gray-500 pl-1">
              Recommended: 10-15% for cuts and waste
            </p>
          </div>
        </div>

        {/* Results */}
        {result !== null && totalArea > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200 mb-8 shadow-inner">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Calculation Results
            </h3>

            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 font-medium">Project Area:</span>
                <span className="font-bold text-gray-800">
                  {totalArea.toFixed(1)} sq ft
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 font-medium">
                  Waste ({waste}%):
                </span>
                <span className="font-bold text-gray-800">
                  {wasteArea.toFixed(1)} sq ft
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 font-medium">
                  Total Area Needed:
                </span>
                <span className="font-bold text-gray-800">
                  {(totalArea + wasteArea).toFixed(1)} sq ft
                </span>
              </div>

              <hr className="border-gray-300 my-4" />

              <div className="flex items-center justify-between py-2 bg-white rounded-lg px-4 border border-gray-200">
                <span className="text-gray-700 font-bold text-base">
                  OSB Sheets Required:
                </span>
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-[#033159]" />
                  <span className="text-2xl font-black text-[#033159]">
                    {result}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded-xl border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-800 font-medium">
                <Info className="h-3 w-3 inline mr-1" />
                Based on standard 4'×8' (32 sq ft) OSB sheets
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {result && (
            <button
              onClick={addToQuote}
              data-quote-btn
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

        {/* Sheet Info */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span className="font-medium">
              Standard OSB Sheet: 4' × 8' (32 sq ft)
            </span>
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSBCalculator;
