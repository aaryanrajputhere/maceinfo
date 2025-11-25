import React, { useEffect, useState } from "react";
import {
  Package,
  X,
  FileText,
  Tag,
  Clock,
  MessageSquare,
  DollarSign,
} from "lucide-react";

interface VendorQuote {
  vendorName: string;
  leadTime?: string;
  quotedPrice?: string;
  notes?: string;
  status?: string;
  substitutions?: string;
  deliveryCharge?: number;
  discount?: number;
  fileLink?: string;
  size?: string;
  unit?: string;
  quantity?: number;
  totalPrice?: number;
  vendorEmail?: string;
}

interface ItemWithQuotes {
  id: number | string;
  itemName: string;
  requestedPrice?: string;
  quantity?: number | string;
  unit?: string;
  vendors: VendorQuote[];
}

interface AwardTableProps {
  items: ItemWithQuotes[];
  onAward?: (itemId: number | string, vendorName: string) => void;
}

const AwardTable: React.FC<AwardTableProps> = ({ items, onAward }) => {
  // keep a local copy so we can optimistically update UI (mark Awarded)
  const [localItems, setLocalItems] = useState<ItemWithQuotes[]>(items || []);
  const [selectedVendor, setSelectedVendor] = useState<{
    vendor: VendorQuote;
    item: ItemWithQuotes;
  } | null>(null);

  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  const openVendorDetails = (vendor: VendorQuote, item: ItemWithQuotes) => {
    setSelectedVendor({ vendor, item });
  };

  const closeVendorDetails = () => {
    setSelectedVendor(null);
  };

  if (!localItems || localItems.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <Package className="h-16 w-16 mx-auto mb-6 text-gray-400" />
        <p className="text-xl font-bold mb-3 text-gray-800">No items found</p>
        <p className="text-base text-gray-700">No award data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="table-container shadow rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[1000px]">
              <thead className="bg-gradient-to-r from-[#033159] to-[#00598F] text-white">
                <tr>
                  <th className="text-left py-5 px-3 font-bold text-sm w-[22%]">
                    Item
                  </th>
                  <th className="text-left py-5 px-3 font-bold text-sm w-[12%]">
                    Requested Price
                  </th>
                  <th className="text-left py-5 px-3 font-bold text-sm w-[10%]">
                    Unit
                  </th>
                  <th className="text-left py-5 px-3 font-bold text-sm w-[8%]">
                    Qty
                  </th>
                  <th className="text-left py-5 px-3 font-bold text-sm w-[46%]">
                    Vendor Quotes
                  </th>
                </tr>
              </thead>
              <tbody>
                {localItems.map((it) => (
                  <React.Fragment key={it.id}>
                    <tr className="bg-white border-b border-gray-100">
                      <td className="py-6 px-3 align-top">
                        <div className="font-bold text-gray-900">
                          {it.itemName}
                        </div>
                      </td>
                      <td className="py-6 px-3 align-top">
                        <div className="text-gray-900 font-medium">
                          {it.requestedPrice || "-"}
                        </div>
                      </td>
                      <td className="py-6 px-3 align-top">
                        <div className="text-gray-700">{it.unit || "-"}</div>
                      </td>
                      <td className="py-6 px-3 align-top">
                        <div className="text-gray-700">
                          {it.quantity ?? "-"}
                        </div>
                      </td>
                      <td className="py-6 px-3 align-top">
                        {/* Nested vendor rows */}
                        <div className="space-y-3">
                          {it.vendors && it.vendors.length > 0 ? (
                            it.vendors.map((v, i) => (
                              <div
                                key={`${it.id}-vendor-${i}`}
                                className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => openVendorDetails(v, it)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="font-bold text-gray-900">
                                    {v.vendorName}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {v.leadTime
                                      ? `Lead: ${v.leadTime}`
                                      : "Lead: -"}
                                  </div>
                                </div>
                                <div className="text-right flex items-center space-x-2">
                                  <div>
                                    <div className="font-bold text-[#033159]">
                                      {v.quotedPrice
                                        ? `$${v.quotedPrice}`
                                        : "-"}
                                    </div>
                                    {v.notes && (
                                      <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                                        {v.notes}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openVendorDetails(v, it);
                                    }}
                                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-semibold transition"
                                  >
                                    View Details
                                  </button>
                                  <div>
                                    {(() => {
                                      const isAwarded = v.status === "awarded";
                                      // base styles (no bg color here)
                                      const btnBase =
                                        "ml-2 inline-flex items-center px-3 py-2 text-white rounded-lg text-sm font-semibold transition";
                                      // color depends solely on status
                                      const btnColor = isAwarded
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-blue-600 hover:bg-blue-700";
                                      const isDisabled = isAwarded;
                                      const disabledClass = isDisabled
                                        ? "opacity-80 cursor-not-allowed"
                                        : "cursor-pointer";

                                      const handleAwardClick = async () => {
                                        if (isDisabled) return;
                                        // Optimistically update local state so UI updates instantly
                                        setLocalItems((prev) =>
                                          prev.map((p) => {
                                            if (p.id !== it.id) return p;
                                            return {
                                              ...p,
                                              vendors: p.vendors.map((vv) =>
                                                vv.vendorName === v.vendorName
                                                  ? { ...vv, status: "awarded" }
                                                  : vv
                                              ),
                                            };
                                          })
                                        );

                                        try {
                                          // call external handler (e.g. API) if provided
                                          const result = onAward
                                            ? (onAward as any)(
                                                it.id,
                                                v.vendorName
                                              )
                                            : undefined;

                                          // if the handler returns a promise, await it
                                          if (
                                            result &&
                                            typeof (result as any).then ===
                                              "function"
                                          ) {
                                            await result;
                                          }
                                        } catch (err) {
                                          console.error(
                                            "Error in onAward:",
                                            err
                                          );
                                        } finally {
                                          // reload the page so the parent can refresh data from server
                                          // small delay gives a tiny UX moment for the optimistic change to show
                                          setTimeout(
                                            () => window.location.reload(),
                                            600
                                          );
                                        }
                                      };

                                      return (
                                        <button
                                          onClick={handleAwardClick}
                                          className={`${btnBase} ${btnColor} ${disabledClass}`}
                                          disabled={isDisabled}
                                        >
                                          {isAwarded ? "Awarded" : "Award"}
                                        </button>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">
                              No vendor quotes
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-6">
        {localItems.map((it) => (
          <div
            key={it.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-gray-900 text-lg">
                  {it.itemName}
                </div>
                <div className="text-sm text-gray-600">
                  Requested: {it.requestedPrice || "-"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {it.quantity ?? "-"} {it.unit || ""}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {it.vendors && it.vendors.length > 0 ? (
                it.vendors.map((v, i) => (
                  <div
                    key={`${it.id}-mob-v-${i}`}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => openVendorDetails(v, it)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-gray-900">
                        {v.vendorName}
                      </div>
                      <div className="font-bold text-[#033159]">
                        {v.quotedPrice ? `$${v.quotedPrice}` : "-"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {v.leadTime ? `Lead: ${v.leadTime}` : "Lead: -"}
                    </div>
                    {v.notes && (
                      <div className="mb-3 text-sm text-gray-700 line-clamp-2">
                        {v.notes}
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openVendorDetails(v, it);
                        }}
                        className="flex-1 px-2 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-semibold transition"
                      >
                        View Details
                      </button>
                      {(() => {
                          const isAwarded = v.status === "awarded";
                          const btnBase =
                            "ml-2 inline-flex items-center px-3 py-2 text-white rounded-lg text-sm font-semibold transition";
                          const btnColor = isAwarded
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700";
                          const isDisabled = isAwarded;
                          const disabledClass = isDisabled
                            ? "opacity-80 cursor-not-allowed"
                            : "cursor-pointer";

                          const handleAwardClick = async () => {
                            if (isDisabled) return;
                            setLocalItems((prev) =>
                              prev.map((p) => {
                                if (p.id !== it.id) return p;
                                return {
                                  ...p,
                                  vendors: p.vendors.map((vv) =>
                                    vv.vendorName === v.vendorName
                                      ? { ...vv, status: "awarded" }
                                      : vv
                                  ),
                                };
                              })
                            );

                            try {
                              const result = onAward
                                ? (onAward as any)(it.id, v.vendorName)
                                : undefined;
                              if (
                                result &&
                                typeof (result as any).then === "function"
                              ) {
                                await result;
                              }
                            } catch (err) {
                              console.error("Error in onAward:", err);
                            } finally {
                              setTimeout(() => window.location.reload(), 600);
                            }
                          };

                          return (
                            <button
                              onClick={handleAwardClick}
                              className={`${btnBase} ${btnColor} ${disabledClass}`}
                              disabled={isDisabled}
                            >
                              {isAwarded ? "Awarded" : "Award"}
                            </button>
                          );
                        })()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No vendor quotes</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Side Panel for Vendor Details */}
      {selectedVendor && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity"
            onClick={closeVendorDetails}
          />

          {/* Side Panel */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-[9999] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#033159] to-[#00598F] text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedVendor.vendor.vendorName}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  Quote Details for {selectedVendor.item.itemName}
                </p>
              </div>
              <button
                onClick={closeVendorDetails}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Item Information */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-[#033159]" />
                  Item Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">
                      Item Name:
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {selectedVendor.item.itemName}
                    </span>
                  </div>
                  {selectedVendor.vendor.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        Size/Option:
                      </span>
                      <span className="text-gray-900">
                        {selectedVendor.vendor.size}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Unit:</span>
                    <span className="text-gray-900">
                      {selectedVendor.vendor.unit ||
                        selectedVendor.item.unit ||
                        "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Quantity:</span>
                    <span className="text-gray-900">
                      {selectedVendor.vendor.quantity ||
                        selectedVendor.item.quantity ||
                        "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-[#033159]" />
                  Pricing Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">
                      Unit Price:
                    </span>
                    <span className="text-[#033159] font-bold text-lg">
                      ${selectedVendor.vendor.quotedPrice || "-"}
                    </span>
                  </div>
                  {selectedVendor.vendor.totalPrice !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        Total Price:
                      </span>
                      <span className="text-[#033159] font-bold text-lg">
                        ${selectedVendor.vendor.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedVendor.vendor.discount !== undefined &&
                    selectedVendor.vendor.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Discount:
                        </span>
                        <span className="text-green-600 font-semibold">
                          -${selectedVendor.vendor.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  {selectedVendor.vendor.deliveryCharge !== undefined &&
                    selectedVendor.vendor.deliveryCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Delivery Charge:
                        </span>
                        <span className="text-gray-900 font-semibold">
                          +${selectedVendor.vendor.deliveryCharge.toFixed(2)}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Lead Time */}
              {selectedVendor.vendor.leadTime && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-[#033159]" />
                    Lead Time
                  </h3>
                  <p className="text-gray-900 font-semibold">
                    {selectedVendor.vendor.leadTime}
                  </p>
                </div>
              )}

              {/* Substitutions */}
              {selectedVendor.vendor.substitutions && (
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-[#033159]" />
                    Substituted Material
                  </h3>
                  <p className="text-gray-900">
                    {selectedVendor.vendor.substitutions}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedVendor.vendor.notes && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-[#033159]" />
                    Vendor Notes
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedVendor.vendor.notes}
                  </p>
                </div>
              )}

              {/* File Uploads */}
              {selectedVendor.vendor.fileLink && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-[#033159]" />
                    Attached Files
                  </h3>
                  {selectedVendor.vendor.fileLink
                    .split(",")
                    .map((link, idx) => (
                      <a
                        key={idx}
                        href={link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 mb-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-3 text-[#033159]" />
                            <span className="text-gray-900 font-medium">
                              File {idx + 1}
                            </span>
                          </div>
                          <span className="text-blue-600 text-sm font-semibold">
                            View File →
                          </span>
                        </div>
                      </a>
                    ))}
                </div>
              )}

              {/* Vendor Contact */}
              {selectedVendor.vendor.vendorEmail && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <a
                        href={`mailto:${selectedVendor.vendor.vendorEmail}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {selectedVendor.vendor.vendorEmail}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Award Button */}
              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200">
                {(() => {
                  const isAwarded = selectedVendor.vendor.status === "awarded";
                  const btnBase =
                    "w-full py-4 text-white rounded-lg text-lg font-bold transition shadow-lg";
                  const btnColor = isAwarded
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700";
                  const isDisabled = isAwarded;

                  const handleAwardClick = async () => {
                    if (isDisabled) return;

                    setLocalItems((prev) =>
                      prev.map((p) => {
                        if (p.id !== selectedVendor.item.id) return p;
                        return {
                          ...p,
                          vendors: p.vendors.map((vv) =>
                            vv.vendorName === selectedVendor.vendor.vendorName
                              ? { ...vv, status: "awarded" }
                              : vv
                          ),
                        };
                      })
                    );

                    try {
                      const result = onAward
                        ? (onAward as any)(
                            selectedVendor.item.id,
                            selectedVendor.vendor.vendorName
                          )
                        : undefined;

                      if (
                        result &&
                        typeof (result as any).then === "function"
                      ) {
                        await result;
                      }
                    } catch (err) {
                      console.error("Error in onAward:", err);
                    } finally {
                      setTimeout(() => window.location.reload(), 600);
                    }
                  };

                  return (
                    <button
                      onClick={handleAwardClick}
                      className={`${btnBase} ${btnColor}`}
                      disabled={isDisabled}
                    >
                      {isAwarded ? "✓ Awarded" : "Award This Vendor"}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AwardTable;
