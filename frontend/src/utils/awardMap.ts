/**
 * Converts backend vendor reply data into grouped item structure.
 */
interface VendorReply {
  id: number;
  rfq_id: string;
  reply_id: string;
  item_name: string;
  size?: string;
  unit?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  discount?: number;
  delivery_charge?: number;
  lead_time?: string;
  substitutions?: string;
  notes?: string;
  file_link?: string | null;
  vendor_name: string;
  created_at: string;
  status: string;
  vendor_email: string;
}

interface VendorQuote {
  vendorName: string;
  leadTime?: string;
  quotedPrice?: string;
  notes?: string;
  status?: string;
  replyId?: number | string;
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

interface ItemWithVendors {
  id: number;
  itemName: string;
  requestedPrice?: string;
  quantity?: number;
  unit?: string;
  rawItemName?: string;
  vendors: VendorQuote[];
  
}

/**
 * Converts a flat array of vendor replies into structured items grouped by item_name.
 */
export function transformVendorReplies(
  replies: VendorReply[]
): ItemWithVendors[] {
  const grouped: Record<string, ItemWithVendors> = {};

  for (const reply of replies) {
    // If we haven’t seen this item yet, create a new entry
    if (!grouped[reply.item_name]) {
      grouped[reply.item_name] = {
        id: Object.keys(grouped).length + 1,
        itemName: reply.item_name,
        requestedPrice: reply.total_price?.toFixed(2) ?? undefined,
        quantity: reply.quantity,
        unit: reply.unit,
        vendors: [],
      };
    }

    // Push the vendor info into the item's vendor list
    grouped[reply.item_name].vendors.push({
      vendorName: reply.vendor_name,
      leadTime: reply.lead_time
        ? new Date(reply.lead_time).toLocaleDateString()
        : undefined,
      quotedPrice: reply.unit_price?.toFixed(2),
      notes: reply.notes || undefined,
      status: reply.status,
      replyId: reply.id,
      substitutions: reply.substitutions || undefined,
      deliveryCharge: reply.delivery_charge,
      discount: reply.discount,
      fileLink: reply.file_link || undefined,
      size: reply.size,
      unit: reply.unit,
      quantity: reply.quantity,
      totalPrice: reply.total_price,
      vendorEmail: reply.vendor_email,
    });
    // ensure we keep the raw original item_name (useful when posting back to backend)
    grouped[reply.item_name].rawItemName = reply.item_name;
  }

  return Object.values(grouped);
}

export default transformVendorReplies;
