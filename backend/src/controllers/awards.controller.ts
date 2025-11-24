import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  userAwardNotification,
  vendorAwardNotification,
} from "../services/mail.service";

const prisma = new PrismaClient();
interface VendorReplyToken {
  email: string;
  rfqId?: string;
}

interface VendorReplyParams {
  rfq_id: string;
  token: string;
}

export const getVendorReplyItems = async (
  req: Request<VendorReplyParams>,
  res: Response
) => {
  const { rfq_id, token } = req.params;
  console.log(`[getVendorReplyItems] Called for rfq_id=${rfq_id}`);

  try {
    const secret = process.env.SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error("[getVendorReplyItems] JWT secret not configured.");
      return res
        .status(500)
        .json({ success: false, error: "Server configuration error" });
    }

    console.log(
      "[getVendorReplyItems] Verifying token (truncated):",
      token?.slice?.(0, 16)
    );

    const decoded = jwt.verify(token, secret) as VendorReplyToken;
    const tokenEmail = decoded.email;
    const tokenRfqId =
      decoded.rfqId || (decoded as any).rfq_id || (decoded as any).rfqId;

    console.log("[getVendorReplyItems] Decoded token:", {
      tokenEmail,
      tokenRfqId,
    });

    // Validate decoded data
    if (!tokenEmail) {
      console.warn("[getVendorReplyItems] Token missing email.");
      return res
        .status(400)
        .json({ success: false, error: "Invalid token: missing email" });
    }

    if (!tokenRfqId) {
      console.warn("[getVendorReplyItems] Token missing RFQ ID.");
      return res
        .status(400)
        .json({ success: false, error: "Invalid token: missing RFQ ID" });
    }

    // Fetch vendor replies associated with this RFQ
    const vendorReplies = await prisma.vendorReplyItem.findMany({
      where: { rfq_id: tokenRfqId },
    });

    console.log(
      `[getVendorReplyItems] Found ${vendorReplies.length} reply items for RFQ ${tokenRfqId}.`
    );

    return res.status(200).json({
      success: true,
      data: vendorReplies,
    });
  } catch (error: any) {
    console.error("[getVendorReplyItems] Error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const awardItem = async (
  req: Request<VendorReplyParams>,
  res: Response
) => {
  const { rfq_id, token } = req.params;
  const { item_name, vendor_name } = req.body;

  console.log(`awardItem called for rfq_id=${rfq_id} item_name=${item_name}`);

  try {
    const secret = process.env.SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error("[awards] Missing JWT secret in environment.");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Verify and decode JWT
    console.log("[awards] Verifying token (truncated):", token?.slice?.(0, 16));

    // verify and decode token
    const decoded = jwt.verify(token, secret) as VendorReplyToken;
    const tokenEmail = decoded.email;
    const tokenRfqId =
      decoded.rfqId || (decoded as any).rfq_id || (decoded as any).rfqId;

    if (!tokenEmail || !tokenRfqId) {
      return res.status(400).json({ success: false, error: "Invalid token" });
    }

    // ensure token's rfq matches the route param
    if (tokenRfqId !== rfq_id) {
      return res.status(403).json({ success: false, error: "RFQ mismatch" });
    }

    // update the specific vendor's item to awarded
    const updateResult = await prisma.vendorReplyItem.updateMany({
      where: {
        rfq_id: tokenRfqId,
        item_name,
        vendor_name,
      },
      data: { status: "awarded" },
    });

    // Try to look up the vendor's email by vendor name from the Vendor table first.
    // If not found, fall back to the vendor_email stored on the VendorReplyItem record.
    let vendorEmail: string | undefined = undefined;
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { name: vendor_name },
        select: { email: true },
      });
      vendorEmail = vendor?.email ?? undefined;
    } catch (err) {
      console.warn(
        `[awards] Error looking up vendor by name: ${vendor_name}`,
        err
      );
    }

    if (!vendorEmail) {
      try {
        const replyRecord = await prisma.vendorReplyItem.findFirst({
          where: { rfq_id: tokenRfqId, item_name, vendor_name },
          select: { vendor_email: true },
        });
        vendorEmail = replyRecord?.vendor_email ?? undefined;
      } catch (err) {
        console.warn(
          `[awards] Error looking up vendor email on reply item for ${vendor_name}`,
          err
        );
      }
    }

    // Fetch RFQ details for email notifications
    const rfqDetails = await prisma.rFQ.findUnique({
      where: { rfq_id: tokenRfqId },
      select: {
        project_name: true,
        project_address: true,
        needed_by: true,
        created_at: true,
        requester_name: true,
        requester_email: true,
        requester_phone: true,
      },
    });
    const itemDet9ails = await prisma.vendorReplyItem.findFirst({
      where: { rfq_id: tokenRfqId, item_name, vendor_name },
      select: {
        quantity: true,
        unit_price: true,
      },
    });
    if (!rfqDetails) {
      console.warn(`[awards] RFQ details not found for rfq_id=${tokenRfqId}`);
    }

    // Notify the user (requester) who awarded the item
    await userAwardNotification(tokenEmail, rfq_id, item_name, vendor_name);

    // Notify the vendor if we have an email and RFQ details
    if (vendorEmail && rfqDetails) {
      // Format dates for email
      const rfqDate = new Date(rfqDetails.created_at).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      const neededByDate = rfqDetails.needed_by
        ? new Date(rfqDetails.needed_by).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Not specified";

      await vendorAwardNotification(
        vendorEmail,
        rfq_id,
        item_name,
        vendor_name,
        rfqDetails.project_name,
        rfqDetails.project_address,
        neededByDate,
        rfqDate,
        rfqDetails.requester_name,
        rfqDetails.requester_email,
        rfqDetails.requester_phone
      );
    } else {
      console.warn(
        `[awards] No vendor email found for vendor '${vendor_name}' or missing RFQ details. Skipping vendor notification.`
      );
    }

    console.log(`[awards] updateMany result: ${JSON.stringify(updateResult)}`);

    if (updateResult.count === 0) {
      console.warn("[awards] No matching vendorReplyItem records found.");
      return res
        .status(404)
        .json({ success: false, message: "No items updated" });
    }

    return res.json({ success: true, updated: updateResult.count });
  } catch (err) {
    console.error("[awards] Error verifying token or updating item:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
