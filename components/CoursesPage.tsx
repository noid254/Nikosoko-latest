
import React, { useState, useMemo } from 'react';
import type { CatalogueItem, ServiceProvider } from '../types';
import CatalogueItemDetailModal from './CatalogueItemDetailModal';

interface CoursesPageProps {
  currentUser: ServiceProvider | null;
  courses: CatalogueItem[];
  mentors: ServiceProvider[];
  onBack: () => void;
  onSelectCourse: (course: CatalogueItem) => void;
  onSelectMentor: (mentor: ServiceProvider) => void;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
}

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const MarketingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.118 1.94 18 2.684 18 3.5A3.5 3.5 0 0114.5 7H11" /></svg>;
const BusinessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const DesignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

const CATEGORIES = [
    { id: 'coding', label: 'Coding', icon: <CodeIcon />, keywords: ['web', 'software', 'python', 'java', 'code'] },
    { id: 'marketing', label: 'Marketing', icon: <MarketingIcon />, keywords: ['marketing', 'seo', 'social', 'brand'] },
    { id: 'business', label: 'Business', icon: <BusinessIcon />, keywords: ['business', 'finance', 'management', 'startup'] },
    { id: 'design', label: 'Design', icon: <DesignIcon />, keywords: ['design', 'graphic', 'ui', 'art'] },
];

const CourseCard: React.FC<{ course: CatalogueItem, provider?: ServiceProvider, onClick: () => void }> = ({ course, provider, onClick }) => (
    <div onClick={onClick} className="w-64 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all">
        <div className="h-32 relative">
            <img src={course.imageUrls[0]} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-white p-1.5 rounded-lg shadow-sm">
                <BookmarkIcon />
            </div>
        </div>
        <div className="p-3">
            {provider?.rating && (
                <div className="flex items-center gap-1 mb-1">
                    <StarIcon />
                    <span className="text-xs font-bold text-gray-700">{provider.rating.toFixed(1)}</span>
                </div>
            )}
            <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 mb-1">{course.title}</h3>
            <div className="flex items-center gap-2 mb-3">
                <img src={provider?.avatarUrl} alt={provider?.name} className="w-4 h-4 rounded-full object-cover" />
                <span className="text-xs text-gray-500 truncate max-w-[100px]">{provider?.name}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-blue-600 font-bold text-sm">{course.price}</span>
                {course.isVerified && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">Verified</span>}
            </div>
        </div>
    </div>
);

const MentorAvatar: React.FC<{ mentor: ServiceProvider, onClick: () => void }> = ({ mentor, onClick }) => (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group w-16 flex-shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all shadow-sm">
            <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full object-cover" />
        </div>
        <span className="text-[10px] font-semibold text-gray-700 text-center line-clamp-1 w-full">{mentor.name.split(' ')[0]}</span>
    </div>
);

const CoursesPage: React.FC<CoursesPageProps> = ({ currentUser, courses, mentors, onBack, onSelectCourse, onSelectMentor, isAuthenticated, onAuthClick, onInitiateContact }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [selectedCourseItem, setSelectedCourseItem] = useState<CatalogueItem | null>(null);

    // Provide default provider lookup
    const getProvider = (id: string) => mentors.find(m => m.id === id) || { 
        id, name: 'Unknown Instructor', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200', rating: 0, service: 'Tutor', phone: '' 
    } as ServiceProvider;

    const filteredCourses = useMemo(() => {
        let filtered = courses;
        
        if (activeCategory) {
            const categoryData = CATEGORIES.find(c => c.id === activeCategory);
            if (categoryData) {
                filtered = filtered.filter(c => {
                    const text = (c.title + c.description).toLowerCase();
                    return categoryData.keywords.some(k => text.includes(k));
                });
            }
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c => c.title.toLowerCase().includes(term) || c.description.toLowerCase().includes(term));
        }

        return filtered;
    }, [courses, activeCategory, searchTerm]);

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col pb-20">
            {selectedCourseItem && (
                <CatalogueItemDetailModal 
                    item={selectedCourseItem} 
                    onClose={() => setSelectedCourseItem(null)} 
                    provider={getProvider(selectedCourseItem.providerId)} 
                    isAuthenticated={isAuthenticated}
                    onAuthClick={onAuthClick}
                    onInitiateContact={onInitiateContact}
                />
            )}

            {/* Header */}
            <header className="bg-blue-600 text-white rounded-b-md px-6 pt-8 pb-16 relative z-10 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Hi, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Guest'} 👋</h1>
                        <p className="text-blue-100 text-sm mt-1">Let's start learning!</p>
                    </div>
                    <button className="p-2 bg-blue-500 rounded-xl hover:bg-blue-400 transition" onClick={onBack}>
                        <BellIcon /> {/* Using Back functionality but keeping Notification Icon visual as per design */}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white rounded-xl flex items-center px-4 py-3 shadow-md">
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search for course..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-1 ml-3 text-sm text-gray-800 placeholder-gray-400 outline-none"
                        />
                    </div>
                    <button className="bg-white p-3 rounded-xl shadow-md text-blue-600 hover:bg-gray-50">
                        <FilterIcon />
                    </button>
                </div>
            </header>

            <main className="flex-1 -mt-8 relative z-20 px-6 space-y-8 overflow-y-auto no-scrollbar">
                
                {/* Categories */}
                <section>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-lg font-bold text-gray-800">Categories</h2>
                        <button className="text-xs font-bold text-blue-600" onClick={() => setActiveCategory('')}>See all</button>
                    </div>
                    <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar pb-2">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
                                className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${activeCategory === cat.id ? 'scale-110' : ''}`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>
                                    {cat.icon}
                                </div>
                                <span className={`text-xs font-medium ${activeCategory === cat.id ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Popular Courses */}
                <section>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-lg font-bold text-gray-800">Popular Course</h2>
                        <span className="text-xs font-bold text-blue-600 cursor-pointer">See all</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map(course => (
                                <CourseCard 
                                    key={course.id} 
                                    course={course} 
                                    provider={getProvider(course.providerId)} 
                                    onClick={() => setSelectedCourseItem(course)}
                                />
                            ))
                        ) : (
                            <div className="w-full text-center py-8 text-gray-400 text-sm">No courses found.</div>
                        )}
                    </div>
                </section>

                {/* Top Mentors */}
                <section>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-lg font-bold text-gray-800">Top Mentor</h2>
                        <span className="text-xs font-bold text-blue-600 cursor-pointer">See all</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {mentors.length > 0 ? (
                            mentors.map(mentor => (
                                <MentorAvatar 
                                    key={mentor.id} 
                                    mentor={mentor} 
                                    onClick={() => onSelectMentor(mentor)} 
                                />
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm italic">No mentors found.</p>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default CoursesPage;
