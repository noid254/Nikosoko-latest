import type { CatalogueItem, ServiceProvider } from '../types';
import { normalizeSkills } from './skills';

export interface TaxChild { label: string; words: string[] }
export interface TaxParent { label: string; children: TaxChild[] }

// Parents are shown in capitals in the Marketplace filter bar; children list on the same line when a parent is opened.
// `words` are matched against an item's text, so a new child is one line.
export const TAXONOMY: TaxParent[] = [
  { label: 'TUTORS', children: [
    { label: 'Maths', words: ['math'] }, { label: 'English', words: ['english'] },
    { label: 'Science', words: ['science', 'physics', 'chemistry', 'biology'] },
    { label: 'Geography', words: ['geograph'] }, { label: 'Kiswahili', words: ['kiswahili', 'swahili'] },
    { label: 'Coding', words: ['coding', 'programming', 'developer'] }, { label: 'Music', words: ['music', 'piano', 'guitar'] },
    { label: 'Tutoring', words: ['tutor', 'lesson', 'teacher'] },
  ]},
  { label: 'COACHING', children: [
    { label: 'Tennis', words: ['tennis'] }, { label: 'Volleyball', words: ['volley'] },
    { label: 'Running', words: ['running', 'athletic'] }, { label: 'Boxing', words: ['boxing'] },
    { label: 'Football', words: ['football', 'soccer'] }, { label: 'Swimming', words: ['swim'] },
    { label: 'Fitness', words: ['fitness', 'gym', 'trainer', 'yoga'] },
  ]},
  { label: 'HOME REPAIRS', children: [
    { label: 'Plumbing', words: ['plumb'] }, { label: 'Electrical', words: ['electric', 'wiring'] },
    { label: 'TV mounting', words: ['tv mount', 'mounting'] }, { label: 'Carpentry', words: ['carpent', 'furniture'] },
    { label: 'Painting', words: ['paint'] }, { label: 'Key cutter', words: ['key cut', 'locksmith'] },
    { label: 'Appliances', words: ['fridge', 'appliance', 'cooker'] },
  ]},
  { label: 'BEAUTY', children: [
    { label: 'Braiding', words: ['braid', 'hair', 'salon'] }, { label: 'Barber', words: ['barber', 'kinyozi'] },
    { label: 'Nails', words: ['nail'] }, { label: 'Makeup', words: ['makeup', 'make-up'] },
    { label: 'Massage', words: ['massage', 'spa'] },
  ]},
  { label: 'TRANSPORT', children: [
    { label: 'Boda', words: ['boda', 'motorbike'] }, { label: 'Taxi', words: ['taxi', 'cab', 'driver'] },
    { label: 'Delivery', words: ['deliver', 'courier'] }, { label: 'Movers', words: ['mover', 'moving', 'lorry'] },
  ]},
  { label: 'FOOD', children: [
    { label: 'Catering', words: ['cater'] }, { label: 'Baking', words: ['bak', 'cake'] },
    { label: 'Groceries', words: ['grocer', 'vegetable', 'fruit'] }, { label: 'Restaurants', words: ['restaurant', 'meal', 'chef', 'cook'] },
  ]},
  { label: 'REFILLS', children: [
    { label: 'Water', words: ['water'] }, { label: 'Gas', words: ['gas', 'lpg'] },
  ]},
  { label: 'PROFESSIONAL', children: [
    { label: 'Accounting', words: ['account', 'tax', 'bookkeep'] }, { label: 'Legal', words: ['legal', 'lawyer', 'advocate'] },
    { label: 'Consulting', words: ['consult'] }, { label: 'Marketing', words: ['market', 'advert', 'social media'] },
    { label: 'IT', words: ['it support', 'computer', 'software', 'web', 'network'] },
  ]},
  { label: 'EVENTS', children: [
    { label: 'Photography', words: ['photo', 'video'] }, { label: 'DJ and sound', words: ['dj', 'sound'] },
    { label: 'Decor', words: ['decor', 'tent', 'chairs'] }, { label: 'MC', words: ['emcee', ' mc '] },
  ]},
  { label: 'FASHION', children: [
    { label: 'Tailoring', words: ['tailor', 'sewing', 'dress'] }, { label: 'Shoe repair', words: ['shoe', 'cobbler'] },
    { label: 'Clothes', words: ['cloth', 'shirt', 'fashion'] },
  ]},
  { label: 'HEALTH', children: [
    { label: 'Nursing', words: ['nurse', 'nursing'] }, { label: 'Physio', words: ['physio'] },
    { label: 'Pharmacy', words: ['pharm', 'chemist'] }, { label: 'Counselling', words: ['counsel', 'therap'] },
  ]},
  { label: 'CLEANING', children: [
    { label: 'Home cleaning', words: ['clean', 'house help'] }, { label: 'Laundry', words: ['laundry', 'wash'] },
    { label: 'Fumigation', words: ['fumig', 'pest'] },
  ]},
];

export const itemText = (item: CatalogueItem, provider?: ServiceProvider): string =>
  [item.category, item.title, item.description, provider?.service, provider?.category,
   ...normalizeSkills(provider?.skills).map(s => s.skillTitle || s.name)]
    .filter(Boolean).join(' ').toLowerCase();

export const providerText = (p: ServiceProvider): string =>
  [p.service, p.category, p.bio, ...normalizeSkills(p.skills).map(s => s.skillTitle || s.name)]
    .filter(Boolean).join(' ').toLowerCase();

export function matches(text: string, parent: string | null, child: string | null): boolean {
  if (!parent) return true;
  const par = TAXONOMY.find(p => p.label === parent);
  if (!par) return true;
  const kids = child ? par.children.filter(c => c.label === child) : par.children;
  return kids.some(c => c.words.some(w => text.includes(w))) || (!child && text.includes(parent.toLowerCase()));
}
