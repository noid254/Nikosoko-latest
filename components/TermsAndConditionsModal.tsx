import React from 'react';

interface TermsAndConditionsModalProps {
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ onClose, onAccept }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-slate-900 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
              ⚖️
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Terms of Service & Legal Compliance
              </h2>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Kenya Data Protection Act 2019 • GDPR & Cybercrimes Act Compliant
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg font-mono p-1 cursor-pointer"
            title="Close Legal Modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Legal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed font-sans">
          
          {/* Key Compliance Notice Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-xl space-y-1 text-amber-950">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wider">🇰🇪 Republic of Kenya Legal Framework</span>
              <span className="bg-amber-200 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">Official Notice</span>
            </div>
            <p className="text-[11px] leading-snug">
              NikoSoko Marketplace is registered under the laws of Kenya and strictly adheres to the <strong>Data Protection Act, 2019 (ODPC)</strong>, the <strong>Computer Misuse and Cybercrimes Act, 2018</strong>, the <strong>Consumer Protection Act, 2012</strong>, and international digital governance protocols (GDPR).
            </p>
          </div>

          {/* Section 1: Data Protection Act 2019 */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1">
              <span>1. Data Privacy & Personal Information (DPA 2019)</span>
            </h3>
            <p className="text-[11px] text-slate-600">
              Pursuant to Section 26 of the Kenya Data Protection Act 2019, NikoSoko collects personal data (including phone numbers, email addresses, national ID scans, live selfies, and location coordinates) strictly for identity verification, fraud prevention, and marketplace security.
            </p>
            <ul className="list-disc pl-5 text-[11px] space-y-1 text-slate-600">
              <li><strong>Lawful Processing:</strong> Personal information is processed solely to verify skilled artisans, enable client communication, and audit trade ratings.</li>
              <li><strong>Data Subject Rights:</strong> You hold the right to request access, rectification, or permanent erasure of your personal data by contacting <span className="font-mono font-bold text-slate-900">privacy@nikosoko.com</span>.</li>
              <li><strong>Storage & Encryption:</strong> All sensitive identity documents (National ID scans, Passport copies) are encrypted and stored in restricted cloud vaults.</li>
              <li><strong>No Data Commercialization:</strong> NikoSoko never sells or leases your personal data to third-party ad networks.</li>
            </ul>
          </section>

          {/* Section 2: Cybercrimes & Fraud Enforcement */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1">
              <span>2. Computer Misuse & Cybercrimes Compliance (Act No. 5 of 2018)</span>
            </h3>
            <p className="text-[11px] text-slate-600">
              By using NikoSoko, you agree not to engage in identity fraud, false impersonation, misrepresentation of trade qualifications, or unauthorized system access.
            </p>
            <ul className="list-disc pl-5 text-[11px] space-y-1 text-slate-600">
              <li><strong>Impersonation & False Credentials:</strong> Uploading fraudulent National IDs, fake EPRA/NCA licenses, or stolen photos constitutes a criminal offense under Section 22 of the Computer Misuse Act.</li>
              <li><strong>System Auditing:</strong> Accounts suspected of cyber fraud or extortion will be frozen immediately and reported to the Directorate of Criminal Investigations (DCI) Cybercrime Unit.</li>
            </ul>
          </section>

          {/* Section 3: Consumer Protection & Service Standards */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1">
              <span>3. Consumer Protection & Artisan Code of Conduct</span>
            </h3>
            <p className="text-[11px] text-slate-600">
              In accordance with the Consumer Protection Act of Kenya:
            </p>
            <ul className="list-disc pl-5 text-[11px] space-y-1 text-slate-600">
              <li><strong>Transparent Pricing:</strong> Service providers must honor advertised rate cards (hourly, daily, or per task) without undisclosed hidden charges.</li>
              <li><strong>Verified Badge Accountability:</strong> Verified blue ticks signify completed document audit, but clients are advised to exercise standard due diligence for home visits.</li>
              <li><strong>Dispute Resolution:</strong> Disputes regarding service quality or non-payment may be escalated to NikoSoko Arbitration or respective SACCO administrators.</li>
            </ul>
          </section>

          {/* Section 4: Global Regulations (GDPR & CCPA) */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1">
              <span>4. Global Privacy Standards (GDPR & International Users)</span>
            </h3>
            <p className="text-[11px] text-slate-600">
              International clients and diaspora members using NikoSoko are protected under standard GDPR guidelines, including Right to Data Portability, Instant Revocation of Consent, and Transparent Audit Logs.
            </p>
          </section>

          {/* Section 5: Electronic Signatures & OTP Authorization */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-1">
              <span>5. OTP Authentication & Electronic Signatures</span>
            </h3>
            <p className="text-[11px] text-slate-600">
              Verifying your account via Email OTP or Phone OTP serves as a legally binding electronic signature under the Kenya Information and Communications Act (KICA). You are responsible for maintaining the confidentiality of your verification OTP codes.
            </p>
          </section>

          {/* Footer Contact Info */}
          <div className="bg-slate-100 p-3 rounded-xl text-[10.5px] font-mono text-slate-600 flex justify-between items-center">
            <span>Official Legal Desk: <strong className="text-slate-900">legal@nikosoko.com</strong></span>
            <span>Version: <strong className="text-slate-900">v2026.2-KENYA</strong></span>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-slate-500 font-medium text-center sm:text-left">
            By clicking "Accept & Continue", you confirm that you have read and agreed to these terms.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Close Window
            </button>
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Accept & Continue ✓
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
