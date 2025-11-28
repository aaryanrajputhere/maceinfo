import { addVendorReplyToSheet } from "../services/sheets.service";
import { saveVendorReplyFiles } from "../services/drive.service";
import { sendReplyConfirmation } from "../services/mail.service";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SECRET = process.env.JWT_SECRET || "supersecret";

interface VendorReplyToken {
  vendorName: string;
  vendorEmail: string;
  rfqId: string;
}

export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      select: { name: true, email: true, phone: true, notes: true },
    });
    return res.json({ success: true, vendors });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch vendors" });
  }
};

export const createVendor = async (req: Request, res: Response) => {
  const { name, email, phone, notes } = req.body;
  try {
    const newVendor = await prisma.vendor.create({
      data: { name, email, phone, notes },
    });
    return res.status(201).json({ success: true, vendor: newVendor });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create vendor" });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    await prisma.vendor.delete({
      where: { name: name },
    });
    return res.json({ success: true, message: "Vendor deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete vendor" });
  }
};

export const getItems = async (req: Request, res: Response) => {
  const { rfqId, token } = req.params;
  console.log(`🔍 getItems called for rfqId: ${rfqId}`);
  try {
    // Validate token
    const decoded = jwt.verify(token, SECRET) as VendorReplyToken;
    if (decoded.rfqId !== rfqId) {
      return res.status(403).json({ error: "Invalid RFQ link" });
    }
    const vendorName = decoded.vendorName;
    // Fetch RFQ record
    const rfq = await prisma.rFQ.findUnique({
      where: { rfq_id: rfqId },
    });
    if (!rfq) {
      return res.status(404).json({ error: "RFQ not found" });
    }

    // Parse items_json
    let items: any[] = [];
    try {
      items = JSON.parse(rfq.items_json);
    } catch {
      return res.status(500).json({ error: "Invalid items_json format" });
    }
    console.log("Vendor Identified:", vendorName);
    const vendorItemsMap: Record<string, any[]> = {};
    items.forEach((item: any) => {
      if (item.Vendors) {
        item.Vendors.split(",")
          .map((v: string) => v.trim())
          .forEach((vendor: string) => {
            if (!vendorItemsMap[vendor]) vendorItemsMap[vendor] = [];
            vendorItemsMap[vendor].push(item);
          });
      }
    });

    // Prepare vendor list as a string
    let itemsForVendor = (vendorItemsMap[vendorName] || []).filter(
      (item: any) =>
        Array.isArray(item.selectedVendors) &&
        item.selectedVendors.includes(vendorName)
    );
    itemsForVendor = itemsForVendor.map(({ selectedVendors, ...rest }) => rest);

    return res.json({ success: true, items: itemsForVendor });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const handleVendorReply = async (req: Request, res: Response) => {
  const { rfqId, token } = req.params;

  // Parse JSON data from FormData
  let itemReplies: any[] = [];
  try {
    itemReplies = req.body.itemReplies ? JSON.parse(req.body.itemReplies) : [];
  } catch (parseErr) {
    console.error("Error parsing itemReplies:", parseErr);
    return res.status(400).json({ error: "Invalid itemReplies format" });
  }

  const deliveryCharges = req.body.deliveryCharges || "";
  const discount = req.body.discount || "";
  const summaryNotes = req.body.summaryNotes || "";

  // Handle uploaded files
  const files = (req.files as Express.Multer.File[]) || [];

  try {
    const decoded = jwt.verify(token, SECRET) as VendorReplyToken;

    if (decoded.rfqId !== rfqId) {
      return res.status(403).json({ error: "Invalid RFQ link" });
    }

    // Fetch vendor details from Prisma using email (not unique, so use findFirst)
    const vendor = await prisma.vendor.findFirst({
      where: { email: decoded.vendorEmail },
      select: { name: true, email: true, phone: true },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    // Generate unique reply ID
    const replyId = `${rfqId}-${vendor.email}-${Date.now()}`;

    console.log("Vendor Reply Received:", {
      rfqId,
      replyId,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      vendorPhone: vendor.phone,
      deliveryCharges,
      discount,
      summaryNotes,
    });

    // Process files if any exist
    let driveLinks: { [itemId: string]: string[] } = {};
    let replyFolderLink = "";
    console.log("Parsed itemReplies:", itemReplies);
    console.log("Received files:", files);

    // Extract files and map them to items for drive upload
    const itemFiles: { [itemName: string]: Express.Multer.File[] } = {};
    if (files && files.length > 0) {
      // Group files by item index based on field names like 'files_0', 'files_1', etc.
      files.forEach((file) => {
        if (file.fieldname && file.fieldname.startsWith("files_")) {
          const itemIndex = parseInt(file.fieldname.split("_")[1]);
          const itemName =
            itemReplies[itemIndex]?.itemName || `item-${itemIndex}`;

          if (!itemFiles[itemName]) {
            itemFiles[itemName] = [];
          }
          itemFiles[itemName].push(file);
        }
      });
    }

    // Upload files to Google Drive if any exist
    if (Object.keys(itemFiles).length > 0) {
      try {
        const driveResult = await saveVendorReplyFiles(replyId, itemFiles);
        driveLinks = driveResult.itemFileLinks;
        replyFolderLink = driveResult.replyFolderLink;
        console.log("Files uploaded to Drive:", driveResult);
      } catch (driveErr) {
        console.error("Failed to upload files to Drive:", driveErr);
        // Continue without files rather than failing completely
      }
    }

    // Consolidate all item replies into a single JSON structure
    if (itemReplies && itemReplies.length > 0) {
      try {
        // Get original items data to merge with vendor replies
        const rfq = await prisma.rFQ.findUnique({
          where: { rfq_id: rfqId },
        });

        let originalItems: any[] = [];
        if (rfq) {
          try {
            originalItems = JSON.parse(rfq.items_json);
          } catch {
            console.error("Failed to parse original items JSON");
          }
        }

        // Create consolidated items JSON with vendor responses
        const consolidatedItems = itemReplies.map((itemReply, index) => {
          // Match original item by name instead of index
          const originalItem =
            originalItems.find(
              (item: any) => item["Item Name"] === itemReply.itemName
            ) ||
            originalItems[index] ||
            {};

          return {
            name:
              originalItem["Item Name"] ||
              itemReply.itemName ||
              `Item ${index + 1}`,
            size: originalItem["Size/Option"] || "",
            unit: originalItem["Unit"] || "",
            qtyRequested: originalItem["Quantity"] || "",
            unitPrice: itemReply.pricing || "",
            leadTime: itemReply.leadTime || "",
            substitutions: itemReply.substitutions || "",
            notes: itemReply.notes || "",
          };
        });

        // Calculate totals
        const totalPrice = itemReplies.reduce((sum, item, index) => {
          const price = parseFloat(item.pricing || "0");
          const quantity = parseFloat(
            originalItems[index]?.["Quantity"] || "0"
          );
          return sum + (isNaN(price) || isNaN(quantity) ? 0 : price * quantity);
        }, 0);

        const deliveryChargesNum = parseFloat(deliveryCharges || "0");
        const discountNum = parseFloat(discount || "0");
        const finalTotal = totalPrice + deliveryChargesNum - discountNum;

        console.log("Delivery Charges:", deliveryChargesNum);
        console.log("Discount:", discountNum);
        console.log("Final Total:", finalTotal);
        console.log("Summary Notes to be saved:", summaryNotes);

        // Add single consolidated entry to sheet
        await addVendorReplyToSheet({
          rfq_id: rfqId,
          reply_id: replyId,
          submitted_at: new Date().toISOString(),
          vendor_name: vendor.name,
          vendor_phone: vendor.phone || "",
          prices_text: JSON.stringify(consolidatedItems, null, 2),
          price_subtotal: totalPrice.toFixed(2),
          discount: discountNum.toFixed(2),
          delivery_charges: deliveryChargesNum.toFixed(2),
          taxes: "",
          total_price: finalTotal.toFixed(2),
          lead_time_days: "",
          delivery_date: "",
          notes: summaryNotes || "",
          substitutions: "", // Consolidated in prices_text
          file_link: replyFolderLink,
          review_status: "",
          decided_at: "",
          vendor_email: vendor.email || "",
        });
        // Also persist each item reply in the VendorReplyItem model (Prisma)
        try {
          const vendorReplyItems = itemReplies.map(
            (itemReply: any, index: number) => {
              // Match original item by name instead of index
              const originalItem =
                originalItems.find(
                  (item: any) => item["Item Name"] === itemReply.itemName
                ) ||
                originalItems[index] ||
                {};

              const itemName =
                itemReply.itemName ||
                originalItem["Item Name"] ||
                `Item ${index + 1}`;
              const quantity = parseInt(originalItem["Quantity"] || "0") || 0;
              const unitPrice = parseFloat(itemReply.pricing || "0") || 0;
              const totalPrice = +(unitPrice * quantity);

              // file links for this item (if uploaded) - use itemName as key
              const fileLinksForItem =
                driveLinks[itemName] || driveLinks[`item-${index}`] || [];

              return {
                rfq_id: rfqId,
                reply_id: replyId,
                vendor_email: vendor.email || "",
                item_name: itemName,
                size: originalItem["Size/Option"] || "",
                unit: originalItem["Unit"] || "",
                quantity: quantity,
                unit_price: unitPrice,
                total_price: totalPrice,
                discount: isNaN(discountNum) ? undefined : discountNum,
                delivery_charge: isNaN(deliveryChargesNum)
                  ? undefined
                  : deliveryChargesNum,
                leadTime: itemReply.leadTime ? new Date(itemReply.leadTime) : new Date(),
                substitutions: itemReply.substitutions || "",
                notes: itemReply.notes || "",
                file_link:
                  fileLinksForItem.length > 0
                    ? fileLinksForItem.join(",")
                    : null,
                vendor_name: vendor.name,
              };
            }
          );

          // Use createMany for bulk insert (skips duplicates by default in older prisma, ensure model exists)
          await prisma.vendorReplyItem.createMany({ data: vendorReplyItems });
          console.log(
            `Inserted ${vendorReplyItems.length} VendorReplyItem records for reply ${replyId}`
          );
        } catch (dbErr) {
          console.error("Failed to persist VendorReplyItem records:", dbErr);
        }
      } catch (sheetErr) {
        console.error(
          "Failed to add consolidated vendor reply to sheet:",
          sheetErr
        );
      }
    } else {
      // Fallback: add a single entry if no itemReplies provided (backward compatibility)
      try {
        await addVendorReplyToSheet({
          rfq_id: rfqId,
          reply_id: replyId,
          submitted_at: new Date().toISOString(),
          vendor_name: vendor.name,
          vendor_email: vendor.email || "",
          vendor_phone: vendor.phone || "",
          prices_text: "",
          lead_time_days: "",
          notes: summaryNotes || "",
          price_subtotal: deliveryCharges || "",
          taxes: discount || "",
          total_price: "",
        });
      } catch (sheetErr) {
        console.error("Failed to add vendor reply to sheet:", sheetErr);
      }
    }

    // Send confirmation email to vendor
    let confirmationEmailSent = false;
    try {
      await sendReplyConfirmation(vendor.email || "", rfqId, replyId);
      console.log(`Confirmation email sent to vendor: ${vendor.email}`);
      confirmationEmailSent = true;
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
      // Don't fail the reply submission if email fails
    }

    return res.status(200).json({
      message: "Reply submitted successfully",
      vendor: {
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
      },
      replyId,
      itemsProcessed: itemReplies?.length || 0,
      filesUploaded: Object.values(driveLinks).flat().length,
      replyFolderLink,
      consolidatedReply: true, // Indicates this is a single consolidated entry
      confirmationEmailSent,
    });
  } catch (err) {
    console.error("Error in handleVendorReply:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
