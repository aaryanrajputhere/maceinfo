import React, { useState, useEffect } from "react";
import {
    Calculator,
    Plus,
    Info,
    Ruler,
    Package,
    DollarSign,
    Grid3x3,
} from "lucide-react";

const DeckCalculator: React.FC = () => {
    const [deckLength, setDeckLength] = useState<number>(0);
    const [deckWidth, setDeckWidth] = useState<number>(0);
    const [joistSpacing, setJoistSpacing] = useState<12 | 16 | 24>(16);
    const [boardWidth, setBoardWidth] = useState<5.5 | 3.5>(5.5);
    const [result, setResult] = useState<{
        joists: number;
        deckBoards: number;
        rimJoists: number;
    } | null>(null);
    const [manualOverrideJoists, setManualOverrideJoists] = useState<number | null>(null);
    const [manualOverrideBoards, setManualOverrideBoards] = useState<number | null>(null);
    const [manualOverrideRim, setManualOverrideRim] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (deckLength > 0 && deckWidth > 0) {
            calculate();
        } else {
            setResult(null);
        }
    }, [deckLength, deckWidth, joistSpacing, boardWidth]);

    const calculate = () => {
        if (deckLength <= 0 || deckWidth <= 0) return;

        // Joists: (Deck length / Joist spacing) + 1
        const joistSpacingFt = joistSpacing / 12;
        const joists = Math.floor(deckLength / joistSpacingFt) + 1;

        // Deck boards: (Deck width / Board width) × Deck length
        const boardWidthFt = boardWidth / 12;
        const deckBoards = Math.ceil((deckWidth / boardWidthFt) * (deckLength / 8)); // 8ft boards

        // Rim joists: 2 × (Length + Width) in linear feet, convert to 8ft pieces
        const rimJoistsLinearFt = 2 * (deckLength + deckWidth);
        const rimJoists = Math.ceil(rimJoistsLinearFt / 8);

        setResult({
            joists,
            deckBoards,
            rimJoists,
        });
    };

    const addToQuote = () => {
        if (!result) return;

        const joistQty = manualOverrideJoists !== null ? manualOverrideJoists : result.joists;
        const boardQty = manualOverrideBoards !== null ? manualOverrideBoards : result.deckBoards;
        const rimQty = manualOverrideRim !== null ? manualOverrideRim : result.rimJoists;

        const existingQuote = JSON.parse(localStorage.getItem("quote") || "[]");
        const timestamp = Date.now();
        const newItems = [];

        // Add Joists
        if (joistQty > 0) {
            newItems.push({
                id: timestamp + 1,
                category: "Deck",
                name: "Deck Joist 2x8",
                size: "8ft",
                unit: "pcs",
                price: 8.99,
                quantity: joistQty,
                vendors: "Home Depot, Lowes",
                selectedVendors: ["Home Depot", "Lowes"],
                image: "",
                addedAt: new Date().toLocaleString(),
            });
        }

        // Add Deck Boards
        if (boardQty > 0) {
            newItems.push({
                id: timestamp + 2,
                category: "Deck",
                name: boardWidth === 5.5 ? "Deck Board 5/4x6" : "Deck Board 2x4",
                size: "8ft",
                unit: "pcs",
                price: boardWidth === 5.5 ? 12.99 : 7.99,
                quantity: boardQty,
                vendors: "Home Depot, Lowes",
                selectedVendors: ["Home Depot", "Lowes"],
                image: "",
                addedAt: new Date().toLocaleString(),
            });
        }

        // Add Rim Joists
        if (rimQty > 0) {
            newItems.push({
                id: timestamp + 3,
                category: "Deck",
                name: "Rim Joist 2x8",
                size: "8ft",
                unit: "pcs",
                price: 8.99,
                quantity: rimQty,
                vendors: "Home Depot, Lowes",
                selectedVendors: ["Home Depot", "Lowes"],
                image: "",
                addedAt: new Date().toLocaleString(),
            });
        }

        const updatedQuote = [...existingQuote, ...newItems];
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
        setDeckLength(0);
        setDeckWidth(0);
        setJoistSpacing(16);
        setBoardWidth(5.5);
        setManualOverrideJoists(null);
        setManualOverrideBoards(null);
        setManualOverrideRim(null);
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
                            <Grid3x3 className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Deck Materials Calculator
                        </h2>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 pl-1">
                        Calculate joists, deck boards, and rim joists for your deck
                    </p>
                </div>

                {/* Input Fields */}
                <div className="space-y-6 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                                Deck Length (ft)
                            </label>
                            <input
                                type="number"
                                value={deckLength || ""}
                                onChange={(e) => setDeckLength(Number(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                                Deck Width (ft)
                            </label>
                            <input
                                type="number"
                                value={deckWidth || ""}
                                onChange={(e) => setDeckWidth(Number(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#033159]/20 focus:border-[#033159] transition-all duration-200 text-base font-medium placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Joist Spacing Selection */}
                    <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-800">
                            <Package className="h-4 w-4 text-gray-500 mr-2" />
                            Joist Spacing
                        </label>
                        <div className="flex space-x-3">
                            {[
                                { value: 12, label: '12" O.C.' },
                                { value: 16, label: '16" O.C.' },
                                { value: 24, label: '24" O.C.' },
                            ].map((spacing) => (
                                <button
                                    key={spacing.value}
                                    onClick={() => setJoistSpacing(spacing.value as 12 | 16 | 24)}
                                    className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 ${joistSpacing === spacing.value
                                            ? "bg-[#033159] text-white border-[#033159] shadow-md"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                                        }`}
                                >
                                    {spacing.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Board Width Selection */}
                    <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-800">
                            <Package className="h-4 w-4 text-gray-500 mr-2" />
                            Deck Board Width
                        </label>
                        <div className="flex space-x-3">
                            {[
                                { value: 5.5, label: '5/4x6 (5.5")', price: 12.99 },
                                { value: 3.5, label: '2x4 (3.5")', price: 7.99 },
                            ].map((board) => (
                                <button
                                    key={board.value}
                                    onClick={() => setBoardWidth(board.value as 5.5 | 3.5)}
                                    className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 ${boardWidth === board.value
                                            ? "bg-[#033159] text-white border-[#033159] shadow-md"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                                        }`}
                                >
                                    <div>{board.label}</div>
                                    <div className="text-xs opacity-75">${board.price}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                {result !== null && deckLength > 0 && deckWidth > 0 && (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200 mb-8 shadow-inner">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
                            Material Requirements
                        </h3>

                        <div className="space-y-4">
                            {/* Joists */}
                            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-gray-800 text-base">
                                        Deck Joists (2x8):
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <Package className="h-5 w-5 text-[#033159]" />
                                        <span className="text-xl font-black text-[#033159]">
                                            {result.joists}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    value={manualOverrideJoists || ""}
                                    onChange={(e) =>
                                        setManualOverrideJoists(
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    placeholder={`Override: ${result.joists}`}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#033159]/20 focus:border-[#033159] transition-all text-sm placeholder-gray-400"
                                />
                            </div>

                            {/* Deck Boards */}
                            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-gray-800 text-base">
                                        Deck Boards ({boardWidth === 5.5 ? "5/4x6" : "2x4"}):
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <Package className="h-5 w-5 text-[#033159]" />
                                        <span className="text-xl font-black text-[#033159]">
                                            {result.deckBoards}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    value={manualOverrideBoards || ""}
                                    onChange={(e) =>
                                        setManualOverrideBoards(
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    placeholder={`Override: ${result.deckBoards}`}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#033159]/20 focus:border-[#033159] transition-all text-sm placeholder-gray-400"
                                />
                            </div>

                            {/* Rim Joists */}
                            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-gray-800 text-base">
                                        Rim Joists (2x8):
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <Package className="h-5 w-5 text-[#033159]" />
                                        <span className="text-xl font-black text-[#033159]">
                                            {result.rimJoists}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    value={manualOverrideRim || ""}
                                    onChange={(e) =>
                                        setManualOverrideRim(
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    placeholder={`Override: ${result.rimJoists}`}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#033159]/20 focus:border-[#033159] transition-all text-sm placeholder-gray-400"
                                />
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
                                        <li>• Joists at {joistSpacing}" O.C. spacing</li>
                                        <li>• {boardWidth === 5.5 ? "5/4x6" : "2x4"} deck boards (8ft length)</li>
                                        <li>• Rim joists for perimeter framing</li>
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
                            data-quote-btn
                            className="flex-1 px-6 py-4 text-base font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-[#033159] to-[#00598F] hover:from-[#022244] hover:to-[#044a73] active:scale-98"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Add All to Quote</span>
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
                            Deck: {deckLength}' × {deckWidth}' - {joistSpacing}" O.C.
                        </span>
                        <DollarSign className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeckCalculator;
