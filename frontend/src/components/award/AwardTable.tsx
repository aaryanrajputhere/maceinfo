import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";

interface VendorQuote {
  vendorName: string;
  leadTime?: string;
  quotedPrice?: string;
  notes?: string;
  status?: string;
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

  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

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
                                className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center justify-between"
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
                                <div className="text-right flex items-center space-x-4">
                                  <div>
                                    <div className="font-bold text-[#033159]">
                                      {v.quotedPrice
                                        ? `$${v.quotedPrice}`
                                        : "-"}
                                    </div>
                                    {v.notes && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        {v.notes}
                                      </div>
                                    )}
                                  </div>
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
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-gray-900">
                        {v.vendorName}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="font-bold text-[#033159]">
                          {v.quotedPrice ? `$${v.quotedPrice}` : "-"}
                        </div>
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
                    <div className="text-sm text-gray-600">
                      {v.leadTime ? `Lead: ${v.leadTime}` : "Lead: -"}
                    </div>
                    {v.notes && (
                      <div className="mt-2 text-sm text-gray-700">
                        {v.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No vendor quotes</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AwardTable;
