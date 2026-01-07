import React, { useState, useEffect } from "react";
import {
    Plus,
    Info,
    Ruler,
    Package,
    DollarSign,
    Paintbrush,
} from "lucide-react";

const SidingCalculator: React.FC = () => {
    const [wallArea, setWallArea] = useState<number>(0);
    const [materialType, setMaterialType] = useState<"siding" | "paint">("siding");
    const [waste, setWaste] = useState<number>(10);
    const [result, setResult] = useState<number | null>(null);
    const [wasteAmount, setWasteAmount] = useState<number>(0);
    const [manualOverride, setManualOverride] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (wallArea > 0) {
            calculate();
        } else {
            setResult(null);
            setWasteAmount(0);
        }
    }, [wallArea, materialType, waste]);

    const calculate = () => {
        if (wallArea <= 0) return;

        const coverage = materialType === "siding" ? 32 : 350; // 32 sq ft per panel, 350 sq ft per gallon
        const wasteArea = wallArea * (waste / 100);
        const totalAreaNeeded = wallArea + wasteArea;
        const quantity = Math.ceil(totalAreaNeeded / coverage);

        setWasteAmount(wasteArea);
        setResult(quantity);
    };

    const addToQuote = () => {
        const quantity = manualOverride !== null ? manualOverride : result;
        if (!quantity) return;

        const existingQuote = JSON.parse(localStorage.getItem("quote") || "[]");

        const newItem = {
            id: Date.now(),
            category: materialType === "siding" ? "Exterior" : "Paint",
            name: materialType === "siding" ? "Vinyl Siding Panel 4x8" : "Exterior Paint",
            size: materialType === "siding" ? "4' x 8' (32 sq ft)" : "1 Gallon (350 sq ft)",
            unit: materialType === "siding" ? "panel" : "gallon",
            price: materialType === "siding" ? 24.99 : 34.99,
            quantity: quantity,
            vendors: "Home Depot, Lowes, Sherwin-Williams",
            selectedVendors: ["Home Depot", "Lowes"],
            image: "",
            addedAt: new Date().toLocaleString(),
        };

        const updatedQuote = [...existingQuote, newItem];
        localStorage.setItem("quote", JSON.stringify(updatedQuote));

        const button = document.querySelector("[data-quote-btn]") as HTMLElement;
        if (button) {
            const originalText = button.textContent;
            button.textContent = "Added to Quote!";
            button.className = button.className.replace(
                "bg-[#033159] hover:bg-[#022244]",
                "bg-green-600 hover:bg-green-700"
            );
            setTimeout(() => {
                button.textContent = originalText;
                button.className = button.className.replace(
                    "bg-green-600 hover:bg-green-700",
                    "bg-[#033159] hover:bg-[#022244]"
                );
            }, 2000);
        }

        window.dispatchEvent(new Event("storage"));
    };

    const clearInputs = () => {
        setWallArea(0);
        setMaterialType("siding");
        setWaste(10);
        setManualOverride(null);
    };

    const displayQuantity = manualOverride !== null ? manualOverride : result;

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
                            <Paintbrush className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Siding / Painting Calculator
                        </h2>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 pl-1">
                        Calculate siding panels or paint needed for exterior walls
                    </p>
                </div>

                {/* Input Fields */}
                <div className="space-y-6 mb-8">
                    {/* Material Type Selection */}
                    <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-800">
                            <Package className="h-4 w-4 text-gray-500 mr-2" />
                            Material Type
                        </label>
                        <div className="flex space-x-3">
                            {[
                                { value: "siding", label: "Siding Panels" },
                                { value: "paint", label: "Paint" },
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setMaterialType(type.value as "siding" | "paint")}
                                    className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 ${materialType === type.value
                                        ? "bg-[#033159] text-white border-[#033159] shadow-md"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 pl-1">
                            {materialType === "siding"
                                ? "32 sq ft per panel (4x8)"
                                : "350 sq ft per gallon"}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                            Wall Area (sq ft)
                        </label>
                        <input
                            type="number"
                            value={wallArea || ""}
                            onChange={(e) => setWallArea(Number(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-800">
                            <Info className="h-4 w-4 text-gray-500 mr-2" />
                            Waste Factor (%)
                            <div className="relative group inline-block">
                                <Info className="h-3.5 w-3.5 text-gray-400 ml-2 cursor-help hover:text-gray-600 transition-colors" />
                                <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-gray-900 text-xs text-white rounded-xl shadow-xl z-10">
                                    Accounts for cuts, overlaps, and waste. 10% is standard.
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
                {result !== null && wallArea > 0 && (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200 mb-8 shadow-inner">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                            Calculation Results
                        </h3>

                        <div className="space-y-3 text-sm sm:text-base">
                            <div className="flex items-center justify-between py-1">
                                <span className="text-gray-600 font-medium">Wall Area:</span>
                                <span className="font-bold text-gray-800">
                                    {wallArea.toFixed(1)} sq ft
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1">
                                <span className="text-gray-600 font-medium">
                                    Waste ({waste}%):
                                </span>
                                <span className="font-bold text-gray-800">
                                    {wasteAmount.toFixed(1)} sq ft
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1">
                                <span className="text-gray-600 font-medium">
                                    Total Area Needed:
                                </span>
                                <span className="font-bold text-gray-800">
                                    {(wallArea + wasteAmount).toFixed(1)} sq ft
                                </span>
                            </div>

                            <hr className="border-gray-300 my-4" />

                            <div className="flex items-center justify-between py-2 bg-white rounded-lg px-4 border border-gray-200">
                                <span className="text-gray-700 font-bold text-base">
                                    {materialType === "siding" ? "Panels" : "Gallons"} Required:
                                </span>
                                <div className="flex items-center space-x-2">
                                    <Package className="h-5 w-5 text-[#033159]" />
                                    <span className="text-2xl font-black text-[#033159]">
                                        {result}
                                    </span>
                                </div>
                            </div>

                            {/* Manual Override */}
                            <div className="mt-4 space-y-2">
                                <label className="flex items-center text-sm font-semibold text-gray-700">
                                    <Info className="h-4 w-4 text-gray-400 mr-2" />
                                    Manual Override (Optional)
                                </label>
                                <input
                                    type="number"
                                    value={manualOverride || ""}
                                    onChange={(e) =>
                                        setManualOverride(
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    placeholder={`Calculated: ${result}`}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
                                />
                                <p className="text-xs text-gray-500 pl-1">
                                    Override calculated quantity if needed
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-100 rounded-xl border border-blue-200">
                            <p className="text-xs sm:text-sm text-blue-800 font-medium">
                                <Info className="h-3 w-3 inline mr-1" />
                                {materialType === "siding"
                                    ? "Based on 4'×8' (32 sq ft) siding panels"
                                    : "Based on 350 sq ft coverage per gallon"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    {displayQuantity && (
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

                {/* Info Footer */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                        <span className="font-medium">
                            {materialType === "siding"
                                ? "Siding Panel: 4' × 8' (32 sq ft)"
                                : "Paint Coverage: 350 sq ft/gallon"}
                        </span>
                        <DollarSign className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidingCalculator;
