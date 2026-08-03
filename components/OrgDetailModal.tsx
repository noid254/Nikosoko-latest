import React, { useState } from 'react';

export interface CourseOfferItem {
  id: string;
  title: string;
  demandTag: 'EXTREME DEMAND' | 'VERY HIGH DEMAND' | 'HIGH DEMAND' | 'HOT MARKET TRADE';
  demandPercentage: number;
  rating: number;
  marketPay: string;
  description?: string;
  duration?: string;
  prerequisites?: string;
  estimatedFee?: string;
  coverImage?: string;
  syllabus?: { moduleNumber: number; title: string; topics: string[] }[];
  careerRoles?: string[];
  certificationAwarded?: string;
}

export interface OrgProfile {
  id: string;
  shortName: string;
  fullName: string;
  category: string;
  accreditationStatus: string;
  location: string;
  established: string;
  about: string;
  coursesOffered: CourseOfferItem[];
  publicOffers: { title: string; description: string; tag: string }[];
  contactPhone: string;
  contactEmail: string;
  website: string;
  verifiedGraduatesCount: number;
}

// Directory of Certifying Bodies & Institutions in Kenya
const ORG_DIRECTORY: Record<string, OrgProfile> = {
  NTSA: {
    id: 'ntsa',
    shortName: 'NTSA Kenya',
    fullName: 'National Transport and Safety Authority',
    category: 'Transport, Road Safety & Driver Licensing',
    accreditationStatus: 'Statutory Transport Regulator',
    location: 'Hill Park Building, Upper Hill, Nairobi',
    established: '2012',
    about: 'NTSA regulates public service vehicles (PSV), commercial taxi transportation, motor vehicle safety inspection, and driver smart licensing in Kenya. NTSA smart driver badges ensure certified road safety and compliance.',
    coursesOffered: [
      {
        id: 'ntsa-1',
        title: 'PSV Driver Smart Driving License (Class B/C/D Badge)',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 98,
        rating: 4.9,
        marketPay: 'KES 1,800 - 4,000 / day',
        description: 'Mandatory smart license badge for ride-hailing app drivers, commercial taxi operators, and PSV shuttles.',
        duration: '1 - 2 Weeks',
        prerequisites: 'Valid Kenya National ID & Class B/C/D Driving License',
        estimatedFee: 'KES 3,000',
        coverImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'NTSA Smart Driving Badge & PSV Endorsement Card',
        careerRoles: ['Uber/Bolt Chauffeur', 'PSV Shuttle Operator', 'Corporate VIP Driver', 'Logistics Courier'],
        syllabus: [
          { moduleNumber: 1, title: 'Road Safety & Highway Code', topics: ['Kenyan Traffic Act rules & penal codes', 'Speed governor management', 'Hazard perception & night driving'] },
          { moduleNumber: 2, title: 'PSV Passenger Care & Ethics', topics: ['Customer service & hygiene standards', 'De-escalation & conflict resolution', 'Luggage & route efficiency'] },
          { moduleNumber: 3, title: 'Digital Navigation & Trip Apps', topics: ['GPS routing & live traffic avoidance', 'Digital fare processing', 'Emergency SOS triggers'] },
          { moduleNumber: 4, title: 'NTSA Biometric Practical Evaluation', topics: ['Vehicle pre-trip safety checklist', 'Defensive maneuvering test', 'Final NTSA Badge issuance'] }
        ]
      },
      {
        id: 'ntsa-2',
        title: 'Commercial Taxi Operator License & Conduct Badge',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 95,
        rating: 4.8,
        marketPay: 'KES 2,000 - 5,000 / day',
        description: 'Official good conduct verification & commercial taxi permit for airport and city transport.',
        duration: '3 - 5 Days',
        prerequisites: 'Police Certificate of Good Conduct & NTSA Account',
        estimatedFee: 'KES 2,500',
        coverImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'NTSA Commercial Taxi License Badge',
        careerRoles: ['Airport Taxi Chauffeur', 'City Transport Operator', 'Fleet Contractor'],
        syllabus: [
          { moduleNumber: 1, title: 'Commercial Taxi Licensing Norms', topics: ['Good conduct verification workflow', 'City council parking & drop-off regulations', 'Vehicle insurance & passenger liability'] },
          { moduleNumber: 2, title: 'Executive Ride Etiquette', topics: ['Client confidentiality', 'Vehicle air quality & upkeep', 'Airport dispatch protocols'] }
        ]
      },
      {
        id: 'ntsa-3',
        title: 'Defensive Driving & Road Safety Compliance Cert',
        demandTag: 'HIGH DEMAND',
        demandPercentage: 91,
        rating: 4.7,
        marketPay: 'KES 2,500 - 6,000 / day',
        description: 'Advanced hazard awareness, passenger safety protocols, and speed governor management.',
        duration: '1 Week',
        prerequisites: 'Active Driver License',
        estimatedFee: 'KES 5,000',
        coverImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'National Defensive Driving Safety Certificate',
        careerRoles: ['Long-Distance Driver', 'Hazardous Cargo Escort', 'Fleet Safety Manager'],
        syllabus: [
          { moduleNumber: 1, title: 'Adverse Weather & Terrain Control', topics: ['Wet road braking distances', 'Off-road recovery', 'Tyre blow-out response'] },
          { moduleNumber: 2, title: 'Emergency Evasive Techniques', topics: ['Anti-collision steering', 'Blind spot mastery', 'Fuel-saving eco-driving'] }
        ]
      },
      {
        id: 'ntsa-4',
        title: 'Motor Vehicle Safety & Fleet Inspection Certification',
        demandTag: 'HOT MARKET TRADE',
        demandPercentage: 89,
        rating: 4.6,
        marketPay: 'KES 3,000 - 7,000 / day',
        description: 'Commercial fleet roadworthiness inspector certification for taxi & logistics companies.',
        duration: '2 Weeks',
        prerequisites: 'Automotive / Mechanical Certificate or 2 yrs field exp',
        estimatedFee: 'KES 8,000',
        coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'Certified NTSA Fleet Roadworthiness Inspector',
        careerRoles: ['Fleet Safety Inspector', 'Garage Quality Assurance Lead', 'Logistics Fleet Auditor'],
        syllabus: [
          { moduleNumber: 1, title: 'Chassis & Brake System Audit', topics: ['ABS & hydraulic pressure checks', 'Brake pad wear tolerances', 'Suspension stress testing'] },
          { moduleNumber: 2, title: 'Emissions & Governor Verification', topics: ['Exhaust gas analyzer operation', 'Governor tamper seals', 'Digital inspection reporting'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'PSV Driver Badge Verification Portal',
        description: 'Instant NTSA smart license & driver badge verification for taxi and ride-hailing platforms.',
        tag: 'Driver Verification'
      },
      {
        title: 'Commercial Taxi Safety & Road Refresher 2026',
        description: 'Mandatory safety and customer care refresher for PSV & private taxi drivers.',
        tag: 'Safety Refresher'
      }
    ],
    contactPhone: '+254 709 932 000',
    contactEmail: 'info@ntsa.go.ke',
    website: 'www.ntsa.go.ke',
    verifiedGraduatesCount: 4850
  },
  AA: {
    id: 'aa-kenya',
    shortName: 'AA Driving School',
    fullName: 'Automobile Association of Kenya (AA Kenya)',
    category: 'Automotive & Driving Academy',
    accreditationStatus: 'NTSA Accredited Master Academy',
    location: 'Renaissance Corporate Park, Upper Hill, Nairobi (45 Branches)',
    established: '1962',
    about: 'AA Driving School is Kenya’s premier driver training academy. It certifies professional taxi drivers, private chauffeurs, VIP drivers, and logistics fleet operators with international driving standards.',
    coursesOffered: [
      {
        id: 'aa-1',
        title: 'Professional Taxi & Executive Chauffeur Certificate',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 97,
        rating: 4.9,
        marketPay: 'KES 2,500 - 6,500 / day',
        description: 'Comprehensive chauffeur etiquette, GPS navigation, defensive driving & emergency protocols.',
        duration: '2 Weeks',
        prerequisites: 'Valid Driving License & National ID',
        estimatedFee: 'KES 8,500',
        coverImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'AA Master Executive Chauffeur License',
        careerRoles: ['Executive Hotel Driver', 'Diplomatic Chauffeur', 'Private Family Driver'],
        syllabus: [
          { moduleNumber: 1, title: 'VIP Courtesy & Vehicle Presentation', topics: ['Protocol for high-net-worth passengers', 'Interior sanitization & scent standards', 'Route pre-planning'] },
          { moduleNumber: 2, title: 'Precision Driving & Security', topics: ['Smooth acceleration & braking', 'Concealed danger recognition', 'Evasive maneuvers'] }
        ]
      },
      {
        id: 'aa-2',
        title: 'Advanced Defensive Driving & VIP Logistics Cert',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 94,
        rating: 4.8,
        marketPay: 'KES 3,500 - 8,000 / day',
        description: 'High-security transport, convoy driving, evasive maneuvers and VIP client confidentiality.',
        duration: '1 Week',
        prerequisites: 'Class B/C Driving License with 2+ yrs driving experience',
        estimatedFee: 'KES 12,000',
        coverImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'AA Certified VIP Tactical Driver',
        careerRoles: ['Embassy Chauffeur', 'Executive Security Driver', 'High-Value Cargo Transporter'],
        syllabus: [
          { moduleNumber: 1, title: 'Tactical Escort & Convoy Formations', topics: ['Multi-vehicle lead/rear protocol', 'Threat assessment on highways', 'Emergency extraction'] }
        ]
      },
      {
        id: 'aa-3',
        title: 'Automotive First Aid & Emergency Rescue',
        demandTag: 'HIGH DEMAND',
        demandPercentage: 88,
        rating: 4.7,
        marketPay: 'KES 2,000 - 4,500 / day',
        description: 'Roadside first responder certification and basic vehicle mechanical diagnostics.',
        duration: '3 Days',
        prerequisites: 'Open to all commercial and private drivers',
        estimatedFee: 'KES 4,500',
        coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'AA First Responder Certificate',
        careerRoles: ['Roadside Assistance Specialist', 'Fleet Safety Marshal'],
        syllabus: [
          { moduleNumber: 1, title: 'CPR & Crash Scene Triage', topics: ['Victim stabilization', 'Fire extinguisher deployment', 'Emergency flare setup'] }
        ]
      },
      {
        id: 'aa-4',
        title: 'Customer Service & Executive Ride-Hailing Protocol',
        demandTag: 'HOT MARKET TRADE',
        demandPercentage: 92,
        rating: 4.8,
        marketPay: 'KES 1,800 - 4,000 / day',
        description: 'Excellence in customer care, trip hygiene, digital payment handling, and ratings maintenance.',
        duration: '3 Days',
        prerequisites: 'Active Uber, Bolt, Faras or Taxi operator',
        estimatedFee: 'KES 3,500',
        coverImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'AA Certified 5-Star Ride Chauffeur',
        careerRoles: ['Premium Uber/Bolt Driver', 'Corporate Transport Operator'],
        syllabus: [
          { moduleNumber: 1, title: 'Rating Optimization & Conflict Avoidance', topics: ['5-star passenger interaction', 'Handling difficult clients', 'Digital cashless tips & receipts'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'AA Certified Chauffeur & Taxi Guild',
        description: 'Direct hiring portal for AA-trained taxi drivers with verified road safety scores.',
        tag: 'Certified Drivers'
      },
      {
        title: 'AA Roadside Assistance & Fleet Protection',
        description: '24/7 towing, rescue, and fuel assistance for Nikosoko registered drivers.',
        tag: 'Fleet Service'
      }
    ],
    contactPhone: '+254 709 933 000',
    contactEmail: 'customercare@aakenya.co.ke',
    website: 'www.aakenya.co.ke',
    verifiedGraduatesCount: 3600
  },
  KMTC: {
    id: 'kmtc',
    shortName: 'KMTC',
    fullName: 'Kenya Medical Training College',
    category: 'Medical & Healthcare Training',
    accreditationStatus: 'State Accredited Tertiary Body',
    location: 'Nairobi HQ • 71 Campuses Nationwide',
    established: '1927',
    about: 'Kenya Medical Training College (KMTC) is the leading health training institution in East & Central Africa, producing over 85% of Kenya’s mid-level healthcare workforce including clinical officers, lab technologists, nurses, and pharmacists.',
    coursesOffered: [
      {
        id: 'kmtc-1',
        title: 'Diploma in Medical Laboratory Technology',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 99,
        rating: 5.0,
        marketPay: 'KES 3,000 - 8,000 / day',
        description: 'Clinical biochemistry, hematology, microbiology, and hospital lab diagnostics.',
        duration: '3 Years',
        prerequisites: 'KCSE C Plain with C in Biology & Chemistry',
        estimatedFee: 'Govt Subsidized / KES 35,000 per term',
        coverImage: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'Diploma in Medical Laboratory Technology (KMLTTB Licensed)',
        careerRoles: ['Hospital Lab Technologist', 'Diagnostic Clinic Operator', 'Blood Bank Analyst'],
        syllabus: [
          { moduleNumber: 1, title: 'Hematology & Blood Transfusion Science', topics: ['Blood cell morphology', 'Cross-matching', 'Anemia diagnostics'] },
          { moduleNumber: 2, title: 'Clinical Microbiology & Parasitology', topics: ['Bacterial culture & sensitivity', 'Malaria microscopy', 'Viral load assays'] },
          { moduleNumber: 3, title: 'Clinical Biochemistry', topics: ['Liver & kidney function panels', 'Diabetes monitoring', 'Automated analyzer calibration'] },
          { moduleNumber: 4, title: 'Practical Hospital Attachment', topics: ['6-month supervised clinical internship', 'KMLTTB Board Examination'] }
        ]
      },
      {
        id: 'kmtc-2',
        title: 'Diploma in Clinical Medicine & Surgery',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 98,
        rating: 4.9,
        marketPay: 'KES 4,000 - 10,000 / day',
        description: 'Outpatient consultation, primary healthcare diagnosis, minor surgery, and emergency care.',
        duration: '3 Years',
        prerequisites: 'KCSE C Plain with C in English, Math, Biology & Chem',
        estimatedFee: 'Govt Subsidized',
        coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'Diploma in Clinical Medicine & Surgery (COC Licensed Clinical Officer)',
        careerRoles: ['Registered Clinical Officer (RCO)', 'Outpatient Clinic Director', 'Emergency Room Practitioner'],
        syllabus: [
          { moduleNumber: 1, title: 'Anatomy, Physiology & Pathology', topics: ['Human system function', 'Disease mechanisms', 'Pharmacology'] },
          { moduleNumber: 2, title: 'Clinical Diagnostics & Minor Surgery', topics: ['Physical examination', 'Wound debridement & suturing', 'Obstetric emergencies'] },
          { moduleNumber: 3, title: 'Community Health & Epidemiology', topics: ['Disease surveillance', 'Immunization programs', 'Public health management'] }
        ]
      },
      {
        id: 'kmtc-3',
        title: 'Higher Diploma in Health Diagnostics & Ultrasound',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 96,
        rating: 4.9,
        marketPay: 'KES 5,000 - 12,000 / day',
        description: 'Specialized diagnostic imaging, sonography, and pathology reporting.',
        duration: '1 Year (Post-Diploma)',
        prerequisites: 'Diploma in Radiography / Clinical Medicine',
        estimatedFee: 'KES 45,000 per semester',
        coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'Higher Diploma in Medical Ultrasound Sonography',
        careerRoles: ['Ultrasonographer', 'Maternal Diagnostics Lead', 'Radiology Specialist'],
        syllabus: [
          { moduleNumber: 1, title: 'Obstetric & Abdominal Ultrasound', topics: ['Fetal anatomy screening', 'Liver & kidney scans', 'Doppler blood flow'] }
        ]
      },
      {
        id: 'kmtc-4',
        title: 'Certificate in Health Records & Information Tech',
        demandTag: 'HIGH DEMAND',
        demandPercentage: 90,
        rating: 4.6,
        marketPay: 'KES 2,000 - 4,500 / day',
        description: 'Digital health systems management, patient registry, and medical coding.',
        duration: '2 Years',
        prerequisites: 'KCSE C- Minus',
        estimatedFee: 'KES 28,000 per term',
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'Certificate in Health Records Information Management',
        careerRoles: ['Medical Records Officer', 'Hospital Registrar', 'Health Data Analyst'],
        syllabus: [
          { moduleNumber: 1, title: 'ICD-11 Medical Coding & EHR', topics: ['Electronic health record databases', 'Patient privacy & HIPAA', 'Hospital billing integration'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'CPD Healthcare Skills Refresher 2026',
        description: 'Short-term certified workshops for lab techs and clinical officers.',
        tag: 'Continuing Education'
      },
      {
        title: 'Hospital Attachment & Internship Placement',
        description: 'Direct placement program for certified KMTC graduates on Nikosoko.',
        tag: 'Graduate Placement'
      }
    ],
    contactPhone: '+254 20 272 5711',
    contactEmail: 'info@kmtc.ac.ke',
    website: 'www.kmtc.ac.ke',
    verifiedGraduatesCount: 1420
  },
  NITA: {
    id: 'nita',
    shortName: 'NITA Kenya',
    fullName: 'National Industrial Training Authority',
    category: 'Industrial & Technical Trade Testing',
    accreditationStatus: 'State Technical Regulatory Body',
    location: 'Commercial Street, Industrial Area, Nairobi',
    established: '1971',
    about: 'NITA regulates and conducts industrial trade testing in Kenya. It certifies skilled artisans, welders, plumbers, mechanics, and electricians through Grade I, II, and III Trade Test accreditations.',
    coursesOffered: [
      {
        id: 'nita-1',
        title: 'National Trade Test Grade I (Electrical / Solar PV)',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 97,
        rating: 4.9,
        marketPay: 'KES 2,500 - 7,000 / day',
        description: 'Master electrician certification for domestic, commercial, and industrial installations.',
        duration: 'Trade Test / 3 Months Practical',
        prerequisites: 'Grade II Cert or 3 yrs field experience',
        estimatedFee: 'KES 6,000 Exam Fee',
        coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'Government Trade Test Grade 1 Certificate in Electrical Installation',
        careerRoles: ['Master Electrician', 'Solar PV Installer', 'Building Services Supervisor', 'Contractor'],
        syllabus: [
          { moduleNumber: 1, title: 'Industrial Conduit & 3-Phase Wiring', topics: ['Distribution board balance', 'Substation earthing', 'Motor starter control'] },
          { moduleNumber: 2, title: 'Solar PV Off-Grid & Hybrid Design', topics: ['Inverter sizing', 'Lithium battery banks', 'Net metering compliance'] },
          { moduleNumber: 3, title: 'Testing, Fault Finding & Certification', topics: ['Insulation resistance testing', 'NITA Practical Board Exam'] }
        ]
      },
      {
        id: 'nita-2',
        title: 'National Trade Test Grade II (Plumbing & Piping)',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 94,
        rating: 4.8,
        marketPay: 'KES 2,000 - 5,500 / day',
        description: 'Certified pressure piping, drainage, solar water heater & sanitary fittings installation.',
        duration: 'Trade Test Evaluation',
        prerequisites: 'Grade III Cert or 2 yrs field experience',
        estimatedFee: 'KES 5,000 Exam Fee',
        coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'NITA Grade 2 Trade Certificate in Plumbing & Sanitary Fittings',
        careerRoles: ['Commercial Plumber', 'Solar Water Heating Tech', 'Site Pipe Fitter'],
        syllabus: [
          { moduleNumber: 1, title: 'High Pressure Water Systems', topics: ['PPR & HDPE heat fusion', 'Booster pump installations', 'Greywater recycling'] }
        ]
      },
      {
        id: 'nita-3',
        title: 'Government Trade Test Grade I (Arc & TIG Welding)',
        demandTag: 'HIGH DEMAND',
        demandPercentage: 93,
        rating: 4.7,
        marketPay: 'KES 3,000 - 8,000 / day',
        description: 'Structural steel fabrication, pressure vessel welding, and metal engineering.',
        duration: 'Trade Test Evaluation',
        prerequisites: 'Grade II Welding Cert or proven shop practice',
        estimatedFee: 'KES 6,500 Exam Fee',
        coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'NITA Grade 1 Master Structural Welder Certificate',
        careerRoles: ['High-Rise Steel Welder', 'Pipeline Fabrication Specialist', 'Workshop Foreman'],
        syllabus: [
          { moduleNumber: 1, title: 'TIG & MIG Alloy Welding', topics: ['Stainless steel & aluminum welding', 'X-ray joint inspection standards'] }
        ]
      },
      {
        id: 'nita-4',
        title: 'Master Craftsman Industrial Apprenticeship',
        demandTag: 'HOT MARKET TRADE',
        demandPercentage: 91,
        rating: 4.8,
        marketPay: 'KES 3,500 - 9,000 / day',
        description: 'Advanced machine shop practice, toolmaking, and factory maintenance leadership.',
        duration: '6 Months Practical Training',
        prerequisites: 'NITA Grade I or Diploma in Engineering',
        estimatedFee: 'KES 15,000',
        coverImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'NITA Master Craftsman Diploma',
        careerRoles: ['Factory Maintenance Manager', 'Toolmaker', 'Industrial Lathe Machinist'],
        syllabus: [
          { moduleNumber: 1, title: 'Precision CNC & Lathe Operation', topics: ['Micrometer tolerances', 'Hydraulic press maintenance', 'Factory breakdown response'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'NITA Trade Test Registration 2026',
        description: 'Book your trade test evaluation for formal government skill certification.',
        tag: 'Certification Exam'
      },
      {
        title: 'Nikosoko Verified Artisan Registry',
        description: 'Direct skill verification for NITA Grade 1-3 certified tradespersons.',
        tag: 'Artisan Portal'
      }
    ],
    contactPhone: '+254 20 269 5580',
    contactEmail: 'directorgeneral@nita.go.ke',
    website: 'www.nita.go.ke',
    verifiedGraduatesCount: 2150
  },
  EPRA: {
    id: 'epra',
    shortName: 'EPRA Kenya',
    fullName: 'Energy and Petroleum Regulatory Authority',
    category: 'Energy & Electrical Licensing',
    accreditationStatus: 'Statutory Regulator',
    location: 'Eagle House, Kilimani, Nairobi',
    established: '2006',
    about: 'EPRA licenses electrical workers, solar PV contractors, and petroleum technicians across Kenya. Holding an EPRA T1, T2, or T3 license guarantees safety and code compliance.',
    coursesOffered: [
      {
        id: 'epra-1',
        title: 'Class T3 Solar PV Electrician & Inverter Specialist',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 99,
        rating: 5.0,
        marketPay: 'KES 4,000 - 12,000 / day',
        description: 'Utility-scale & commercial hybrid solar PV system design, battery storage & commissioning.',
        duration: 'Licensing Board Exam',
        prerequisites: 'T2 License + Degree / Higher Diploma in Electrical Eng',
        estimatedFee: 'KES 7,500 License Fee',
        coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'EPRA Class T3 Solar PV License',
        careerRoles: ['Solar System Engineer', 'Commercial PV Project Manager', 'Energy Auditor'],
        syllabus: [
          { moduleNumber: 1, title: 'Mega-Watt Solar Plant Design', topics: ['PVSyst modeling', 'High voltage inverter grid tie', 'Battery management systems'] }
        ]
      },
      {
        id: 'epra-2',
        title: 'Class A1 & C1 Electrical Contractor License',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 96,
        rating: 4.9,
        marketPay: 'KES 5,000 - 15,000 / day',
        description: 'High voltage substation wiring, building electrification, and grid tie installations.',
        duration: 'Licensing Evaluation',
        prerequisites: 'NITA Grade I or Diploma in Electrical Engineering',
        estimatedFee: 'KES 5,000 License Fee',
        coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'EPRA Class A1 Electrical Contractor License',
        careerRoles: ['Licensed Electrical Contractor', 'High Voltage Specialist'],
        syllabus: [
          { moduleNumber: 1, title: 'High Voltage Safety & Grid Regulations', topics: ['Transformer testing', 'Lightning protection', 'Safety clearances'] }
        ]
      },
      {
        id: 'epra-3',
        title: 'LPG Station & Gas Pipeline Safety Technician',
        demandTag: 'HIGH DEMAND',
        demandPercentage: 90,
        rating: 4.7,
        marketPay: 'KES 3,000 - 8,000 / day',
        description: 'Liquefied petroleum gas storage safety, pressure valve inspection, and plant maintenance.',
        duration: 'Specialized Short Course & Exam',
        prerequisites: 'Mechanical / Chemical background',
        estimatedFee: 'KES 10,000',
        coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'EPRA LPG Safety Inspector License',
        careerRoles: ['Gas Depot Safety Lead', 'LPG Station Inspector'],
        syllabus: [
          { moduleNumber: 1, title: 'LPG Storage & Pressure Vessel Audits', topics: ['Hydrostatic pressure testing', 'Gas leak detection systems'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'Electrical License Renewal & Portal Check',
        description: 'Verify active EPRA electrician license credentials on Nikosoko.',
        tag: 'Licensing'
      },
      {
        title: 'Solar System Safety Inspector Directory',
        description: 'Hire EPRA licensed solar installers with active public liability cover.',
        tag: 'Directory'
      }
    ],
    contactPhone: '+254 20 284 7000',
    contactEmail: 'info@epra.go.ke',
    website: 'www.epra.go.ke',
    verifiedGraduatesCount: 890
  },
  KITI: {
    id: 'kiti',
    shortName: 'KITI Kenya',
    fullName: 'Kenya Industrial Training Institute',
    category: 'Machinery, Agro-Processing & Mechanical',
    accreditationStatus: 'Ministry of Industry Institute',
    location: 'Nakuru Main Campus, Kenya',
    established: '1965',
    about: 'KITI provides specialized hands-on training in heavy machinery operation, tractor ploughing, mechanical engineering, footwear tech, and industrial maintenance.',
    coursesOffered: [
      {
        id: 'kiti-1',
        title: 'Heavy Machinery & Tractor Operation Certificate',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 96,
        rating: 4.9,
        marketPay: 'KES 3,500 - 9,000 / day',
        description: 'Excavator, grader, bulldozer, and agricultural tractor operation with hydraulics.',
        duration: '1 - 3 Months Practical',
        prerequisites: 'Valid Driving License (Class G/I)',
        estimatedFee: 'KES 25,000',
        coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'KITI Government Heavy Equipment Operator Badge',
        careerRoles: ['Excavator Operator', 'Road Grader Driver', 'Large Farm Machinery Lead'],
        syllabus: [
          { moduleNumber: 1, title: 'Hydraulic Controls & Machine Handling', topics: ['Bucket leverage & trench digging', 'Slope stabilization', 'Daily engine maintenance'] }
        ]
      },
      {
        id: 'kiti-2',
        title: 'Diploma in Mechanical & Agricultural Engineering',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 92,
        rating: 4.7,
        marketPay: 'KES 3,000 - 7,500 / day',
        description: 'Diesel engine overhaul, farm equipment fabrication, and industrial lathe operations.',
        duration: '2 Years',
        prerequisites: 'KCSE C- Minus',
        estimatedFee: 'KES 30,000 per semester',
        coverImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'KITI Diploma in Mechanical Engineering',
        careerRoles: ['Plant Maintenance Engineer', 'Agricultural Workshop Director'],
        syllabus: [
          { moduleNumber: 1, title: 'Diesel Engine Rebuilding', topics: ['Piston clearance', 'Turbocharger tuning', 'Hydraulic pump repair'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'Tractor Operator & Farm Equipment Guild',
        description: 'Certified machinery operators available for seasonal farm work.',
        tag: 'Equipment Operators'
      }
    ],
    contactPhone: '+254 51 221 6380',
    contactEmail: 'info@kiti.ac.ke',
    website: 'www.kiti.ac.ke',
    verifiedGraduatesCount: 640
  },
  KALRO: {
    id: 'kalro',
    shortName: 'KALRO',
    fullName: 'Kenya Agricultural & Livestock Research Organization',
    category: 'Agriculture & Apiary Research',
    accreditationStatus: 'State Agricultural Authority',
    location: 'Kaptagat Rd, Loresho, Nairobi',
    established: '2013',
    about: 'KALRO conducts research and offers practical training in apiculture (beekeeping), livestock husbandry, soil testing, seed multiplication, and smart farming.',
    coursesOffered: [
      {
        id: 'kalro-1',
        title: 'Commercial Beekeeping & Apiary Management Cert',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 94,
        rating: 4.8,
        marketPay: 'KES 2,500 - 6,000 / day',
        description: 'Langstroth hive setup, queen rearing, honey processing, and pest control.',
        duration: '1 Week Intensive Practical',
        prerequisites: 'Open to all farmers & commercial apiarists',
        estimatedFee: 'KES 7,000',
        coverImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'KALRO Certified Master Apiarist Certificate',
        careerRoles: ['Commercial Honey Producer', 'Apiary Inspector', 'Agro-Extension Officer'],
        syllabus: [
          { moduleNumber: 1, title: 'Hive Construction & Queen Rearing', topics: ['Langstroth vs Kenya Top Bar hives', 'Swarm trapping', 'Queen grafting'] },
          { moduleNumber: 2, title: 'Honey Extraction & Quality Testing', topics: ['Refractometer moisture test', 'Propolis & bee venom harvesting', 'Export packaging'] }
        ]
      },
      {
        id: 'kalro-2',
        title: 'Soil Testing & Fertilizer Application Protocol',
        demandTag: 'HIGH DEMAND',
        demandPercentage: 88,
        rating: 4.6,
        marketPay: 'KES 2,000 - 5,000 / day',
        description: 'pH sampling, micronutrient analysis, and organic soil amendment.',
        duration: '3 Days',
        prerequisites: 'Agronomy interest or agriculture certificate',
        estimatedFee: 'KES 4,500',
        coverImage: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'KALRO Certified Soil Tester',
        careerRoles: ['Soil Analyst', 'Farm Agronomist Advisor'],
        syllabus: [
          { moduleNumber: 1, title: 'Field Sampling & pH Remediation', topics: ['GPS soil grid sampling', 'Lime & organic compost ratios'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'Honey Quality & Hive Setup Masterclass',
        description: 'Practical training with hive distribution for rural farmers.',
        tag: 'Agro Masterclass'
      }
    ],
    contactPhone: '+254 722 206986',
    contactEmail: 'director.general@kalro.org',
    website: 'www.kalro.org',
    verifiedGraduatesCount: 520
  },
  TVETA: {
    id: 'tveta',
    shortName: 'TVETA Kenya',
    fullName: 'Technical and Vocational Education and Training Authority',
    category: 'TVET Regulatory Council',
    accreditationStatus: 'National Accreditation Board',
    location: 'Utalii House, Nairobi',
    established: '2013',
    about: 'TVETA regulates and inspects technical colleges, polytechnics, and vocational institutions across Kenya, maintaining national standards for competency-based training.',
    coursesOffered: [
      {
        id: 'tveta-1',
        title: 'CBET Level 6 Master Technical Instructor',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 95,
        rating: 4.8,
        marketPay: 'KES 3,000 - 8,000 / day',
        description: 'Competency-based education curriculum development & practical assessment.',
        duration: '3 Months Module',
        prerequisites: 'Diploma / Degree in Technical Field',
        estimatedFee: 'KES 20,000',
        coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'TVETA Level 6 Master Technical Trainer Badge',
        careerRoles: ['Vocational College Lecturer', 'Technical Skills Assessor'],
        syllabus: [
          { moduleNumber: 1, title: 'CBET Curriculum Design & Verification', topics: ['Outcome-based assessment rubrics', 'Workplace portfolio review'] }
        ]
      },
      {
        id: 'tveta-2',
        title: 'Recognition of Prior Learning (RPL) Assessment',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 97,
        rating: 4.9,
        marketPay: 'KES 2,500 - 7,000 / day',
        description: 'Convert informal field experience into an official government-recognized diploma.',
        duration: '1 - 2 Weeks Evaluation',
        prerequisites: '3+ Years Field Work Experience in Trade',
        estimatedFee: 'KES 5,000 Assessment',
        coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'Official TVETA Government Trade Diploma via RPL',
        careerRoles: ['Certified Master Craftsman', 'Public Tender Bidder', 'Registered Trade Expert'],
        syllabus: [
          { moduleNumber: 1, title: 'Field Evidence Portfolio & Practical Audit', topics: ['Workplace video audit', 'Oral trade examination', 'Government diploma issuance'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'Recognized Prior Learning (RPL) Assessment',
        description: 'Get your informal field experience certified into an official TVETA diploma.',
        tag: 'RPL Certification'
      }
    ],
    contactPhone: '+254 20 239 2140',
    contactEmail: 'info@tveta.go.ke',
    website: 'www.tveta.go.ke',
    verifiedGraduatesCount: 3100
  }
};

interface OrgDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName?: string;
  fullSkillCert?: {
    certificationName?: string;
    issuingSchool?: string;
    yearObtained?: string;
    licenseNumber?: string;
  };
}

export const OrgDetailModal: React.FC<OrgDetailModalProps> = ({
  isOpen,
  onClose,
  orgName,
  fullSkillCert
}) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseOfferItem | null>(null);
  const [activeTab, setActiveTab] = useState<'COURSES' | 'OFFERS' | 'ABOUT'>('COURSES');
  const [courseSearch, setCourseSearch] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  const [applicantForm, setApplicantForm] = useState({ fullName: '', phone: '', nationalId: '', intake: 'Immediate / Next Week' });
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isProspectusDownloaded, setIsProspectusDownloaded] = useState(false);

  if (!isOpen) return null;

  const rawName = orgName || fullSkillCert?.issuingSchool || 'Accredited Institution';
  const nameUpper = rawName.toUpperCase();

  // Smart match against directory keys
  let matchedOrg: OrgProfile | null = null;
  for (const key of Object.keys(ORG_DIRECTORY)) {
    if (nameUpper.includes(key) || key.includes(nameUpper)) {
      matchedOrg = ORG_DIRECTORY[key];
      break;
    }
  }

  // Fallback profile if custom or unlisted institution
  const profile: OrgProfile = matchedOrg || {
    id: 'custom-org',
    shortName: rawName,
    fullName: rawName,
    category: 'Accredited Training & Certifying Body',
    accreditationStatus: 'Verified Educational Body',
    location: 'Nairobi & Regional Campuses',
    established: '2015',
    about: `${rawName} is a recognized institution providing specialized training, certifications, and trade evaluations for skilled professionals in Kenya.`,
    coursesOffered: [
      {
        id: 'cust-1',
        title: fullSkillCert?.certificationName || 'Certified Competency & Skill Trade Test',
        demandTag: 'EXTREME DEMAND',
        demandPercentage: 96,
        rating: 4.9,
        marketPay: 'KES 2,000 - 6,000 / day',
        description: 'Formal skill competency testing and field safety accreditation.',
        duration: '1 - 2 Weeks',
        prerequisites: '2+ yrs practical work experience',
        estimatedFee: 'KES 5,000',
        coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: `Certified Trade Competency Badge from ${rawName}`,
        careerRoles: ['Certified Field Artisan', 'Commercial Trade Specialist'],
        syllabus: [
          { moduleNumber: 1, title: 'Field Safety & Standard Operating Procedure', topics: ['Personal Protective Equipment (PPE)', 'Hazard mitigation', 'Quality checks'] },
          { moduleNumber: 2, title: 'Practical Competency Assessment', topics: ['Hands-on trade test', 'Time-bound project execution', 'Certification review'] }
        ]
      },
      {
        id: 'cust-2',
        title: 'Professional Practice & Customer Care Refresher',
        demandTag: 'VERY HIGH DEMAND',
        demandPercentage: 92,
        rating: 4.8,
        marketPay: 'KES 1,800 - 4,500 / day',
        description: 'Ethics, client relations, and quality assurance in professional services.',
        duration: '3 Days',
        prerequisites: 'Open enrolment',
        estimatedFee: 'KES 3,000',
        coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&auto=format&fit=crop&q=80',
        certificationAwarded: 'Professional Customer Service Certificate',
        careerRoles: ['Client Services Operator', 'Freelance Service Provider'],
        syllabus: [
          { moduleNumber: 1, title: 'Client Communication & Billing Ethics', topics: ['Transparent pricing', 'Handling customer queries', 'Digital receipts'] }
        ]
      }
    ],
    publicOffers: [
      {
        title: 'Verifiable Member Directory',
        description: `Official registry of certified graduates and skilled artisans from ${rawName}.`,
        tag: 'Member Verification'
      },
      {
        title: 'Skill Refresher & Assessment',
        description: 'Practical evaluations for field operators seeking certification renewal.',
        tag: 'Assessment'
      }
    ],
    contactPhone: '+254 700 000 000',
    contactEmail: `info@${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.ke`,
    website: `www.${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.ke`,
    verifiedGraduatesCount: 540
  };

  const filteredCourses = profile.coursesOffered.filter(c => 
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  const handleOpenCoursePage = (course: CourseOfferItem) => {
    setSelectedCourse(course);
    setInquirySuccess(null);
    setIsProspectusDownloaded(false);
  };

  const submitEnrollmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setIsSubmittingForm(true);
    setTimeout(() => {
      setIsSubmittingForm(false);
      setInquirySuccess(`Registration Received! Admissions at ${profile.shortName} will call ${applicantForm.phone || 'your phone number'} regarding intake details.`);
    }, 1000);
  };

  const handleDownloadProspectus = () => {
    setIsProspectusDownloaded(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-neutral-950/95 overflow-y-auto animate-fade-in font-sans flex flex-col">
      {/* FULL PAGE CONTAINER - LEAN, SOPHISTICATED, RHYTHMIC LAYOUT */}
      <div className="w-full min-h-screen bg-slate-50 text-neutral-900 flex flex-col max-w-6xl mx-auto shadow-2xl relative">
        
        {/* TOP EXECUTIVE NAVIGATION HEADER BAR */}
        <header className="sticky top-0 z-50 bg-neutral-900 text-white px-4 sm:px-8 py-3.5 border-b border-neutral-800 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedCourse) {
                  setSelectedCourse(null);
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-neutral-700 active:scale-95"
            >
              <span className="text-sm">←</span>
              <span>{selectedCourse ? 'Back to Organization Catalog' : 'Close Profile'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-neutral-400">
              <span>ACCREDITED INSTITUTION</span>
              <span>•</span>
              <span className="text-amber-400 font-bold uppercase">{profile.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${profile.contactPhone}`}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-lg text-xs font-bold border border-neutral-700 transition-colors"
            >
              <span>📞</span>
              <span>{profile.contactPhone}</span>
            </a>

            <a
              href={`https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded-lg text-xs font-black transition-colors shadow-xs"
            >
              <span>🌐 Visit Website</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white text-sm font-bold cursor-pointer transition-all"
              title="Close Full Page View"
            >
              ✕
            </button>
          </div>
        </header>

        {/* VERIFIED SKILL CREDENTIAL BANNER (IF OPENED FROM WORKER PROFILE) */}
        {fullSkillCert && (
          <div className="bg-emerald-900 text-emerald-50 border-b border-emerald-700 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-inner">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                    VERIFIED WORKER CREDENTIAL
                  </span>
                  {fullSkillCert.licenseNumber && (
                    <span className="text-[10px] font-mono text-emerald-300 font-bold">
                      Lic/Reg #: {fullSkillCert.licenseNumber}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5">
                  {fullSkillCert.certificationName}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-950 text-emerald-200 border border-emerald-700 text-[10px] font-mono px-3 py-1 rounded-md font-bold">
                Issued {fullSkillCert.yearObtained || '2024'} • Verified by {profile.shortName}
              </span>
            </div>
          </div>
        )}

        {/* IF A SPECIFIC COURSE IS SELECTED: FULL COURSE PAGE PROSPECTUS */}
        {selectedCourse ? (
          <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-6 animate-fade-in bg-slate-50">
            {/* COURSE HERO BANNER */}
            <div className="relative rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-900 text-white shadow-xl">
              <div className="relative h-56 sm:h-72 w-full overflow-hidden">
                <img
                  src={selectedCourse.coverImage || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80'}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-black/90 backdrop-blur-md text-white border border-neutral-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      🏛️ {profile.fullName}
                    </span>
                    <span className="bg-emerald-400 text-black text-xs font-black px-2.5 py-1 rounded-full uppercase">
                      ★ {selectedCourse.rating.toFixed(1)} TVET Accredited
                    </span>
                  </div>
                  <span className="bg-amber-400 text-black font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    🔥 {selectedCourse.demandTag}
                  </span>
                </div>

                {/* Title & Stats */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                    <span className="text-amber-400 font-bold">HIRING SURGE: {selectedCourse.demandPercentage}% DEMAND</span>
                    <span>•</span>
                    <span>KENYA REGULATORY CODE #{selectedCourse.id.toUpperCase()}</span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                    {selectedCourse.title}
                  </h1>
                </div>
              </div>

              {/* PDF Header Strip */}
              <div className="bg-black px-4 sm:px-6 py-2.5 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>✓ OFFICIAL TVETA / REGULATORY SYLLABUS DIRECTORY</span>
                <span className="text-emerald-400 font-bold">VERIFIED #{profile.id.toUpperCase()}-2026</span>
              </div>
            </div>

            {/* QUICK FACTSHEET GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block font-mono">⏱️ DURATION</span>
                <p className="font-black text-neutral-900 text-sm sm:text-base">{selectedCourse.duration || '1 - 2 Weeks'}</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block font-mono">💰 TUITION / ESTIMATED FEE</span>
                <p className="font-black text-neutral-900 text-sm sm:text-base font-mono">{selectedCourse.estimatedFee || 'KES 3,500'}</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block font-mono">💼 MARKET EARNING</span>
                <p className="font-black text-neutral-900 text-sm sm:text-base font-mono">{selectedCourse.marketPay}</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
                <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block font-mono">📈 INDUSTRY RATING</span>
                <p className="font-black text-emerald-700 text-sm sm:text-base font-mono">{selectedCourse.demandPercentage}% Hiring Rate</p>
              </div>
            </div>

            {/* TWO-COLUMN DETAILED SYLLABUS AND ADMISSIONS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT 2 COLUMNS: SYLLABUS & DETAILS */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* OBJECTIVE */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                    Course Objective & Executive Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                    {selectedCourse.description} This accredited program is tailored specifically for the Kenyan market, meeting the regulatory standards of {profile.fullName}. Upon completion, graduates receive a verifiable badge on Nikosoko and direct placement access to corporate clients.
                  </p>

                  {selectedCourse.certificationAwarded && (
                    <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-950">
                      <div>
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block">Awarded Credential</span>
                        <span className="font-black text-xs sm:text-sm">{selectedCourse.certificationAwarded}</span>
                      </div>
                      <span className="text-2xl">📜</span>
                    </div>
                  )}
                </div>

                {/* SYLLABUS MODULES */}
                {selectedCourse.syllabus && selectedCourse.syllabus.length > 0 && (
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div>
                        <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                          Course Curriculum & Practical Modules ({selectedCourse.syllabus.length})
                        </h3>
                        <p className="text-[11px] text-neutral-600 font-medium">Comprehensive practical & theoretical training modules</p>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-bold border border-emerald-200">
                        TVETA / Regulatory Approved
                      </span>
                    </div>

                    <div className="space-y-3">
                      {selectedCourse.syllabus.map((mod) => (
                        <div key={mod.moduleNumber} className="p-4 bg-slate-50 rounded-xl border border-neutral-200 space-y-2">
                          <div className="flex items-center gap-2.5">
                            <span className="bg-black text-white text-[9px] font-mono font-black px-2.5 py-1 rounded-md uppercase">
                              MODULE {mod.moduleNumber}
                            </span>
                            <h4 className="font-extrabold text-xs sm:text-sm text-neutral-900">{mod.title}</h4>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-xs text-neutral-700 pl-1 font-medium">
                            {mod.topics.map((tp, idx) => (
                              <li key={idx}>{tp}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CAREER OPPORTUNITIES */}
                {selectedCourse.careerRoles && selectedCourse.careerRoles.length > 0 && (
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                      Target Job Roles & Career Opportunities
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedCourse.careerRoles.map((role, idx) => (
                        <span key={idx} className="bg-slate-100 text-neutral-900 border border-neutral-300 text-xs font-bold px-3 py-1.5 rounded-full">
                          💼 {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* PREREQUISITES */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                    Admission Entry Requirements
                  </h3>
                  <div className="p-3.5 bg-slate-100 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800">
                    📋 {selectedCourse.prerequisites || 'Valid National ID & basic literacy in English or Swahili.'}
                  </div>
                </div>

              </div>

              {/* RIGHT 1 COLUMN: ADMISSIONS & ACTION FORM */}
              <div className="space-y-6">
                
                {/* DIRECT ADMISSIONS PORTAL CARD */}
                <div className="bg-neutral-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl space-y-4 border border-neutral-800 sticky top-20">
                  <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block font-mono">
                        DIRECT ADMISSIONS PORTAL
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase mt-0.5">
                        Apply for Next Intake
                      </h3>
                    </div>
                    <span className="bg-emerald-400 text-black text-[9px] font-mono font-bold px-2.5 py-1 rounded-md uppercase">
                      Open 2026
                    </span>
                  </div>

                  {inquirySuccess ? (
                    <div className="p-4 bg-emerald-100 border border-emerald-400 text-emerald-950 rounded-xl text-center space-y-2">
                      <span className="text-2xl">✅</span>
                      <p className="font-black text-xs sm:text-sm">{inquirySuccess}</p>
                    </div>
                  ) : (
                    <form onSubmit={submitEnrollmentForm} className="space-y-3 text-xs">
                      <div>
                        <label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Full Applicant Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Samuel Kamau"
                          value={applicantForm.fullName}
                          onChange={e => setApplicantForm({ ...applicantForm, fullName: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Phone Number (Calls / M-Pesa)</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0712345678"
                          value={applicantForm.phone}
                          onChange={e => setApplicantForm({ ...applicantForm, phone: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">National ID / Passport #</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 34567890"
                          value={applicantForm.nationalId}
                          onChange={e => setApplicantForm({ ...applicantForm, nationalId: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">Preferred Intake Date</label>
                        <select
                          value={applicantForm.intake}
                          onChange={e => setApplicantForm({ ...applicantForm, intake: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value="Immediate / Next Week">Immediate / Next Week</option>
                          <option value="First Week of Next Month">First Week of Next Month</option>
                          <option value="Weekend / Evening Classes">Weekend / Evening Classes</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingForm}
                        className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-3 active:scale-98 shadow-md flex items-center justify-center gap-1.5"
                      >
                        {isSubmittingForm ? 'Submitting Application...' : 'Submit Course Application →'}
                      </button>
                    </form>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="pt-2 border-t border-neutral-800 flex flex-col gap-2">
                    <a
                      href={`tel:${profile.contactPhone}`}
                      className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs uppercase rounded-xl text-center cursor-pointer block"
                    >
                      📞 Call {profile.shortName} Admissions
                    </a>

                    <button
                      onClick={handleDownloadProspectus}
                      className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 font-black text-xs uppercase rounded-xl text-center cursor-pointer active:scale-95 transition-all"
                    >
                      {isProspectusDownloaded ? '✓ Prospectus Opened' : '📄 Download / Print Prospectus'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* ORGANIZATIONAL FULL PAGE MAIN VIEW */
          <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-6">
            
            {/* HERO BRAND BANNER */}
            <div className="relative rounded-2xl bg-neutral-900 text-white border border-neutral-800 p-6 sm:p-8 overflow-hidden shadow-xl">
              {/* Background texture */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute -right-10 -top-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-amber-400 text-black font-black text-[9px] px-2.5 py-0.5 rounded-md uppercase tracking-widest">
                      ACCREDITED ORGANIZATIONAL PROFILE
                    </span>
                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                      ID: #{profile.id.toUpperCase()}-KENYA
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md">
                      ✓ {profile.accreditationStatus}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                    {profile.fullName}
                  </h1>

                  <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
                    {profile.about}
                  </p>
                </div>

                {/* QUICK METRIC STACK SIDEBAR */}
                <div className="bg-neutral-950/80 border border-neutral-800 p-5 rounded-2xl space-y-3 shrink-0 min-w-[240px]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">📍</span>
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">Main Campus / HQ</span>
                      <span className="text-xs font-bold text-white">{profile.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-2 border-t border-neutral-800">
                    <span className="text-lg">🏛️</span>
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">Established</span>
                      <span className="text-xs font-bold text-amber-400">Year {profile.established}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-2 border-t border-neutral-800">
                    <span className="text-lg">🎓</span>
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">Verified Graduates</span>
                      <span className="text-xs font-bold text-emerald-400">{profile.verifiedGraduatesCount.toLocaleString()}+ Members</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION STRIP */}
            <div className="flex items-center border-b border-neutral-200 bg-white rounded-2xl p-1.5 shadow-xs text-xs font-black uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('COURSES')}
                className={`flex-1 py-3 text-center rounded-xl cursor-pointer transition-all ${
                  activeTab === 'COURSES'
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                🎓 Accredited Courses & Trade Tests ({profile.coursesOffered.length})
              </button>
              <button
                onClick={() => setActiveTab('OFFERS')}
                className={`flex-1 py-3 text-center rounded-xl cursor-pointer transition-all ${
                  activeTab === 'OFFERS'
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                📜 Public Services & Verification Portals ({profile.publicOffers.length})
              </button>
              <button
                onClick={() => setActiveTab('ABOUT')}
                className={`flex-1 py-3 text-center rounded-xl cursor-pointer transition-all ${
                  activeTab === 'ABOUT'
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                🏛️ Institutional Directory & Contacts
              </button>
            </div>

            {/* TAB 1: COURSES CATALOG */}
            {activeTab === 'COURSES' && (
              <div className="space-y-4">
                {/* SEARCH & CATALOG HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-neutral-900 uppercase">
                      Official Accredited Course & Competency Catalog
                    </h2>
                    <p className="text-xs text-neutral-500 font-medium">Select any course below to view the full TVET syllabus and application details</p>
                  </div>

                  <div className="relative min-w-[260px]">
                    <input
                      type="text"
                      placeholder="Search courses or skills..."
                      value={courseSearch}
                      onChange={e => setCourseSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-neutral-300 text-neutral-900 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-black font-medium"
                    />
                    {courseSearch && (
                      <button
                        onClick={() => setCourseSearch('')}
                        className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-black font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* COURSE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredCourses.map((course) => {
                    const defaultImg = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80';

                    return (
                      <div
                        key={course.id}
                        onClick={() => handleOpenCoursePage(course)}
                        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:border-black hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
                      >
                        <div>
                          {/* Image Thumbnail */}
                          <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
                            <img
                              src={course.coverImage || defaultImg}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
                              <span className="bg-amber-400 text-black font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                🔥 {course.demandTag}
                              </span>
                              <span className="bg-black/80 backdrop-blur-xs text-white border border-neutral-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">
                                ★ {course.rating.toFixed(1)}
                              </span>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-0.5">
                                Market Demand: {course.demandPercentage}% Rating
                              </span>
                              <h3 className="text-base font-black text-white leading-tight uppercase group-hover:text-amber-300 transition-colors">
                                {course.title}
                              </h3>
                            </div>
                          </div>

                          {/* Details Content */}
                          <div className="p-4 space-y-3">
                            <p className="text-xs text-neutral-600 line-clamp-2 font-medium">
                              {course.description}
                            </p>

                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-neutral-200 text-[10px]">
                              <div>
                                <span className="text-neutral-400 font-bold block uppercase font-mono">Duration</span>
                                <span className="font-extrabold text-neutral-900">{course.duration || '1 - 2 Wks'}</span>
                              </div>
                              <div>
                                <span className="text-neutral-400 font-bold block uppercase font-mono">Tuition</span>
                                <span className="font-extrabold text-neutral-900 font-mono">{course.estimatedFee || 'KES 3,500'}</span>
                              </div>
                              <div>
                                <span className="text-amber-800 font-bold block uppercase font-mono">Market Pay</span>
                                <span className="font-extrabold text-neutral-900 font-mono truncate block">{course.marketPay}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 pb-4 pt-1">
                          <button className="w-full py-2.5 bg-neutral-900 group-hover:bg-amber-400 text-white group-hover:text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow-xs">
                            <span>View Full Syllabus & Application</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: PUBLIC SERVICES */}
            {activeTab === 'OFFERS' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                  <h2 className="text-sm sm:text-base font-black text-neutral-900 uppercase">
                    Public Verification Services & Driver/Artisan Portals
                  </h2>
                  <p className="text-xs text-neutral-500 font-medium">Official verification channels provided by {profile.shortName}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.publicOffers.map((offer, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3 shadow-xs hover:border-black transition-all">
                      <div className="flex justify-between items-start">
                        <span className="bg-black text-white text-[9px] font-mono font-black px-2.5 py-1 rounded-md uppercase">
                          {offer.tag}
                        </span>
                        <span className="text-emerald-600 font-black text-xs">✓ Active Portal</span>
                      </div>

                      <h3 className="text-base font-black text-neutral-900 uppercase">{offer.title}</h3>
                      <p className="text-xs text-neutral-600 leading-relaxed font-medium">{offer.description}</p>

                      <button
                        onClick={() => alert(`Launching ${offer.title} verification desk...`)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-neutral-900 hover:text-white text-neutral-900 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer text-center"
                      >
                        Access Portal / Verify Now →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ABOUT & CONTACTS */}
            {activeTab === 'ABOUT' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-4 shadow-xs">
                  <h2 className="text-base font-black text-neutral-900 uppercase tracking-tight border-b border-neutral-200 pb-3">
                    About {profile.fullName}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                    {profile.about}
                  </p>

                  <div className="pt-4 border-t border-neutral-200 space-y-3">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                      Quality Standards & Regulatory Compliance
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 space-y-2">
                      <p>✓ All certifications issued by {profile.shortName} comply with national TVET, NTSA, EPRA, and ministry frameworks in Kenya.</p>
                      <p>✓ Employers and digital transport platforms can verify badge credentials instantly using the worker's license number.</p>
                    </div>
                  </div>
                </div>

                {/* CONTACT CARD */}
                <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-4 shadow-xl">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest border-b border-neutral-800 pb-2">
                    Official Admissions Desk
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">Phone / Helpline</span>
                      <a href={`tel:${profile.contactPhone}`} className="font-extrabold text-white text-sm hover:text-amber-400">
                        {profile.contactPhone}
                      </a>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">Email Address</span>
                      <a href={`mailto:${profile.contactEmail}`} className="font-extrabold text-white text-sm hover:text-amber-400">
                        {profile.contactEmail}
                      </a>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">Official Website</span>
                      <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="font-extrabold text-amber-400 text-sm hover:underline">
                        {profile.website}
                      </a>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">Physical Location</span>
                      <span className="font-bold text-neutral-200">{profile.location}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <a
                      href={`tel:${profile.contactPhone}`}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center block shadow-md"
                    >
                      📞 Call Admissions Desk
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default OrgDetailModal;
