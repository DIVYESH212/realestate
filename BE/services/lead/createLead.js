import dbService from "../../utilities/dbService";
import { getOwnerId } from "./utils";

export const createLead = async ({ body, user }) => {
  const userId = getOwnerId(user);
  if (!userId) {
    throw new Error('Authentication required to create leads.');
  }
  const {
    name,
    email,
    mobilenumber,
    ownername,
    ownermailingaddress,
    estimatedvalue,
    estimatedtotallens,
    estimatedequity,
    leadsource,
    market_segment,
    propertyAddress,
    dateCreated,
    leadstatus,
    city,
    state,
    zip,
    propertytype,
    loanamount,
    loaninterest,
    loanterm,
    loanduration,
    loanpayment
  } = body;

  const cleanEmail = (email || '').toString().toLowerCase().trim();
  const cleanMobile = (mobilenumber || '').toString().trim();
  const cleanName = (name || '').toString().trim();
  const cleanAddr = (propertyAddress || ownermailingaddress || '').toString().trim();

  if (cleanMobile) {
    const existing = await dbService.findOneRecord("leadModel", {
      user_id: userId,
      mobilenumber: cleanMobile
    });
    if (existing) {
      throw new Error('Duplicate lead detected! A record with matching mobile number already exists.');
    }
  }

  const lead = await dbService.createOneRecord("leadModel", {
    name: cleanName || 'Unnamed Lead',
    email: cleanEmail,
    mobilenumber: cleanMobile,
    ownername: (ownername || '').toString().trim(),
    ownermailingaddress: (ownermailingaddress || '').toString().trim(),
    estimatedvalue,
    estimatedtotallens,
    estimatedequity,
    leadsource,
    market_segment,
    propertyAddress: cleanAddr,
    dateCreated,
    leadstatus,
    user_id: userId,
    city: (city || '').toString().trim(),
    state: (state || '').toString().trim(),
    zip: (zip || '').toString().trim(),
    propertytype: (propertytype || '').toString().trim(),
    loanamount,
    loaninterest,
    loanterm,
    loanduration,
    loanpayment
  });

  return lead;
};
