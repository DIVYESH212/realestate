import mongoose from "mongoose";
import dbService from "../../utilities/dbService";
import { getOwnerId } from "./utils";

export const getLeads = async ({ user, body, query }) => {
  const ownerId = getOwnerId(user);
  if (!ownerId) {
    throw new Error('Authentication required to fetch leads.');
  }

  const queryData = {
    ...query,
    ...body
  };

  const page = parseInt(queryData.page, 10) || 1;
  const limit = parseInt(queryData.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  const filter = { 
    user_id: userObjectId,
    isDeleted: { $ne: true }
  };

  let searchConditions = null;
  if (queryData.propertyInfo && queryData.propertyInfo.toString().trim()) {
    const searchRegex = new RegExp(queryData.propertyInfo.toString().trim(), 'i');
    searchConditions = [
      { name: searchRegex },
      { propertyAddress: searchRegex },
      { city: searchRegex },
      { state: searchRegex },
      { zip: searchRegex },
      { ownername: searchRegex },
      { email: searchRegex },
      { mobilenumber: searchRegex }
    ];
  }

  if (queryData.startDate || queryData.endDate) {
    filter.dateCreated = {};
    if (queryData.startDate) {
      filter.dateCreated.$gte = new Date(queryData.startDate);
    }
    if (queryData.endDate) {
      const endDate = new Date(queryData.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.dateCreated.$lte = endDate;
    }
  }

  if (queryData.market_segment && queryData.market_segment !== 'all') {
    filter.market_segment = queryData.market_segment.toLowerCase();
  }

  let addressConditions = null;
  if (queryData.addressAvailability && queryData.addressAvailability !== 'all') {
    if (queryData.addressAvailability === 'available') {
      filter.propertyAddress = { $exists: true, $ne: '' };
    } else if (queryData.addressAvailability === 'not_available') {
      addressConditions = [
        { propertyAddress: { $exists: false } },
        { propertyAddress: '' },
        { propertyAddress: null }
      ];
    }
  }

  if (searchConditions && addressConditions) {
    filter.$and = [
      { $or: searchConditions },
      { $or: addressConditions }
    ];
  } else if (searchConditions) {
    filter.$or = searchConditions;
  } else if (addressConditions) {
    filter.$or = addressConditions;
  }

  const { propertyValueOperator, propertyValueMin, propertyValueMax } = queryData;
  if (propertyValueOperator && propertyValueOperator !== 'all') {
    filter.estimatedvalue = {};
    const minVal = parseFloat(propertyValueMin);
    const maxVal = parseFloat(propertyValueMax);

    if (propertyValueOperator === 'greater' && !isNaN(minVal)) {
      filter.estimatedvalue.$gt = minVal;
    } else if (propertyValueOperator === 'less' && !isNaN(maxVal)) {
      filter.estimatedvalue.$lt = maxVal;
    } else if (propertyValueOperator === 'between') {
      if (!isNaN(minVal)) filter.estimatedvalue.$gte = minVal;
      if (!isNaN(maxVal)) filter.estimatedvalue.$lte = maxVal;
    }
    if (Object.keys(filter.estimatedvalue).length === 0) delete filter.estimatedvalue;
  }

  const { loanAmountOperator, loanAmountMin, loanAmountMax } = queryData;
  if (loanAmountOperator && loanAmountOperator !== 'all') {
    filter.loanamount = {};
    const minLoan = parseFloat(loanAmountMin);
    const maxLoan = parseFloat(loanAmountMax);

    if (loanAmountOperator === 'greater' && !isNaN(minLoan)) {
      filter.loanamount.$gt = minLoan;
    } else if (loanAmountOperator === 'less' && !isNaN(maxLoan)) {
      filter.loanamount.$lt = maxLoan;
    } else if (loanAmountOperator === 'between') {
      if (!isNaN(minLoan)) filter.loanamount.$gte = minLoan;
      if (!isNaN(maxLoan)) filter.loanamount.$lte = maxLoan;
    }
    if (Object.keys(filter.loanamount).length === 0) delete filter.loanamount;
  }

  const buyerMatchConditions = [];
  const cleanBuyerName = (queryData.buyerName || '').toString().trim();
  const cleanBuyerAddress = (queryData.buyerAddress || '').toString().trim();
  const cleanBuyerMobile = (queryData.buyerMobileNumber || queryData.buyerMobile || '').toString().trim();
  const cleanBuyerEmail = (queryData.buyerEmail || '').toString().trim();

  if (cleanBuyerName) buyerMatchConditions.push({ name: { $regex: cleanBuyerName, $options: 'i' } });
  if (cleanBuyerAddress) buyerMatchConditions.push({ propertyAddress: { $regex: cleanBuyerAddress, $options: 'i' } });
  if (cleanBuyerMobile) buyerMatchConditions.push({ mobilenumber: { $regex: cleanBuyerMobile, $options: 'i' } });
  if (cleanBuyerEmail) buyerMatchConditions.push({ email: { $regex: cleanBuyerEmail, $options: 'i' } });

  const isBuyerFilterActive = Boolean(cleanBuyerName || cleanBuyerAddress || cleanBuyerMobile || cleanBuyerEmail);

  const buyerPipeline = [
    {
      $match: {
        isDeleted: { $ne: true },
        $expr: { $in: ['$$leadId', { $ifNull: ['$lead_ids', []] }] }
      }
    }
  ];

  if (buyerMatchConditions.length > 0) {
    buyerPipeline.push({ $match: { $and: buyerMatchConditions } });
  }
  buyerPipeline.push({ $sort: { name: 1 } });

  const aggregatePipeline = [
    { $match: filter },
    {
      $lookup: {
        from: 'buyers',
        let: { leadId: '$_id' },
        pipeline: buyerPipeline,
        as: 'buyerInfo'
      }
    },
    {
      $lookup: {
        from: 'stages',
        localField: 'stage_id',
        foreignField: '_id',
        as: 'stage'
      }
    },
    {
      $unwind: {
        path: '$stage',
        preserveNullAndEmptyArrays: true
      }
    }
  ];

  if (isBuyerFilterActive) {
    aggregatePipeline.push({
      $match: { buyerInfo: { $ne: [] } }
    });
  }

  aggregatePipeline.push({
    $sort: { createdAt: -1, name: 1 }
  });

  if (queryData.export === 'excel') {
    aggregatePipeline.push({ $unwind: { path: '$buyerInfo', preserveNullAndEmptyArrays: true } });
    return await dbService.aggregateData("leadModel", aggregatePipeline);
  }

  aggregatePipeline.push({
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [
        { $skip: skip },
        { $limit: limit }
      ]
    }
  });

  const result = await dbService.aggregateData("leadModel", aggregatePipeline);

  const leads = result?.[0]?.data || [];
  const totalLeads = result?.[0]?.metadata?.[0]?.total || 0;
  const totalPages = Math.ceil(totalLeads / limit);

  return {
    success: true,
    count: leads.length,
    pagination: {
      totalItems: totalLeads,
      totalPages: totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    data: leads
  };
};
