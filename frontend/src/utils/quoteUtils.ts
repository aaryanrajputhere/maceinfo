import type { Material } from "../types/materials";

export interface QuoteItem {
    id: number;
    category: string;
    name: string;
    size: string;
    unit: string;
    price: number;
    quantity: number;
    vendors: string;
    selectedVendors: string[];
    image: string;
    addedAt: string;
}

export interface AddToQuoteResult {
    isNewItem: boolean;
    totalQuantity: number;
}

/**
 * Normalizes strings for consistent matching (trims and lowercase)
 */
const normalize = (str: string | undefined | null) => str?.toLowerCase().trim() || "";

/**
 * Adds an item to the quote in localStorage with deduplication and catalog matching.
 * If catalog data is provided, it tries to match the item and use official metadata.
 */
export function addToQuoteWithDeduplication(
    item: Partial<QuoteItem> & { name: string; size: string; quantity: number },
    catalog?: Material[]
): AddToQuoteResult {
    try {
        const existing = JSON.parse(localStorage.getItem("quote") || "[]");
        const items: QuoteItem[] = Array.isArray(existing) ? existing : [];

        // 1. Try to find a match in the Catalog first to get official metadata
        let enrichedItem = { ...item };
        if (catalog) {
            const catalogMatch = catalog.find(m =>
                normalize(m["Item Name"]) === normalize(item.name) &&
                normalize(m["Size/Option"]) === normalize(item.size)
            );

            if (catalogMatch) {
                enrichedItem = {
                    ...enrichedItem,
                    category: catalogMatch.Category || item.category || "General",
                    unit: catalogMatch.Unit || item.unit || "",
                    price: parseFloat(catalogMatch.Price) || item.price || 0,
                    vendors: catalogMatch.Vendors || item.vendors || "",
                    image: catalogMatch.image || item.image || "",
                    selectedVendors: catalogMatch.selectedVendors || item.selectedVendors || []
                };
            }
        }

        // 2. Find if this item (by name+size) already exists in the current Quote
        const existingIndex = items.findIndex(
            (i) =>
                normalize(i.name) === normalize(item.name) &&
                normalize(i.size) === normalize(item.size)
        );

        if (existingIndex !== -1) {
            // Item exists, increment quantity
            const existingItem = items[existingIndex];
            existingItem.quantity = (existingItem.quantity || 0) + item.quantity;
            existingItem.addedAt = new Date().toLocaleString();

            // Also take the opportunity to update metadata if we found it in catalog
            if (enrichedItem.vendors) existingItem.vendors = enrichedItem.vendors;
            if (enrichedItem.image) existingItem.image = enrichedItem.image;
            if (enrichedItem.price) existingItem.price = enrichedItem.price;

            localStorage.setItem("quote", JSON.stringify(items));
            window.dispatchEvent(new Event("storage"));

            return { isNewItem: false, totalQuantity: existingItem.quantity };
        } else {
            // New item, ensure all fields are present
            const finalItem: QuoteItem = {
                id: Date.now(),
                category: enrichedItem.category || "General",
                name: enrichedItem.name,
                size: enrichedItem.size,
                unit: enrichedItem.unit || "",
                price: enrichedItem.price || 0,
                quantity: enrichedItem.quantity,
                vendors: enrichedItem.vendors || "",
                selectedVendors: enrichedItem.selectedVendors || [],
                image: enrichedItem.image || "",
                addedAt: new Date().toLocaleString(),
            };

            items.push(finalItem);
            localStorage.setItem("quote", JSON.stringify(items));
            window.dispatchEvent(new Event("storage"));

            return { isNewItem: true, totalQuantity: finalItem.quantity };
        }
    } catch (err) {
        console.error("Failed to save to localStorage:", err);
        return { isNewItem: true, totalQuantity: item.quantity };
    }
}

/**
 * Helper to show feedback on the Add to Quote button
 */
export function showQuoteButtonFeedback(
    buttonSelector: string,
    wasUpdated: boolean,
    originalGradient: string = "bg-gradient-to-r from-[#033159] to-[#00598F]",
    successGradient: string = "bg-gradient-to-r from-green-600 to-green-700"
): void {
    const button = document.querySelector(buttonSelector) as HTMLElement;
    if (button) {
        const originalText = button.textContent;
        button.textContent = wasUpdated ? "Quantity Updated!" : "Added to Quote!";
        // Use a more robust class replacement
        button.classList.remove(...originalGradient.split(' '));
        button.classList.add(...successGradient.split(' '));

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove(...successGradient.split(' '));
            button.classList.add(...originalGradient.split(' '));
        }, 2000);
    }
}
