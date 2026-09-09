import mongoose from "mongoose";
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

  // 3. Call Free Google Gemini Flash API if key exists
  const apiKey = process.env.GEMINI_API_KEY;
  let summary = "";

  if (apiKey) {
    try {
      const prompt = `You are a real estate CRM intelligence assistant. Summarize this lead and its assigned buyer concisely in 3 short bullet points:
1. Property & Deal: Address, status, estimated value.
2. Assigned Buyer: Name, status, target area (or state 'No buyer assigned').
3. Buyer Portfolio Context: State that this buyer currently holds ${otherLeadsCount} other lead(s) in their pipeline and whether they have capacity.

Data:
${JSON.stringify(leadContext, null, 2)}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.3
            }
          })
        }
      );

      const data = await response.json();
      summary = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local summary:", err.message);
    }
  }

  // 4. Fallback smart summary if API didn't return text
  if (!summary) {
    summary = buyer
      ? `• Property & Deal: ${leadContext.property} (${leadContext.leadStatus}, Valued at ${leadContext.estimatedValue}).\n• Assigned Buyer: ${buyer.name} (Status: ${buyer.status || "Active"}) targeting ${buyer.propertyAddress || "General market"}.\n• Buyer Portfolio: Holds ${otherLeadsCount} other active lead(s) in their deal pipeline.`
      : `• Property & Deal: ${leadContext.property} (${leadContext.leadStatus}, Valued at ${leadContext.estimatedValue}).\n• Assigned Buyer: No buyer currently linked to this lead deal.`;
  }

  return {
    leadId: lead._id,
    summary,
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
