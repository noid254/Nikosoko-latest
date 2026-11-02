import React from 'react';
import { TAXONOMY } from '../utils/taxonomy';

const GREEN = '#22C27A';

interface Props { parent: string | null; child: string | null; onParent: (p: string | null) => void; onChild: (c: string | null) => void; top?: string }

// One scrolling line: PARENT, then (when opened) its children, then the next PARENT.
const FilterBar: React.FC<Props> = ({ parent, child, onParent, onChild, top = 'top-[52px]' }) => (
  <nav className={`sticky ${top} z-20 bg-white border-b border-gray-200 overflow-x-auto no-scrollbar`}>
    <div className="flex items-center gap-2 px-3 py-2.5 w-max">
      <button onClick={() => { onParent(null); onChild(null); }}
        className={`text-[11px] font-black tracking-wider px-3 py-1.5 rounded-full border cursor-pointer ${!parent ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600'}`}>ALL</button>
      {TAXONOMY.map(p => (
        <React.Fragment key={p.label}>
          <button onClick={() => { if (parent === p.label) { onParent(null); onChild(null); } else { onParent(p.label); onChild(null); } }}
            className={`text-[11px] font-black tracking-wider px-3 py-1.5 rounded-full border whitespace-nowrap cursor-pointer ${parent === p.label ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-800'}`}>
            {p.label}
          </button>
          {parent === p.label && p.children.map(c => (
            <button key={c.label} onClick={() => onChild(child === c.label ? null : c.label)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer border"
              style={child === c.label ? { background: GREEN, borderColor: GREEN, color: '#000' } : { borderColor: '#d1d5db', color: '#374151' }}>
              {c.label}
            </button>
          ))}
        </React.Fragment>
      ))}
    </div>
  </nav>
);

export default FilterBar;
