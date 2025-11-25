// src/controllers/rfq.controller.ts
import { Request, Response } from "express";
import { saveRFQFiles } from "../services/drive.service";
import { generateRFQ } from "../utils/generateRFQ";
import { addRFQToSheet, RFQData } from "../services/sheets.service";
import { sendRFQEmail, rfqAward } from "../services/mail.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Item = {
  id: number;
  Category?: string;
  "Item Name"?: string;
  "Size/Option"?: string;
  Unit?: string;
  Price?: string | number;
  Vendors?: string;
  image?: string;
  Quantity?: string | number;
  selectedVendors?: string[];
  [key: string]: any;
};

export const createQuote = async (req: Request, res: Response) => {
  try {
    // Parse projectInfo and items safely (they may come as JSON strings)
    let projectInfo: any = null;
    let itemsArr: Item[] = [];

    if (req.body.projectInfo) {
      try {
        projectInfo =
          typeof req.body.projectInfo === "string"
            ? JSON.parse(req.body.projectInfo)
            : req.body.projectInfo;
      } catch (err) {
        console.error("❌ Failed to parse projectInfo:", err);
        return res
          .status(400)
          .json({ success: false, message: "Invalid projectInfo JSON" });
      }
    }

    if (req.body.items) {
      try {
        const parsed =
          typeof req.body.items === "string"
            ? JSON.parse(req.body.items)
            : req.body.items;
        if (Array.isArray(parsed)) itemsArr = parsed as Item[];
        else
          return res
            .status(400)
            .json({ success: false, message: "items must be an array" });
      } catch (err) {
        console.error("❌ Failed to parse items:", err);
        return res
          .status(400)
          .json({ success: false, message: "Invalid items JSON" });
      }
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!projectInfo || itemsArr.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: projectInfo or items",
      });
    }

    // Validate required contact fields
    if (
      !projectInfo.requesterName ||
      !projectInfo.requesterEmail ||
      !projectInfo.requesterPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "Contact information (name, email, phone) is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(projectInfo.requesterEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    const rfqId = generateRFQ();
    console.log("-".repeat(100));
    console.log(`RFQ Initiated ${rfqId}`);
    console.log("-".repeat(100));

    console.log("📦 ITEM MAPPING STARTED");
    console.log("-".repeat(50));
    // Map each vendor to their items (keeping original casing as key)
    const vendorItemsMap: Record<string, Item[]> = {};

    itemsArr.forEach((item: Item, itemIndex: number) => {
      console.log(`\n🔹 Processing Item ${itemIndex + 1}:`);
      console.log(`   Item Name: ${item["Item Name"] || "N/A"}`);
      console.log(`   Vendors String: "${item.Vendors || "NONE"}"`);

      // Prefer `selectedVendors` if present, otherwise fall back to `Vendors` string
      let vendorsList: string[] = [];
      if (Array.isArray(item.selectedVendors) && item.selectedVendors.length) {
        vendorsList = item.selectedVendors.map((v) => String(v).trim());
      } else if (item.Vendors && typeof item.Vendors === "string") {
        vendorsList = item.Vendors.split(",").map((v) => v.trim());
      }

      if (vendorsList.length === 0) {
        console.log(`   ⚠️  NO VENDORS ASSIGNED TO THIS ITEM`);
      } else {
        console.log(
          `   Split Vendors: [${vendorsList.map((v) => `"${v}"`).join(", ")}]`
        );
        vendorsList.forEach((vendorRaw, vendorIndex) => {
          const vendor = vendorRaw.trim();
          if (!vendor) {
            console.log(`   ⚠️  Vendor ${vendorIndex + 1}: EMPTY - SKIPPING`);
            return;
          }

          console.log(
            `   ✅ Vendor ${vendorIndex + 1}: "${vendor}" - ADDING ITEM`
          );
          if (!vendorItemsMap[vendor]) vendorItemsMap[vendor] = [];
          vendorItemsMap[vendor].push(item);
        });
      }
    });

    console.log("\n" + "-".repeat(50));
    console.log("📊 VENDOR ITEMS MAP SUMMARY:");
    console.log("-".repeat(50));
    Object.entries(vendorItemsMap).forEach(([vendor, items]) => {
      console.log(`\n👤 Vendor: "${vendor}"`);
      console.log(`   Total Items: ${items.length}`);
      items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item["Item Name"] || "Unnamed Item"}`);
      });
    });
    console.log("-".repeat(50));

    const vendorsArray = Object.keys(vendorItemsMap);
    const vendors_json = vendorsArray.join(", ");
    const items_json_string = JSON.stringify(itemsArr);

    // 1️⃣ Save RFQ files (creates folder + uploads files)
    const { folderLink, fileLinks } = await saveRFQFiles(files || [], `RFQ-${rfqId}`);

    // 2️⃣ Add RFQ metadata to Google Sheet
    const rfqData: RFQData = {
      rfq_id: rfqId,
      created_at: new Date().toISOString(),
      requester_name: projectInfo.requesterName || "",
      requester_email: projectInfo.requesterEmail || "",
      requester_phone: projectInfo.requesterPhone || "",
      project_name: projectInfo.projectName || "",
      project_address: projectInfo.siteAddress || "",
      needed_by: projectInfo.neededBy || "",
      notes: projectInfo.notes || "",
      items_json: items_json_string,
      vendors_json: vendors_json,
      drive_folder_url: folderLink || "",
    };

    // 2️⃣b Add RFQ to Prisma DB
    await prisma.rFQ.create({
      data: {
        rfq_id: rfqId,
        created_at: new Date(),
        requester_name: projectInfo.requesterName || "",
        requester_email: projectInfo.requesterEmail || "",
        requester_phone: String(projectInfo.requesterPhone || ""),
        project_name: projectInfo.projectName || "",
        project_address: projectInfo.siteAddress || "",
        needed_by: projectInfo.neededBy || "",
        notes: projectInfo.notes || "",
        items_json: items_json_string,
        vendors_json: vendors_json,
        drive_folder_url: folderLink || "",
      },
    });

    const sheetResponse = await addRFQToSheet(rfqData);

    // Fetch all vendors from the database
    const vendors = await prisma.vendor.findMany({
      select: {
        name: true,
        email: true,
      },
    });

    // Create lookup object from vendors array (direct and normalized)
    const vendorEmailLookup: Record<string, string> = {};
    const vendorEmailLookupNormalized: Record<string, string> = {};
    vendors.forEach((v) => {
      const emailStr = v.email || "";
      vendorEmailLookup[v.name] = emailStr;
      if (v.name) {
        vendorEmailLookupNormalized[v.name.trim().toLowerCase()] = emailStr;
      }
    });

    console.log("\n" + "=".repeat(100));
    console.log("📧 EMAIL SENDING PROCESS STARTED");
    console.log("=".repeat(100));
    console.log(`Total Vendors to Email: ${vendorsArray.length}`);
    console.log(
      `Vendors: [${vendorsArray.map((v) => `"${v}"`).join(", ")}]`
    );
    console.log("-".repeat(100));

    // Send RFQ emails to each vendor with their items
    let emailsSentCount = 0;
    let emailsSkippedCount = 0;

    for (const vendor of vendorsArray) {
      console.log("\n" + "-".repeat(80));
      console.log(`📨 PROCESSING VENDOR: "${vendor}"`);
      console.log("-".repeat(80));

      // Try direct lookup first, then normalized lookup as a fallback
      let email = vendorEmailLookup[vendor];
      console.log(`   🔍 Direct Lookup: "${vendor}" → ${email || "NOT FOUND"}`);

      if (!email) {
        const normalized = vendor.trim().toLowerCase();
        email = vendorEmailLookupNormalized[normalized];
        console.log(
          `   🔍 Normalized Lookup: "${normalized}" → ${email || "NOT FOUND"}`
        );
      }

      if (!email) {
        console.warn(`   ❌ SKIPPING - No email found for vendor "${vendor}"`);
        console.log(
          `   Available vendors in DB: [${Object.keys(vendorEmailLookup)
            .map((v) => `"${v}"`)
            .join(", ")}]`
        );
        emailsSkippedCount++;
        continue;
      }

      console.log(`   ✅ Email Found: ${email}`);

      // Use the vendorItemsMap we already built
      const vendorItems = vendorItemsMap[vendor] || [];

      console.log(`   📦 Items Selected For ${vendor}: ${vendorItems.length}`);

      try {
        await sendRFQEmail(
          rfqId,
          projectInfo,
          vendorItems,
          { email, name: vendor },
          fileLinks
        );
        emailsSentCount++;
        console.log(`   ✅ Email sent successfully to ${email}`);
      } catch (err) {
        console.error(`   ❌ Error sending email to ${email}:`, err);
        // don't rethrow — continue with next vendor
      }
    }

    console.log("\n" + "=".repeat(100));
    console.log("📊 EMAIL SENDING SUMMARY");
    console.log("=".repeat(100));
    console.log(`✅ Emails Sent: ${emailsSentCount}`);
    console.log(`❌ Emails Skipped: ${emailsSkippedCount}`);
    console.log("=".repeat(100));

    // Send award access email to the requester
    let awardEmailSent = false;
    console.log(
      `🎯 Starting award email process for: ${projectInfo.requesterEmail}`
    );
    try {
      console.log(`📬 Calling rfqAward function...`);
      const result = await rfqAward(projectInfo.requesterEmail, rfqId);
      console.log(`✅ rfqAward result:`, result);
      console.log(
        `Award access email sent to requester: ${projectInfo.requesterEmail}`
      );
      awardEmailSent = true;
    } catch (error) {
      console.error(`❌ Failed to send award email to requester:`, error);
    }

    // 5️⃣ Respond with Drive + Sheet info and email confirmation
    res.status(201).json({
      success: true,
      rfqId,
      folderLink,
      fileLinks,
      sheetUpdated: true,
      sheetResponse,
      emailsSent: emailsSentCount,
      emailsSkipped: emailsSkippedCount,
      awardEmailSent,
    });
  } catch (err: any) {
    console.error("❌ Error creating RFQ:", err);
    res.status(500).json({
      success: false,
      message: err?.message || "Failed to create quote",
    });
  }
};
