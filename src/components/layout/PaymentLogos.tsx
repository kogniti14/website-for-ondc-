import React from 'react';

/**
 * Official Payment Brand Logos for Indian & Global Transactions:
 * - UPI (NPCI Unified Payments Interface)
 * - RuPay (NPCI Card Network)
 * - Visa (Global Payment Network)
 * - Mastercard (Global Payment Network)
 * - NetBanking (All Major Indian Scheduled Commercial Banks)
 */

export const UpiLogo: React.FC<{ className?: string; height?: number }> = ({ className = '', height = 20 }) => (
  <svg
    height={height}
    viewBox="0 0 68 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    aria-label="UPI - Unified Payments Interface"
    role="img"
  >
    {/* UPI Arrows */}
    <path d="M7 3L17 12L7 21L12 12L7 3Z" fill="#097939" />
    <path d="M14 3L24 12L14 21L19 12L14 3Z" fill="#F47920" />
    {/* UPI Text */}
    <text
      x="27"
      y="17"
      fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      fontSize="14"
      fontWeight="900"
      fontStyle="italic"
      fill="#1E293B"
      letterSpacing="-0.5px"
    >
      UPI
    </text>
  </svg>
);

export const RuPayLogo: React.FC<{ className?: string; height?: number }> = ({ className = '', height = 20 }) => (
  <svg
    height={height}
    viewBox="0 0 74 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    aria-label="RuPay"
    role="img"
  >
    {/* RuPay Text */}
    <text
      x="2"
      y="17"
      fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      fontSize="14"
      fontWeight="900"
      fontStyle="italic"
      fill="#0B2E6E"
      letterSpacing="-0.5px"
    >
      RuPay
    </text>
    {/* RuPay Dual Chevrons */}
    <polygon points="53,4 58,4 55,20 50,20" fill="#00A859" />
    <polygon points="59,4 64,4 61,20 56,20" fill="#F37021" />
  </svg>
);

export const VisaLogo: React.FC<{ className?: string; height?: number }> = ({ className = '', height = 20 }) => (
  <svg
    height={height}
    viewBox="0 0 64 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    aria-label="Visa"
    role="img"
  >
    {/* VISA text with gold flick on V */}
    <text
      x="2"
      y="18"
      fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      fontSize="17"
      fontWeight="900"
      fontStyle="italic"
      fill="#1A1F71"
      letterSpacing="-0.5px"
    >
      VISA
    </text>
    {/* V gold flick wing */}
    <path d="M2 5.5L7.5 5.5L6 9.5L2 5.5Z" fill="#F7B600" />
  </svg>
);

export const MastercardLogo: React.FC<{ className?: string; height?: number }> = ({ className = '', height = 20 }) => (
  <svg
    height={height}
    viewBox="0 0 44 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    aria-label="Mastercard"
    role="img"
  >
    {/* Mastercard Left Red Circle */}
    <circle cx="15" cy="12" r="9" fill="#EB001B" />
    {/* Mastercard Right Orange/Yellow Circle */}
    <circle cx="29" cy="12" r="9" fill="#F79E1B" fillOpacity="0.95" />
    {/* Overlap Intersect Path */}
    <path
      d="M22 5.5A9 9 0 0 0 15 12a9 9 0 0 0 7 6.5A9 9 0 0 0 29 12a9 9 0 0 0-7-6.5Z"
      fill="#FF5F00"
    />
  </svg>
);

export const NetBankingLogo: React.FC<{ className?: string; height?: number }> = ({ className = '', height = 20 }) => (
  <svg
    height={height}
    viewBox="0 0 96 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    aria-label="NetBanking"
    role="img"
  >
    {/* Bank Columns Emblem */}
    <path d="M4 8L11 4L18 8V10H4V8Z" fill="#0284C7" />
    <rect x="5.5" y="11" width="2" height="6.5" rx="0.5" fill="#0284C7" />
    <rect x="10" y="11" width="2" height="6.5" rx="0.5" fill="#0284C7" />
    <rect x="14.5" y="11" width="2" height="6.5" rx="0.5" fill="#0284C7" />
    <rect x="4" y="18.5" width="14" height="2" rx="0.5" fill="#0284C7" />
    {/* NetBanking Text */}
    <text
      x="22"
      y="16.5"
      fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      fontSize="11"
      fontWeight="800"
      fill="#0F172A"
      letterSpacing="-0.3px"
    >
      NetBanking
    </text>
  </svg>
);

interface PaymentLogosProps {
  variant?: 'card' | 'compact';
  className?: string;
}

export const PaymentLogos: React.FC<PaymentLogosProps> = ({ variant = 'card', className = '' }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        <span
          className="inline-flex items-center justify-center bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 transition-transform hover:scale-105"
          title="UPI - Unified Payments Interface"
        >
          <UpiLogo height={16} />
        </span>
        <span
          className="inline-flex items-center justify-center bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 transition-transform hover:scale-105"
          title="RuPay Debit & Credit Cards"
        >
          <RuPayLogo height={16} />
        </span>
        <span
          className="inline-flex items-center justify-center bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 transition-transform hover:scale-105"
          title="Visa Cards"
        >
          <VisaLogo height={16} />
        </span>
        <span
          className="inline-flex items-center justify-center bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 transition-transform hover:scale-105"
          title="Mastercard"
        >
          <MastercardLogo height={16} />
        </span>
        <span
          className="inline-flex items-center justify-center bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 transition-transform hover:scale-105"
          title="NetBanking (All Major Banks)"
        >
          <NetBankingLogo height={16} />
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div
        className="inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200/90 hover:border-cyan-400 transition-all hover:scale-105"
        title="UPI - Unified Payments Interface (PhonePe, GPay, Paytm, BHIM)"
      >
        <UpiLogo height={18} />
      </div>
      <div
        className="inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200/90 hover:border-cyan-400 transition-all hover:scale-105"
        title="RuPay Debit & Credit Cards"
      >
        <RuPayLogo height={18} />
      </div>
      <div
        className="inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200/90 hover:border-cyan-400 transition-all hover:scale-105"
        title="Visa Debit & Credit Cards"
      >
        <VisaLogo height={18} />
      </div>
      <div
        className="inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200/90 hover:border-cyan-400 transition-all hover:scale-105"
        title="Mastercard Debit & Credit Cards"
      >
        <MastercardLogo height={18} />
      </div>
      <div
        className="inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200/90 hover:border-cyan-400 transition-all hover:scale-105"
        title="NetBanking - 50+ Major Indian Banks"
      >
        <NetBankingLogo height={18} />
      </div>
    </div>
  );
};

export default PaymentLogos;
