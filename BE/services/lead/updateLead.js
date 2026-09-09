import dbService from "../../utilities/dbService";
import Message from "../../utilities/messages";
import { getOwnerId } from "./utils";

export const updateLead = async ({ body, user, params }) => {
  const userId = getOwnerId(user);
  const { id } = params;

  const trim = (val) => (typeof val === "string" ? val.trim() : val);
  const toNum = (val) => (val === "" || val === null || isNaN(Number(val)) ? null : Number(val));

  const {
    name,
    email,
    mobilenumber,
    phone,
    ownername,
    ownermailingaddress,
    propertyAddress,
    city,
    state,
    zip,
    propertytype,
    leadsource,
    market_segment,
    leadstatus,
    status,
    stage_id,
    buyer_id,
    dateCreated,
    estimatedvalue,
    estimatedtotallens,
    estimatedequity,
    loanamount,
    loaninterest,
    loanterm,
    loanduration,
    loanpayment,
    isDeleted
  } = body;

  const updateData = {};

  if (name !== undefined) updateData.name = trim(name);
  if (email !== undefined) updateData.email = trim(email)?.toLowerCase();
  if (mobilenumber !== undefined || phone !== undefined) updateData.mobilenumber = trim(mobilenumber ?? phone);
  if (ownername !== undefined) updateData.ownername = trim(ownername);
  if (ownermailingaddress !== undefined) updateData.ownermailingaddress = trim(ownermailingaddress);
  if (propertyAddress !== undefined) updateData.propertyAddress = trim(propertyAddress);
  if (city !== undefined) updateData.city = trim(city);
  if (state !== undefined) updateData.state = trim(state);
  if (zip !== undefined) updateData.zip = trim(zip);
  if (propertytype !== undefined) updateData.propertytype = trim(propertytype);
  if (leadsource !== undefined) updateData.leadsource = trim(leadsource);
  if (market_segment !== undefined) updateData.market_segment = trim(market_segment);
  if (leadstatus !== undefined || status !== undefined) updateData.leadstatus = trim(leadstatus ?? status);
  if (stage_id !== undefined) updateData.stage_id = stage_id || null;
  if (buyer_id !== undefined) updateData.buyer_id = buyer_id || null;

  if (estimatedvalue !== undefined) updateData.estimatedvalue = toNum(estimatedvalue);
  if (estimatedtotallens !== undefined) updateData.estimatedtotallens = toNum(estimatedtotallens);
  if (estimatedequity !== undefined) updateData.estimatedequity = toNum(estimatedequity);
  if (loanamount !== undefined) updateData.loanamount = toNum(loanamount);
  if (loaninterest !== undefined) updateData.loaninterest = toNum(loaninterest);
  if (loanterm !== undefined) updateData.loanterm = toNum(loanterm);
  if (loanduration !== undefined) updateData.loanduration = toNum(loanduration);
  if (loanpayment !== undefined) updateData.loanpayment = toNum(loanpayment);

  if (dateCreated !== undefined) updateData.dateCreated = dateCreated ? new Date(dateCreated) : null;
  if (isDeleted !== undefined) updateData.isDeleted = Boolean(isDeleted);

  const lead = await dbService.findOneAndUpdateRecord(
    "leadModel",
    { _id: id, user_id: userId },
    { $set: updateData },
    { new: true }
  );

  if (!lead) {
    throw new Error(Message.recordNotFound);
  }

  return lead;
};

