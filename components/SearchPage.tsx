import React, { useState } from 'react';
import type { ServiceProvider } from '../types';
import ServiceCard from './ServiceCard';
import OrgDetailModal from './OrgDetailModal';

interface SearchPageProps {
    providers: ServiceProvider[];
    onSelectProvider: (provider: ServiceProvider) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ providers, onSelectProvider }) => {
    const [selectedOrgModal, setSelectedOrgModal] = useState<{ orgName: string; cert?: any } | null>(null);

    return (
        <div className="bg-gray-100 min-h-screen pt-4">
             <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                    {providers.map(provider => (
                        <ServiceCard 
                            key={provider.id} 
                            provider={provider} 
                            onClick={() => onSelectProvider(provider)} 
                            onViewOrg={(orgName, cert) => setSelectedOrgModal({ orgName, cert })}
                        />
                    ))}
                    {providers.length === 0 && <p className="col-span-2 text-center text-gray-500 mt-8">No services found. Try a different search term or filter.</p>}
                </div>
            </div>

            <OrgDetailModal
                isOpen={Boolean(selectedOrgModal)}
                onClose={() => setSelectedOrgModal(null)}
                orgName={selectedOrgModal?.orgName}
                fullSkillCert={selectedOrgModal?.cert ? {
                    certificationName: selectedOrgModal.cert.certificationName,
                    issuingSchool: selectedOrgModal.cert.issuingSchool,
                    yearObtained: selectedOrgModal.cert.yearObtained,
                    licenseNumber: selectedOrgModal.cert.licenseNumber
                } : undefined}
            />
        </div>
    );
};

export default SearchPage;
