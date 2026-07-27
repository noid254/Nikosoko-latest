
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
    SUPER_ADMIN_PROVIDER,
    // --- HOME SERVICES (10) ---
    { 
        id: 'h1', 
        name: 'James Waweru', 
        phone: '254711111111', 
        service: 'Master Plumber', 
        avatarUrl: 'https://i.pravatar.cc/150?u=h1', 
        coverImageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800', 
        rating: 4.8, 
        distanceKm: 1.2, 
        hourlyRate: 1500, 
        rateType: 'per hour', 
        currency: 'Ksh', 
        isVerified: true, 
        about: '20 years of experience in residential and industrial plumbing.', 
        skills: [
            {
                id: 'sk-h1-1',
                skillTitle: 'Certified Master Plumber',
                category: 'Plumbing',
                certificationName: 'Grade I Pipe Fitting & Sanitary License',
                issuingSchool: 'NITA Kenya',
                yearObtained: '2020',
                hourlyRate: 1500,
                currency: 'Ksh',
                description: 'Specializing in residential pipe fitting, blockage unclogging, solar water heater plumbing, and emergency leak repairs.',
                isVerified: true
            }
        ],
        works: [], 
        category: 'HOME', 
        location: 'Westlands, Nairobi', 
        isOnline: true, 
        accountType: 'individual', 
        flagCount: 0, 
        views: 450, 
        cta: ['call', 'whatsapp'] 
    },
    { 
        id: 'h2', 
        name: 'Mary Atieno', 
        phone: '254711111112', 
        service: 'Deep Cleaning Expert', 
        avatarUrl: 'https://i.pravatar.cc/150?u=h2', 
        coverImageUrl: 'https://images.unsplash.com/photo-1581578731117-104f2a863726?q=80&w=800', 
        rating: 4.9, 
        distanceKm: 2.5, 
        hourlyRate: 3000, 
        rateType: 'per task', 
        currency: 'Ksh', 
        isVerified: true, 
        about: 'Eco-friendly cleaning for homes and offices.', 
        skills: [
            {
                id: 'sk-h2-1',
                skillTitle: 'Post-Construction & Office Deep Cleaning',
                category: 'Cleaning',
                certificationName: 'Professional Hospitality & Sanitation Cert',
                issuingSchool: 'Utalii College',
                yearObtained: '2022',
                hourlyRate: 3000,
                currency: 'Ksh',
                description: 'Deep steaming, carpet sanitization, post-renovation cleanup, and eco-safe disinfectant spraying.',
                isVerified: true
            }
        ],
        works: [], 
        category: 'HOME', 
        location: 'Kilimani, Nairobi', 
        isOnline: true, 
        accountType: 'individual', 
        flagCount: 0, 
        views: 890, 
        cta: ['call', 'whatsapp', 'book'] 
    },
    { 
        id: 'h3', 
        name: 'Peter Kamau', 
        phone: '254711111113', 
        service: 'Certified Electrician', 
        avatarUrl: 'https://i.pravatar.cc/150?u=h3', 
        coverImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800', 
        rating: 4.7, 
        distanceKm: 0.8, 
        hourlyRate: 2000, 
        rateType: 'per hour', 
        currency: 'Ksh', 
        isVerified: true, 
        about: 'Specializing in smart home wiring and solar installations.', 
        skills: [
            {
                id: 'sk-h3-1',
                skillTitle: 'High-Voltage Wiring & EPRA Solar Tech',
                category: 'Electrical',
                certificationName: 'EPRA Class T3 Electrical License',
                issuingSchool: 'NITA Kenya',
                yearObtained: '2023',
                hourlyRate: 2000,
                currency: 'Ksh',
                description: 'Specialist in 3-phase domestic wiring, circuit breaker diagnosis, solar inverter synchronization, and emergency fault finding.',
                isVerified: true
            }
        ],
        works: [], 
        category: 'HOME', 
        location: 'Lavington, Nairobi', 
        isOnline: true, 
        accountType: 'individual', 
        flagCount: 0, 
        views: 320, 
        cta: ['call', 'whatsapp'] 
    },
    { id: 'h4', name: 'Grace Muli', phone: '254711111114', service: 'Interior Stylist', avatarUrl: 'https://i.pravatar.cc/150?u=h4', coverImageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800', rating: 4.6, distanceKm: 5.0, hourlyRate: 10000, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Transforming houses into curated homes.', works: [], category: 'HOME', location: 'Karen, Nairobi', isOnline: true, accountType: 'individual', flagCount: 0, views: 210, cta: ['call', 'catalogue'] },
    { id: 'h5', name: 'Maina Carpets', phone: '254711111115', service: 'Upholstery Cleaning', avatarUrl: 'https://i.pravatar.cc/150?u=h5', coverImageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800', rating: 4.5, distanceKm: 3.1, hourlyRate: 2000, rateType: 'per task', currency: 'Ksh', isVerified: false, about: 'Professional carpet and sofa cleaning.', works: [], category: 'HOME', location: 'South C, Nairobi', isOnline: true, accountType: 'individual', flagCount: 0, views: 150, cta: ['call', 'whatsapp'] },
    { id: 'h6', name: 'David Locksmith', phone: '254711111116', service: 'Digital Locks Expert', avatarUrl: 'https://i.pravatar.cc/150?u=h6', coverImageUrl: 'https://images.unsplash.com/photo-1558002038-10339045237c?q=80&w=800', rating: 5.0, distanceKm: 0.2, hourlyRate: 2500, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Installation of biometric and smart home security.', works: [], category: 'HOME', location: 'CBD, Nairobi', isOnline: true, accountType: 'individual', flagCount: 0, views: 600, cta: ['call'] },
    { id: 'h7', name: 'SafeFume', phone: '254711111117', service: 'Eco-Fumigation', avatarUrl: 'https://i.pravatar.cc/150?u=h7', coverImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800', rating: 4.4, distanceKm: 4.2, hourlyRate: 5000, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Safe and effective pest eradication.', works: [], category: 'HOME', location: 'Parklands, Nairobi', isOnline: true, accountType: 'organization', flagCount: 0, views: 280, cta: ['call', 'whatsapp'] },
    { id: 'h8', name: 'Gardens by Grace', phone: '254711111118', service: 'Urban Landscaping', avatarUrl: 'https://i.pravatar.cc/150?u=h8', coverImageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800', rating: 4.8, distanceKm: 1.5, hourlyRate: 12000, rateType: 'per task', currency: 'Ksh', isVerified: false, about: 'Balcony and lawn design experts.', works: [], category: 'HOME', location: 'Gachie, Nairobi', isOnline: true, accountType: 'individual', flagCount: 0, views: 400, cta: ['call', 'whatsapp', 'book'] },

    // --- TRANSPORT SERVICES (8) ---
    { id: 't1', name: 'Brian Boda', phone: '254722222221', service: 'Express Boda', avatarUrl: 'https://i.pravatar.cc/150?u=t1', coverImageUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=800', rating: 4.9, distanceKm: 0.3, hourlyRate: 200, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Fast and safe trips within Westlands.', works: [], category: 'TRANSPORT', location: 'Westlands', isOnline: true, accountType: 'individual', flagCount: 0, views: 1200, cta: ['call'] },
    { id: 't2', name: 'Elite Taxis', phone: '254722222222', service: 'Corporate Cabs', avatarUrl: 'https://i.pravatar.cc/150?u=t2', coverImageUrl: 'https://images.unsplash.com/photo-1549463223-35661e7e4088?q=80&w=800', rating: 4.8, distanceKm: 1.0, hourlyRate: 1500, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Punctual and clean vehicles for all your needs.', works: [], category: 'TRANSPORT', location: 'Kilimani', isOnline: true, accountType: 'organization', flagCount: 0, views: 850, cta: ['call', 'whatsapp', 'book'] },
    { id: 't3', name: 'Swift Delivery', phone: '254722222223', service: 'Parcel Runner', avatarUrl: 'https://i.pravatar.cc/150?u=t3', coverImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800', rating: 4.7, distanceKm: 0.5, hourlyRate: 300, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Parcels delivered in under 60 minutes.', works: [], category: 'TRANSPORT', location: 'CBD', isOnline: true, accountType: 'individual', flagCount: 0, views: 920, cta: ['call', 'whatsapp'] },
    { id: 't4', name: 'Movers Kenya', phone: '254722222224', service: 'House Moving Pro', avatarUrl: 'https://i.pravatar.cc/150?u=t4', coverImageUrl: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=800', rating: 4.6, distanceKm: 3.5, hourlyRate: 25000, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Hassle-free home and office moving.', works: [], category: 'TRANSPORT', location: 'Mombasa Road', isOnline: true, accountType: 'organization', flagCount: 0, views: 540, cta: ['call', 'whatsapp', 'catalogue'] },
    { id: 't5', name: 'Coast Connect', phone: '254722222225', service: 'Daily Shuttle', avatarUrl: 'https://i.pravatar.cc/150?u=t5', coverImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800', rating: 4.9, distanceKm: 5.2, hourlyRate: 2500, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Reliable Nairobi-Mombasa daily shuttle.', works: [], category: 'TRANSPORT', location: 'Upperhill', isOnline: true, accountType: 'individual', flagCount: 0, views: 410, cta: ['call', 'whatsapp'] },
    { id: 't6', name: 'Bike Share', phone: '254722222226', service: 'E-Bike Rentals', avatarUrl: 'https://i.pravatar.cc/150?u=t6', coverImageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800', rating: 4.5, distanceKm: 0.1, hourlyRate: 100, rateType: 'per hour', currency: 'Ksh', isVerified: false, about: 'Rent high-quality e-bikes for urban commute.', works: [], category: 'TRANSPORT', location: 'Gachie', isOnline: true, accountType: 'organization', flagCount: 0, views: 290, cta: ['call', 'save'] },

    // --- HEALTH SERVICES (7) ---
    { id: 'hl1', name: 'Dr. Jane Njeri', phone: '254733333331', service: 'Family Doctor', avatarUrl: 'https://i.pravatar.cc/150?u=hl1', coverImageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800', rating: 5.0, distanceKm: 1.5, hourlyRate: 3000, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Expert consultation at your home or my clinic.', works: [], category: 'HEALTH', location: 'Westlands', isOnline: true, accountType: 'individual', flagCount: 0, views: 780, cta: ['call', 'book'] },
    { id: 'hl2', name: 'Fitness First', phone: '254733333332', service: 'Gym & Training', avatarUrl: 'https://i.pravatar.cc/150?u=hl2', coverImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800', rating: 4.7, distanceKm: 2.2, hourlyRate: 1500, rateType: 'per hour', currency: 'Ksh', isVerified: true, about: 'Strength building and group fitness.', works: [], category: 'HEALTH', location: 'Kilimani', isOnline: true, accountType: 'organization', flagCount: 0, views: 1200, cta: ['call', 'whatsapp', 'menu'] },
    { id: 'hl3', name: 'Serenity Spa', phone: '254733333333', service: 'Massage Therapy', avatarUrl: 'https://i.pravatar.cc/150?u=hl3', coverImageUrl: 'https://images.unsplash.com/photo-1544161515-4ae6ce6ea858?q=80&w=800', rating: 4.8, distanceKm: 0.5, hourlyRate: 3500, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Holistic wellness and relaxation.', works: [], category: 'HEALTH', location: 'Lavington', isOnline: true, accountType: 'organization', flagCount: 0, views: 650, cta: ['call', 'whatsapp', 'catalogue'] },

    // --- PROFESSIONAL SERVICES (8) ---
    { id: 'pr1', name: 'Legal Advisors', phone: '254755555551', service: 'Family Law', avatarUrl: 'https://i.pravatar.cc/150?u=pr1', coverImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800', rating: 4.9, distanceKm: 1.2, hourlyRate: 10000, rateType: 'per hour', currency: 'Ksh', isVerified: true, about: 'Expert legal counsel on family matters.', works: [], category: 'PROFESSIONAL', location: 'Upperhill', isOnline: true, accountType: 'organization', flagCount: 0, views: 900, cta: ['call', 'book'] },
    { id: 'pr2', name: 'Code Lab', phone: '254755555552', service: 'Web Agency', avatarUrl: 'https://i.pravatar.cc/150?u=pr2', coverImageUrl: 'https://images.unsplash.com/photo-1504868584819-f8eec2421750?q=80&w=800', rating: 4.8, distanceKm: 2.5, hourlyRate: 50000, rateType: 'per task', currency: 'Ksh', isVerified: true, about: 'Building high-performance web apps.', works: [], category: 'PROFESSIONAL', location: 'Westlands', isOnline: true, accountType: 'organization', flagCount: 0, views: 1300, cta: ['call', 'whatsapp', 'catalogue'] },

    // --- PREMISE TENANTS (Demo Door Profiles) ---
    { 
        id: 'p-bistro', 
        name: 'The Gourmet Bistro', 
        phone: '254700111222', 
        service: 'Fine Dining & Cafe', 
        avatarUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=200', 
        coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800', 
        rating: 4.9, 
        distanceKm: 0, 
        hourlyRate: 0, 
        rateType: 'per task', 
        currency: 'Ksh', 
        isVerified: true, 
        about: 'Premium cafe and bistro serving local and international flavors. Managed by corporate hospitality group. Best coffee in the plaza.', 
        works: [
            'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=400',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400',
            'https://images.unsplash.com/photo-1550966841-3ee7ad6c107a?q=80&w=400'
        ], 
        category: 'RESTAURANT', 
        location: 'Corporate Plaza, Ground Floor', 
        isOnline: true, 
        accountType: 'organization', 
        flagCount: 0, 
        views: 1250, 
        cta: ['call', 'whatsapp', 'menu', 'save'],
        unit: 'G1',
        floor: 'Ground',
        premiseId: 'p-plaza',
        unitDetails: {
            type: 'Business',
            operatingHours: '07:00 - 22:00',
            availabilityStatus: 'Available'
        },
        menu: [
            { id: 'm1', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon served with wild asparagus and lemon butter sauce.', price: 1800, category: 'Main Course', images: ['https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=400'] },
            { id: 'm2', name: 'Classic Wagyu Burger', description: 'Aged wagyu beef, caramelized onions, truffle aioli on a brioche bun.', price: 1200, category: 'Burgers', images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400'], isSpicy: true },
            { id: 'm3', name: 'Avocado Toast', description: 'Sourdough bread, crushed avocado, poached eggs, and chili flakes.', price: 850, category: 'Breakfast', images: ['https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400'], isVegetarian: true },
            { id: 'm4', name: 'Flat White', description: 'Double shot of house blend espresso with silky steamed milk.', price: 350, category: 'Beverages', images: ['https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400'] },
            { id: 'm5', name: 'Truffle Pasta', description: 'Handmade linguine with black truffle cream and parmesan.', price: 1500, category: 'Main Course', images: ['https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?q=80&w=400'], isVegetarian: true }
        ],
        bundles: [
            { id: 'b1', title: 'Power Lunch Deal', description: 'Any Burger + Any Beverage + Side Salad', price: 1400, originalPrice: 1850, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400' },
            { id: 'b2', title: 'Couples Night', description: '2x Main Courses + Shared Dessert + 2x Drinks', price: 3500, originalPrice: 4500, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=400' }
        ]
    },
    { 
        id: 'p-gizmo', 
        name: 'Gizmo Hub', 
        phone: '254700333444', 
        service: 'Tech Repair & Retail', 
        avatarUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=200', 
        coverImageUrl: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=800', 
        rating: 4.7, 
        distanceKm: 0, 
        hourlyRate: 0, 
        rateType: 'per piece work', 
        currency: 'Ksh', 
        isVerified: true, 
        about: 'Certified tech experts for mobile and laptop repairs. Authorized retail partner.', 
        works: [], 
        category: 'RETAIL', 
        location: 'Corporate Plaza, 2nd Floor', 
        isOnline: true, 
        accountType: 'organization', 
        flagCount: 0, 
        views: 840, 
        cta: ['whatsapp', 'catalogue', 'save'],
        unit: '205',
        floor: '2nd',
        premiseId: 'p-plaza',
        unitDetails: {
            type: 'Business',
            operatingHours: '09:00 - 18:00',
            availabilityStatus: 'Available'
        }
    }
];

export const mockCatalogueItems: CatalogueItem[] = [
    { id: 'cat-s24', providerId: 'p-gizmo', title: 'Samsung Galaxy S24 Ultra', category: 'Product', description: '512GB, AI Enhanced. Titanium Gray.', price: 'Ksh 165,000', imageUrls: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400'], isVerified: true },
    { id: 'cat-mac', providerId: 'p-gizmo', title: 'MacBook Air M2', category: 'Product', description: '13-inch, 256GB SSD, 8GB RAM.', price: 'Ksh 120,000', imageUrls: ['https://images.unsplash.com/photo-1611186871348-b1ec696e5237?q=80&w=400'], isVerified: true },
];

export const mockDocuments: Document[] = [
    { id: 'doc1', type: 'Invoice', number: 'INV-001', issuerName: 'John Doe', clientName: 'Alice', date: '2023-10-26T10:00:00Z', amount: 4500, currency: 'Ksh', paymentStatus: 'Paid' },
];

export const mockQaRibuRequests: QaRibuRequest[] = [
    { id: 'qrr1', premiseId: 'p-plaza', premiseName: 'The Corporate Plaza', hostId: 'p-bistro', hostName: 'The Gourmet Bistro', visitorPhone: '254799887766', visitorName: 'Alice Chen', visitorPurpose: 'Business Lunch', visitorAvatar: 'https://i.pravatar.cc/150?img=5', createdAt: '2023-10-27T00:00:00Z', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), status: 'Approved', requestType: 'Direct', premiseType: 'Commercial', accessCode: 'A123' },
];

export const mockTickets: Ticket[] = [];
export const mockGigs: Gig[] = [];
export const mockEvents: Event[] = [];
export const mockCategories: string[] = ['HOME', 'TRANSPORT', 'HEALTH', 'EDUCATION', 'PROFESSIONAL'];

export const mockSpecialBanners: SpecialBanner[] = [];

export const mockPremises: Premise[] = [
    {
      id: 'p-plaza', 
      name: 'The Corporate Plaza', 
      tagline: 'Premier Business Hub', 
      logoUrl: 'https://i.imgur.com/I5MaTM3.png', 
      bannerImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200', 
      galleryImages: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800'
      ],
      about: 'The Corporate Plaza offers elite office spaces and high-end retail opportunities in the heart of the city.', 
      location: 'Kilimani, Nairobi', 
      street: 'Lenana Road', 
      gps: { lat: -1.2921, lng: 36.8019 }, 
      amenities: [
          { name: 'Backup Power' },
          { name: 'High Speed Lifts' },
          { name: 'Rooftop Cafe' },
          { name: 'Gym' },
          { name: '24/7 Security' }
      ], 
      contactEmail: 'admin@corporateplaza.com', 
      contactPhone: '254700000111', 
      operatingHours: '06:00 - 22:00', 
      vacancies: [
          { 
              id: 'v1', 
              unitNumber: '304', 
              floor: '3rd', 
              type: 'Office', 
              configuration: 'Executive Corner Suite', 
              status: 'Vacant', 
              rentAmount: 75000, 
              size: '1,200',
              images: [
                  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800',
                  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800'
              ],
              description: 'Bright corner office with floor-to-ceiling windows, private kitchenette, and ergonomic layout perfect for a growing tech team.',
              amenities: ['High-speed Fiber', 'AC', 'Private Kitchenette']
          },
          { 
              id: 'v2', 
              unitNumber: 'G12', 
              floor: 'Ground', 
              type: 'Shop', 
              configuration: 'Prime Retail Shell', 
              status: 'Vacant', 
              rentAmount: 120000, 
              size: '1,850',
              images: [
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
                  'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=800'
              ],
              description: 'High-traffic retail space located adjacent to the main lobby. Excellent visibility and modern facade.',
              amenities: ['Lobby Frontage', 'Service Entry', 'Grease Trap Ready']
          }
      ], 
      buildingManagerId: 'sa1', 
      tenants: ['p-bistro', 'p-gizmo'], 
      verificationStatus: 'Verified',
      type: 'Commercial'
    },
    {
      id: 'p-manor', 
      name: 'Oakwood Residence', 
      tagline: 'Modern Living Redefined', 
      logoUrl: '', 
      bannerImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200', 
      galleryImages: [
          'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800',
          'https://images.unsplash.com/photo-1512918766674-ed62b9a39c3e?q=80&w=800'
      ],
      about: 'Luxurious apartments with panoramic city views and premium lifestyle amenities.', 
      location: 'Lavington, Nairobi', 
      amenities: [{ name: 'Pool' }, { name: 'Kids Play Area' }, { name: 'CCTV' }], 
      contactEmail: 'oakwood@manor.co.ke', 
      contactPhone: '254711222333', 
      vacancies: [
          { 
              id: 'v3', 
              unitNumber: '10A', 
              floor: '10th', 
              type: 'Apartment', 
              configuration: '3 Bedroom Penthouse All Ensuite', 
              status: 'Vacant', 
              rentAmount: 180000, 
              size: '2,400',
              images: [
                  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
                  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800'
              ],
              description: 'Exquisite penthouse with sunset views, wrap-around balcony, and modern open-plan kitchen. Managed by premium lifestyle concierge.',
              amenities: ['Private Elevator', 'Gym Access', 'Sunset Balcony']
          }
      ], 
      buildingManagerId: 'sa1', 
      tenants: [], 
      verificationStatus: 'Verified',
      type: 'Residential'
    },
    {
      id: 'p-skyline', 
      name: 'Skyline Residences', 
      tagline: 'Elevated Urban Lifestyle', 
      logoUrl: 'https://i.imgur.com/I5MaTM3.png', 
      bannerImageUrl: 'https://images.unsplash.com/photo-1545324418-f1d3ac157306?q=80&w=1200', 
      galleryImages: [
          'https://images.unsplash.com/photo-1545324418-f1d3ac157306?q=80&w=800',
          'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=800'
      ],
      about: 'A masterpiece of contemporary architecture, Skyline Residences offers unmatched luxury in the city skyline.', 
      location: 'Kilimani, Nairobi', 
      amenities: [{ name: 'Infinity Pool' }, { name: 'Smart Home' }, { name: 'Concierge' }], 
      contactEmail: 'sales@skyline.co.ke', 
      contactPhone: '254700999888', 
      vacancies: [
          { 
              id: 'v4', 
              unitNumber: '402', 
              floor: '4th', 
              type: 'Apartment', 
              configuration: '2 Bedroom Luxury Suite', 
              status: 'Vacant', 
              rentAmount: 110000, 
              size: '1,450',
              images: [
                  'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800',
                  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800'
              ],
              description: 'Modern 2-bedroom suite with smart lighting, designer finishes, and an open layout designed for professional urban living.',
              amenities: ['Smart Access', 'Walk-in Closet', 'Balcony']
          },
          { 
              id: 'v5', 
              unitNumber: 'PH-1', 
              floor: '22nd', 
              type: 'Apartment', 
              configuration: 'Grand Presidential Penthouse', 
              status: 'Vacant', 
              rentAmount: 450000, 
              size: '5,200',
              images: [
                  'https://images.unsplash.com/photo-1600607687940-47a00160205b?q=80&w=800',
                  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800'
              ],
              description: 'The ultimate in luxury. 5-bedroom duplex penthouse featuring private pool, cinema room, and 360-degree views of the Nairobi skyline.',
              amenities: ['Private Pool', 'Home Cinema', 'Maid Quarter']
          }
      ], 
      buildingManagerId: 'sa1', 
      tenants: [], 
      verificationStatus: 'Verified',
      type: 'Residential'
    },
];

export const mockInboxMessages: InboxMessage[] = [];
