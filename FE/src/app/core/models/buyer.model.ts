export interface AssociatedLead {
  _id?: string;
  id?: string;
  name?: string;
  ownername?: string;
  email?: string;
  mobilenumber?: string;
  propertyAddress?: string;
  leadstatus?: string;
  leadsource?: string;
  market_segment?: string;
  estimatedvalue?: number;
  city?: string;
  state?: string;
  zip?: string;
  propertytype?: string;
}

export interface BuyerRecord {
  _id?: string;
  id?: string;
  name: string;
  mobilenumber?: string;
  email?: string;
  propertyAddress?: string;
  status: 'active' | 'inactive' | 'hold' | 'assign' | string;
  lead_id?: AssociatedLead | string | any;
  lead_ids?: (AssociatedLead | string | any)[];
  associatedLeads?: AssociatedLead[];
  user_id?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuyerFilterParams {
  name?: string | null;
  email?: string | null;
  mobilenumber?: string | null;
  address?: string | null;
  buyerStatus?: string | null;
  lead_id?: string | null;
  search?: string | null;
}
