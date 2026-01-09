// controllers/sync.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Readable } from "stream";
import { google } from "googleapis";
import { getGoogleAuth } from "../utils/googleAuth"; // common auth

const drive = google.drive({ version: "v3", auth: getGoogleAuth() });
const prisma = new PrismaClient();

/**
 * Sanitizes material data before saving to DB
 */
function sanitizeMaterialData(row: any) {
  let itemName = String(row.itemName || "").trim();
  let unit = String(row.unit || "").trim().toLowerCase();
  let category = String(row.category || "").trim();
  let size = String(row.size || "").trim();
  let price = parseFloat(row.price) || 0;

  itemName = itemName.replace(/[①②③④⑤⑥⑦⑧⑨⑩]/g, "").trim();


  return {
    itemName,
    unit,
    category,
    size,
    price: parseFloat(price.toFixed(2)), 
  };
}

function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export const syncRFQs = async (req: Request, res: Response) => {
  try {
    const rows = req.body.data; // Expecting array of ARFQ rows from sheet
    console.log("Incoming RFQ rows from sheet:", rows);

    // Delete all rows in RFQ table only
    await prisma.rFQ.deleteMany({});

    for (const row of rows) {
      // Prepare RFQ data with correct types and undefined for optional fields
      const rfqData: any = {
        rfq_id: row["rfq_id"] || "",
        created_at: row["created_at"]
          ? new Date(row["created_at"])
          : new Date(),
        updated_at: row["updated_at"]
          ? new Date(row["updated_at"])
          : new Date(),
        requester_name: row["requester_name"] || "",
        requester_email: row["requester_email"] || "",
        requester_phone:
          row["requester_phone"] !== undefined &&
            row["requester_phone"] !== null
            ? String(row["requester_phone"])
            : "",
        project_name: row["project_name"] || "",
        project_address: row["project_address"] || "",
        items_json:
          typeof row["items_json"] === "string"
            ? row["items_json"]
            : JSON.stringify(row["items_json"] || ""),
        vendors_json:
          typeof row["vendors_json"] === "string"
            ? row["vendors_json"]
            : JSON.stringify(row["vendors_json"] || ""),
      };

      // Optional string fields
      const optionalStringFields = [
        "notes",
        "drive_folder_url",
        "status",
        "email_message_id",
        "awarded_vendor_name",
        "awarded_reply_id",
        "po_number",
        "po_notes",
      ];
      for (const field of optionalStringFields) {
        if (
          row[field] !== undefined &&
          row[field] !== null &&
          row[field] !== ""
        ) {
          rfqData[field] = String(row[field]);
        }
      }
      // Special handling for needed_by (convert Date to string if needed)
      if (
        row["needed_by"] !== undefined &&
        row["needed_by"] !== null &&
        row["needed_by"] !== ""
      ) {
        rfqData["needed_by"] =
          typeof row["needed_by"] === "string"
            ? row["needed_by"]
            : String(row["needed_by"]);
      }

      // Optional number fields
      if (
        row["awarded_total_price"] !== undefined &&
        row["awarded_total_price"] !== null &&
        row["awarded_total_price"] !== ""
      ) {
        rfqData["awarded_total_price"] = parseFloat(row["awarded_total_price"]);
      }
      if (
        row["awarded_lead_time_days"] !== undefined &&
        row["awarded_lead_time_days"] !== null &&
        row["awarded_lead_time_days"] !== ""
      ) {
        rfqData["awarded_lead_time_days"] = parseInt(
          row["awarded_lead_time_days"]
        );
      }

      // Optional date fields
      if (
        row["decision_at"] !== undefined &&
        row["decision_at"] !== null &&
        row["decision_at"] !== ""
      ) {
        rfqData["decision_at"] = new Date(row["decision_at"]);
      }
      if (
        row["po_date"] !== undefined &&
        row["po_date"] !== null &&
        row["po_date"] !== ""
      ) {
        rfqData["po_date"] = new Date(row["po_date"]);
      }

      await prisma.rFQ.create({
        data: rfqData,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
  }
};

import fs from "fs";
import path from "path";

export const syncMaterials = async (req: Request, res: Response) => {
  try {
    const rows = req.body.data;
    console.log("Incoming Material rows:", rows.length);
    console.log("Incoming Material row data:", rows);
    for (const row of rows) {
      let imagePath: string | null = null;

      // If Apps Script sent an image object
      if (row.image && row.image.base64) {
        const buffer = Buffer.from(row.image.base64, "base64");

        const fileName = row.image.fileName || `material_${Date.now()}.png`;
        const savePath = path.join(
          __dirname,
          "..",
          "uploads",
          "materials",
          fileName
        );

        fs.writeFileSync(savePath, buffer);

        // Store relative path in DB
        imagePath = `/uploads/materials/${fileName}`;
      }

      const clean = sanitizeMaterialData(row);

      await prisma.material.upsert({
        where: {
          category_itemName_size_unit_price: {
            category: clean.category,
            itemName: clean.itemName,
            size: clean.size,
            unit: clean.unit,
            price: clean.price,
          },
        },
        update: {
          image: imagePath,
          vendors: row.vendors || null,
        },
        create: {
          category: clean.category,
          itemName: clean.itemName,
          size: clean.size,
          unit: clean.unit,
          price: clean.price,
          image: imagePath,
          vendors: row.vendors || null,
        },
      });
    }

    res.json({ success: true, message: "Materials synced successfully" });
  } catch (err) {
    console.error("Error syncing materials:", err);
    res.status(500).json({ success: false, error: err });
  }
};

export const uploadFileToFolder = async (
  file: Express.Multer.File,
  folderId: string
): Promise<string> => {
  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: [folderId],
    },
    media: {
      mimeType: file.mimetype,
      body: bufferToStream(file.buffer),
    },
    supportsAllDrives: true,
    fields: "id",
  });

  const fileId = response.data.id!;

  // Permissions inherited from folder (Shared Drive)
  const link = `https://drive.google.com/file/d/${fileId}/view`;

  return link;
};

export const syncVendors = async (req: Request, res: Response) => {
  try {
    const rows = req.body.data; // Expecting [{ VendorName, Email, Phone, Notes }, ...]

    if (!rows || rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No vendor data received" });
    }

    // Clear old vendors
    await prisma.vendor.deleteMany({});

    // Insert all vendors
    const inserted = await prisma.vendor.createMany({
      data: rows.map((row: any) => ({
        name: row["Vendor Name"],
        email: row["Email"],
        phone: row["Phone"] || null,
        notes: row["Notes"] || null,
      })),
    });

    return res.json({
      success: true,
      message: `${inserted.count} vendors synced successfully`,
    });
  } catch (error: any) {
    console.error("Error syncing vendors:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
