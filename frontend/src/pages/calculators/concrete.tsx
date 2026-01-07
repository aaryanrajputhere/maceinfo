import React, { useState, useEffect } from "react";
import {
    Calculator,
    Plus,
    Info,
    Ruler,
    Package,
    DollarSign,
    Box,
} from "lucide-react";

const ConcreteCalculator: React.FC = () => {
    const [slabLength, setSlabLength] = useState<number>(0);
    const [slabWidth, setSlabWidth] = useState<number>(0);
    const [slabDepth, setSlabDepth] = useState<number>(0);
    const [footingLength, setFootingLength] = useState<number>(0);
    const [footingWidth, setFootingWidth] = useState<number>(0);
    const [footingDepth, setFootingDepth] = useState<number>(0);
    const [result, setResult] = useState<{
        slabVolume: number;
        footingVolume: number;
        totalVolume: number;
    } | null>(null);
    const [manualOverride, setManualOverride] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        calculate();
    }, [slabLength, slabWidth, slabDepth, footingLength, footingWidth, footingDepth]);

    const calculate = () => {
        // Slab volume in cubic feet
        const slabCubicFeet = slabLength * slabWidth * (slabDepth / 12); // depth in inches, convert to feet

        // Footing volume in cubic feet
        const footingCubicFeet = footingLength * footingWidth * (footingDepth / 12);

        // Convert to cubic yards (divide by 27)
        const slabVolume = slabCubicFeet / 27;
        const footingVolume = footingCubicFeet / 27;
        const totalVolume = slabVolume + footingVolume;

        if (totalVolume > 0) {
            setResult({
                slabVolume,
                footingVolume,
                totalVolume,
            });
        } else {
            setResult(null);
        }
    };

    const addToQuote = () => {
        if (!result) return;
        const quantity = manualOverride !== null ? manualOverride : result.totalVolume;
        if (quantity <= 0) return;

        const existingQuote = JSON.parse(localStorage.getItem("quote") || "[]");

        const newItem = {
            id: Date.now(),
            category: "Concrete",
            name: "Ready-Mix Concrete",
            size: "3000 PSI",
            unit: "cubic yard",
            price: 125.0,
            quantity: parseFloat(quantity.toFixed(2)),
            vendors: "Local Concrete Supplier",
            selectedVendors: ["Local Concrete Supplier"],
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
        setSlabLength(0);
        setSlabWidth(0);
        setSlabDepth(0);
        setFootingLength(0);
        setFootingWidth(0);
        setFootingDepth(0);
        setManualOverride(null);
    };

    const displayQuantity = manualOverride !== null ? manualOverride : result?.totalVolume;

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
                            <Box className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Concrete Calculator
                        </h2>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 pl-1">
                        Calculate concrete volume for slabs and footings
                    </p>
                </div>

                {/* Input Fields */}
                <div className="space-y-6 mb-8">
                    {/* Slab Section */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="text-base font-bold text-gray-800 flex items-center">
                            <Package className="h-4 w-4 text-gray-500 mr-2" />
                            Slab Dimensions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    Length (ft)
                                </label>
                                <input
                                    type="number"
                                    value={slabLength || ""}
                                    onChange={(e) => setSlabLength(Number(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-sm font-medium placeholder-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    Width (ft)
                                </label>
                                <input
                                    type="number"
                                    value={slabWidth || ""}
                                    onChange={(e) => setSlabWidth(Number(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-sm font-medium placeholder-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    Depth (in)
                                </label>
                                <input
                                    type="number"
                                    value={slabDepth || ""}
                                    onChange={(e) => setSlabDepth(Number(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-sm font-medium placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footing Section */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="text-base font-bold text-gray-800 flex items-center">
                            <Package className="h-4 w-4 text-gray-500 mr-2" />
                            Footing Dimensions (Optional)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    Length (ft)
                                </label>
                                <input
                                    type="number"
                                    value={footingLength || ""}
                                    onChange={(e) => setFootingLength(Number(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-sm font-medium placeholder-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    Width (ft)
                                </label>
                                <input
                                    type="number"
                                    value={footingWidth || ""}
                                    onChange={(e) => setFootingWidth(Number(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-sm font-medium placeholder-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    Depth (in)
                                </label>
                                <input
                                    type="number"
                                    value={footingDepth || ""}
                                    onChange={(e) => setFootingDepth(Number(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-sm font-medium placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {result !== null && result.totalVolume > 0 && (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200 mb-8 shadow-inner">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                            Calculation Results
                        </h3>

                        <div className="space-y-3 text-sm sm:text-base">
                            {result.slabVolume > 0 && (
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-gray-600 font-medium">Slab Volume:</span>
                                    <span className="font-bold text-gray-800">
                                        {result.slabVolume.toFixed(2)} cu yd
                                    </span>
                                </div>
                            )}

                            {result.footingVolume > 0 && (
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-gray-600 font-medium">Footing Volume:</span>
                                    <span className="font-bold text-gray-800">
                                        {result.footingVolume.toFixed(2)} cu yd
                                    </span>
                                </div>
                            )}

                            <hr className="border-gray-300 my-4" />

                            <div className="flex items-center justify-between py-2 bg-white rounded-lg px-4 border border-gray-200">
                                <span className="text-gray-700 font-bold text-base">
                                    Total Concrete:
                                </span>
                                <div className="flex items-center space-x-2">
                                    <Package className="h-5 w-5 text-[#033159]" />
                                    <span className="text-2xl font-black text-[#033159]">
                                        {result.totalVolume.toFixed(2)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">cu yd</span>
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
                                    step="0.01"
                                    value={manualOverride || ""}
                                    onChange={(e) =>
                                        setManualOverride(
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    placeholder={`Calculated: ${result.totalVolume.toFixed(2)}`}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
                                />
                                <p className="text-xs text-gray-500 pl-1">
                                    Override calculated volume if needed (cubic yards)
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-100 rounded-xl border border-blue-200">
                            <p className="text-xs sm:text-sm text-blue-800 font-medium">
                                <Info className="h-3 w-3 inline mr-1" />
                                Volume calculated in cubic yards. Consider ordering 5-10% extra.
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    {displayQuantity && displayQuantity > 0 && (
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
                            Ready-Mix Concrete - 3000 PSI
                        </span>
                        <DollarSign className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConcreteCalculator;
