import React, { useState, useEffect } from "react";
import {
    Plus,
    Info,
    Ruler,
    Package,
    DollarSign,
    Square,
} from "lucide-react";

const DrywallCalculator: React.FC = () => {
    const [wallArea, setWallArea] = useState<number>(0);
    const [ceilingArea, setCeilingArea] = useState<number>(0);
    const [boardSize, setBoardSize] = useState<"4x8" | "4x10" | "4x12">("4x8");
    const [waste, setWaste] = useState<number>(10);
    const [result, setResult] = useState<number | null>(null);
    const [totalArea, setTotalArea] = useState<number>(0);
    const [wasteArea, setWasteArea] = useState<number>(0);
    const [manualOverride, setManualOverride] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const getBoardArea = (size: string) => {
        switch (size) {
            case "4x8":
                return 32;
            case "4x10":
                return 40;
            case "4x12":
                return 48;
            default:
                return 32;
        }
    };

    const getBoardPrice = (size: string) => {
        switch (size) {
            case "4x8":
                return 12.99;
            case "4x10":
                return 15.99;
            case "4x12":
                return 18.99;
            default:
                return 12.99;
        }
    };

    useEffect(() => {
        if (wallArea > 0 || ceilingArea > 0) {
            calculate();
        } else {
            setResult(null);
            setTotalArea(0);
            setWasteArea(0);
        }
    }, [wallArea, ceilingArea, boardSize, waste]);

    const calculate = () => {
        if (wallArea <= 0 && ceilingArea <= 0) return;

        const area = wallArea + ceilingArea;
        const boardArea = getBoardArea(boardSize);
        const wasteAmount = area * (waste / 100);
        const totalAreaNeeded = area + wasteAmount;
        const sheets = Math.ceil(totalAreaNeeded / boardArea);

        setTotalArea(area);
        setWasteArea(wasteAmount);
        setResult(sheets);
    };

    const addToQuote = () => {
        const quantity = manualOverride !== null ? manualOverride : result;
        if (!quantity) return;

        const existingQuote = JSON.parse(localStorage.getItem("quote") || "[]");

        const newItem = {
            id: Date.now(),
            category: "Drywall",
            name: `Drywall Sheet ${boardSize}`,
            size: `${boardSize.replace("x", "' x ")}' (${getBoardArea(boardSize)} sq ft)`,
            unit: "sheet",
            price: getBoardPrice(boardSize),
            quantity: quantity,
            vendors: "Home Depot, Lowes",
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
        setCeilingArea(0);
        setBoardSize("4x8");
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
                            <Square className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Drywall Calculator
                        </h2>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 pl-1">
                        Calculate drywall sheets needed for walls and ceilings
                    </p>
                </div>

                {/* Input Fields */}
                <div className="space-y-6 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                                Ceiling Area (sq ft)
                            </label>
                            <input
                                type="number"
                                value={ceilingArea || ""}
                                onChange={(e) => setCeilingArea(Number(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Board Size Selection */}
                    <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-800">
                            <Package className="h-4 w-4 text-gray-500 mr-2" />
                            Board Size
                        </label>
                        <div className="flex space-x-3">
                            {[
                                { value: "4x8", label: "4×8", area: 32 },
                                { value: "4x10", label: "4×10", area: 40 },
                                { value: "4x12", label: "4×12", area: 48 },
                            ].map((size) => (
                                <button
                                    key={size.value}
                                    onClick={() => setBoardSize(size.value as "4x8" | "4x10" | "4x12")}
                                    className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 ${boardSize === size.value
                                        ? "bg-[#033159] text-white border-[#033159] shadow-md"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                                        }`}
                                >
                                    <div>{size.label}</div>
                                    <div className="text-xs opacity-75">{size.area} sq ft</div>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 pl-1">
                            ${getBoardPrice(boardSize).toFixed(2)} per sheet
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-800">
                            <Info className="h-4 w-4 text-gray-500 mr-2" />
                            Waste Factor (%)
                            <div className="relative group inline-block">
                                <Info className="h-3.5 w-3.5 text-gray-400 ml-2 cursor-help hover:text-gray-600 transition-colors" />
                                <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-gray-900 text-xs text-white rounded-xl shadow-xl z-10">
                                    Accounts for cutting waste. 10% is standard for drywall.
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
                                <span className="text-gray-600 font-medium">Total Area:</span>
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
                                    Sheets Required:
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
                                Based on {boardSize.replace("x", "' × ")}' ({getBoardArea(boardSize)} sq ft) drywall sheets
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
                            Drywall Sheet: {boardSize.replace("x", "' × ")}' ({getBoardArea(boardSize)} sq ft)
                        </span>
                        <DollarSign className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrywallCalculator;
