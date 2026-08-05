import type { ServiceProvider, CatalogueItem, Document, QaRibuRequest, Ticket, Gig, Event, SpecialBanner, InboxMessage, Premise, UnitKey } from '../types';

export const SUPER_ADMIN_PROVIDER: ServiceProvider = {
    id: 'superadmin-0723119356',
    name: 'Alex Kiprop (Super Admin)',
    phone: '254723119356',
    service: 'Master Systems Administrator & Marketplace Director',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    coverImageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800',
    rating: 5.0,
    distanceKm: 0.1,
    hourlyRate: 5000,
    rateType: 'per hour',
    currency: 'Ksh',
    isVerified: true,
    isProfileCompleted: true,
    about: 'Super Admin account for NikoSoko platform testing. Has full system administrative access to audit marketplace listings, manage premises, validate gate passes, oversee gigs, and monitor quality control.',
    category: 'PERSONAL',
    location: 'Nairobi HQ, Kenya',
    isOnline: true,
    accountType: 'individual',
    flagCount: 0,
    views: 1250,
    role: 'SuperAdmin',
    cta: ['call', 'whatsapp', 'book', 'catalogue', 'save'],
    skills: [
        {
            id: 'sk-sa-1',
            skillTitle: 'Platform Audit & Quality Control',
            category: 'Super Admin & Technical',
            certificationName: 'NikoSoko Master Administrator Certification',
            issuingSchool: 'NikoSoko Tech Academy',
            yearObtained: '2025',
            hourlyRate: 5000,
            currency: 'Ksh',
            description: 'System-wide provider verification, fraud detection, review audits, and marketplace regulation compliance testing.',
            isVerified: true
        },
        {
            id: 'sk-sa-2',
            skillTitle: 'Enterprise IT & Systems Management',
            category: 'IT & Technology',
            certificationName: 'Certified Information Systems Security Professional (CISSP)',
            issuingSchool: 'KCA University',
            yearObtained: '2024',
            hourlyRate: 4500,
            currency: 'Ksh',
            description: 'Database administration, API integrations, premise digital access control, and payment gateway auditing.',
            isVerified: true
        },
        {
            id: 'sk-sa-3',
            skillTitle: 'Digital Operations & Logistics Consulting',
            category: 'Consulting',
            certificationName: 'Project Management Professional (PMP)',
            issuingSchool: 'Strathmore Business School',
            yearObtained: '2023',
            hourlyRate: 4000,
            currency: 'Ksh',
            description: 'Workflow optimization, service provider onboarding, gig escalation resolution, and ticket dispatch testing.',
            isVerified: true
        }
    ],
    works: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600'
    ]
};

export const mockProviders: ServiceProvider[] = [
    SUPER_ADMIN_PROVIDER
];

export const mockCatalogueItems: CatalogueItem[] = [];

export const mockDocuments: Document[] = [];

export const mockQaRibuRequests: QaRibuRequest[] = [];

export const mockTickets: Ticket[] = [];
export const mockGigs: Gig[] = [];
export const mockEvents: Event[] = [];
export const mockCategories: string[] = ['HOME', 'TRANSPORT', 'HEALTH', 'EDUCATION', 'PROFESSIONAL'];

export const mockSpecialBanners: SpecialBanner[] = [];

export const mockPremises: Premise[] = [];

export const mockInboxMessages: InboxMessage[] = [];
