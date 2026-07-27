
import React, { useState } from 'react';
import type { SpecialBanner } from '../../types';

interface AppearancePageProps {
    categories: string[];
    specialBanners: SpecialBanner[];
    onAddBanner: (banner: Omit<SpecialBanner, 'id'>) => void;
    // FIX: Changed bannerId type from number to string to match the SpecialBanner type.
    onDeleteBanner: (bannerId: string) => void;
}

const AppearancePage: React.FC<AppearancePageProps> = ({ categories, specialBanners, onAddBanner, onDeleteBanner }) => {
    const [newBanner, setNewBanner] = useState<Omit<SpecialBanner, 'id'>>({ imageUrl: '' });
    
    const handleAddBanner = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBanner.imageUrl) {
            alert('Banner image is required.');
            return;
        }
        // Clean up empty fields
        const bannerToAdd = Object.fromEntries(Object.entries(newBanner).filter(([, value]) => value !== '' && value !== undefined));
        onAddBanner(bannerToAdd as Omit<SpecialBanner, 'id'>);
        setNewBanner({ imageUrl: '' });
    };

    const inputClass = "w-full p-2 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400";
    const selectClass = "w-full p-2 border rounded-md bg-white text-sm text-gray-900";
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Special Banners</h2>
                 <form onSubmit={handleAddBanner} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                     <h3 className="font-semibold text-gray-800">Add New Banner</h3>
                     <div className="space-y-1">
                         <label className="text-xs font-bold text-gray-700 block">Banner Image (Upload from Phone/Device)*</label>
                         <input 
                             type="file" 
                             accept="image/*" 
                             onChange={e => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                     const reader = new FileReader();
                                     reader.onload = () => {
                                         if (reader.result) {
                                             setNewBanner(p => ({ ...p, imageUrl: reader.result as string }));
                                         }
                                     };
                                     reader.readAsDataURL(file);
                                 }
                             }} 
                             className={inputClass} 
                             required={!newBanner.imageUrl} 
                         />
                         {newBanner.imageUrl && (
                             <div className="flex items-center gap-2 pt-1">
                                 <img src={newBanner.imageUrl} alt="Banner Preview" className="w-24 h-12 object-cover rounded border" />
                                 <button type="button" onClick={() => setNewBanner(p => ({ ...p, imageUrl: '' }))} className="text-xs font-bold text-red-600">Remove</button>
                             </div>
                         )}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Target Service (e.g. Plumber)" value={newBanner.targetService || ''} onChange={e => setNewBanner(p => ({...p, targetService: e.target.value}))} className={inputClass} />
                        <input type="text" placeholder="Target Location (e.g. Nairobi)" value={newBanner.targetLocation || ''} onChange={e => setNewBanner(p => ({...p, targetLocation: e.target.value}))} className={inputClass} />
                        <select value={newBanner.targetCategory || ''} onChange={e => setNewBanner(p => ({...p, targetCategory: e.target.value}))} className={selectClass}>
                            <option value="">Any Category</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <select value={newBanner.minRating || ''} onChange={e => setNewBanner(p => ({...p, minRating: e.target.value ? Number(e.target.value) : undefined}))} className={selectClass}>
                            <option value="">Any Rating</option>
                            <option value="4.5">4.5+ Rating</option>
                            <option value="4.0">4.0+ Rating</option>
                        </select>
                        <select value={newBanner.isVerifiedTarget === undefined ? '' : String(newBanner.isVerifiedTarget)} onChange={e => setNewBanner(p => ({...p, isVerifiedTarget: e.target.value === '' ? undefined : e.target.value === 'true'}))} className={selectClass}>
                            <option value="">Any Verification</option>
                            <option value="true">Verified Only</option>
                            <option value="false">Unverified Only</option>
                        </select>
                        <select value={newBanner.isOnlineTarget === undefined ? '' : String(newBanner.isOnlineTarget)} onChange={e => setNewBanner(p => ({...p, isOnlineTarget: e.target.value === '' ? undefined : e.target.value === 'true'}))} className={selectClass}>
                            <option value="">Any Status</option>
                            <option value="true">Online Only</option>
                            <option value="false">Offline Only</option>
                        </select>
                        <input type="text" placeholder="Target Referral Code" value={newBanner.targetReferralCode || ''} onChange={e => setNewBanner(p => ({...p, targetReferralCode: e.target.value}))} className={inputClass} />
                     </div>
                      <div className="flex gap-4 items-center">
                        <input type="date" value={newBanner.startDate || ''} onChange={e => setNewBanner(p => ({...p, startDate: e.target.value}))} className={inputClass} title="Start Date"/>
                        <span>to</span>
                        <input type="date" value={newBanner.endDate || ''} onChange={e => setNewBanner(p => ({...p, endDate: e.target.value}))} className={inputClass} title="End Date"/>
                      </div>
                     <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg">Add Banner</button>
                 </form>
                 <div className="mt-6">
                     <h3 className="font-semibold mb-2">Active Banners</h3>
                     <div className="space-y-3">
                         {specialBanners.map(banner => (
                             <div key={banner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                 <div className="flex items-center gap-3">
                                    <img src={banner.imageUrl} className="w-16 h-10 rounded object-cover" />
                                    <div className="text-xs">
                                        {Object.entries(banner).filter(([key]) => key !== 'id' && key !== 'imageUrl').map(([key, value]) => (
                                            <p key={key}><span className="font-semibold capitalize">{key.replace('target', '')}:</span> {String(value)}</p>
                                        ))}
                                    </div>
                                 </div>
                                 <button onClick={() => onDeleteBanner(banner.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Delete</button>
                             </div>
                         ))}
                         {specialBanners.length === 0 && <p className="text-center text-gray-500 py-4">No special banners configured.</p>}
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default AppearancePage;
