
import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import { 
  ServiceProvider, CatalogueItem, Document, SpecialBanner, 
  InboxMessage, UnitDetails, SetupData, CurrentPage, OrderData, UnitKey, RatingDispute,
  AppBrandingConfig, AppFeatureConfig
} from './types';

import AuthModal from './components/AuthModal';
import SideMenu from './components/SideMenu';
import NikoSoko from './components/NikoSoko';
import ServiceMarketplace from './components/ServiceMarketplace';
import JourneyPage from './components/JourneyPage';
import Tukosoko from './components/Tukosoko';
import PendingRatingsView from './components/PendingRatingsView';
import MyContactsView, { SavedContactItem } from './components/MyContactsView';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CreatePostView from './components/CreatePostView';
import AddServiceCardView from './components/AddServiceCardView';
import MessageCenterView from './components/MessageCenterView';
import RegisterAssetView from './components/RegisterAssetView';
import OwnershipCheckView from './components/OwnershipCheckView';
import QRScannerView from './components/QRScannerView';
import ProfileView from './components/ProfileView';
import ReviewModal from './components/ReviewModal';
import SkillDashboard from './components/SkillDashboard';
import SaccoDashboard from './components/SaccoDashboard';
import SaccoModal from './components/SaccoModal';
import { BookingModal } from './components/BookingModal';
import SEOHead from './components/SEOHead';
import SEOMapModal from './components/SEOMapModal';
import DesktopBannerLayout from './components/DesktopBannerLayout';

function App() {
  const [currentUser, setCurrentUser] = useState<ServiceProvider | null>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_cached_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(api.getToken() || localStorage.getItem('nikosoko_cached_user'));
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_cached_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.role === 'SuperAdmin' || parsed.phone === '254723119356' || parsed.phone === '0723119356';
      }
    } catch {}
    return false;
  });
  const [currentPage, setCurrentPage] = useState<CurrentPage>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_current_page');
      return (saved as CurrentPage) || 'home';
    } catch {
      return 'home';
    }
  });
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'nickname' | 'complete_signup'>('nickname');
  const [saccoModalProvider, setSaccoModalProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState<ServiceProvider[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isForcedReview, setIsForcedReview] = useState(false);
  const [contactHistory, setContactHistory] = useState<{ providerId: string; contactedAt: number; postponeCount: number }[]>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_contact_history_v2');
      if (saved) return JSON.parse(saved);
      const oldContacted = localStorage.getItem('nikosoko_contacted_provider_ids');
      if (oldContacted) {
        const ids: string[] = JSON.parse(oldContacted);
        return ids.map(id => ({ providerId: id, contactedAt: Date.now() - 3600 * 1000, postponeCount: 0 }));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [ratedProviderIds, setRatedProviderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_rated_provider_ids');
      if (saved) return JSON.parse(saved);
      if (localStorage.getItem('nikosoko_user_has_rated') === 'true') {
        const savedContacted = localStorage.getItem('nikosoko_contacted_provider_ids');
        return savedContacted ? JSON.parse(savedContacted) : [];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [dismissedProviderIds, setDismissedProviderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_dismissed_provider_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [reviewModalSubtitle, setReviewModalSubtitle] = useState<string>('');
  const [reviewPostponeCount, setReviewPostponeCount] = useState<number>(0);
  const [pendingCtaAction, setPendingCtaAction] = useState<(() => void) | null>(null);
  const [simulated6HOverdueId, setSimulated6HOverdueId] = useState<string | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [specialBanners, setSpecialBanners] = useState<SpecialBanner[]>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_special_banners');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [brandingConfig, setBrandingConfig] = useState<AppBrandingConfig>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_branding_config');
      return saved ? JSON.parse(saved) : {
        appName: 'NikoSoko',
        tagline: "Kenya's Premier Marketplace for Trades Professionals & Services",
        primaryColor: '#F59E0B',
        supportPhone: '+254 723 119 356',
        supportEmail: 'support@nikosoko.com'
      };
    } catch {
      return {
        appName: 'NikoSoko',
        tagline: "Kenya's Premier Marketplace for Trades Professionals & Services",
        primaryColor: '#F59E0B',
        supportPhone: '+254 723 119 356',
        supportEmail: 'support@nikosoko.com'
      };
    }
  });
  const [featureConfig, setFeatureConfig] = useState<AppFeatureConfig>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_feature_config');
      return saved ? JSON.parse(saved) : {
        enableTimeline: true,
        enableQaRibuGatePass: false,
        enableGigs: true,
        enableEvents: true,
        enableSaccos: true,
        enableAssetVerification: true,
        enableCourses: true,
        enableCatalogue: true
      };
    } catch {
      return {
        enableTimeline: true,
        enableQaRibuGatePass: false,
        enableGigs: true,
        enableEvents: true,
        enableSaccos: true,
        enableAssetVerification: true,
        enableCourses: true,
        enableCatalogue: true
      };
    }
  });
  const [viewingProvider, setViewingProvider] = useState<ServiceProvider | null>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_viewing_provider');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [viewingCatalogueProvider, setViewingCatalogueProvider] = useState<ServiceProvider | null>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_viewing_catalogue_provider');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(() => {
    try {
      const saved = localStorage.getItem('nikosoko_selected_document');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedTools, setSelectedTools] = useState<CurrentPage[]>(['home', 'journey', 'admin']);
  const [bookingTargetProvider, setBookingTargetProvider] = useState<ServiceProvider | null>(null);
  const [isSEOMapOpen, setIsSEOMapOpen] = useState(false);
  const [savedContactsMap, setSavedContactsMap] = useState<Record<string, SavedContactItem>>(() => {
    try {
      const local = localStorage.getItem('nikosoko_saved_contacts_v2');
      if (local) return JSON.parse(local);
    } catch (e) {
      console.error(e);
    }
    return {};
  });
  const [pendingBackAction, setPendingBackAction] = useState<(() => void) | null>(null);
  const [pendingCtaTargetProvider, setPendingCtaTargetProvider] = useState<ServiceProvider | null>(null);
  const [ctaToast, setCtaToast] = useState<{ show: boolean; text: string; providerId?: string } | null>(null);

  const contactedProviderIds = contactHistory.map(c => c.providerId);

  const handleOpenCompleteSignUp = () => {
    setAuthModalMode('complete_signup');
    setIsAuthModalOpen(true);
  };

  const handleOpenLogin = () => {
    setAuthModalMode('nickname');
    setIsAuthModalOpen(true);
  };

  const handleToggleSaveContact = (providerId: string, customLabel?: string) => {
    setSavedContactsMap(prev => {
      const next = { ...prev };
      if (next[providerId]) {
        delete next[providerId];
      } else {
        next[providerId] = {
          providerId,
          label: customLabel || '',
          savedAt: new Date().toISOString()
        };
      }
      try {
        localStorage.setItem('nikosoko_saved_contacts_v2', JSON.stringify(next));
      } catch (e) { console.error(e); }
      return next;
    });
  };

  const handleUpdateContactLabel = (providerId: string, label: string) => {
    setSavedContactsMap(prev => {
      if (!prev[providerId]) return prev;
      const next = {
        ...prev,
        [providerId]: {
          ...prev[providerId],
          label
        }
      };
      try {
        localStorage.setItem('nikosoko_saved_contacts_v2', JSON.stringify(next));
      } catch (e) { console.error(e); }
      return next;
    });
  };

  const handleRemoveContact = (providerId: string) => {
    setSavedContactsMap(prev => {
      const next = { ...prev };
      delete next[providerId];
      try {
        localStorage.setItem('nikosoko_saved_contacts_v2', JSON.stringify(next));
      } catch (e) { console.error(e); }
      return next;
    });
  };

  // Sync core application states to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('nikosoko_current_page', currentPage);
    } catch (e) { console.error(e); }
  }, [currentPage]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('nikosoko_cached_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('nikosoko_cached_user');
      }
    } catch (e) { console.error(e); }
  }, [currentUser]);

  useEffect(() => {
    try {
      if (viewingProvider) {
        localStorage.setItem('nikosoko_viewing_provider', JSON.stringify(viewingProvider));
      } else {
        localStorage.removeItem('nikosoko_viewing_provider');
      }
    } catch (e) { console.error(e); }
  }, [viewingProvider]);

  useEffect(() => {
    try {
      if (viewingCatalogueProvider) {
        localStorage.setItem('nikosoko_viewing_catalogue_provider', JSON.stringify(viewingCatalogueProvider));
      } else {
        localStorage.removeItem('nikosoko_viewing_catalogue_provider');
      }
    } catch (e) { console.error(e); }
  }, [viewingCatalogueProvider]);

  useEffect(() => {
    try {
      if (selectedDocument) {
        localStorage.setItem('nikosoko_selected_document', JSON.stringify(selectedDocument));
      } else {
        localStorage.removeItem('nikosoko_selected_document');
      }
    } catch (e) { console.error(e); }
  }, [selectedDocument]);

  useEffect(() => {
    let isMounted = true;

    // Safety fallback: Ensure splash screen unmounts within 2 seconds max
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 2000);

    const loadData = async () => {
      try {
        let token = api.getToken();

        if (token) {
            const user = await api.getMyProfile().catch(() => null);
            if (user && isMounted) {
              setCurrentUser(user);
              setIsAuthenticated(true);
              if (user.phone === '254723119356' || user.phone === '0723119356') setIsSuperAdmin(true);
            }
        }
        const [providersData, catalogueData, docsData, bannersData] = await Promise.all([
          api.getProviders().catch(() => []), 
          api.getCatalogueItems().catch(() => []), 
          api.getDocuments().catch(() => []), 
          api.getSpecialBanners().catch(() => [])
        ]);
        if (isMounted) {
          if (providersData.length) setProviders(providersData);
          if (catalogueData.length) setCatalogueItems(catalogueData);
          if (docsData.length) setDocuments(docsData);
          if (bannersData.length) setSpecialBanners(bannersData);
        }
      } catch (error) { 
        console.error("Failed to load data", error); 
      } finally { 
        if (isMounted) {
          setIsLoading(false); 
          clearTimeout(safetyTimer);
        }
      }
    };
    loadData();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleSaveAssets = (assets: BusinessAssets) => {
    setBusinessAssets(assets);
    localStorage.setItem('nikosoko_business_assets', JSON.stringify(assets));
  };

  const gateAuth = (action: () => void) => {
    if (!isAuthenticated) handleOpenLogin();
    else action();
  };

  const handleOpenSideMenu = () => {
    gateAuth(() => setIsSideMenuOpen(true));
  };

  const handleLogin = (data: any, phone: string, nickname?: string, fullProfile?: Partial<ServiceProvider>) => {
    if (data.success && data.user) {
        const userToSet = { ...data.user, ...(fullProfile || {}) };
        setCurrentUser(userToSet);
        setIsAuthenticated(true);
        setIsSuperAdmin(data.isSuperAdmin);
        api.setToken(data.token);
        api.updateProvider(userToSet).catch(() => {});
        setIsAuthModalOpen(false);
    } else if (data.success && !data.user) {
        setIsAuthenticated(true); 
        api.setToken(data.token);
        setIsSuperAdmin(data.isSuperAdmin);

        if (currentUser && fullProfile) {
            // Updating existing logged-in guest user with full profile
            const updatedUser: ServiceProvider = {
                ...currentUser,
                ...fullProfile,
                isProfileCompleted: true,
                isVerified: fullProfile.isVerified ?? Boolean(fullProfile.referralCode && fullProfile.referralCode.trim().length > 0)
            };
            setCurrentUser(updatedUser);
            api.updateProvider(updatedUser).catch(() => {});
            setProviders(prev => prev.map(p => p.id === updatedUser.id ? updatedUser : p));
            if (!providers.some(p => p.id === updatedUser.id)) {
                setProviders(prev => [updatedUser, ...prev]);
            }
        } else if (fullProfile) {
            const hasReferral = Boolean(fullProfile.referralCode && fullProfile.referralCode.trim().length > 0);
            const newUser: ServiceProvider = { 
                id: `usr_${Date.now()}`, 
                name: fullProfile.name || nickname || 'Member', 
                phone: fullProfile.phone || phone, 
                service: fullProfile.service || 'Trades Professional', 
                avatarUrl: fullProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullProfile.name || nickname || 'U')}&background=random`,
                coverImageUrl: fullProfile.coverImageUrl || 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800', 
                isVerified: fullProfile.isVerified ?? hasReferral, 
                rating: 5.0, 
                distanceKm: 0, 
                hourlyRate: fullProfile.hourlyRate ?? 0,
                rateType: fullProfile.rateType || 'per hour', 
                currency: 'Ksh', 
                about: fullProfile.about || '', 
                works: [], 
                category: fullProfile.category || 'TECHNICAL', 
                location: fullProfile.location || 'Nairobi, Kenya', 
                isOnline: true,
                accountType: fullProfile.accountType || 'individual', 
                referralCode: fullProfile.referralCode || '',
                shopDetails: fullProfile.shopDetails ? { operatingHours: fullProfile.shopDetails.operatingHours } : undefined,
                flagCount: 0, 
                views: 0, 
                cta: fullProfile.cta || ['call', 'whatsapp', 'book', 'save'],
                isProfileCompleted: fullProfile.isProfileCompleted ?? true
            };
            setCurrentUser(newUser);
            api.createProvider(newUser).catch(() => {});
            setProviders(prev => [newUser, ...prev]);
        } else {
            // Guest Mode
            const newUser: ServiceProvider = { 
                id: `guest_${Date.now()}`, 
                name: nickname && nickname.trim() ? nickname.trim() : 'Guest Member', 
                phone, 
                service: 'Guest', 
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname || 'Guest')}&background=random`,
                coverImageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800', 
                isVerified: false, 
                rating: 0, 
                distanceKm: 0, 
                hourlyRate: 0,
                rateType: 'per hour', 
                currency: 'Ksh', 
                about: 'Guest Account', 
                works: [], 
                category: 'PERSONAL', 
                location: 'Kenya', 
                isOnline: true,
                accountType: 'individual', 
                flagCount: 0, 
                views: 0, 
                cta: [],
                isProfileCompleted: false
            };
            setCurrentUser(newUser);
            api.createProvider(newUser).catch(() => {});
        }
        setIsAuthModalOpen(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    api.clearToken();
    try {
      localStorage.removeItem('nikosoko_cached_user');
      localStorage.removeItem('nikosoko_viewing_provider');
      localStorage.removeItem('nikosoko_viewing_catalogue_provider');
      localStorage.removeItem('nikosoko_selected_document');
      localStorage.setItem('nikosoko_current_page', 'home');
    } catch (e) {
      console.error(e);
    }
    setCurrentPage('home');
  };

  const handleApproveSaccoRequest = (orgId: string, userId: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === userId) {
        const updated = {
          ...p,
          isSaccoVerified: true,
          saccoMember: p.saccoMember ? {
            ...p.saccoMember,
            status: 'Confirmed' as const,
            confirmedAt: new Date().toISOString()
          } : {
            saccoId: orgId,
            saccoName: 'Registered Sacco',
            saccoCode: '',
            status: 'Confirmed' as const,
            requestedAt: new Date().toISOString(),
            confirmedAt: new Date().toISOString()
          }
        };
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
        }
        if (viewingProvider?.id === userId) {
          setViewingProvider(updated);
        }
        return updated;
      }
      if (p.id === orgId) {
        const updatedRequests = (p.joinRequests || []).map(r => r.userId === userId ? { ...r, status: 'Approved' as const } : r);
        const updatedOrg = { ...p, joinRequests: updatedRequests };
        if (viewingProvider?.id === orgId) {
          setViewingProvider(updatedOrg);
        }
        return updatedOrg;
      }
      return p;
    }));
  };

  const handleRejectSaccoRequest = (orgId: string, userId: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === userId) {
        const updated = {
          ...p,
          isSaccoVerified: false,
          saccoMember: p.saccoMember ? { ...p.saccoMember, status: 'Rejected' as const } : undefined
        };
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
        }
        if (viewingProvider?.id === userId) {
          setViewingProvider(updated);
        }
        return updated;
      }
      if (p.id === orgId) {
        const updatedRequests = (p.joinRequests || []).map(r => r.userId === userId ? { ...r, status: 'Rejected' as const } : r);
        const updatedOrg = { ...p, joinRequests: updatedRequests };
        if (viewingProvider?.id === orgId) {
          setViewingProvider(updatedOrg);
        }
        return updatedOrg;
      }
      return p;
    }));
  };

  const handleDisputeRating = (providerId: string, reviewerName: string, rating: number, comment: string, disputeReason: string) => {
    const targetProvider = providers.find(p => p.id === providerId);
    if (!targetProvider || !targetProvider.saccoMember?.saccoId) return;

    const saccoId = targetProvider.saccoMember.saccoId;
    const dispute: RatingDispute = {
      id: `dsp_${Date.now()}`,
      providerId,
      providerName: targetProvider.name,
      reviewerName,
      originalRating: rating,
      comment,
      disputeReason,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setProviders(prev => prev.map(p => {
      if (p.id === saccoId) {
        const updatedOrg = {
          ...p,
          ratingDisputes: [...(p.ratingDisputes || []), dispute]
        };
        if (viewingProvider?.id === saccoId) setViewingProvider(updatedOrg);
        return updatedOrg;
      }
      return p;
    }));
  };

  const handleResolveDispute = (saccoId: string, disputeId: string, action: 'resolve' | 'dismiss') => {
    setProviders(prev => prev.map(p => {
      if (p.id === saccoId) {
        const updatedDisputes = (p.ratingDisputes || []).map(d => {
          if (d.id === disputeId) {
            return {
              ...d,
              status: action === 'resolve' ? ('Resolved' as const) : ('Dismissed' as const),
              resolutionNote: action === 'resolve' ? 'Resolved by Sacco Executive Committee' : 'Dismissed after review'
            };
          }
          return d;
        });
        const updatedOrg = { ...p, ratingDisputes: updatedDisputes };
        if (viewingProvider?.id === saccoId) setViewingProvider(updatedOrg);
        return updatedOrg;
      }
      return p;
    }));
  };

  const handleNavigate = (page: CurrentPage) => {
      if (page === 'login') {
          setIsAuthModalOpen(true);
          return;
      }
      if (page === 'profile') {
          if (currentUser) {
              setViewingProvider(currentUser);
          }
          setCurrentPage('profile');
          return;
      }
      if (page === 'skill_id') {
          gateAuth(() => setCurrentPage('skill_id'));
          return;
      }
      if (['createPost', 'messages'].includes(page)) {
          gateAuth(() => setCurrentPage(page));
      } else {
          setCurrentPage(page);
      }
  };

  const handleScanSuccess = async (data: string) => {
    if (data.startsWith('PROFILE:')) {
        const userId = data.split(':')[1];
        const provider = providers.find(p => p.id === userId);
        if (provider) { setViewingProvider(provider); setCurrentPage('profile'); }
    } else {
        alert("Scanned Code: " + data);
    }
  };

  const handleVerifyCatalogueItem = (itemId: string, isVerified: boolean) => {
      setCatalogueItems(prev => prev.map(item => item.id === itemId ? { ...item, isVerified } : item));
  };

  const handleDeleteCatalogueItem = async (itemId: string) => {
      await api.deleteCatalogueItem(itemId);
      setCatalogueItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddBannerAdmin = (newBannerData: Omit<SpecialBanner, 'id'>) => {
    const banner: SpecialBanner = {
      ...newBannerData,
      id: `banner_${Date.now()}`
    };
    setSpecialBanners(prev => {
      const updated = [banner, ...prev];
      try {
        localStorage.setItem('nikosoko_special_banners', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteBannerAdmin = (bannerId: string) => {
    setSpecialBanners(prev => {
      const updated = prev.filter(b => b.id !== bannerId);
      try {
        localStorage.setItem('nikosoko_special_banners', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleSaveBrandingAdmin = (config: AppBrandingConfig) => {
    setBrandingConfig(config);
    try {
      localStorage.setItem('nikosoko_branding_config', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveFeatureAdmin = (config: AppFeatureConfig) => {
    setFeatureConfig(config);
    try {
      localStorage.setItem('nikosoko_feature_config', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  };

  const recordContact = (providerId: string) => {
      setContactHistory(prev => {
          const existing = prev.find(c => c.providerId === providerId);
          if (existing) return prev;
          const updated = [{ providerId, contactedAt: Date.now(), postponeCount: 0 }, ...prev];
          localStorage.setItem('nikosoko_contact_history_v2', JSON.stringify(updated));
          return updated;
      });
  };

  const handleBackWithReviewCheck = (onConfirmBack: () => void) => {
      // Navigation & CTA interactions must remain fast and non-blocking
      onConfirmBack();
  };

  const handleCtaInteraction = (provider: ServiceProvider, actionType: string = 'contact', actionCallback?: () => void): boolean => {
      if (!provider || !provider.id) return false;

      // Record contact timestamp for post-service 2-3 hour follow-up reminder
      recordContact(provider.id);

      // Update provider view count
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, views: (p.views || 0) + 1 } : p));

      // Dispatch notifications to inbox
      const tapperName = currentUser?.name || 'A customer';
      const providerMsg: Omit<InboxMessage, 'id'> = {
          sender: 'team',
          text: `🔔 ${tapperName} tapped your '${actionType.toUpperCase()}' button! Click here to send them a rating reminder.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'cta_tap',
          targetProviderId: provider.id,
          targetProviderName: provider.name,
          ctaType: actionType,
          tapperName,
          isActionable: true
      };

      const tapperMsg: Omit<InboxMessage, 'id'> = {
          sender: 'team',
          text: `⭐ Thanks for contacting ${provider.name}! Click here to leave a quick 5-star rating for their service.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'rating_reminder',
          targetProviderId: provider.id,
          targetProviderName: provider.name,
          isActionable: true
      };

      api.addInboxMessage(providerMsg);
      api.addInboxMessage(tapperMsg);

      // Trigger floating CTA Toast Notification
      setCtaToast({
          show: true,
          text: `🔔 Notification sent! Tapped '${actionType.toUpperCase()}'. Click to remind client or rate!`,
          providerId: provider.id
      });
      setTimeout(() => setCtaToast(prev => prev ? { ...prev, show: false } : null), 5000);

      if (actionCallback) actionCallback();
      return true;
  };

  const handleUpdateUnitDetails = async (details: Partial<UnitDetails>) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      unitDetails: {
        ...(currentUser.unitDetails || { type: 'Business', availabilityStatus: 'Available' }),
        ...details
      }
    };
    const saved = await api.updateProvider(updatedUser);
    setCurrentUser(saved);
    setProviders(prev => prev.map(p => p.id === saved.id ? saved : p));
    alert("Door details updated successfully!");
  };

  const handleUpdateProviderAdmin = async (provider: ServiceProvider) => {
      const saved = await api.updateProvider(provider);
      setProviders(prev => prev.map(p => p.id === saved.id ? saved : p));
      if (currentUser?.id === saved.id) setCurrentUser(saved);
  };

  const handleUpdateCatalogueItem = async (updatedItem: any) => {
      await api.updateCatalogueItem(updatedItem);
      setCatalogueItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const handleDeleteProviderAdmin = async (id: string) => {
      await api.deleteProvider(id);
      setProviders(prev => prev.filter(p => p.id !== id));
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex items-center justify-center h-screen bg-brand-navy text-white font-bold animate-pulse italic uppercase tracking-tighter">NIKOSOKO...</div>;

    switch (currentPage) {
      case 'home':
      case 'tukosoko':
      case 'services':
        return (
          <NikoSoko 
            providers={providers} 
            catalogueItems={catalogueItems}
            specialBanners={specialBanners}
            onSelectProvider={(p) => { setViewingProvider(p); setCurrentPage('profile'); }} 
            searchTerm={""} 
            setSearchTerm={() => {}} 
            onBack={handleOpenSideMenu} 
            onMessagesClick={() => gateAuth(() => setCurrentPage('messages'))} 
            hasNewMessages={false} 
            onNavigate={handleNavigate} 
            currentUser={currentUser} 
            onViewSacco={(p) => setSaccoModalProvider(p)}
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onInitiateContact={(p) => handleCtaInteraction(p)}
            onBookProvider={(p) => setBookingTargetProvider(p)}
          />
        );
      case 'sellService':
        return (
          <Tukosoko 
            items={catalogueItems} 
            providers={providers} 
            currentUser={currentUser}
            initialViewMode="sellService"
            onAddCatalogueItem={(newItem) => setCatalogueItems(prev => [newItem, ...prev])}
            onSelectProvider={(p) => { setViewingProvider(p); setCurrentPage('profile'); }} 
            onBack={() => setCurrentPage('tukosoko')} 
            onMessagesClick={() => gateAuth(() => setCurrentPage('messages'))} 
            hasNewMessages={false} 
            onNavigate={handleNavigate}
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onInitiateContact={(p) => handleCtaInteraction(p)}
            onBookProvider={(p) => setBookingTargetProvider(p)}
          />
        );
      case 'profile': {
        const profileToView = viewingProvider || currentUser;
        return profileToView ? (
          <ProfileView 
            profileData={profileToView} 
            isOwner={currentUser?.id === profileToView.id} 
            isAuthenticated={isAuthenticated} 
            isSuperAdmin={isSuperAdmin} 
            currentUserPhone={currentUser?.phone} 
            onBack={() => handleBackWithReviewCheck(() => setCurrentPage('home'))} 
            onLogout={handleLogout} 
            onUpdate={(u) => { 
              setViewingProvider(u); 
              if (currentUser?.id === u.id) setCurrentUser(u);
              setProviders(prev => prev.map(p => p.id === u.id ? u : p)); 
              api.updateProvider(u);
            }} 
            onDelete={() => {}} 
            onContactClick={() => setIsAuthModalOpen(true)} 
            onInitiateContact={() => handleCtaInteraction(profileToView)} 
            savedContacts={Object.keys(savedContactsMap)} 
            onToggleSaveContact={(id) => handleToggleSaveContact(id)} 
            catalogueItems={catalogueItems.filter(i => i.providerId === profileToView.id)} 
            onUpdateCatalogueItem={handleUpdateCatalogueItem}
            onDeleteCatalogueItem={handleDeleteCatalogueItem}
            onBook={() => setBookingTargetProvider(profileToView)} 
            onJoin={() => {}} 
            isFlaggedByUser={false} 
            onFlag={(reason) => profileToView && handleFlagProvider(profileToView.id, reason)} 
            allDocuments={documents} 
            onViewDocument={(d) => { setSelectedDocument(d); setCurrentPage('documentDetail'); }} 
            onNavigate={handleNavigate}
            onViewSaccoModal={(p) => setSaccoModalProvider(p)}
            onApproveSaccoMember={handleApproveSaccoRequest}
            onRejectSaccoMember={handleRejectSaccoRequest}
            onDisputeRating={handleDisputeRating}
            onResolveDispute={handleResolveDispute}
          />
        ) : null;
      }
      case 'sacco_dashboard':
        return (
          <SaccoDashboard 
            currentUser={currentUser} 
            providers={providers} 
            onBack={() => setCurrentPage('home')} 
            onUpdateProvider={handleUpdateProviderAdmin} 
            onApproveSaccoMember={handleApproveSaccoRequest} 
            onRejectSaccoMember={handleRejectSaccoRequest} 
            onResolveDispute={handleResolveDispute} 
          />
        );
      case 'qrScan':
        return <QRScannerView onBack={() => setCurrentPage('home')} onScanSuccess={handleScanSuccess} />;
      case 'skill_id':
        return <SkillDashboard currentUser={currentUser} onBack={() => setCurrentPage('home')} onNavigate={handleNavigate} onUpdateUser={(u) => { setCurrentUser(u); setProviders(prev => prev.map(p => p.id === u.id ? u : p)); }} onBookProvider={(p) => setBookingTargetProvider(p)} />;
      case 'messages':
        return (
          <MessageCenterView 
            onBack={() => setCurrentPage('home')} 
            currentUser={currentUser} 
            onOpenCompleteSignUp={handleOpenCompleteSignUp}
            onOpenReviewModal={(providerId) => {
              const found = providers.find(p => p.id === providerId);
              if (found) {
                setPendingReviews([found]);
                setReviewModalSubtitle(`Rating request for ${found.name}`);
                setIsForcedReview(false);
                setShowReviewModal(true);
              }
            }}
          />
        );
      case 'journey':
        return <JourneyPage providers={providers} currentUser={currentUser} onSelectProvider={(p) => { setViewingProvider(p); setCurrentPage('profile'); }} onBack={() => setCurrentPage('home')} />;
      case 'mycontacts':
        return (
          <MyContactsView 
            savedContactsMap={savedContactsMap} 
            providers={providers} 
            onSelectContact={(p) => { setViewingProvider(p); setCurrentPage('profile'); }} 
            onUpdateLabel={handleUpdateContactLabel} 
            onRemoveContact={handleRemoveContact} 
            onBack={() => handleBackWithReviewCheck(() => setCurrentPage('home'))} 
            onInitiateContact={(p) => { handleCtaInteraction(p); return true; }} 
          />
        );
      case 'pendingRatings': {
        const unratedIds = contactHistory.map(c => c.providerId).filter(id => !ratedProviderIds.includes(id));
        const unratedProviders = providers.filter(p => unratedIds.includes(p.id));
        return (
          <PendingRatingsView
            unratedProviders={unratedProviders.length > 0 ? unratedProviders : providers.slice(0, 3)}
            targetProvider={pendingCtaTargetProvider}
            onRateProvider={(providerId, rating, comment) => {
              handleRateProvider(providerId, rating, comment);
            }}
            onFlagProvider={(providerId, reason) => {
              handleFlagProvider(providerId, reason);
            }}
            onBack={() => {
              setCurrentPage('home');
            }}
            onContinueAction={() => {
              if (pendingCtaAction) {
                pendingCtaAction();
                setPendingCtaAction(null);
              }
            }}
          />
        );
      }
      case 'admin':
        return <SuperAdminDashboard 
          onBack={() => setCurrentPage('home')} 
          providers={providers} 
          onUpdateProvider={handleUpdateProviderAdmin} 
          onDeleteProvider={handleDeleteProviderAdmin} 
          onViewProvider={(p) => { setViewingProvider(p); setCurrentPage('profile'); }} 
          categories={Array.from(new Set(providers.map(p => p.category))).filter(Boolean)} 
          onAddCategory={() => {}} 
          onDeleteCategory={() => {}} 
          onBroadcast={() => {}} 
          specialBanners={specialBanners} 
          onAddBanner={handleAddBannerAdmin} 
          onDeleteBanner={handleDeleteBannerAdmin} 
          onCreateOrganization={() => {}} 
          onApproveRequest={() => {}} 
          onRejectRequest={() => {}} 
          catalogueItems={catalogueItems}
          onVerifyCatalogueItem={handleVerifyCatalogueItem}
          onDeleteCatalogueItem={handleDeleteCatalogueItem}
          brandingConfig={brandingConfig}
          onSaveBrandingConfig={handleSaveBrandingAdmin}
          featureConfig={featureConfig}
          onSaveFeatureConfig={handleSaveFeatureAdmin}
        />;
      default:
        return <NikoSoko providers={providers} catalogueItems={catalogueItems} onSelectProvider={(p) => { setViewingProvider(p); setCurrentPage('profile'); }} searchTerm={""} setSearchTerm={() => {}} onBack={handleOpenSideMenu} onMessagesClick={() => gateAuth(() => setCurrentPage('messages'))} hasNewMessages={false} onNavigate={handleNavigate} currentUser={currentUser} />;
    }
  };

  const handleCloseReviewModal = () => {
      setIsForcedReview(false);
      setShowReviewModal(false);
      if (pendingCtaAction) {
          const action = pendingCtaAction;
          setPendingCtaAction(null);
          action();
      } else if (pendingBackAction) {
          const action = pendingBackAction;
          setPendingBackAction(null);
          action();
      }
  };

  const handlePostponeReview = () => {
      const currentPending = pendingReviews[0];
      if (currentPending) {
          setContactHistory(prev => {
              const updated = prev.map(item => {
                  if (item.providerId === currentPending.id) {
                      return { ...item, postponeCount: Math.min(3, (item.postponeCount || 0) + 1) };
                  }
                  return item;
              });
              localStorage.setItem('nikosoko_contact_history_v2', JSON.stringify(updated));
              return updated;
          });
      }

      setShowReviewModal(false);

      if (pendingCtaAction) {
          const action = pendingCtaAction;
          setPendingCtaAction(null);
          action();
      } else if (pendingBackAction) {
          const action = pendingBackAction;
          setPendingBackAction(null);
          action();
      }
  };

  const handleSmsPostpone = (providerId: string) => {
      setContactHistory(prev => {
          const updated = prev.map(item => {
              if (item.providerId === providerId) {
                  return { ...item, postponeCount: Math.min(3, (item.postponeCount || 0) + 1) };
              }
              return item;
          });
          localStorage.setItem('nikosoko_contact_history_v2', JSON.stringify(updated));
          return updated;
      });
      if (simulated6HOverdueId === providerId) {
          setSimulated6HOverdueId(null);
      }
  };

  const handleRateProvider = (providerId: string, rating: number, comment: string) => {
      const newRated = Array.from(new Set([...ratedProviderIds, providerId]));
      setRatedProviderIds(newRated);
      localStorage.setItem('nikosoko_rated_provider_ids', JSON.stringify(newRated));

      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, rating: Math.min(5, Math.max(1, (p.rating * 10 + rating) / 11)) } : p));
      
      setContactHistory(prev => {
          const updated = prev.filter(c => c.providerId !== providerId);
          localStorage.setItem('nikosoko_contact_history_v2', JSON.stringify(updated));
          return updated;
      });

      if (simulated6HOverdueId === providerId) {
          setSimulated6HOverdueId(null);
      }

      const updatedPending = pendingReviews.filter(p => p.id !== providerId);
      setPendingReviews(updatedPending);

      if (updatedPending.length === 0) {
          setShowReviewModal(false);
          if (pendingCtaAction) {
              const action = pendingCtaAction;
              setPendingCtaAction(null);
              action();
          } else if (pendingBackAction) {
              const action = pendingBackAction;
              setPendingBackAction(null);
              action();
          }
      }
  };

  const handleFlagProvider = (providerId: string, reason: string) => {
      const newRated = Array.from(new Set([...ratedProviderIds, providerId]));
      setRatedProviderIds(newRated);
      localStorage.setItem('nikosoko_rated_provider_ids', JSON.stringify(newRated));

      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, flagCount: (p.flagCount || 0) + 1 } : p));
      
      setContactHistory(prev => {
          const updated = prev.filter(c => c.providerId !== providerId);
          localStorage.setItem('nikosoko_contact_history_v2', JSON.stringify(updated));
          return updated;
      });

      if (simulated6HOverdueId === providerId) {
          setSimulated6HOverdueId(null);
      }

      const updatedPending = pendingReviews.filter(p => p.id !== providerId);
      setPendingReviews(updatedPending);

      if (updatedPending.length === 0) {
          setShowReviewModal(false);
          if (pendingCtaAction) {
              const action = pendingCtaAction;
              setPendingCtaAction(null);
              action();
          } else if (pendingBackAction) {
              const action = pendingBackAction;
              setPendingBackAction(null);
              action();
          }
      }
      alert("Profile flagged successfully. Thank you for your feedback.");
  };

  const handleNeverHappened = (providerId: string) => {
      const newDismissed = Array.from(new Set([...dismissedProviderIds, providerId]));
      setDismissedProviderIds(newDismissed);
      localStorage.setItem('nikosoko_dismissed_provider_ids', JSON.stringify(newDismissed));

      setContactHistory(prev => {
          const updated = prev.filter(c => c.providerId !== providerId);
          localStorage.setItem('nikosoko_contact_history_v2', JSON.stringify(updated));
          return updated;
      });

      if (simulated6HOverdueId === providerId) {
          setSimulated6HOverdueId(null);
      }

      const updatedPending = pendingReviews.filter(p => p.id !== providerId);
      setPendingReviews(updatedPending);

      if (updatedPending.length === 0) {
          setShowReviewModal(false);
      }
  };

  const active6HourItem = contactHistory.find(c => {
      if (ratedProviderIds.includes(c.providerId)) return false;
      if (dismissedProviderIds.includes(c.providerId)) return false;
      if (simulated6HOverdueId === c.providerId) return true;
      const hoursPassed = (Date.now() - c.contactedAt) / (1000 * 3600);
      return hoursPassed >= 2;
  });

  const active6HourProvider = active6HourItem ? providers.find(p => p.id === active6HourItem.providerId) : null;

  return (
    <DesktopBannerLayout
      currentUser={currentUser}
      onOpenSignUp={handleOpenCompleteSignUp}
      onOpenLogin={handleOpenLogin}
    >
      {/* Floating CTA Tap Notification Toast Banner */}
      {ctaToast && ctaToast.show && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[120] w-full max-w-md px-3 animate-fade-in">
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl shrink-0">🔔</span>
              <p className="text-slate-100 font-bold text-xs leading-tight truncate">
                {ctaToast.text}
              </p>
            </div>
            <button
              onClick={() => {
                setCtaToast(null);
                setCurrentPage('messages');
              }}
              className="bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl hover:bg-amber-300 transition-all uppercase text-[10px] tracking-wider shrink-0 cursor-pointer"
            >
              Open Messages &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 2-3 Hour Post-Service Notification Reminder Banner */}
      {active6HourProvider && active6HourItem && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[110] w-full max-w-lg px-3 animate-fade-in">
          <div className="bg-gray-900 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0">
              <span className="text-xl shrink-0 p-1.5 bg-amber-400/20 rounded-xl">📱</span>
              <div className="min-w-0 flex-1">
                <div className="font-black text-amber-300 text-[9.5px] uppercase tracking-wider">
                  Post-Service Reminder
                </div>
                <p className="text-gray-100 font-bold text-xs leading-tight truncate">
                  Rate your service with <span className="text-amber-400 font-extrabold">{active6HourProvider.name}</span>?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-800 pt-2 sm:pt-0">
              <button
                onClick={() => {
                  setPendingReviews([active6HourProvider]);
                  setReviewModalSubtitle(`Reminder to rate your service with ${active6HourProvider.name}`);
                  setReviewPostponeCount(active6HourItem.postponeCount || 0);
                  setIsForcedReview(false);
                  setShowReviewModal(true);
                }}
                className="bg-amber-400 text-black font-black px-3 py-1.5 rounded-xl hover:bg-amber-300 transition-all active:scale-95 uppercase text-[10px] tracking-wider cursor-pointer"
              >
                Rate
              </button>
              <button
                onClick={() => handleNeverHappened(active6HourProvider.id)}
                className="bg-white/10 text-gray-200 hover:text-white font-bold px-2.5 py-1.5 rounded-xl hover:bg-white/20 text-[10px] uppercase tracking-wide cursor-pointer"
                title="Service did not take place"
              >
                Never Happened
              </button>
              <button
                onClick={() => handleSmsPostpone(active6HourProvider.id)}
                className="bg-white/10 text-gray-400 hover:text-white font-bold px-2 py-1.5 rounded-xl hover:bg-white/20 text-[10px] cursor-pointer"
                title="Remind me later"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      <SEOHead provider={viewingProvider || currentUser} />
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
        onNavigate={(p) => { setIsSideMenuOpen(false); handleNavigate(p as CurrentPage); }} 
        currentUser={currentUser} 
        isSuperAdmin={isSuperAdmin} 
        onLogout={handleLogout} 
        onOpenCompleteSignUp={handleOpenCompleteSignUp}
        onOpenSEOMap={() => setIsSEOMapOpen(true)}
        onUpdateUser={(updated) => {
            setCurrentUser(updated);
            setProviders(prev => prev.map(p => p.id === updated.id ? updated : p));
            api.updateProvider(updated);
        }}
      />
      <SEOMapModal 
        isOpen={isSEOMapOpen} 
        onClose={() => setIsSEOMapOpen(false)} 
        onNavigate={(page) => handleNavigate(page)} 
      />
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)} 
          onLogin={handleLogin} 
          initialMode={authModalMode}
        />
      )}
      {showReviewModal && (
        <ReviewModal 
          pendingProviders={pendingReviews} 
          isForced={isForcedReview} 
          postponeCount={reviewPostponeCount}
          maxPostpones={3}
          subtitle={reviewModalSubtitle}
          onRate={handleRateProvider} 
          onFlag={handleFlagProvider} 
          onPostpone={handlePostponeReview}
          onNeverHappened={handleNeverHappened}
          onClose={handleCloseReviewModal} 
        />
      )}
      {bookingTargetProvider && <BookingModal provider={bookingTargetProvider} onClose={() => setBookingTargetProvider(null)} />}
      <SaccoModal 
        isOpen={Boolean(saccoModalProvider)} 
        onClose={() => setSaccoModalProvider(null)} 
        provider={saccoModalProvider} 
        saccoOrg={saccoModalProvider ? providers.find(p => p.id === saccoModalProvider.saccoMember?.saccoId || p.name === saccoModalProvider.saccoMember?.saccoName) || null : null} 
      />
      {renderContent()}
    </DesktopBannerLayout>
  );
}

export default App;
