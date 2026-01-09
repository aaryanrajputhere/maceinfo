// App.tsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Materials from "./pages/materials";
import CalculatorsIndex from "./pages/calculators/index";
import StudCalculator from "./pages/calculators/stud";
import OSBCalculator from "./pages/calculators/osb";
import HousewrapCalculator from "./pages/calculators/housewrap";
import SidingCalculator from "./pages/calculators/siding";
import DrywallCalculator from "./pages/calculators/drywall";
import InsulationCalculator from "./pages/calculators/insulation";
import ConcreteCalculator from "./pages/calculators/concrete";
import RoofingCalculator from "./pages/calculators/roofing";
import DeckCalculator from "./pages/calculators/deck";
import QuoteBuilder from "./pages/quote";
import LandingPage from "./pages/home";
import VendorReplyPage from "./pages/vendor-reply";
import Award from "./pages/award";
const App: React.FC = () => {
  const location = useLocation();

  // Disable number input scroll behavior and negative values
  React.useEffect(() => {
    const handleWheel = () => {
      if (document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "number") {
        if (e.key === "-" || e.key === "e") {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Hide header/footer on vendor-reply route
  const isVendorReply = /^\/vendor-reply\//.test(location.pathname);
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      {!isVendorReply && <Header />}
      {/* Container with consistent padding */}
      <main className="container py-10 space-scale-lg">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/materials" element={<Materials />} />

          {/* Calculator Routes */}
          <Route path="/calculators" element={<CalculatorsIndex />} />
          <Route path="/calculators/studs" element={<StudCalculator />} />
          <Route path="/calculators/osb" element={<OSBCalculator />} />
          <Route path="/calculators/housewrap" element={<HousewrapCalculator />} />
          <Route path="/calculators/siding" element={<SidingCalculator />} />
          <Route path="/calculators/drywall" element={<DrywallCalculator />} />
          <Route path="/calculators/insulation" element={<InsulationCalculator />} />
          <Route path="/calculators/concrete" element={<ConcreteCalculator />} />
          <Route path="/calculators/roofing" element={<RoofingCalculator />} />
          <Route path="/calculators/deck" element={<DeckCalculator />} />

          <Route path="/quote" element={<QuoteBuilder />} />
          <Route
            path="/vendor-reply/:rfqId/:token"
            element={<VendorReplyPage />}
          />
          <Route path="/award/:rfq_id/:token" element={<Award />} />
        </Routes>
      </main>
      {!isVendorReply && <Footer />}
    </div>
  );
};

export default App;
