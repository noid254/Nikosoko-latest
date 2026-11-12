// Client for the Qaribu asset ledger (architecture section 24 on the Qaribu platform), reached through the bridge at
// /api/qaribu like the documents. One owner per serial number or registration plate, and a history that cannot change.
import { ApiError } from './documentsApi';

const API_BASE_URL = '/api/qaribu';

const ERROR_TEXT: Record<string, string> = {
  too_many_attempts: 'Too many tries. Wait a few minutes and try again.',
  verification_required: 'Verify your Skill ID with KYC to register items.',
  sign_in_required: 'Please sign in again.',
};

const call = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, cache: 'no-store', signal: AbortSignal.timeout(25000) }).catch((e: any) => {
    throw new ApiError(0, e?.name === 'TimeoutError' ? 'Qaribu is taking too long to answer. Check your connection and try again.' : 'Could not reach Nikosoko. Check your connection and try again.');
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data.message || ERROR_TEXT[data.error] || data.error || `Something went wrong (${response.status}).`);
  return data;
};

// The kinds the ledger knows. A boda boda, a delivery van or a car is a vehicle, and its plate is its serial.
export type AssetKind = 'vehicle' | 'tool' | 'electronics' | 'other';

export const KINDS: { key: AssetKind; label: string; hint: string }[] = [
  { key: 'vehicle', label: 'Vehicle', hint: 'Motorbike, van, car, tuk-tuk' },
  { key: 'tool', label: 'Tool / machine', hint: 'Drill, welder, CNC, printer' },
  { key: 'electronics', label: 'Electronics', hint: 'Phone, laptop, TV' },
  { key: 'other', label: 'Other', hint: 'Anything with a serial number' },
];

export const kindLabel = (k: AssetKind): string => KINDS.find((x) => x.key === k)?.label ?? 'Other';

export interface Asset {
  id: string;
  kind: AssetKind;
  name: string;
  make_model: string;
  year: string;
  serial: string; // a serial number, or a vehicle's plate without spaces
  notes: string;
  verification: 'unverified' | 'verified';
  source: 'self' | 'receipt';
  created_at: string;
}

export interface AssetEvent {
  event: string; // registered, claimed_from_receipt, transferred, ...
  at: string;
  from: string; // 'you', or the last digits of a phone
  to: string;
  receipt_number: string;
  shop_name: string;
}

export interface AssetInput {
  kind: AssetKind;
  name: string;
  make_model?: string;
  year?: string;
  serial: string;
  notes?: string;
  consent_show_name: boolean; // the owner agrees their name or nickname is shown to people who check this item
}

export interface OwnershipCheck {
  registered: boolean;
  matches: { kind: AssetKind; name: string; verified: boolean; owner: string; since: string }[];
}

export const getMyAssets = (): Promise<{ assets: Asset[] }> => call('/assets');

export const registerAsset = (input: AssetInput): Promise<{ asset: Asset }> =>
  call('/assets', { method: 'POST', body: JSON.stringify(input) });

export const getAsset = (id: string): Promise<{ asset: Asset; history: AssetEvent[] }> => call(`/assets/${encodeURIComponent(id)}`);

// Before buying: is this serial number or plate registered, and to whom?
export const checkSerial = (serial: string): Promise<OwnershipCheck> => call(`/assets/check?serial=${encodeURIComponent(serial)}`);
