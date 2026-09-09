import mongoose from "mongoose";
import collections from "../../collections";
import Message from "../../utilities/messages";
import { getOwnerId } from "./utils";

const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getbuyer = async ({ user, query, body }) => {
  const userId = getOwnerId(user);
  if (!userId) {
    throw new Error(Message.unauthorizedUser || 'Authentication required to view buyers.');
  }

  const queryData = {
    ...query,
    ...body,
    ...(body?.filters || {})
  };

  const page = parseInt(queryData.page, 10) || 1;
  const limit = parseInt(queryData.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const filter = { 
    user_id: userObjectId,
    isDeleted: { $ne: true }
  };

  const searchText = (queryData.search || queryData.name || queryData.propertyAddress || '').toString().trim();
  if (searchText) {
    const searchRegex = new RegExp(escapeRegex(searchText), 'i');
    filter.$or = [
      { name: searchRegex },
      { propertyAddress: searchRegex }
    ];
  }

  const [items, totalCount] = await Promise.all([
    collections.buyerModel
      .find(filter)
      .populate('lead_ids')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    collections.buyerModel.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    items: items || [],
    buyers: items || [],
    count: totalCount,
    totalItems: totalCount,
    totalPages,
    page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
