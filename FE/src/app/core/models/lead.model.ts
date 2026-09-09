export interface LeadContact {
  name: string;
  phone: string;
  email: string;
}

export interface Stage {
  id?: string;
  _id?: string;
  name: string;
  order?: number;
}

export interface LeadRecord {
  id: string;
  contacts: LeadContact[];
  leadSource: string;
  dateCreated: string;
  market: string;
  propertyAddress: string;
  status: string;
  leadstatus?: string;
  stage_id?: string;
  stage?: Stage;
  contactedCount?: number;


  // Owner Details
  ownerName: string;
  ownerMailingAddress: string;

  // Valuation
  propertyvalue?: string;
  valEstimatedValue?: string;
  valEstimatedTotalLiens?: string;
  valEstimatedEquity?: string;
  buyerInfo?: any[];
  ownermailingaddress?: string;

  propertyCity?: string;
  propertyState?: string;  
  propertyZip?: string;
  propertyType?: string;

  loanAmount?: string;
  loanInterest?: string;
  loanTerm?: string;
  loanDuration?: string;
  loanPayment?: string;
}

export interface LeadFilterParams {
  propertyInfo?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  market_segment?: string | null;
  addressAvailability?: string | null;
  propertyValueOperator?: string | null;
  propertyValueMin?: number | string | null;
  propertyValueMax?: number | string | null;
  loanAmountOperator?: string | null;
  loanAmountMin?: number | string | null;
  loanAmountMax?: number | string | null;
  buyerName?: string | null;
  buyerAddress?: string | null;
  buyerMobileNumber?: string | null;
  buyerMobile?: string | null;
  buyerEmail?: string | null;
}
