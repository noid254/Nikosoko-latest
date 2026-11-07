// Client for the Qaribu documents routes on this server (see qaribuDocs.ts): brand kit, receipts, invoices and quotes.
// The functions and types are the same as in the Qaribu app, so its screens run here unchanged.
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

const API_BASE_URL = '/api/qaribu';
// The sign-in token is added to every request by the global fetch patch in api.ts.
const getToken = (): string | null => null;
const clearToken = () => {};
const ERROR_TEXT: Record<string, string> = {
    sign_in_unavailable: 'Sign-in is not available right now.',
    invalid_phone: 'Enter a valid phone number.',
    too_many_requests: 'Too many tries. Wait a few minutes and try again.',
    too_many_invites: 'You have sent a lot of invites. Wait a while and try again.',
    invalid_code: 'That code is not right, or it has expired.',
    sign_in_required: 'Please sign in again.',
    premise_not_found: 'That premise was not found.',
    not_allowed: 'Your role does not allow that.',
    gate_pass_off: 'Gate pass is switched off for this premise.',
    pass_not_found: 'No pass found for that code.',
    not_checked_in: 'That visitor is not checked in.',
    too_many_attempts: 'Too many wrong codes. Wait a few minutes, then try again.',
    brand_kit_required: 'Set up your brand kit first: your business name, address and phone.',
    too_many_receipts: 'You have issued a lot of receipts. Wait a while and try again.',
};

const call = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, cache: 'no-store', signal: AbortSignal.timeout(25000) }).catch((e: any) => {
    throw new ApiError(0, e?.name === 'TimeoutError' ? 'Qaribu is taking too long to answer. Check your connection and try again.' : 'Could not reach Nikosoko. Check your connection and try again.');
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data.message || ERROR_TEXT[data.error] || data.error || `Something went wrong (${response.status}).`);
  return data;
};

// --- Brand kit and receipts (architecture sections 22 and 23) ---

// The name, address and details a business puts on its documents. Nothing can be issued until it is complete.
export interface BrandKit {
    business_name: string;
    address: string;
    phone: string; // +254..., may start as the account's own number
    email: string;
    tax_pin: string;
    tagline: string;
    payment_details: string;
    receipt_note: string; // printed at the foot of every receipt
    terms_accepted_at: string; // empty until the terms are accepted
    complete: boolean;
    // How its documents look: two colours (#rrggbb, empty for Qaribu's own), a font key, and whether a logo is saved.
    color: string;
    color2: string;
    font: string;
    has_logo: boolean;
    has_letterhead: boolean;
    fonts: { key: string; label: string; stack: string }[];
    design: string; // band, plain or centred; empty means band
    designs: { key: string; label: string }[];
}

let kitCache: BrandKit | null = null;
export const peekBrandKit = (): BrandKit | null => kitCache;
export const clearBrandKitCache = (): void => { kitCache = null; };
export const getBrandKit = (): Promise<BrandKit> => call('/me/brand-kit').then((kit: BrandKit) => (kitCache = kit));

export const saveBrandKit = (input: {
    business_name: string;
    address: string;
    phone?: string;
    email?: string;
    tax_pin?: string;
    tagline?: string;
    payment_details?: string;
    receipt_note?: string;
    accept_terms?: boolean;
    color?: string;
    color2?: string;
    font?: string;
    design?: string;
}): Promise<BrandKit> => call('/me/brand-kit', { method: 'PUT', body: JSON.stringify(input) });

// The logo: a PNG or JPEG up to 100 KB, sent as the raw bytes.
export const uploadLogo = async (file: Blob): Promise<BrandKit> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/me/brand-kit/logo`, {
        method: 'PUT',
        headers: { 'Content-Type': file.type, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: file,
        cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(response.status, data.message || (response.status === 413 ? 'That picture is too large. Use one under 100 KB.' : `Something went wrong (${response.status}).`));
    return data;
};

// The letterhead picture (PNG or JPEG under 250 KB): used when the design is 'letterhead'.
export const uploadLetterhead = async (file: Blob): Promise<BrandKit> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/me/brand-kit/letterhead`, {
        method: 'PUT',
        headers: { 'Content-Type': file.type, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: file,
        cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(response.status, data.message || (response.status === 413 ? 'That picture is too large. Use one under 250 KB.' : `Something went wrong (${response.status}).`));
    return data;
};

export const removeLetterhead = (): Promise<BrandKit> => call('/me/brand-kit/letterhead', { method: 'DELETE' });

export const fetchLetterheadUrl = async (): Promise<string | null> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/me/brand-kit/letterhead`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: 'no-store' });
    if (!response.ok) return null;
    return URL.createObjectURL(await response.blob());
};

export const removeLogo = (): Promise<BrandKit> => call('/me/brand-kit/logo', { method: 'DELETE' });

// The saved logo as a picture the page can show (the server needs the sign-in to give it), or null if there is none.
export const fetchLogoUrl = async (): Promise<string | null> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/me/brand-kit/logo`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: 'no-store' });
    if (!response.ok) return null;
    return URL.createObjectURL(await response.blob());
};

// One line of a receipt, as the shop types it (strings, as typed) and as the server returns it.
export interface ReceiptLineInput {
    description: string;
    qty: string;
    unit_price: string;
    serial?: string;
}

export interface ReceiptLine {
    description: string;
    qty: number;
    unit_price: number;
    total: number;
    serial: string;
}

export interface CreatedReceipt {
    id: string;
    uid: string;
    number: string;
    amount: number;
    items: ReceiptLine[];
    receipt_url: string;
    customer_phone: string;
    message: string;
    sms_link: string;
    whatsapp_link: string;
}

export const issueReceipt = (input: { customer_phone: string; customer_name?: string; items: ReceiptLineInput[] }): Promise<CreatedReceipt> =>
    call('/receipts', { method: 'POST', body: JSON.stringify(input) });

// A receipt in a list. A receipt can never be edited or deleted, so there is nothing here that does either.
export type DocumentKind = 'receipt' | 'invoice' | 'quote';

export interface ReceiptItem {
    balance_due: number | null; // invoices: what is still to pay (null once cancelled)
    cancelled?: boolean; // cancelled by the shop, with a reason, on its record
    invoiced?: boolean; // a quote that has been made into an invoice
    decision?: 'accepted' | 'declined' | null; // the customer's answer to a quote
    kind: DocumentKind;
    due_date: string; // invoices
    valid_until: string; // quotes
    id: string;
    uid: string; // unique across Qaribu
    number: string; // the shop's own running number
    shop_name: string;
    amount: number;
    item_count: number;
    first_item: string;
    customer_name: string;
    customer_phone: string;
    issued_at: string;
    // Only in the shop's own list: the message to send the link again. Never in a customer's list.
    message: string | null;
    sms_link: string | null;
    whatsapp_link: string | null;
}

// What the person typed in the search boxes: a name, a phone number, a receipt number or ID (or a shop name), and days.
export interface ReceiptSearch { q: string; from: string; to: string; }

const searchQuery = (s: ReceiptSearch): string => {
    const params = new URLSearchParams();
    if (s.q.trim()) params.set('q', s.q.trim());
    if (s.from) params.set('from', s.from);
    if (s.to) params.set('to', s.to);
    const text = params.toString();
    return text ? `?${text}` : '';
};

// The receipts this person issued.
export const getReceipts = (search: ReceiptSearch = { q: '', from: '', to: '' }): Promise<{ receipts: ReceiptItem[] }> =>
    call(`/receipts${searchQuery(search)}`);

// The receipts issued to this person's phone number. No brand kit is needed to look.
export const getMyReceipts = (search: ReceiptSearch = { q: '', from: '', to: '' }): Promise<{ receipts: ReceiptItem[] }> =>
    call(`/me/receipts${searchQuery(search)}`);

// One receipt as the page the customer sees, fetched signed in. This is how a receipt is previewed in the app: the
// customer's link is never opened for it, because the link opens only once.
export const getReceiptPage = async (id: string): Promise<string> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/receipts/${encodeURIComponent(id)}/page`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
    });
    if (!response.ok) {
        if (response.status === 401 && token) clearToken();
        throw new ApiError(response.status, response.status === 401 ? ERROR_TEXT.sign_in_required : 'Could not load that receipt.');
    }
    return response.text();
};

// --- Invoices and quotes (architecture section 25) ---

// What the shop typed for an invoice or a quote. Money and rates go as typed; the server works the sums out.
export interface DocumentInput {
    customer_phone: string;
    customer_name: string;
    customer_details?: string;
    items: ReceiptLineInput[];
    discount?: string;
    tax_rate?: string; // left out: 16 for a business with a KRA PIN, else none
    shipping?: string;
    deposit?: string; // invoices only
    due_date?: string; // invoices
    valid_until?: string; // quotes
    notes?: string;
}

export interface CreatedDocument {
    id: string;
    uid: string;
    kind: 'invoice' | 'quote';
    number: string;
    amount: number; // the total
    balance_due: number;
    date: string; // the due date, or the last day a quote is valid
    customer_phone: string;
    message: string;
    sms_link: string;
    whatsapp_link: string;
}

export const issueDocument = (kind: 'invoice' | 'quote', input: DocumentInput): Promise<CreatedDocument> =>
    call(kind === 'invoice' ? '/invoices' : '/quotes', { method: 'POST', body: JSON.stringify(input) });

const kindQuery = (kind: DocumentKind | '', s: ReceiptSearch): string => {
    const query = searchQuery(s);
    if (!kind) return query;
    return query ? `${query}&kind=${kind}` : `?kind=${kind}`;
};

// Every receipt, invoice and quote this person's business issued; kind narrows it.
export const getIssuedDocuments = (kind: DocumentKind | '' = '', search: ReceiptSearch = { q: '', from: '', to: '' }): Promise<{ documents: ReceiptItem[] }> =>
    call(`/documents${kindQuery(kind, search)}`);

// Everything issued to this person's phone number.
export const getReceivedDocuments = (kind: DocumentKind | '' = '', search: ReceiptSearch = { q: '', from: '', to: '' }): Promise<{ documents: ReceiptItem[] }> =>
    call(`/me/documents${kindQuery(kind, search)}`);

// --- Payments against an invoice (architecture section 25) ---

export type PayMethod = 'cash' | 'mpesa' | 'bank' | 'card' | 'other';

export interface CreatedPayment {
    id: string; // the receipt that was issued
    uid: string;
    number: string;
    amount: number;
    invoice_number: string;
    balance_due: number; // what is still to pay after this payment
    paid_in_full: boolean;
    customer_phone: string;
    message: string;
    sms_link: string;
    whatsapp_link: string;
}

// The shop records a payment against an invoice it issued. That issues a receipt linked to the invoice, and the
// invoice's balance goes down. An empty amount is the whole balance.
export const recordPayment = (invoiceId: string, input: { amount?: string; method: PayMethod; reference?: string }): Promise<CreatedPayment> =>
    call(`/invoices/${encodeURIComponent(invoiceId)}/payments`, { method: 'POST', body: JSON.stringify(input) });

// The shop cancels an invoice or quote it issued, with a reason. The document stays, marked cancelled. An invoice that
// has payments against it cannot be cancelled.
export const cancelDocument = (id: string, reason: string): Promise<{ id: string; kind: 'invoice' | 'quote'; number: string; cancelled: true; reason: string }> =>
    call(`/documents/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });

// The customer answers a quote they were sent: accept or decline, once, and it is final.
export const respondToQuote = (quoteId: string, decision: 'accept' | 'decline'): Promise<{ id: string; decision: 'accepted' | 'declined' }> =>
    call(`/documents/${encodeURIComponent(quoteId)}/respond`, { method: 'POST', body: JSON.stringify({ decision }) });

// The shop makes a quote into an invoice: everything is copied from the quote, and it may give a due date and a deposit.
export const invoiceFromQuote = (quoteId: string, input: { due_date?: string; deposit?: string } = {}): Promise<CreatedDocument> =>
    call(`/quotes/${encodeURIComponent(quoteId)}/invoice`, { method: 'POST', body: JSON.stringify(input) });

