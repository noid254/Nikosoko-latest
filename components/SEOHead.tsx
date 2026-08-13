import React, { useEffect } from 'react';
import type { ServiceProvider, CatalogueItem } from '../types';
import { normalizeSkills } from '../utils/skills';

interface SEOHeadProps {
    provider?: ServiceProvider | null;
    item?: CatalogueItem | null;
    customTitle?: string;
    customDescription?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ provider, item, customTitle, customDescription }) => {
    useEffect(() => {
        // Compute page title & meta description for Google indexing
        let title = 'NikoSoko - Skilled Professional Marketplace & Service Directory';
        let description = 'Find certified, verified skilled professionals in Kenya. Boda, Taxi, Electricians, Plumbers, Tech Repairs, Solar Installers & Artisans with location verification.';
        let canonicalUrl = window.location.href;
        let imageUrl = 'https://nikosoko.app/icon-512.png';
        let jsonLdData: any = null;

        if (provider) {
            title = `${provider.name} | Certified ${provider.service} in ${provider.location} - Nikosoko`;
            description = `Hire ${provider.name}, verified ${provider.service} based in ${provider.location}. Rating: ${provider.rating?.toFixed(1) || '5.0'}★. Contact directly via Nikosoko. ${provider.bio || ''}`;
            imageUrl = provider.avatarUrl || imageUrl;
            canonicalUrl = `${window.location.origin}/profile/${provider.id}`;

            jsonLdData = {
                "@context": "https://schema.org",
                "@type": ["LocalBusiness", "ProfessionalService", "Person"],
                "@id": canonicalUrl,
                "name": provider.name,
                "jobTitle": provider.service,
                "image": provider.avatarUrl,
                "description": description,
                "telephone": provider.phone,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": provider.location || "Nairobi",
                    "addressCountry": "KE"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "address": provider.location
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": (provider.rating || 5.0).toFixed(1),
                    "reviewCount": provider.ratingCount || 12,
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "knowsAbout": normalizeSkills(provider.skills).length > 0 
                    ? normalizeSkills(provider.skills).map(s => s.skillTitle || s.name || provider.service)
                    : [provider.service],
                "priceRange": provider.rate || "Ksh 1,500 - Ksh 5,000",
                "memberOf": provider.saccoId ? {
                    "@type": "Organization",
                    "name": provider.saccoName || "Verified Cooperative Sacco"
                } : undefined,
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": `${provider.name} Services`,
                    "itemListElement": (provider.catalogueItems || []).map((cat, idx) => ({
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": cat.title,
                            "description": cat.description
                        },
                        "price": cat.price,
                        "priceCurrency": "KES"
                    }))
                }
            };
        } else if (item) {
            title = `${item.title} - ${item.price} | Nikosoko Services`;
            description = `${item.title} (${item.category}) offered at ${item.price}. ${item.description}`;
            imageUrl = item.imageUrls?.[0] || imageUrl;

            jsonLdData = {
                "@context": "https://schema.org",
                "@type": "Service",
                "name": item.title,
                "category": item.category,
                "description": item.description,
                "provider": provider ? {
                    "@type": "LocalBusiness",
                    "name": (provider as ServiceProvider).name,
                    "telephone": (provider as ServiceProvider).phone
                } : undefined,
                "offers": {
                    "@type": "Offer",
                    "price": item.price,
                    "priceCurrency": "KES",
                    "availability": "https://schema.org/InStock"
                }
            };
        } else if (customTitle) {
            title = customTitle;
            description = customDescription || description;
        }

        // Update Document Title
        document.title = title;

        // Update Standard Meta Description
        let metaDescEl = document.querySelector('meta[name="description"]');
        if (!metaDescEl) {
            metaDescEl = document.createElement('meta');
            metaDescEl.setAttribute('name', 'description');
            document.head.appendChild(metaDescEl);
        }
        metaDescEl.setAttribute('content', description);

        // Update OpenGraph Title
        let ogTitleEl = document.querySelector('meta[property="og:title"]');
        if (ogTitleEl) ogTitleEl.setAttribute('content', title);

        // Update OpenGraph Description
        let ogDescEl = document.querySelector('meta[property="og:description"]');
        if (ogDescEl) ogDescEl.setAttribute('content', description);

        // Update OpenGraph Image
        let ogImgEl = document.querySelector('meta[property="og:image"]');
        if (ogImgEl) ogImgEl.setAttribute('content', imageUrl);

        // Ensure Robots Indexing Meta Tag exists
        let robotsEl = document.querySelector('meta[name="robots"]');
        if (!robotsEl) {
            robotsEl = document.createElement('meta');
            robotsEl.setAttribute('name', 'robots');
            robotsEl.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1');
            document.head.appendChild(robotsEl);
        }

        // Inject Schema.org JSON-LD Script
        let scriptEl = document.getElementById('google-schema-jsonld') as HTMLScriptElement | null;
        if (!scriptEl) {
            scriptEl = document.createElement('script');
            scriptEl.id = 'google-schema-jsonld';
            scriptEl.type = 'application/ld+json';
            document.head.appendChild(scriptEl);
        }
        if (jsonLdData) {
            scriptEl.textContent = JSON.stringify(jsonLdData, null, 2);
        }

    }, [provider, item, customTitle, customDescription]);

    return null;
};

export default SEOHead;
