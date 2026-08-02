import React, { useState } from 'react';
import type { ServiceProvider, RatingDispute } from '../types';

interface SaccoDashboardProps {
  currentUser: ServiceProvider | null;
  providers: ServiceProvider[];
  onBack: () => void;
  onUpdateProvider: (provider: ServiceProvider) => void;
  onApproveSaccoMember: (orgId: string, userId: string) => void;
  onRejectSaccoMember: (orgId: string, userId: string) => void;
  onResolveDispute: (saccoId: string, disputeId: string, action: 'resolve' | 'dismiss') => void;
}

const SaccoDashboard: React.FC<SaccoDashboardProps> = ({
  currentUser,
  providers,
  onBack,
  onUpdateProvider,
  onApproveSaccoMember,
  onRejectSaccoMember,
  onResolveDispute
}) => {
  // Find organizations/saccos in the system
  const saccoOrgs = providers.filter(p => p.accountType === 'organization' || p.saccoCode || p.id.startsWith('sacco'));
  
  // Default active sacco: if currentUser is an organization or has saccoCode, or default to sacco-sheria
  const userSaccoId = currentUser?.saccoMember?.saccoId || currentUser?.id || 'sacco-sheria';
  const [selectedSaccoId, setSelectedSaccoId] = useState<string>(
    saccoOrgs.find(s => s.id === userSaccoId)?.id || saccoOrgs[0]?.id || 'sacco-sheria'
  );

  // Active Sacco Org Provider Object
  const currentSaccoOrg: ServiceProvider = providers.find(p => p.id === selectedSaccoId) || {
    id: selectedSaccoId,
    name: currentUser?.saccoMember?.saccoName || 'Sheria Professionals Sacco',
    service: 'Sacco & Professional Association',
    phone: currentUser?.phone || '254711111111',
    avatarUrl: 'https://i.pravatar.cc/150?u=sacco',
    coverImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800',
    rating: 5.0,
    distanceKm: 0.1,
    hourlyRate: 0,
    rateType: 'per hour',
    currency: 'Ksh',
    isVerified: true,
    about: 'Registered and audited Sacco for neighborhood service professionals.',
    accountType: 'organization',
    flagCount: 0,
    views: 120,
    location: 'Nairobi, Kenya',
    category: 'Association',
    works: [],
    isOnline: true,
    joinRequests: [],
    ratingDisputes: [],
    cta: ['call'] as ('call' | 'whatsapp' | 'book' | 'catalogue' | 'join' | 'menu' | 'save')[],
    saccoCode: 'SACCO-SHERIA',
    saccoDetails: {
      description: 'Official Sacco organization providing quality verification, dispute resolution, and welfare for registered professionals.',
      location: 'Nairobi, Kenya',
      registrationNo: 'REG-SOC/2024/0981',
      contactPhone: currentUser?.phone || '254711111111',
      totalMembers: 48,
      rulesAndBenefits: 'Verified quality standards, group insurance, and rating audit support.'
    }
  };

  // State for active tab: 'members' | 'offerings' | 'profile' | 'disputes'
  const [activeTab, setActiveTab] = useState<'members' | 'offerings' | 'profile' | 'disputes'>('members');

  // Org Services & Vocational Courses Offerings State
  const [orgOfferings, setOrgOfferings] = useState<{ id: string; title: string; type: 'Course' | 'Service' | 'Equipment'; price: string; description: string; published: boolean }[]>([
    { id: 'off_1', title: 'Solar Installation & Electrical Certificate Course', type: 'Course', price: 'Ksh 15,000', description: '3-Month accredited TVET vocational training course with hands-on field practice.', published: true },
    { id: 'off_2', title: 'Group Security Guarding & Event Stewarding', type: 'Service', price: 'Ksh 2,500/day', description: 'Vetted, uniformed security guards for community events and premises.', published: true },
    { id: 'off_3', title: 'Heavy Duty Scaffolding & Ladder Hire', type: 'Equipment', price: 'Ksh 1,000/day', description: 'Certified aluminum scaffolds with safety harnesses for high-rise work.', published: true }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Course' | 'Service' | 'Equipment'>('Course');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAddOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem = {
      id: `off_${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      price: newPrice.trim() || 'Ksh 0',
      description: newDesc.trim(),
      published: true
    };
    setOrgOfferings([newItem, ...orgOfferings]);
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    alert(`✓ "${newItem.title}" added to ${saccoName}'s published offerings!`);
  };

  // Search query for adding members
  const [memberSearch, setMemberSearch] = useState('');

  // Sacco Profile Edit Form State
  const [saccoName, setSaccoName] = useState(currentSaccoOrg.name || 'Sheria Professionals Sacco');
  const [saccoCode, setSaccoCode] = useState(currentSaccoOrg.saccoCode || 'SACCO-SHERIA');
  const [regNo, setRegNo] = useState(currentSaccoOrg.saccoDetails?.registrationNo || 'REG-SOC/2024/0981');
  const [location, setLocation] = useState(currentSaccoOrg.saccoDetails?.location || currentSaccoOrg.location || 'Nairobi, Kenya');
  const [contactPhone, setContactPhone] = useState(currentSaccoOrg.saccoDetails?.contactPhone || currentSaccoOrg.phone || '');
  const [description, setDescription] = useState(currentSaccoOrg.saccoDetails?.description || currentSaccoOrg.about || '');
  const [rules, setRules] = useState(currentSaccoOrg.saccoDetails?.rulesAndBenefits || 'Verified quality standards and rating audit support.');
  
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Active Sacco members list
  const activeMembers = providers.filter(p => 
    p.accountType !== 'organization' && 
    (p.saccoMember?.saccoId === currentSaccoOrg.id || 
     p.saccoMember?.saccoName === currentSaccoOrg.name || 
     p.isSaccoVerified)
  );

  // Pending join requests
  const joinRequests = currentSaccoOrg.joinRequests || [
    { id: 'req_1', userId: 'h2', userName: 'David Njuguna', userPhone: '254712345678', status: 'Pending' as const },
    { id: 'req_2', userId: 'h3', userName: 'Grace Muthoni', userPhone: '254723456789', status: 'Pending' as const }
  ];
  const pendingRequests = joinRequests.filter((r: any) => r.status === 'Pending' || r.status === 'pending');

  // Rating Disputes
  const disputes: RatingDispute[] = currentSaccoOrg.ratingDisputes || [];

  // Filtered providers for "Add Member" picker
  const nonMembers = providers.filter(p => 
    p.accountType !== 'organization' && 
    p.saccoMember?.saccoId !== currentSaccoOrg.id &&
    (!memberSearch || 
      p.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
      p.phone.includes(memberSearch) ||
      p.service.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  // Action: Add provider directly as a Sacco member
  const handleAddMemberDirectly = (targetProvider: ServiceProvider) => {
    const updatedMember: ServiceProvider = {
      ...targetProvider,
      isSaccoVerified: true,
      saccoMember: {
        saccoId: currentSaccoOrg.id,
        saccoName: saccoName,
        saccoCode: saccoCode,
        status: 'Confirmed',
        requestedAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString()
      }
    };
    onUpdateProvider(updatedMember);
    alert(`✓ ${targetProvider.name} added as a verified member of ${saccoName}!`);
  };

  // Action: Remove member from Sacco
  const handleRemoveMember = (targetProvider: ServiceProvider) => {
    if (!confirm(`Are you sure you want to remove ${targetProvider.name} from ${saccoName}?`)) return;
    const updatedMember: ServiceProvider = {
      ...targetProvider,
      isSaccoVerified: false,
      saccoMember: undefined
    };
    onUpdateProvider(updatedMember);
    alert(`Removed ${targetProvider.name} from Sacco membership.`);
  };

  // Action: Save Sacco Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedOrg: ServiceProvider = {
      ...currentSaccoOrg,
      name: saccoName,
      saccoCode: saccoCode,
      phone: contactPhone,
      location: location,
      about: description,
      saccoDetails: {
        registrationNo: regNo,
        location: location,
        contactPhone: contactPhone,
        description: description,
        rulesAndBenefits: rules,
        totalMembers: activeMembers.length || 1
      }
    };

    // Update state across app
    onUpdateProvider(updatedOrg);
    
    // Also update all active members' saccoName
    activeMembers.forEach(m => {
      if (m.saccoMember) {
        onUpdateProvider({
          ...m,
          saccoMember: {
            ...m.saccoMember,
            saccoName: saccoName,
            saccoCode: saccoCode
          }
        });
      }
    });

    setSaveSuccessMsg('✓ Sacco public profile updated successfully! Changes are live for the public.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-black bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95"
            >
              ← Back
            </button>
            <span className="bg-blue-500/30 border border-blue-400/30 text-blue-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
              🏢 Executive Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 border-2 border-blue-300 text-white font-black flex items-center justify-center text-xl shadow-inner flex-shrink-0">
              🏢
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-wide leading-snug">
                Sacco & Organization Security Portal
              </h1>
              <p className="text-xs text-blue-200 font-medium">
                Vetting & member security approvals, org offerings, and public Sacco profile.
              </p>
            </div>
          </div>

          {/* Sacco Switcher Selector if multiple Saccos exist */}
          <div className="mt-4 pt-3 border-t border-blue-800/80 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider">
              Active Sacco / Org:
            </span>
            <select
              value={selectedSaccoId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedSaccoId(newId);
                const chosen = providers.find(p => p.id === newId);
                if (chosen) {
                  setSaccoName(chosen.name || '');
                  setSaccoCode(chosen.saccoCode || '');
                  setRegNo(chosen.saccoDetails?.registrationNo || 'REG-SOC/2024/0981');
                  setLocation(chosen.location || 'Nairobi, Kenya');
                  setContactPhone(chosen.phone || '');
                  setDescription(chosen.saccoDetails?.description || chosen.about || '');
                }
              }}
              className="bg-blue-950/80 border border-blue-400/40 text-white text-xs font-black rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              {saccoOrgs.map(org => (
                <option key={org.id} value={org.id} className="bg-gray-900 text-white">
                  {org.name} ({org.saccoCode || 'SACCO'})
                </option>
              ))}
              <option value="sacco-utumishi" className="bg-gray-900 text-white">
                Utumishi Sacco (SACCO-UTUMISHI)
              </option>
              <option value="sacco-stima" className="bg-gray-900 text-white">
                Stima Sacco (SACCO-STIMA)
              </option>
              <option value="sacco-sheria" className="bg-gray-900 text-white">
                Sheria Professionals Sacco
              </option>
              <option value="sacco-westlands" className="bg-gray-900 text-white">
                Westlands Boda Boda Association
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* Primary Security Purpose Banner */}
        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-3.5 rounded-2xl border border-blue-400/30 flex items-start gap-3 shadow-md">
          <span className="text-xl p-1.5 bg-white/10 rounded-xl">🛡️</span>
          <div className="text-xs">
            <h4 className="font-black uppercase tracking-wider text-blue-200">
              Primary Goal: Enhanced Multi-Layer Security & Member Vetting
            </h4>
            <p className="text-gray-300 text-[10.5px] leading-relaxed mt-0.5">
              Strictly for accounts registered with a Sacco Registration No. and Organization account type (Saccos, Vocational Schools, Cooperatives). Professionals registering with your Sacco Code require manual verification here before receiving the <strong>💙 SACCO MEMBER</strong> badge.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 min-w-[110px] py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'members' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span>👥</span> Vetting ({activeMembers.length})
          </button>

          <button
            onClick={() => setActiveTab('offerings')}
            className={`flex-1 min-w-[110px] py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'offerings' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span>🎓</span> Services & Courses
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[100px] py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span>✏️</span> Public Profile
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`flex-1 min-w-[90px] py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'disputes' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span>⚖️</span> Disputes ({disputes.length})
          </button>
        </div>

        {/* TAB 1: MEMBERS MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            
            {/* Add Member Card */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>➕</span> Add Member to {saccoName}
                </h3>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Quick Registration
                </span>
              </div>

              <p className="text-xs text-gray-600">
                Search professionals on the platform to add them directly as verified Sacco members.
              </p>

              <input 
                type="text" 
                placeholder="Search provider name, service, or phone number..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-black outline-none focus:bg-white focus:border-blue-600 transition-all"
              />

              {/* Suggestions List */}
              {memberSearch.trim().length > 0 && (
                <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-2xl bg-gray-50 p-1">
                  {nonMembers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500 font-medium">
                      No matching unassigned providers found.
                    </div>
                  ) : (
                    nonMembers.map(prov => (
                      <div key={prov.id} className="p-2 flex items-center justify-between hover:bg-white rounded-xl transition-all">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={prov.avatarUrl} className="w-8 h-8 rounded-full object-cover border" alt="" />
                          <div className="min-w-0">
                            <h4 className="font-black text-xs text-gray-900 truncate">{prov.name}</h4>
                            <p className="text-[10px] text-gray-500 font-semibold truncate">{prov.service} • {prov.phone}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAddMemberDirectly(prov)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] px-2.5 py-1 rounded-xl uppercase tracking-wider transition-all shadow-xs active:scale-95"
                        >
                          + Add Member
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl space-y-3">
                <h3 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⏳</span> Pending Join Requests ({pendingRequests.length})
                </h3>
                
                <div className="space-y-2">
                  {pendingRequests.map((req: any) => (
                    <div key={req.id} className="bg-white p-3 rounded-2xl border border-amber-200 flex items-center justify-between gap-2 shadow-xs">
                      <div>
                        <h4 className="font-black text-xs text-gray-900">{req.userName}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">Phone: {req.userPhone || 'Registered'}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onApproveSaccoMember(currentSaccoOrg.id, req.userId)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-xs"
                        >
                          ✓ Confirm
                        </button>
                        <button
                          onClick={() => onRejectSaccoMember(currentSaccoOrg.id, req.userId)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-black text-[10px] px-2.5 py-1.5 rounded-xl uppercase tracking-wider"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Members Directory List */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💙</span> Verified Active Sacco Members ({activeMembers.length})
                </h3>
                <span className="text-[10px] text-blue-700 font-black bg-blue-50 px-2 py-0.5 rounded-md">
                  Code: {saccoCode}
                </span>
              </div>

              {activeMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 font-medium">
                  No verified members in this Sacco yet. Use the search box above to add members!
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activeMembers.map(member => (
                    <div key={member.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={member.avatarUrl} 
                          alt={member.name} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-xs text-gray-900 truncate">{member.name}</h4>
                            <span className="text-[8px] bg-blue-100 text-blue-900 font-black px-1.5 py-0.2 rounded-md">
                              VERIFIED
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold truncate">{member.service}</p>
                          <p className="text-[9px] text-gray-400 font-medium">{member.phone}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px] font-black px-2.5 py-1.5 rounded-xl border border-red-200 transition-all active:scale-95 flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: ORGANIZATION OFFERINGS (SERVICES & COURSES) */}
        {activeTab === 'offerings' && (
          <div className="space-y-4 font-sans">
            {/* Create New Offering Form */}
            <form onSubmit={handleAddOffering} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div>
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🎓</span> Publish Organization Offerings & Courses
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  List services, equipment hires, or vocational training courses sold directly by {saccoName}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                    Offering / Course Title *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Electrical & Solar Installation Masterclass"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                    Offering Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Course">Vocational Course</option>
                    <option value="Service">Org Service</option>
                    <option value="Equipment">Equipment Hire</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                    Price / Tuition Fee
                  </label>
                  <input 
                    type="text" 
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g. Ksh 12,000 / term"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                    Short Description
                  </label>
                  <input 
                    type="text" 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g. 3-Month practical certification with internship placement."
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-black outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>➕</span> Publish Offering to Tukosoko
              </button>
            </form>

            {/* Published Offerings List */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <span>🛒</span> Published Organization Catalogue ({orgOfferings.length})
              </h3>

              <div className="space-y-2.5">
                {orgOfferings.map(item => (
                  <div key={item.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                          item.type === 'Course' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                          item.type === 'Equipment' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}>
                          {item.type}
                        </span>
                        <h4 className="font-black text-xs text-gray-900">{item.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium">{item.description}</p>
                      <span className="inline-block text-xs font-black text-emerald-700">{item.price}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg uppercase">
                        ✓ Live on Tukosoko
                      </span>
                      <button 
                        onClick={() => {
                          setOrgOfferings(orgOfferings.filter(o => o.id !== item.id));
                        }}
                        className="text-red-500 hover:text-red-700 text-xs p-1 cursor-pointer"
                        title="Delete offering"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PUBLIC SACCO PROFILE EDIT */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            
            <div>
              <h3 className="font-black text-sm text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                <span>✏️</span> Public Sacco Profile Settings
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                These exact details appear when the public clicks the Sacco badge on service listings or provider profiles.
              </p>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 font-black text-xs rounded-2xl">
                {saveSuccessMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                  Sacco Public Name
                </label>
                <input 
                  type="text" 
                  required
                  value={saccoName}
                  onChange={(e) => setSaccoName(e.target.value)}
                  placeholder="e.g. Westlands Boda Boda Association"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                  Sacco Code / Code
                </label>
                <input 
                  type="text" 
                  required
                  value={saccoCode}
                  onChange={(e) => setSaccoCode(e.target.value)}
                  placeholder="e.g. SACCO-WESTLANDS"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-blue-700 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                  Registration Number
                </label>
                <input 
                  type="text" 
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g. REG-SOC/2024/0981"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                  Base Location
                </label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Westlands, Nairobi"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                  Secretariat Contact Phone
                </label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. 254711111111"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                Public Sacco Description & Quality Guarantee
              </label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your Sacco's mission, verification standards, and community backing..."
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-black outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-600 mb-1">
                Rules & Membership Benefits
              </label>
              <textarea 
                rows={2}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Key rules, audit standards, group welfare..."
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-black outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <span>💾</span> Save & Publish Sacco Profile
            </button>
          </form>
        )}

        {/* TAB 3: DISPUTES & AUDITS */}
        {activeTab === 'disputes' && (
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-sm text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                <span>⚖️</span> Member Rating Disputes ({disputes.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Audit rating dispute tickets submitted by Sacco members against unfair reviews.
              </p>
            </div>

            {disputes.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500 font-medium">
                No active rating disputes filed with this Sacco.
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map(disp => (
                  <div key={disp.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-xs text-gray-900">{disp.providerName}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">Reviewer: {disp.reviewerName}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                        disp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-900' :
                        disp.status === 'Dismissed' ? 'bg-gray-200 text-gray-700' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {disp.status}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-xl border text-[11px] text-gray-700">
                      <strong>Reason:</strong> {disp.disputeReason}
                    </div>

                    {disp.status === 'Pending' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => onResolveDispute(currentSaccoOrg.id, disp.id, 'resolve')}
                          className="flex-1 bg-emerald-600 text-white font-black py-1.5 rounded-xl text-[10px] uppercase tracking-wider"
                        >
                          ✓ Resolve Dispute
                        </button>
                        <button
                          onClick={() => onResolveDispute(currentSaccoOrg.id, disp.id, 'dismiss')}
                          className="flex-1 bg-gray-200 text-gray-800 font-black py-1.5 rounded-xl text-[10px] uppercase tracking-wider"
                        >
                          ✕ Dismiss Ticket
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SaccoDashboard;
