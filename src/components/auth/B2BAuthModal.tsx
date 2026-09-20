import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Lock,
  Phone,
  UserCheck,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  ArrowLeft,
  KeyRound,
  Eye,
  Download,
  RefreshCw,
  Check,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { B2BBusiness, B2BDocumentType, B2BDocumentAttachment } from '../../types';
import { storageService } from '../../services/storageService';
import { UnregisteredUserModal } from './UnregisteredUserModal';
import { ImageUpload } from '../common/ImageUpload';
import { isSuperAdminIdentifier } from '../../services/adminDbService';

interface B2BAuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const MANDATORY_DOC_CONFIG: Array<{
  type: B2BDocumentType;
  title: string;
  code: string;
  description: string;
  validationError: string;
}> = [
  {
    type: 'gst_certificate',
    title: 'GST Certificate',
    code: 'GST REG-06',
    description: 'Government issued GST Certificate with official seal & annexures',
    validationError: 'GST Certificate is required.',
  },
  {
    type: 'msme_udyam',
    title: 'MSME / Udyam Certificate',
    code: 'UDYAM',
    description: 'Government of India Udyam Registration Certificate for MSE/SME',
    validationError: 'MSME/Udyam Certificate is required.',
  },
  {
    type: 'moa',
    title: 'MOA — Memorandum of Association',
    code: 'MOA',
    description: 'Corporate charter establishing company scope and operations',
    validationError: 'MOA is required.',
  },
  {
    type: 'aoa',
    title: 'AOA — Articles of Association',
    code: 'AOA',
    description: 'Statutory bylaws governing management and administration',
    validationError: 'AOA is required.',
  },
  {
    type: 'coi',
    title: 'COI — Certificate of Incorporation',
    code: 'COI',
    description: 'Registrar of Companies (RoC) issued Incorporation Certificate',
    validationError: 'COI is required.',
  },
];

export const B2BAuthModal: React.FC<B2BAuthModalProps> = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Unregistered Account Check State
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);
  const [unregisteredIdentifier, setUnregisteredIdentifier] = useState('');

  // Registration Fields
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('Procurement Authority');
  const [businessEmail, setBusinessEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gstin, setGstin] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [cinNumber, setCinNumber] = useState('');
  const [businessType, setBusinessType] = useState<B2BBusiness['businessType']>('Corporate Office');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [docUploaded, setDocUploaded] = useState(false);
  const [docImage, setDocImage] = useState('');

  // 5 Compulsory KYC Documents State
  const [kycDocs, setKycDocs] = useState<Record<B2BDocumentType, B2BDocumentAttachment | null>>({
    gst_certificate: null,
    msme_certificate: null,
    msme_udyam: null,
    moa: null,
    aoa: null,
    coi: null,
  });
  const [kycUploading, setKycUploading] = useState<Record<B2BDocumentType, boolean>>({
    gst_certificate: false,
    msme_certificate: false,
    msme_udyam: false,
    moa: false,
    aoa: false,
    coi: false,
  });
  const [previewDoc, setPreviewDoc] = useState<B2BDocumentAttachment | null>(null);

  // Login Method & OTP
  const [loginMethod, setLoginMethod] = useState<'password' | 'email_otp'>('password');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [loginCooldown, setLoginCooldown] = useState(0);

  // Registration Password & Email OTP
  const [regPassword, setRegPassword] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtp, setRegOtp] = useState('');
  const [regCooldown, setRegCooldown] = useState(0);

  // Handle uploading compulsory KYC files to /api/upload.php
  const handleKycFileUpload = async (docType: B2BDocumentType, file: File) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setError(`Invalid format for ${file.name}. Please upload PDF, JPG, or PNG.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    setKycUploading((prev) => ({ ...prev, [docType]: true }));
    setError(null);

    try {
      let docUrl = '';
      let storedPath = '';

      if (typeof window !== 'undefined' && typeof FormData !== 'undefined') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'b2b_documents');

        let uploadRes = await fetch('/api/upload.php', {
          method: 'POST',
          body: formData,
        }).catch(() => null);

        if (!uploadRes || !uploadRes.ok) {
          uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          }).catch(() => null);
        }

        if (uploadRes && uploadRes.ok) {
          const data = await uploadRes.json();
          if (data.success && data.url) {
            docUrl = data.url;
            storedPath = data.path || data.url;
          }
        }
      }

      // Browser fallback (FileReader data URL) if server upload not reached
      if (!docUrl && typeof FileReader !== 'undefined') {
        docUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
        storedPath = `/uploads/b2b_documents/${Date.now()}_${file.name}`;
      }

      if (!docUrl) {
        setError(`Failed to process ${file.name}. Please try again.`);
        setKycUploading((prev) => ({ ...prev, [docType]: false }));
        return;
      }

      const cfg = MANDATORY_DOC_CONFIG.find((c) => c.type === docType);
      const attachment: B2BDocumentAttachment = {
        id: `kyc_${docType}_${Date.now()}`,
        documentType: docType,
        name: cfg ? cfg.title : docType,
        originalFilename: file.name,
        storedPath,
        documentUrl: docUrl,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        mimeType: file.type || 'application/pdf',
        verificationStatus: 'pending',
      };

      setKycDocs((prev) => ({ ...prev, [docType]: attachment }));
      if (docType === 'gst_certificate') {
        setDocImage(docUrl);
        setDocUploaded(true);
      }
    } catch (err: any) {
      setError(`Failed to upload ${file.name}: ${err.message || 'Network error'}`);
    } finally {
      setKycUploading((prev) => ({ ...prev, [docType]: false }));
    }
  };

  // Policy Acceptance State for B2B Registration
  const [agreePolicies, setAgreePolicies] = useState(false);

  // Forgot Password via Email OTP State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [firebaseResetSuccess, setFirebaseResetSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    loginB2B,
    loginB2BWithFirebase,
    loginWithGoogle,
    sendFirebasePasswordReset,
    sendEmailOtp,
    loginB2BWithEmailOtp,
    registerB2BWithEmailOtp,
    resetPasswordWithEmailOtp,
    loginAdminWithFirebase,
    isFirebaseLive,
  } = useAuth();

  // Cooldown timers - Real-time countdown
  React.useEffect(() => {
    if (loginCooldown <= 0) return;
    const interval = setInterval(() => {
      setLoginCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [loginCooldown > 0]);

  React.useEffect(() => {
    if (regCooldown <= 0) return;
    const interval = setInterval(() => {
      setRegCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [regCooldown > 0]);

  React.useEffect(() => {
    if (forgotCooldown <= 0) return;
    const interval = setInterval(() => {
      setForgotCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [forgotCooldown > 0]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your registered corporate email or mobile number.');
      return;
    }
    const cleanEmail = email.trim();

    // Check if this identifier belongs to Super Admin / Admin personnel
    const isAdminId =
      isSuperAdminIdentifier(cleanEmail) || storageService.isAnyAdminIdentifier(cleanEmail);
    if (isAdminId) {
      if (password) {
        setLoading(true);
        const adminRes = await loginAdminWithFirebase(cleanEmail, password);
        setLoading(false);
        if (adminRes.success) {
          if (onSuccess) onSuccess();
          onClose();
          return;
        }
        setError(adminRes.message);
        return;
      } else {
        setError('Kogniti Minds Admin Account detected. Please enter your Admin Password to sign in.');
        return;
      }
    }

    if (cleanEmail.includes('@') && password) {
      setLoading(true);
      const res = await loginB2BWithFirebase(cleanEmail.toLowerCase(), password);
      setLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
        return;
      }
      if (
        res.error &&
        (res.error.toLowerCase().includes('no registered account') ||
          res.error.toLowerCase().includes('user-not-found'))
      ) {
        setUnregisteredIdentifier(cleanEmail);
        setShowUnregisteredModal(true);
        return;
      }
      setError(res.error || 'Authentication failed.');
      return;
    }

    let isRegistered = storageService.isB2BIdentifierRegistered(cleanEmail);
    if (!isRegistered) {
      try {
        let checkRes = await fetch(`/api/data.php?collection=b2b_businesses`).catch(() => null);
        if (!checkRes || !checkRes.ok) {
          checkRes = await fetch(`/api/data/b2b_businesses`).catch(() => null);
        }
        if (checkRes && checkRes.ok) {
          const serverBiz = await checkRes.json();
          const match = serverBiz.find((b: any) => (b.businessEmail || '').toLowerCase() === cleanEmail.toLowerCase());
          if (match) {
            storageService.saveB2BBusiness(match);
            isRegistered = true;
          }
        }
      } catch {}
    }

    if (!isRegistered) {
      setUnregisteredIdentifier(cleanEmail);
      setShowUnregisteredModal(true);
      return;
    }

    setLoading(true);
    const success = loginB2B(cleanEmail.toLowerCase());
    setLoading(false);
    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError('Incorrect corporate credentials. Please verify your password or use Email OTP.');
    }
  };

  const handleSendB2BLoginEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter your official corporate email address.');
      return;
    }

    const isAdminId =
      isSuperAdminIdentifier(cleanEmail) || storageService.isAnyAdminIdentifier(cleanEmail);
    if (isAdminId) {
      setError('This is an Admin account. Please sign in with your Admin Password or visit the Admin Portal.');
      return;
    }

    let isRegistered = storageService.isB2BIdentifierRegistered(cleanEmail);
    if (!isRegistered) {
      try {
        let checkRes = await fetch(`/api/data.php?collection=b2b_businesses`).catch(() => null);
        if (!checkRes || !checkRes.ok) {
          checkRes = await fetch(`/api/data/b2b_businesses`).catch(() => null);
        }
        if (checkRes && checkRes.ok) {
          const serverBiz = await checkRes.json();
          const match = serverBiz.find((b: any) => (b.businessEmail || '').toLowerCase() === cleanEmail.toLowerCase());
          if (match) {
            storageService.saveB2BBusiness(match);
            isRegistered = true;
          }
        }
      } catch {}
    }

    if (!isRegistered) {
      setUnregisteredIdentifier(cleanEmail);
      setShowUnregisteredModal(true);
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(cleanEmail, 'login');
    setLoading(false);
    if (res.success) {
      setLoginOtpSent(true);
      setLoginCooldown(res.cooldownSeconds || 10);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyB2BLoginEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginOtp || loginOtp.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setLoading(true);
    const res = await loginB2BWithEmailOtp(email.trim().toLowerCase(), loginOtp.trim());
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Invalid OTP code. Please try again.');
    }
  };

  const handleGoogleB2BSignIn = async () => {
    setError(null);
    setLoading(true);
    const res = await loginWithGoogle('b2b');
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Google Workspace sign-in failed.');
    }
  };

  const handleSendB2BFirebaseReset = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Please enter a valid corporate email to receive the Firebase reset link.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await sendFirebasePasswordReset(forgotEmail.trim());
    setLoading(false);
    if (res.success) {
      setFirebaseResetSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleSendB2BForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = forgotEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setError('Please enter your registered corporate email.');
      return;
    }
    const isRegistered = storageService.isB2BIdentifierRegistered(clean);
    if (!isRegistered) {
      setUnregisteredIdentifier(clean);
      setShowUnregisteredModal(true);
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(clean, 'reset');
    setLoading(false);
    if (res.success) {
      setForgotOtpSent(true);
      setForgotCooldown(res.cooldownSeconds || 10);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyB2BForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotOtp || forgotOtp.length !== 6) {
      setError('Please enter the 6-digit verification code received in your email.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordWithEmailOtp(
      forgotEmail.trim().toLowerCase(),
      forgotOtp.trim(),
      forgotNewPassword,
      'b2b'
    );
    setLoading(false);
    if (res.success) {
      setForgotSuccess(res.message);
      setEmail(forgotEmail.trim());
      setPassword('');
      setTimeout(() => {
        setTab('login');
        setForgotSuccess(null);
        setForgotOtpSent(false);
        setForgotOtp('');
      }, 2500);
    } else {
      setError(res.message);
    }
  };

  const handleSendB2BRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError('Company/Business Legal Name is required.');
      return;
    }
    if (!contactPerson.trim()) {
      setError('Authorized Contact Person Name is required.');
      return;
    }
    if (!businessEmail.trim() || !businessEmail.includes('@')) {
      setError('Official Business Email is required.');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      setError('Valid 10-digit mobile number is required.');
      return;
    }
    if (!gstin.trim() || gstin.trim().length !== 15) {
      setError('Valid 15-character Indian GSTIN is required.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 5 COMPULSORY Document Upload Validations (Section 25, 27, 33)
    for (const doc of MANDATORY_DOC_CONFIG) {
      if (!kycDocs[doc.type]?.documentUrl) {
        setError(doc.validationError);
        return;
      }
    }

    if (!agreePolicies) {
      setError('Please accept the Terms & Conditions, Privacy Policy, Refund & Return Policy, and Shipping & Logistics Policy to continue.');
      return;
    }

    const cleanEmail = businessEmail.trim().toLowerCase();
    const existing = storageService.isB2BIdentifierRegistered(cleanEmail);
    if (existing) {
      setError('A business account with this email address already exists. Please sign in.');
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(cleanEmail, 'register');
    setLoading(false);
    if (res.success) {
      setRegOtpSent(true);
      setRegCooldown(res.cooldownSeconds || 10);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyAndRegisterB2B = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regOtp || regOtp.length !== 6) {
      setError('Please enter the 6-digit verification code received in your email.');
      return;
    }

    // Double-check 5 mandatory documents
    for (const doc of MANDATORY_DOC_CONFIG) {
      if (!kycDocs[doc.type]?.documentUrl) {
        setError(doc.validationError);
        return;
      }
    }

    if (!agreePolicies) {
      setError('Please accept the Terms & Conditions, Privacy Policy, Refund & Return Policy, and Shipping & Logistics Policy to continue.');
      return;
    }

    const compiledKycDocuments: B2BDocumentAttachment[] = MANDATORY_DOC_CONFIG
      .map((cfg) => kycDocs[cfg.type])
      .filter((doc): doc is B2BDocumentAttachment => doc !== null);

    setLoading(true);
    const res = await registerB2BWithEmailOtp(
      {
        companyName: companyName.trim(),
        tradeName: tradeName.trim() || undefined,
        contactPerson: contactPerson.trim() || 'Authorized Representative',
        designation: designation.trim() || 'Procurement Authority',
        businessEmail: businessEmail.trim().toLowerCase(),
        mobile: mobile.trim(),
        gstin: gstin.trim().toUpperCase(),
        udyamNumber: udyamNumber.trim().toUpperCase() || undefined,
        cinNumber: cinNumber.trim().toUpperCase() || undefined,
        pan: gstin.trim().slice(2, 12).toUpperCase(),
        businessType,
        policyAccepted: true,
        policyAcceptedAt: new Date().toISOString(),
        policyAcceptedVersion: '2026-09-18',
        verificationStatus: 'pending',
        kycDocuments: compiledKycDocuments,
        documents: compiledKycDocuments.map((d) => ({
          name: d.originalFilename || d.originalFileName || d.name || 'KYC Document',
          type: d.name,
          uploadedAt: d.uploadedAt,
          status: 'pending' as const,
        })),
        avatarUrl: kycDocs.gst_certificate?.documentUrl || undefined,
        billingAddress: {
          id: `baddr_${Date.now()}`,
          fullName: companyName.trim(),
          phone: mobile.trim(),
          street: street || 'Commercial Facility',
          city: city || 'Bengaluru',
          state: state || 'Karnataka',
          pincode: pincode || '560001',
          addressType: 'work',
          isDefault: true,
        },
        shippingAddress: {
          id: `saddr_${Date.now()}`,
          fullName: companyName.trim(),
          phone: mobile.trim(),
          street: street || 'Commercial Facility',
          city: city || 'Bengaluru',
          state: state || 'Karnataka',
          pincode: pincode || '560001',
          addressType: 'work',
          isDefault: true,
        },
      },
      regOtp.trim(),
      regPassword
    );

    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Corporate registration failed. Please verify the OTP.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: tab === 'register' ? '780px' : '440px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} className="text-slate-300" />
        </button>

        {/* Corporate Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              height: '52px',
              borderRadius: '12px',
              background: '#FFFFFF',
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <img
              src="/logo.png"
              alt="Kogniti Minds"
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>
            {tab === 'login' ? 'Kogniti Minds B2B Portal' : 'Registered Business'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            {tab === 'login'
              ? 'DIRECT MANUFACTURER PRICING • Bulk tier discounts, RFQs & GST billing'
              : 'DIRECT MANUFACTURER PRICING • Verified institutional procurement'}
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-2"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher */}
        {tab !== 'forgot' && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
            }}
          >
            <button
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                background: tab === 'login' ? 'var(--primary)' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              B2B Login
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                background: tab === 'register' ? 'var(--primary)' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Registered Business
            </button>
          </div>
        )}

        {tab === 'login' ? (
          <div>
            {/* Login Method Toggle */}
            <div className="flex justify-center gap-4" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setError(null);
                }}
                style={{
                  color: loginMethod === 'password' ? '#F59E0B' : '#94A3B8',
                  fontWeight: loginMethod === 'password' ? 700 : 500,
                  borderBottom: loginMethod === 'password' ? '2px solid #F59E0B' : 'none',
                  paddingBottom: '4px',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                }}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email_otp');
                  setError(null);
                }}
                style={{
                  color: loginMethod === 'email_otp' ? '#F59E0B' : '#94A3B8',
                  fontWeight: loginMethod === 'email_otp' ? 700 : 500,
                  borderBottom: loginMethod === 'email_otp' ? '2px solid #F59E0B' : 'none',
                  paddingBottom: '4px',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                }}
              >
                ✉️ Corporate Email OTP
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>
                    Registered Corporate Email or Mobile
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="text"
                      placeholder="contact@enterprise.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1', margin: 0 }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        setForgotEmail(email || '');
                        setError(null);
                        setForgotSuccess(null);
                        setForgotOtpSent(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: '#F59E0B',
                        fontWeight: 600,
                      }}
                    >
                      Forgot Password? Reset via OTP
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                      }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.75rem' }}>
                  <UserCheck size={16} /> {loading ? 'Authenticating...' : 'Sign In to B2B Dashboard'}
                </button>
              </form>
            ) : (
              <div>
                {!loginOtpSent ? (
                  <form onSubmit={handleSendB2BLoginEmailOtp}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#CBD5E1' }}>Official Corporate Email</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                        <input
                          type="email"
                          placeholder="contact@enterprise.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-input"
                          style={{
                            paddingLeft: '38px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            color: '#FFFFFF',
                          }}
                          required
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                        A one-time 6-digit corporate verification code will be sent to your inbox.
                      </span>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                      {loading ? 'Sending OTP...' : 'Send Corporate Login OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyB2BLoginEmailOtp}>
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34D399',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                      }}
                    >
                      OTP sent to <strong>{email}</strong>. Check inbox or spam folder.
                    </div>
                    <div className="form-group">
                      <div className="flex justify-between items-center">
                        <label className="form-label" style={{ color: '#CBD5E1' }}>Enter 6-Digit Email OTP</label>
                        <button
                          type="button"
                          disabled={loginCooldown > 0 || loading}
                          onClick={handleSendB2BLoginEmailOtp}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: loginCooldown > 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                            color: loginCooldown > 0 ? '#94A3B8' : '#F59E0B',
                            fontWeight: 600,
                          }}
                        >
                          {loginCooldown > 0 ? `Resend in ${loginCooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="••••••"
                        maxLength={6}
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                        className="form-input"
                        style={{
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          letterSpacing: '0.3em',
                          fontWeight: 800,
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                        }}
                        required
                        autoFocus
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%' }}>
                      {loading ? 'Verifying...' : 'Verify OTP & Enter B2B Portal'}
                    </button>
                  </form>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleB2BSignIn}
              disabled={loading}
              style={{
                width: '100%',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.65rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                marginTop: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google Workspace</span>
            </button>
          </div>
        ) : tab === 'forgot' ? (
          /* Forgot Password via Email OTP Form for B2B */
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                  setForgotOtpSent(false);
                }}
                className="btn btn-sm btn-outline-b2b"
                style={{ padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#FFF' }}
              >
                <ArrowLeft size={14} /> Back to B2B Sign In
              </button>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>
                Corporate Password Recovery
              </span>
            </div>

            {forgotSuccess ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem', color: '#FFF' }}>Password Reset Complete</div>
                <p style={{ fontSize: '0.82rem' }}>{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="btn btn-amber btn-sm"
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  Sign In with New Password
                </button>
              </div>
            ) : !forgotOtpSent ? (
              <form onSubmit={handleSendB2BForgotOtp}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Registered Corporate Email *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="email"
                      placeholder="contact@enterprise.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                      }}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>
                    A secure 6-digit verification code will be sent to your corporate email.
                  </span>
                </div>

                {firebaseResetSuccess && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34D399',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      marginBottom: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {firebaseResetSuccess}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Dispatching OTP...' : 'Generate & Send Verification OTP'}
                </button>

                {forgotEmail && forgotEmail.includes('@') && (
                  <button
                    type="button"
                    onClick={handleSendB2BFirebaseReset}
                    disabled={loading}
                    className="btn btn-sm btn-outline-b2b"
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      color: '#FFFFFF',
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    <KeyRound size={14} /> Send Official Firebase Reset Link
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleVerifyB2BForgotOtp}>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                  }}
                >
                  Verification code dispatched to <strong>{forgotEmail}</strong>. Please check your inbox or spam folder.
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label" style={{ color: '#CBD5E1' }}>6-Digit Verification OTP *</label>
                    <button
                      type="button"
                      disabled={forgotCooldown > 0 || loading}
                      onClick={handleSendB2BForgotOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: forgotCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        color: forgotCooldown > 0 ? '#94A3B8' : '#F59E0B',
                        fontWeight: 600,
                      }}
                    >
                      {forgotCooldown > 0 ? `Resend in ${forgotCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="form-input"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.25rem',
                      letterSpacing: '0.3em',
                      textAlign: 'center',
                      fontWeight: 800,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>New Password * (Min. 6 chars)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Confirm New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                      }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Updating Password...' : 'Verify OTP & Set New Password'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Business Registration Form with Real Email OTP Verification */
          <div>
            {!regOtpSent ? (
              <form onSubmit={handleSendB2BRegisterOtp}>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Company / Business Legal Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Global Technologies Pvt Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Trade / Brand Name (If different)</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex CleanTech"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Authorized Contact Person *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Khurana"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Designation / Authority *</label>
                    <input
                      type="text"
                      placeholder="e.g. Procurement Head / Director"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Official Business Email * (For OTP)</label>
                    <input
                      type="email"
                      placeholder="contact@enterprise.com"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Direct Contact Mobile *</label>
                    <input
                      type="tel"
                      placeholder="98123 45678"
                      value={mobile}
                      maxLength={10}
                      onChange={(e) => setMobile(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>15-Digit Indian GSTIN *</label>
                    <input
                      type="text"
                      placeholder="29AAACE1234F1Z8"
                      value={gstin}
                      maxLength={15}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF', letterSpacing: '0.05em', fontWeight: 600 }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>MSME / Udyam Number</label>
                    <input
                      type="text"
                      placeholder="UDYAM-XX-00-0000000"
                      value={udyamNumber}
                      onChange={(e) => setUdyamNumber(e.target.value.toUpperCase())}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Company CIN / Reg Number</label>
                    <input
                      type="text"
                      placeholder="U74999KA2023PTC123456"
                      value={cinNumber}
                      onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Create Portal Password * (Min 6 chars)</label>
                    <input
                      type="password"
                      placeholder="Create secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem', gridColumn: '1 / -1' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Business Classification *</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as any)}
                      className="form-select"
                      style={{ background: '#1E293B', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                    >
                      <option value="Education / School">Education / School / University</option>
                      <option value="Corporate Office">Corporate Office / IT Enterprise</option>
                      <option value="Retailer / Reseller">Retailer / Bulk Reseller</option>
                      <option value="Healthcare / Hospital">Healthcare / Hospital / Clinic</option>
                      <option value="Co-Working & Real Estate">Co-Working & Real Estate Hub</option>
                      <option value="Government / PSU">Government / PSU / NGO</option>
                      <option value="Other">Other Institutional Buyer</option>
                    </select>
                  </div>
                </div>

                {/* Address Row */}
                <div style={{ marginTop: '0.5rem' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Registered Business Address *</label>
                    <input
                      type="text"
                      placeholder="Building, Plot, Tech Park, Street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="form-input"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                    />
                  </div>

                  <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#CBD5E1' }}>City</label>
                      <input
                        type="text"
                        placeholder="Bengaluru"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="form-input"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#CBD5E1' }}>State</label>
                      <input
                        type="text"
                        placeholder="Karnataka"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="form-input"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#CBD5E1' }}>Pincode</label>
                      <input
                        type="text"
                        placeholder="560103"
                        value={pincode}
                        maxLength={6}
                        onChange={(e) => setPincode(e.target.value)}
                        className="form-input"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Dedicated Business Documents / KYC Documents Section (Sections 25, 26, 27, 33) */}
                <div
                  style={{
                    marginTop: '1.25rem',
                    marginBottom: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} className="text-amber-400" />
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                          Business Documents / KYC Documents
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '0.2rem', marginBottom: 0 }}>
                        All 5 statutory documents below are mandatory for B2B institutional account verification.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.6rem',
                          borderRadius: '999px',
                          background: Object.values(kycDocs).filter(Boolean).length === 5 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: Object.values(kycDocs).filter(Boolean).length === 5 ? '#34D399' : '#F87171',
                          border: `1px solid ${Object.values(kycDocs).filter(Boolean).length === 5 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                        }}
                      >
                        {Object.values(kycDocs).filter(Boolean).length} / 5 Attached
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {MANDATORY_DOC_CONFIG.map((cfg) => {
                      const doc = kycDocs[cfg.type];
                      const isUploading = kycUploading[cfg.type];

                      return (
                        <div
                          key={cfg.type}
                          style={{
                            background: doc ? 'rgba(52, 211, 153, 0.05)' : 'rgba(15, 23, 42, 0.6)',
                            border: `1px solid ${doc ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.12)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ flex: '1 1 240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#FFFFFF' }}>{cfg.title}</span>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '4px',
                                  background: doc ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                  color: doc ? '#34D399' : '#F87171',
                                  border: `1px solid ${doc ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {doc ? 'ATTACHED' : '[ REQUIRED ]'}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0 }}>
                              {doc ? (
                                <span style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <Check size={13} /> {doc.originalFilename} ({(doc.fileSize / 1024).toFixed(0)} KB)
                                </span>
                              ) : (
                                cfg.description
                              )}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            {doc && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="btn btn-sm btn-outline-b2b"
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '0.3rem 0.55rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    color: '#38BDF8',
                                    borderColor: 'rgba(56, 189, 248, 0.3)',
                                  }}
                                >
                                  <Eye size={13} /> View
                                </button>
                                <a
                                  href={doc.documentUrl}
                                  download={doc.originalFilename}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-b2b"
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '0.3rem 0.55rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    color: '#FFFFFF',
                                  }}
                                >
                                  <Download size={13} /> Download
                                </a>
                              </>
                            )}

                            <label
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                background: doc ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                                color: '#FFFFFF',
                                border: doc ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" /> Uploading...
                                </>
                              ) : doc ? (
                                <>
                                  <RefreshCw size={13} /> Replace
                                </>
                              ) : (
                                <>
                                  <Upload size={13} /> Attach Document
                                </>
                              )}
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                disabled={isUploading}
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleKycFileUpload(cfg.type, f);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mandatory Single Policy Agreement Checkbox */}
                <div style={{ margin: '1rem 0 0.85rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="b2b-agree-policies"
                    checked={agreePolicies}
                    onChange={(e) => {
                      setAgreePolicies(e.target.checked);
                      if (e.target.checked && error?.includes('Please accept')) {
                        setError(null);
                      }
                    }}
                    style={{
                      marginTop: '3px',
                      width: '16px',
                      height: '16px',
                      accentColor: '#F59E0B',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    required
                  />
                  <label
                    htmlFor="b2b-agree-policies"
                    style={{
                      fontSize: '0.82rem',
                      color: '#CBD5E1',
                      lineHeight: 1.5,
                      cursor: 'pointer',
                    }}
                  >
                    I agree to the{' '}
                    <a
                      href="#terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FBBF24', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      Terms & Conditions
                    </a>
                    ,{' '}
                    <a
                      href="#privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FBBF24', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      Privacy Policy
                    </a>
                    ,{' '}
                    <a
                      href="#refund"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FBBF24', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      Refund & Return Policy
                    </a>
                    , and{' '}
                    <a
                      href="#shipping"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FBBF24', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      Shipping & Logistics Policy
                    </a>{' '}
                    of KOGNITI MINDS PRIVATE LIMITED.
                  </label>
                </div>

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%' }}>
                  {loading ? 'Sending Code...' : 'Send Verification OTP to Corporate Email'}
                </button>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', marginTop: '0.5rem' }}>
                  Registrations undergo compliance check by Kogniti B2B desk within 24 business hours.
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndRegisterB2B}>
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                  }}
                >
                  Verification code dispatched to <strong>{businessEmail}</strong>. Enter the 6-digit OTP below to verify ownership and submit your compliance application.
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Enter 6-Digit Email OTP *</label>
                    <button
                      type="button"
                      disabled={regCooldown > 0 || loading}
                      onClick={handleSendB2BRegisterOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: regCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        color: regCooldown > 0 ? '#94A3B8' : '#F59E0B',
                        fontWeight: 600,
                      }}
                    >
                      {regCooldown > 0 ? `Resend in ${regCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={regOtp}
                    onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="form-input"
                    style={{
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      letterSpacing: '0.3em',
                      fontWeight: 800,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                    }}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-amber" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {loading ? 'Verifying & Submitting...' : 'Verify OTP & Submit Compliance Application'}
                </button>

                <button
                  type="button"
                  onClick={() => setRegOtpSent(false)}
                  className="btn btn-outline-b2b btn-sm"
                  style={{ width: '100%', marginTop: '0.65rem', color: '#FFF' }}
                >
                  ← Edit Entity Details
                </button>
              </form>
            )}
          </div>
        )}

        {/* Firebase Authentication Security Badge */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.72rem',
            color: '#94A3B8',
          }}
        >
          <span>🔒</span>
          <span>
            Enterprise Security Powered by <strong>Firebase Authentication</strong> {isFirebaseLive ? '• Live' : '• Ready'}
          </span>
        </div>
      </div>

      {showUnregisteredModal && (
        <UnregisteredUserModal
          identifier={unregisteredIdentifier}
          portalType="b2b"
          onClose={() => setShowUnregisteredModal(false)}
          onRegisterNow={() => {
            setShowUnregisteredModal(false);
            setTab('register');
            if (unregisteredIdentifier.includes('@')) {
              setBusinessEmail(unregisteredIdentifier);
            } else {
              setMobile(unregisteredIdentifier.replace(/\D/g, '').slice(-10));
            }
            setError(null);
          }}
        />
      )}

      {/* KYC Document Viewer Modal */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 11000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#1E293B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={18} className="text-amber-400" />
                <div>
                  <div style={{ fontWeight: 700, color: '#FFF', fontSize: '0.92rem' }}>
                    {previewDoc.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {previewDoc.originalFilename} • {(previewDoc.fileSize / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={previewDoc.documentUrl}
                  download={previewDoc.originalFilename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-b2b"
                  style={{ color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                >
                  <Download size={13} /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '1rem',
                background: '#020617',
                minHeight: '420px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {(previewDoc.mimeType || '').includes('pdf') || (previewDoc.documentUrl || previewDoc.fileUrl || '').toLowerCase().includes('.pdf') ? (
                <iframe
                  src={previewDoc.documentUrl || previewDoc.fileUrl || ''}
                  title={previewDoc.name}
                  style={{ width: '100%', height: '540px', border: 'none', borderRadius: '8px', background: '#FFFFFF' }}
                />
              ) : (
                <img
                  src={previewDoc.documentUrl || previewDoc.fileUrl || ''}
                  alt={previewDoc.name}
                  style={{ maxWidth: '100%', maxHeight: '540px', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
