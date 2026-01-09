import { Package, Plus, Trash2, HelpCircle } from "lucide-react";
import type { Material } from "../../types/materials";
import Tooltip from "./Tooltip";
import { useNavigate } from "react-router-dom";

interface QuoteItemsTableProps {
  items: Material[];
  onUpdateItem: (
    index: number,
    field: keyof Material | string,
    value: any
  ) => void;
  onDeleteItem: (index: number) => void;
  calculateItemTotal: (price: string, quantity: string) => number;
  calculateGrandTotal: () => number;
}

const QuoteItemsTable: React.FC<QuoteItemsTableProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  calculateItemTotal,
  calculateGrandTotal,
}) => {
  const navigate = useNavigate();

  const handleAddItem = () => {
    navigate("/materials");
  };
  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Package className="h-6 w-6 text-gray-500 mr-3" />
            Quote Items
          </h2>
          <Tooltip text="Add materials and products you need quotes for. Items from calculators will appear here automatically.">
            <HelpCircle className="h-4 w-4 text-gray-500" />
          </Tooltip>
        </div>
        <button
          onClick={handleAddItem}
          className="px-6 py-3 bg-gradient-to-r from-[#033159] to-[#00598F] text-white rounded-xl hover:from-[#022244] hover:to-[#004a7a] transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Package className="h-16 w-16 mx-auto mb-6 text-gray-400" />
          <p className="text-xl font-bold mb-3 text-gray-800">
            No items added yet
          </p>
          <p className="text-base text-gray-700">
            Add items from calculators or create custom items
          </p>
        </div>
      ) : (
        <>
          <div className="table-container shadow rounded-xl">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`border border-gray-200 rounded-2xl p-6 hover:bg-blue-50 transition-colors duration-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left side - Item details */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item["Item Name"] || "N/A"}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">
                          Unit: {item.Unit || "N/A"}
                        </span>
                        <span className="hidden sm:block">•</span>
                        <span className="font-medium">
                          Size/Option: {item["Size/Option"] || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Center - Price and Quantity */}
                    <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 items-start sm:items-center">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 font-medium">
                          Price
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {item.Price
                            ? `$${parseFloat(String(item.Price)).toFixed(2)}`
                            : "N/A"}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-500 font-medium">
                          Quantity
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {item.Quantity || "1"}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-500 font-medium">
                          Total
                        </div>
                        <div className="text-lg font-bold text-[#033159]">
                          $
                          {calculateItemTotal(
                            item.Price,
                            item.Quantity || "1"
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Vendors and Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Vendors */}
                      <div className="lg:min-w-[200px]">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Vendors
                        </div>
                        <div className="flex flex-col gap-2">
                          {typeof item.Vendors === "string" &&
                            item.Vendors.trim() ? (
                            item.Vendors.split(",").map(
                              (vendor: string, vIdx: number) => {
                                const trimmedVendor = vendor.trim();

                                // Check if vendor exists in localStorage selectedVendors array
                                const quoteArr = JSON.parse(
                                  localStorage.getItem("quote") || "[]"
                                );
                                const storedItem = quoteArr.find(
                                  (q: any) => String(q.id) === String(item.id)
                                );
                                const storedSelectedVendors =
                                  storedItem?.selectedVendors;

                                // Use stored selectedVendors or fallback to item.selectedVendors
                                const selectedVendors = Array.isArray(
                                  storedSelectedVendors
                                )
                                  ? storedSelectedVendors
                                  : item.selectedVendors;

                                const selected = Array.isArray(selectedVendors)
                                  ? selectedVendors.includes(trimmedVendor)
                                  : false;
                                const itemId = String(item.id);
                                return (
                                  <label
                                    key={vIdx}
                                    className="flex items-center space-x-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      className="rounded border-gray-300 text-[#033159] focus:ring-[#033159] h-4 w-4"
                                      checked={selected}
                                      onChange={(e) => {
                                        // Get the current quote from localStorage
                                        const quoteArr = JSON.parse(
                                          localStorage.getItem("quote") || "[]"
                                        );
                                        // Find the item with this itemId
                                        const itemIndex = quoteArr.findIndex(
                                          (q: any) => String(q.id) === itemId
                                        );
                                        if (itemIndex === -1) return;
                                        let updatedVendors: string[] =
                                          Array.isArray(
                                            quoteArr[itemIndex].selectedVendors
                                          )
                                            ? [
                                              ...quoteArr[itemIndex]
                                                .selectedVendors,
                                            ]
                                            : [];
                                        if (e.target.checked) {
                                          if (
                                            !updatedVendors.includes(
                                              trimmedVendor
                                            )
                                          ) {
                                            updatedVendors.push(trimmedVendor);
                                          }
                                        } else {
                                          updatedVendors =
                                            updatedVendors.filter(
                                              (v) => v !== trimmedVendor
                                            );
                                        }
                                        // Update in-memory state
                                        onUpdateItem(
                                          index,
                                          "selectedVendors",
                                          updatedVendors
                                        );
                                        // Update localStorage
                                        quoteArr[itemIndex].selectedVendors =
                                          updatedVendors;
                                        localStorage.setItem(
                                          "quote",
                                          JSON.stringify(quoteArr)
                                        );
                                      }}
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                      {trimmedVendor}
                                    </span>
                                  </label>
                                );
                              }
                            )
                          ) : (
                            <span className="text-sm text-gray-500 italic">
                              No vendors available
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end lg:justify-center">
                        <Tooltip text="Delete this item">
                          <button
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300"
                            aria-label={`Remove ${item["Item Name"]}`}
                            onClick={() => onDeleteItem(index)}
                          >
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total */}
          <div className="mt-6 flex justify-end">
            <div className="bg-gradient-to-r from-[#033159] to-[#00598F] text-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold">Grand Total:</span>
                <span className="text-2xl font-bold">
                  ${calculateGrandTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuoteItemsTable;
