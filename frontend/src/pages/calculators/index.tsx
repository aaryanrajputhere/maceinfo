import React from "react";
import { Link } from "react-router-dom";
import {
    Hammer,
    Home,
    Paintbrush,
    Square,
    Wind,
    Box,
    Grid3x3,
    Calculator,
    ArrowRight,
} from "lucide-react";

interface CalculatorCard {
    name: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    category: string;
    color: string;
}

const CalculatorsIndex: React.FC = () => {
    const calculators: CalculatorCard[] = [
        {
            name: "Stud Calculator",
            description: "Calculate wall framing materials including studs, plates, and lumber",
            icon: <Hammer className="h-8 w-8" />,
            path: "/calculators/studs",
            category: "Framing",
            color: "from-blue-500 to-blue-600",
        },
        {
            name: "OSB Sheathing",
            description: "Calculate OSB sheets needed based on wall dimensions",
            icon: <Calculator className="h-8 w-8" />,
            path: "/calculators/osb",
            category: "Sheathing",
            color: "from-amber-500 to-amber-600",
        },
        {
            name: "Housewrap",
            description: "Calculate housewrap rolls for exterior wall coverage",
            icon: <Home className="h-8 w-8" />,
            path: "/calculators/housewrap",
            category: "Exterior",
            color: "from-green-500 to-green-600",
        },
        {
            name: "Siding / Painting",
            description: "Calculate siding panels or paint needed for exterior walls",
            icon: <Paintbrush className="h-8 w-8" />,
            path: "/calculators/siding",
            category: "Exterior",
            color: "from-purple-500 to-purple-600",
        },
        {
            name: "Drywall",
            description: "Calculate drywall sheets for walls and ceilings",
            icon: <Square className="h-8 w-8" />,
            path: "/calculators/drywall",
            category: "Interior",
            color: "from-gray-500 to-gray-600",
        },
        {
            name: "Insulation",
            description: "Calculate insulation batts based on R-value and spacing",
            icon: <Wind className="h-8 w-8" />,
            path: "/calculators/insulation",
            category: "Insulation",
            color: "from-cyan-500 to-cyan-600",
        },
        {
            name: "Concrete",
            description: "Calculate concrete volume for slabs and footings",
            icon: <Box className="h-8 w-8" />,
            path: "/calculators/concrete",
            category: "Foundation",
            color: "from-stone-500 to-stone-600",
        },
        {
            name: "Roofing",
            description: "Calculate roofing shingles based on area and pitch",
            icon: <Home className="h-8 w-8" />,
            path: "/calculators/roofing",
            category: "Roofing",
            color: "from-red-500 to-red-600",
        },
        {
            name: "Deck Materials",
            description: "Calculate joists, deck boards, and rim joists for decks",
            icon: <Grid3x3 className="h-8 w-8" />,
            path: "/calculators/deck",
            category: "Outdoor",
            color: "from-orange-500 to-orange-600",
        },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                    Construction Calculators
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Professional material calculators to help you estimate quantities for your construction projects.
                    All calculators support waste factors and manual overrides.
                </p>
            </div>

            {/* Calculator Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {calculators.map((calc) => (
                    <Link
                        key={calc.path}
                        to={calc.path}
                        className="group bg-white rounded-2xl border-2 border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200"
                    >
                        {/* Icon and Category */}
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`p-4 rounded-xl bg-gradient-to-br ${calc.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                                {calc.icon}
                            </div>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {calc.category}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#033159] transition-colors">
                                {calc.name}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {calc.description}
                            </p>
                        </div>

                        {/* Action */}
                        <div className="flex items-center text-[#033159] font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                            <span>Open Calculator</span>
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer Info */}
            <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        How to Use Our Calculators
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-[#033159] text-white flex items-center justify-center font-bold mr-3">
                                    1
                                </div>
                                <h3 className="font-bold text-gray-900">Enter Dimensions</h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-11">
                                Input your project measurements and select material options
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-[#033159] text-white flex items-center justify-center font-bold mr-3">
                                    2
                                </div>
                                <h3 className="font-bold text-gray-900">Review Results</h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-11">
                                Get instant calculations with waste factors included
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-[#033159] text-white flex items-center justify-center font-bold mr-3">
                                    3
                                </div>
                                <h3 className="font-bold text-gray-900">Add to Quote</h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-11">
                                Build your material list and request quotes from vendors
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalculatorsIndex;
