import React, { useEffect } from 'react';
import type { CurrentPage, ServiceProvider } from '../types';

interface SEOHeadProps {
  currentPage: CurrentPage;
  selectedProvider?: ServiceProvider | null;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ currentPage, selectedProvider }) => {
  useEffect(() => {
    // 1. Dynamic Title & Meta Description Mapping
    let title = 'NikoSoko - Find & Connect Skilled Professionals Near You';
    let description = 'Borderless skill ecosystem to find nearby skilled artisans, plumbers, electricians, TV mounters, hair braiders, and verify Sacco memberships.';
    let keywords = 'nikosoko, tukosoko, skilled professionals, Kenya artisans, TV mounting, plumbing, gas delivery, water refill, hair braiding, Stima Sacco';

    if (selectedProvider) {
      title = `${selectedProvider.name} - ${selectedProvider.service} | NikoSoko`;
      description = `${selectedProvider.name} provides ${selectedProvider.service} in ${selectedProvider.location || 'Kenya'}. Hourly rate: ${selectedProvider.currency || 'Ksh'} ${selectedProvider.hourlyRate}. Sacco verified professional.`;
      keywords = `${selectedProvider.service}, ${selectedProvider.name}, ${selectedProvider.location}, skilled professional, tukosoko, nikosoko`;
    } else {
      switch (currentPage) {
        case 'tukosoko':
          title = 'Tukosoko - Traded Skill & Service Catalogue | NikoSoko';
          description = 'Browse published service rate cards on Tukosoko: TV mounting, pure water delivery, gas cylinders, hair braiding, maths tuition, and home repairs.';
          keywords = 'tukosoko, service catalogue, TV mounting price, gas delivery Nairobi, water refill, hair braiding rates, tuition tutors';
          break;
        case 'sacco_dashboard':
          title = 'Sacco & Organization Security Portal | NikoSoko';
          description = 'Verify Sacco memberships, audit member credentials, manage multi-layer security approvals, and explore Stima Sacco & Sheria Sacco profiles.';
          keywords = 'sacco member verification, Stima Sacco, Sheria Sacco, artisan vetting, cooperative society Kenya';
          break;
        case 'skill_id':
          title = '$kill Hub - Verified Professional Skill Cards | NikoSoko';
          description = 'Discover verified technical skills, demand heatmaps, certified TVET skills, and instant booking rates.';
          keywords = 'skill hub, TVET certification, skill verification, skilled trade marketplace Kenya';
          break;
        case 'courses':
          title = 'Vocational Courses & Skill Training | NikoSoko';
          description = 'Enroll in TVET accredited vocational courses and practical skill training from certified organizations.';
          keywords = 'vocational training Kenya, solar installation course, electrical training, carpentry TVET';
          break;
      }
    }

    // Update Document Title
    document.title = title;

    // Helper to update meta tag content
    const updateMeta = (nameAttr: string, valueAttr: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${valueAttr}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, valueAttr);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('name', 'description', description);
    updateMeta('name', 'keywords', keywords);
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);

    // 2. Inject Dynamic Schema.org JSON-LD for Search Engine Bots
    const schemaId = 'nikosoko-schema-jsonld';
    let schemaScript = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://nikosoko.app/#website',
          'url': 'https://nikosoko.app/',
          'name': 'NikoSoko & Tukosoko',
          'description': 'Borderless skill ecosystem to discover, connect, and trade services with nearby verified professionals.',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': 'https://nikosoko.app/?search={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'OfferCatalog',
          '@id': 'https://nikosoko.app/tukosoko#catalogue',
          'name': 'Tukosoko Service Catalogue',
          'description': 'Live traded services and published skill rate cards',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'TV Mounting & Bracket Installation',
                'description': 'Professional wall drilling, bracket mounting, and neat cable trunking for all TV sizes.',
                'provider': { '@type': 'LocalBusiness', 'name': 'Verified Tukosoko Technicians' }
              },
              'priceSpecification': { '@type': 'PriceSpecification', 'priceCurrency': 'KES', 'price': '1500' }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Pure Refilled Water Delivery (20L Bottle)',
                'description': 'Doorstep purified drinking water bottle exchange and dispenser delivery.',
                'provider': { '@type': 'LocalBusiness', 'name': 'Neighborhood Water Vendors' }
              },
              'priceSpecification': { '@type': 'PriceSpecification', 'priceCurrency': 'KES', 'price': '250' }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'LPG Gas Cylinder Refill & Leak Check',
                'description': 'Safe 6kg & 13kg cooking gas cylinder refills delivered with regulator leak inspections.',
                'provider': { '@type': 'LocalBusiness', 'name': 'Certified Gas Distributors' }
              },
              'priceSpecification': { '@type': 'PriceSpecification', 'priceCurrency': 'KES', 'price': '1300' }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Plumbing Pipe Repairs & Unclogging',
                'description': 'Sink unclogging, leaking pipe repairs, tap installation, and bathroom fittings.',
                'provider': { '@type': 'LocalBusiness', 'name': 'Stima Sacco Verified Plumbers' }
              },
              'priceSpecification': { '@type': 'PriceSpecification', 'priceCurrency': 'KES', 'price': '1000' }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Knotless Braids & Hair Styling',
                'description': 'Mobile salon hair braiding, dreadlocks maintenance, and cornrows at home.',
                'provider': { '@type': 'LocalBusiness', 'name': 'Beauty Professionals' }
              },
              'priceSpecification': { '@type': 'PriceSpecification', 'priceCurrency': 'KES', 'price': '2000' }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Solar Panel Installation & Maintenance',
                'description': 'Off-grid solar system sizing, inverter setup, battery wiring, and panel cleaning.',
                'provider': { '@type': 'LocalBusiness', 'name': 'Certified Solar Engineers' }
              },
              'priceSpecification': { '@type': 'PriceSpecification', 'priceCurrency': 'KES', 'price': '3500' }
            }
          ]
        }
      ]
    };

    schemaScript.textContent = JSON.stringify(structuredData);
  }, [currentPage, selectedProvider]);

  return null;
};

export default SEOHead;
