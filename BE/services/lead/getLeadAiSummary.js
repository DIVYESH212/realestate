import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import dbService from "../../utilities/dbService";
import { getOwnerId } from "./utils";

export const getLeadAiSummary = async ({ user, params }) => {
  const { id } = params;
  const ownerId = getOwnerId(user);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid or missing Lead ID.");
  }

  const leadObjectId = new mongoose.Types.ObjectId(id);
  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  // 1. Fetch lead and its assigned buyer
  const leads = await dbService.aggregateData("leadModel", [
    {
      $match: {
        _id: leadObjectId,
        user_id: userObjectId,
        isDeleted: { $ne: true }
      }
    },
    {
      $lookup: {
        from: "buyers",
        let: { leadId: "$_id", buyerId: "$buyer_id" },
        pipeline: [
          {
            $match: {
              isDeleted: { $ne: true },
              $expr: {
                $or: [
                  { $eq: ["$_id", "$$buyerId"] },
                  { $in: ["$$leadId", { $ifNull: ["$lead_ids", []] }] }
                ]
              }
            }
          }
        ],
        as: "buyerInfo"
      }
    }
  ]);

  if (!leads || leads.length === 0) {
    throw new Error("Lead not found or unauthorized.");
  }

  const lead = leads[0];
  const buyer = lead.buyerInfo && lead.buyerInfo.length > 0 ? lead.buyerInfo[0] : null;

  // 2. Count other leads for this specific buyer
  let otherLeadsCount = 0;
  if (buyer) {
    const buyerArrayCount = (buyer.lead_ids || [])
      .map(lid => lid.toString())
      .filter(lid => lid !== lead._id.toString()).length;

    const dbCount = await dbService.recordsCount("leadModel", {
      buyer_id: buyer._id,
      _id: { $ne: lead._id },
      isDeleted: { $ne: true }
    });

    otherLeadsCount = Math.max(buyerArrayCount, Number(dbCount) || 0);
  }

  const leadContext = {
    property: lead.propertyAddress || lead.name || "Unspecified address",
    city: lead.city || "",
    state: lead.state || "",
    zip: lead.zip || "",
    leadStatus: lead.leadstatus || lead.status || "Active",
    estimatedValue: lead.estimatedvalue ? `$${Number(lead.estimatedvalue).toLocaleString()}` : "N/A",
    owner: lead.ownername || "N/A",
    buyer: buyer
      ? {
          name: buyer.name,
          status: buyer.status || "Active",
          targetTerritory: buyer.propertyAddress || "N/A",
          otherLeadsHeld: otherLeadsCount
        }
      : null
  };

  // 3. Call Google Gemini API via official SDK
  const apiKey = process.env.GEMINI_API_KEY;
  let summary = "";
  let aiError = null;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Area Historical Insights: Using any available location info (property address, city, state, zip, or even the lead/owner name to infer a region), provide 1-2 sentences about the area's history — notable historical facts, neighborhood development trends, and how the local real estate market has evolved. Always attempt to provide this even with partial location data.

Data:
${JSON.stringify(leadContext, null, 2)}`;

      const interaction = await ai.interactions.create({
        model: "gemini-3.8-flash",
        input: prompt,
      });

      summary = interaction.output_text?.trim() || "";

      if (!summary) {
        aiError = "Gemini returned empty response";
      }
    } catch (err) {
      console.warn("Gemini SDK call failed, falling back to local summary:", err.message);
      aiError = err.message || "AI request failed";
    }
  } else {
    aiError = "GEMINI_API_KEY not configured";
  }

  // 4. Fallback smart summary if API didn't return text
  if (!summary) {
    const bullet1 = `• **Property & Deal:** ${leadContext.property} (${leadContext.leadStatus}, Valued at ${leadContext.estimatedValue}).`;
    const bullet2 = buyer
      ? `• **Assigned Buyer:** ${buyer.name} (Status: ${buyer.status || "Active"}) targeting ${buyer.propertyAddress || "General market"}.`
      : `• **Assigned Buyer:** No buyer currently linked to this lead deal.`;
    const bullet3 = buyer
      ? `• **Buyer Portfolio:** Holds ${otherLeadsCount} other active lead(s) in their deal pipeline.`
      : "";

    summary = [bullet1, bullet2, bullet3].filter(Boolean).join("\n");
  }

  return {
    leadId: lead._id,
    summary,
    source: aiError ? "fallback" : "gemini",
    aiError: aiError || null,
    lead: leadContext,
    buyer: buyer
      ? {
          _id: buyer._id,
          name: buyer.name,
          email: buyer.email,
          mobilenumber: buyer.mobilenumber,
          status: buyer.status
        }
      : null,
    otherLeadsCount
  };
};
