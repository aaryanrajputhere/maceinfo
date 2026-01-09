import React, { useState } from "react";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  X,
  Info,
  HelpCircle,
  Calculator,
} from "lucide-react";
import type { Material } from "../../types/materials";
import { addToQuoteWithDeduplication } from "../../utils/quoteUtils";

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({
  content,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Use the Material type for props
const MaterialCard: React.FC<{ material: Material }> = ({ material }) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [quantity, setQuantity] = useState<number | string>(1);
  console.log(material);
  // Vendors is now always string[], deduplicated
  let vendors: string[] = [];
  if (Array.isArray(material.Vendors)) {
    vendors = [...new Set(material.Vendors)];
  } else if (
    typeof material.Vendors === "string" &&
    material.Vendors.length > 0
  ) {
    vendors = [...new Set(material.Vendors.split(",").map((v: string) => v.trim()))];
  }

  const {
    Category,
    "Item Name": name,
    "Size/Option": size,
    Unit: unit,
    Price: price,
    image,
    createdAt,
  } = material;

  console.log("Material image:", image);
  console.log("Full material:", material);

  // Convert Google Drive URL to direct image URL
  const getDirectImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;

    // Check if it's a Google Drive URL
    const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      // Convert to direct image URL format
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
    }

    return url;
  };

  const directImageUrl = getDirectImageUrl(image);

  // Calculate total price
  const calculateTotal = (): number => {
    const priceNum = parseFloat(String(price).replace(/[^0-9.-]/g, "")) || 0;
    return priceNum * Number(quantity);
  };

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setIsPanelOpen(true)}
        className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 max-w-[100vw-32px] mx-auto w-full sm:p-6 lg:p-7 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#033159] focus-visible:ring-offset-2 focus-visible:outline-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        tabIndex={0}
        style={{
          fontSize: "clamp(16px, 1.6vw, 18px)",
        }}
      >
        {/* Image */}
        <div className="mb-6 w-full h-52 flex items-center justify-center rounded-xl overflow-hidden bg-gray-100 relative">
          {true ? (
            <img
              src={directImageUrl}
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"
                }`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
              <Package className="h-16 w-16" />
            </div>
          )}
          <div
            className={`absolute inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
              }`}
          />
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-base font-bold bg-black bg-opacity-60 px-5 py-2 rounded-full">
                Click for details
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-5">
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#033159] to-[#00598F] rounded-full">
              {Category}
            </span>
          </div>

          <h3
            className="font-bold text-gray-900 leading-tight mb-2"
            style={{
              fontSize: "clamp(20px, 2vw, 24px)",
            }}
          >
            {name}
          </h3>
          {size && <p className="text-base text-[#00598F] font-bold">{size}</p>}
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6 text-sm">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700 font-bold">Unit:</span>
            <span className="ml-2 font-bold text-gray-900 text-base">
              {unit}
            </span>
            <Tooltip content="The measurement unit for this material">
              <Info className="h-4 w-4 text-gray-400 ml-2" />
            </Tooltip>
          </div>

          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700 font-bold">Price:</span>
            <span className="ml-2 font-bold text-[#033159] text-lg">
              {price}
            </span>
            <Tooltip content="Price per unit from selected vendor">
              <Info className="h-4 w-4 text-gray-400 ml-2" />
            </Tooltip>
          </div>

          <div className="flex items-start">
            <Users className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 font-bold">
              Vendors ({vendors.length}):
            </span>
            <div className="ml-2 flex items-center">
              <span className="text-gray-900 font-bold">
                {vendors.length > 0 ? (
                  vendors.length <= 2 ? (
                    vendors.join(", ")
                  ) : (
                    `${vendors.slice(0, 2).join(", ")} +${vendors.length - 2}`
                  )
                ) : (
                  <span className="text-gray-500 italic">None available</span>
                )}
              </span>
              <Tooltip content="Available suppliers for this material. Click to see all options.">
                <Info className="h-4 w-4 text-gray-400 ml-2" />
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          className="w-full min-h-[44px] px-6 py-3 sm:py-4 text-base font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#033159] focus-visible:ring-offset-2 bg-gradient-to-r from-[#033159] to-[#00598F] hover:from-[#022244] hover:to-[#004a7a] group-hover:scale-105"
          aria-label="Add to Quote"
          onClick={(e) => {
            e.stopPropagation();
            setIsPanelOpen(true);
          }}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Add to Quote</span>
        </button>
      </div>

      {/* Side Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsPanelOpen(false)}
          ></div>

          {/* Panel */}
          <div className="ml-auto w-full max-w-md bg-white shadow-2xl h-full flex flex-col relative animate-slide-in">
            {/* Header */}
            <div className="p-6 lg:p-8 border-b border-gray-200">
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#033159] focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="Close panel"
                onClick={() => setIsPanelOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex items-center space-x-3">
                <h2
                  className="font-bold text-gray-900"
                  style={{
                    fontSize: "clamp(24px, 2.5vw, 30px)",
                  }}
                >
                  Quote Details
                </h2>
                <Tooltip content="Configure your material requirements and add to quote">
                  <HelpCircle className="h-5 w-5 text-gray-400" />
                </Tooltip>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              {/* Product Image */}
              <div className="w-full h-48 mb-8 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {!imgError && directImageUrl ? (
                  <img
                    src={directImageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-16 w-16 text-gray-400" />
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4 text-base mb-8">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Category:</span>
                  <span className="font-bold text-gray-900">{Category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Material:</span>
                  <span className="font-bold text-gray-900">{name}</span>
                </div>
                {size && (
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Size:</span>
                    <span className="font-bold text-gray-900">{size}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Unit:</span>
                  <span className="font-bold text-gray-900">{unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Price:</span>
                  <span className="font-bold text-[#033159] text-xl">
                    {price}
                  </span>
                </div>
                {createdAt && (
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Added:</span>
                    <span className="font-bold text-gray-600 text-sm">
                      {new Date(createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Vendor List */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-3">
                  <label className="block text-base font-bold text-gray-800">
                    Available Vendors
                  </label>
                  <Tooltip content="All suppliers for this material. Prices may vary between vendors.">
                    <Info className="h-4 w-4 text-gray-400" />
                  </Tooltip>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vendors.length > 0 ? (
                    vendors.map((vendor: string, index: number) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm font-bold text-gray-800"
                      >
                        {vendor}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">
                      No vendors available
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-3">
                  <label className="block text-base font-bold text-gray-800">
                    Quantity
                  </label>
                  <Tooltip content="Specify the number of units you need for your project">
                    <Info className="h-4 w-4 text-gray-400" />
                  </Tooltip>
                </div>
                <div className="flex items-center justify-center space-x-6 bg-gray-50 rounded-xl p-4">
                  <button
                    className="w-12 min-h-[44px] border-2 border-gray-300 rounded-xl text-xl font-bold hover:bg-gray-100 hover:border-[#033159] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#033159] focus-visible:ring-offset-2 transition-all duration-200 text-gray-700"
                    onClick={() =>
                      setQuantity(Math.max(1, Number(quantity) - 1))
                    }
                    aria-label="Decrease quantity"
                    type="button"
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    inputMode="numeric"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || isNaN(Number(val))) {
                        setQuantity(""); // allow empty input
                      } else {
                        setQuantity(Math.max(1, Number(val)));
                      }
                    }}
                    onBlur={() => {
                      if (!quantity || isNaN(Number(quantity))) {
                        setQuantity(1);
                      }
                    }}
                    className="text-2xl font-bold text-gray-900 min-w-[6rem] text-center bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#033159] no-spinner"
                    style={{ width: "7rem" }}
                  />
                  <button
                    className="w-12 min-h-[44px] border-2 border-gray-300 rounded-xl text-xl font-bold hover:bg-gray-100 hover:border-[#033159] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#033159] focus-visible:ring-offset-2 transition-all duration-200 text-gray-700"
                    onClick={() => setQuantity(Number(quantity) + 1)}
                    aria-label="Increase quantity"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="mb-8 bg-gradient-to-r from-[#033159] to-[#00598F] rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calculator className="h-6 w-6" />
                    <span className="text-lg font-bold">Total Price:</span>
                  </div>
                  <span className="text-2xl font-bold">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 text-sm opacity-90">
                  {quantity} × ${price} = ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 lg:p-8 border-t border-gray-200">
              <button
                className="w-full px-6 py-4 min-h-[44px] bg-gradient-to-r from-[#033159] to-[#00598F] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:from-[#022244] hover:to-[#004a7a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#033159] focus-visible:ring-offset-2 flex items-center justify-center space-x-3 text-base"
                onClick={() => {
                  const cleanedPrice = Number(price.toString().replace(/[^0-9.-]/g, ""));

                  const selectedVendorsList = Array.isArray(vendors) ? vendors : [];

                  addToQuoteWithDeduplication({
                    category: Category,
                    name,
                    size,
                    unit,
                    price: cleanedPrice,
                    vendors: selectedVendorsList.join(", "),
                    quantity: Number(quantity),
                    image: material.image || "",
                    selectedVendors: selectedVendorsList,
                  });

                  setIsPanelOpen(false);
                  setShowPopup(true);
                  setTimeout(() => {
                    setShowPopup(false);
                  }, 5000);
                }}
              >
                Add to Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {
        showPopup && (
          <div
            onClick={() => (window.location.href = "/quote")}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 cursor-pointer animate-slide-up"
          >
            <div className="bg-white border border-gray-300 rounded-xl px-6 py-4 shadow-2xl flex items-center space-x-4 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#033159] to-[#00598F] text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-gray-800">
                <p className="font-bold text-[#033159] text-base">
                  Added to Quote
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {quantity} × {name} = ${calculateTotal().toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Click to view quote →
                </p>
              </div>
            </div>
          </div>
        )
      }

      <style>
        {`
    @keyframes slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .animate-slide-up {
      animation: slide-up 0.3s ease-out forwards;
    }

    /* Hide number input spinners for all browsers */
    input.no-spinner::-webkit-outer-spin-button,
    input.no-spinner::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input.no-spinner[type=number] {
      -moz-appearance: textfield;
    }
  `}
      </style>
    </>
  );
};

export default MaterialCard;
