
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
  verifier?: {
    type: 'institution' | 'mentor';
    name: string;
    details: string;
    verifierId?: string;
  };
}

export interface Premise {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  bannerImageUrl: string;
  galleryImages?: string[];
  about: string;
  location: string;
  street?: string;
  gps?: { lat: number; lng: number };
  town?: string;
  county?: string;
  lrNumber?: string;
  type?: 'Residential' | 'Commercial' | 'Mixed' | 'Education' | 'Hospitality' | 'Retail' | 'Industrial';
  totalUnits?: number;
  floors?: number;
  amenities: { name: string; imageUrl?: string }[]; 
  contactEmail: string;
  contactPhone: string;
  visitorReportEmail?: string;
  operatingHours?: string; 
  vacancies: UnitKey[]; 
  buildingManagerId: string;
  tenants: string[]; 
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  noticeBoard?: {
      id: string;
      title: string;
      content: string;
      date: string;
      type: 'Info' | 'Alert' | 'Promo';
  }[];
}

export interface UnitKey {
    id: string;
    unitNumber: string;
    floor: string;
    type: 'Residential' | 'Commercial' | 'Gate' | 'Warehouse' | 'Shop' | 'Office' | 'Retail' | 'Apartment' | 'Education' | 'Hospitality';
    configuration: string;
    size?: string;
    status: 'Occupied' | 'Vacant';
    isListed?: boolean;
    tenantId?: string; 
    tenantName?: string; 
    rentAmount?: number;
    description?: string;
    amenities?: string[]; 
    images?: string[];
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
  distanceKm: number;
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
  idNumber?: string;
  idDocumentUrl?: string;
  selfieUrl?: string;
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
  ratingDisputes?: RatingDispute[];
  adminNotes?: AdminNote[];
  systemIntelligence?: SystemProfileIntelligence;
}

export interface QaRibuRequest {
  id: string;
  accessCode?: string;
  premiseId: string;
  premiseName?: string;
  tenantId?: string;
  hostId: string;
  hostName: string;
  targetUnit?: string;
  visitorName: string;
  visitorPhone: string;
  visitorId?: string;
  visitorAvatar?: string;
  visitorPurpose?: string;
  vehicleReg?: string;
  createdAt?: string;
  expiresAt?: string;
  status: 'Pending' | 'Approved' | 'CheckedIn' | 'Expired' | 'Killed' | 'Denied';
  requestType?: 'Direct' | 'Mediated';
  premiseType?: 'Residential' | 'Commercial' | 'Mixed' | 'Education' | 'Hospitality' | 'Retail' | 'Industrial' | 'Residence';
  isDigitalKey?: boolean;
}

export type CurrentPage = 'home' | 'nikosoko' | 'services' | 'myplaces' | 'qaribu' | 'journey' | 'profile' | 'tukosoko' | 'sellService' | 'mycontacts' | 'mycatalogue' | 'settings' | 'admin' | 'addService' | 'messages' | 'createPost' | 'mytoolkit' | 'login' | 'qrScan' | 'premiseLanding' | 'hostSetup' | 'doorProfile' | 'courses' | 'skill_id' | 'pendingRatings' | 'sacco_dashboard';

export interface BusinessAssets {
  name: string;
  address: string;
  logo: string | null;
  tagline?: string;
  phone?: string;
  email?: string;
  about?: string;
  colors?: { primary: string, secondary: string };
}

export interface OrderData {
  customer: { name: string; phone: string; location: string; };
  restaurantName: string;
  items: { name: string; qty: number; price: number; }[];
  total: number;
  date: string;
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

export interface SpecialBanner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  targetCategory?: string;
  targetLocation?: string;
  targetAgeGroup?: '18-24' | '25-34' | '35-50' | '50+' | 'All';
  minRating?: number;
  targetService?: string;
  isOnlineTarget?: boolean;
  isVerifiedTarget?: boolean;
  targetReferralCode?: string;
  targetJoiningTenure?: 'all' | 'new_members' | 'tenured';
  maxDaysJoined?: number;
  minDaysJoined?: number;
  targetRole?: 'all' | 'client' | 'provider' | 'guest';
  isHeaderHero?: boolean;
  ctaText?: string;
  actionUrl?: string;
  badgeText?: string;
  startDate?: string;
  endDate?: string;
  isGlobalHero?: boolean;
  priority?: number;
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

export interface AppFeatureConfig {
  enableTimeline: boolean;
  enableQaRibuGatePass: boolean;
  enableGigs: boolean;
  enableEvents: boolean;
  enableSaccos: boolean;
  enableAssetVerification: boolean;
  enableCourses: boolean;
  enableCatalogue: boolean;
}

export interface Gig {
  id: string;
  providerId: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  budgetType: 'fixed' | 'per hour' | 'per day';
  currency: string;
  location: string;
  imageUrl: string;
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

export interface SetupData {
  role: 'BuildingManager' | 'TenantAdmin' | 'Staff' | 'Gateman';
  premiseId: string;
  unitId?: string;
  adminId?: string;
}

export interface Enquiry {
  id: string;
  userName: string;
  userPhone: string;
  date: string;
  status: 'New' | 'Contacted' | 'Closed';
  vacancyType: string;
}
