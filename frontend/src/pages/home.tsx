import React from "react";
import {
  Package,
  Calculator,
  ClipboardList,
  Mail,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "Materials Catalog",
    description:
      "Browse studs, OSB, drywall, lumber, and more with indicative pricing pulled from Google Sheets.",
    icon: <Package className="h-8 w-8 text-[#033159]" />,
    link: "/materials",
  },
  {
    title: "Smart Calculators",
    description:
      "Estimate studs and OSB quantities instantly with built-in calculators and add results to your quote.",
    icon: <Calculator className="h-8 w-8 text-[#033159]" />,
    link: "/calculators",
  },
  {
    title: "Quote Builder",
    description:
      "Add items, adjust quantities, and attach project details to generate a professional RFQ package.",
    icon: <ClipboardList className="h-8 w-8 text-[#033159]" />,
    link: "/quote",
  },
  {
    title: "Vendor RFQ System",
    description:
      "Send requests directly to vendors and collect replies seamlessly—auto-logged into Google Sheets.",
    icon: <Mail className="h-8 w-8 text-[#033159]" />,
    link: "/quote",
  },
];


const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className=" py-10 md:py-35 ">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#033159] leading-tight">
            Construction Estimator & RFQ Platform
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            For contractors, builders, and DIYers: browse materials, run quick
            calculators, build quotes, and request vendor pricing—all in one
            place.
          </p>
          <div className="mt-6">
            <a
              href="/materials"
              className="inline-flex items-center px-6 py-3 bg-[#033159] text-white text-lg font-semibold rounded-xl shadow hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              Start Building Your Quote <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <main className="flex-grow">
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-[#033159]">
              Core Features
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Simple tools to make estimating and RFQs effortless.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, idx) => (
                <a
                  key={idx}
                  href={f.link}
                  className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col group"
                >
                  <div className="mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#033159] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm flex-grow">
                    {f.description}
                  </p>
                </a>
              ))}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
