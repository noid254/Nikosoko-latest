
export type Page = 'home' | 'explore' | 'orders' | 'profile' | 'contacts';

export interface Member {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  distanceKm: number;
  hourlyRate: number;
  rateType: 'per hour' | 'per day' | 'per task' | 'per month' | 'per piece work' | 'per km' | 'per sqm' | 'per cbm' | 'per appearance';
  phone: string;
  whatsapp?: string;
  isOnline: boolean;
}

export interface Skill {
  id: string;
  name?: string;
  skillTitle?: string;
  category?: string;
  certificationName?: string;
  issuingSchool?: string;
  yearObtained?: string;
  hourlyRate?: number;
  currency?: string;
  description?: string;
  portfolioImages?: string[];
  iconUrl?: string;
  isVerified?: boolean;
  licenseNumber?: string;
  tradeTestGrade?: string;
  verifier?: {
    type: 'institution' | 'mentor';
    name: string;
    details: string;
    verifierId?: string;
  };
}

export interface UnitDetails {
  type: 'Business' | 'Residence';
  operatingHours?: string;
  availabilityStatus: 'Available' | 'Busy' | 'Closed' | 'Do Not Disturb';
  doorNote?: string;
  doorNoteHistory?: string[];
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    isVegetarian?: boolean;
    isSpicy?: boolean;
}

export interface MenuBundle {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    imageUrl: string;
}

export interface ShopDetails {
  logo?: string;
  name?: string;
  address?: string;
  operatingHours?: string;
  paymentMode?: string;
  website?: string;
}

export interface SaccoMembership {
  saccoId: string;
  saccoName: string;
  saccoCode: string;
  status: 'Pending' | 'Confirmed' | 'Approved' | 'Rejected';
  requestedAt: string;
  confirmedAt?: string;
}

export interface RatingDispute {
  id: string;
  providerId: string;
  providerName: string;
  reviewerName: string;
  originalRating: number;
  comment: string;
  disputeReason: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  createdAt: string;
  resolutionNote?: string;
}

export interface AdminNote {
  id: string;
  authorName: string;
  authorRole: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  signature: string; // E.g., "Signed by SuperAdmin (Noid254@gmail.com) on 2026-08-12 at 14:10"
}

export interface SystemProfileIntelligence {
  createdAt: string;
  lastLoginAt?: string;
  authMethod?: 'google' | 'email' | 'phone';
  otpVerifiedAt?: string;
  loginCount?: number;
  totalCatalogueItems?: number;
  totalGigsPosted?: number;
  ipAddress?: string;
  deviceFingerprint?: string;
  verificationAuditTrail?: string[];
  systemFlags?: string[];
  termsAcceptedAt?: string;
  termsVersion?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  service: string;
  avatarUrl: string;
  coverImageUrl: string;
  catalogueBannerUrl?: string;
  rating: number;
  ratingCount?: number;
  distanceKm?: number; // undefined when the provider's location is unknown
  hourlyRate: number;
  rateType: 'per hour' | 'per day' | 'per task' | 'per month' | 'per piece work' | 'per km' | 'per sqm' | 'per cbm' | 'per appearance';
  currency: string;
  isVerified: boolean;
  about: string;
  bio?: string;
  rate?: string;
  saccoId?: string;
  saccoName?: string;
  works: string[];
  skills?: Skill[];
  category: string;
  location: string;
  isOnline: boolean;
  accountType: 'individual' | 'organization';
  role?: 'BuildingManager' | 'TenantAdmin' | 'Staff' | 'Gateman' | 'SuperAdmin' | 'Provider' | 'Member';
  tenantId?: string;
  premiseId?: string;
  coHosts?: string[];
  tenantAdminId?: string;
  staffIds?: string[];
  floor?: string;
  unit?: string;
  unitDetails?: UnitDetails;
  flagCount: number;
  isSuspended?: boolean;
  suspendedReason?: string;
  suspendedBy?: string;
  suspendedAt?: string;
  views: number;
  cta: ('call' | 'whatsapp' | 'book' | 'catalogue' | 'join' | 'menu' | 'save' | 'chat')[];
  selectedProfileButtons?: ('call' | 'book' | 'chat' | 'whatsapp' | 'catalogue' | 'location' | 'document')[];
  shopDetails?: ShopDetails;
  brandColors?: { primary: string, secondary: string };
  steps?: number;
  menu?: MenuItem[];
  bundles?: MenuBundle[];
  referralCode?: string;
  saccoCode?: string;
  saccoMember?: SaccoMembership;
  isSaccoVerified?: boolean;
  isProfileCompleted?: boolean;
  idVerificationStatus?: 'Unverified' | 'Pending' | 'Verified';
  idType?: 'National ID' | 'Passport' | 'Alien Card' | 'Driving License';
  idSubmitted?: boolean; // server-computed; ID details themselves are never sent back
  // Write-only (sent at signup, never returned by the API):
  idNumber?: string;
  idDocumentUrl?: string;
  selfieUrl?: string;
  minBookingDeposit?: number;
  saccoDetails?: {
    description?: string;
    location?: string;
    totalMembers?: number;
    registrationNo?: string;
    contactPhone?: string;
    rulesAndBenefits?: string;
  };
  hasCatalogue?: boolean;
  catalogueItems?: CatalogueItem[];
  joinRequests?: { id: string; userId: string; userName: string; userPhone?: string; status: 'Pending' | 'Approved' | 'Rejected' | 'pending' }[];
  nationalId?: string;
  referredBy?: string;
  referralCodeUsed?: string;
  isReferred?: boolean;
  reviewsCount?: number;
  completionRate?: number;
  trustScore?: number;
  ratingDisputes?: RatingDispute[];
  adminNotes?: AdminNote[];
  systemIntelligence?: SystemProfileIntelligence;
  latitude?: number;
  longitude?: number;
  lastCheckInAt?: string;
  lastCheckInLocation?: string;
  checkInHistory?: LocationCheckInLog[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationCheckInLog {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  userRole?: string;
  locationName: string;
  estateName?: string;
  county?: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  checkInType: 'live_status' | 'premise_checkin' | 'manual_update' | 'gps_auto' | 'service_area';
  deviceInfo?: string;
  notes?: string;
  timestamp: string;
  isActive?: boolean;
}

export type CurrentPage = 'home' | 'tukosoko' | 'sellService' | 'profile' | 'skill_id' | 'mycontacts' | 'bookings' | 'sacco_dashboard' | 'admin' | 'messages' | 'login';

export interface Booking {
  id: string;
  // Set by the platform: whether the signed-in person is the client or the professional on this booking.
  role?: 'client' | 'provider';
  providerId: string;
  providerName: string;
  providerPhone?: string;
  providerAvatar?: string;
  providerService: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  serviceTitle: string;
  estimatedFee?: number;
  minBookingFee: number; // Minimum deposit set by provider
  paidDepositAmount: number;
  mpesaReceiptNumber?: string;
  mpesaPhoneNumber?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';
  location?: string;
  notes?: string;
  googleCalendarEventId?: string;
  googleCalendarHtmlLink?: string;
  isCalendarSynced?: boolean;
  cancellationReason?: string;
  cancelledBy?: 'client' | 'provider' | 'admin';
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InboxMessage {
    id: number;
    sender: 'user' | 'team';
    text: string;
    timestamp: string;
    type?: 'general' | 'cta_tap' | 'rating_reminder' | 'booking';
    targetProviderId?: string;
    targetProviderName?: string;
    ctaType?: 'call' | 'whatsapp' | 'chat' | 'book' | 'save' | string;
    tapperName?: string;
    tapperPhone?: string;
    isActionable?: boolean;
}

export type CatalogueCategory = 'Product' | 'Service' | 'Professional Service' | 'For Rent' | 'For Sale';

export interface CatalogueItem {
  id: string;
  providerId: string;
  title: string;
  category: CatalogueCategory | string;
  description: string;
  price: string;
  imageUrls: string[];
  externalLink?: string;
  duration?: string;
  discountInfo?: string;
  verifiedAssetId?: string;
  serialNumber?: string;
  isVerified: boolean;
}

export interface AppBrandingConfig {
  appName: string;
  tagline: string;
  appIconUrl?: string;
  faviconUrl?: string;
  heroBannerUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  primaryColor?: string;
  supportPhone?: string;
  supportEmail?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
  qrCodeData: string;
  gate: string;
  eventCoverUrl: string;
}

export interface Event {
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    coverImageUrl: string;
    createdBy: string;
    category: 'Music' | 'Food' | 'Sport' | 'Conference' | 'Party' | 'Wedding' | 'Community' | 'Arts' | 'Business' | 'Fashion' | 'Gaming';
    price: number;
    originalPrice?: number;
    currency: string;
    ticketType: 'single' | 'multiple';
    distanceKm: number;
    organizer: {
        name: string;
        avatarUrl: string;
    };
    attendees: {
        avatarUrl: string;
    }[];
    teaserVideoUrl?: string;
}

export type DocumentType = 'Invoice' | 'Quote' | 'Receipt';

export interface DocumentItem {
  description: string;
  quantity: number;
  price: number;
  serial?: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  number: string;
  issuerName: string;
  clientName?: string;
  recipientContact?: string;
  date: string;
  dueDate?: string;
  amount: number;
  currency: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  items?: DocumentItem[];
  terms?: string;
  paymentInstructions?: string;
  discountRate?: number;
  taxRate?: number;
  isAsset?: boolean;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected' | 'Unverified';
  assetType?: string;
  model?: string;
  registrationNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  condition?: 'New' | 'Used';
  sellerContact?: string;
  productImages?: string[];
  scannedImageUrl?: string;
  ownerPhone?: string;
  pendingOwnerPhone?: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  area?: string;        // place name, e.g. "Ruaka"
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number;    // shown to users within this distance; no coordinates = shown everywhere
  isActive?: number | boolean;
  createdAt?: string;
}
