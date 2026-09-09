import mongoose from "mongoose";
import dbService from "../../utilities/dbService";
import { getOwnerId } from "./utils";

export const getLeadById = async ({ user, params }) => {
  const { id } = params;
  const ownerId = getOwnerId(user);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid or missing Lead ID.');
  }

  const leadObjectId = new mongoose.Types.ObjectId(id);
  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  const matchQuery = { 
    _id: leadObjectId,
    user_id: userObjectId,
    isDeleted: { $ne: true }
  };

  const leads = await dbService.aggregateData("leadModel", [
    { $match: matchQuery },
    {
      $lookup: {
        from: 'buyers',
        let: { leadId: '$_id' },
        pipeline: [
          {
            $match: {
              isDeleted: { $ne: true },
              $expr: { $in: ['$$leadId', { $ifNull: ['$lead_ids', []] }] }
            }
          },
          { $sort: { name: 1 } }
        ],
        as: 'buyerInfo'
      }
    }
  ]);

  if (!leads || leads.length === 0) {
    throw new Error('Lead not found or unauthorized');
  }

  return leads[0];
};
