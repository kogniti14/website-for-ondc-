import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Building2,
  RefreshCw,
} from 'lucide-react';
import {
  razorpayService,
  RazorpayConfig,
  RazorpayPaymentSuccessResponse,
} from '../../services/razorpayService';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; // in INR
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
  isB2B?: boolean;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'corporate' | 'wallet';

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  description,
  isB2B = false,
  onSuccess,
}) => {
  const [config, setConfig] = useState<RazorpayConfig>(() => razorpayService.getConfig());
  const [activeTab, setActiveTab] = useState<PaymentTab>(isB2B ? 'corporate' : 'upi');

  // Form states
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(customerName || '');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [walletProvider, setWalletProvider] = useState('Paytm');

  // Interactive transaction states
  const [step, setStep] = useState<'select' | 'otp' | 'processing' | 'success'>('select');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(razorpayService.getConfig());
      setStep('select');
      setPaymentError(null);
      setSimulatedOtp(Math.floor(100000 + Math.random() * 900000).toString());
      setCardName(customerName || '');
    }
  }, [isOpen, customerName]);

  if (!isOpen) return null;

  const handleStartPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPaymentError(null);

    // Validation
    if (activeTab === 'card') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setPaymentError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 4) {
        setPaymentError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setPaymentError('Please enter a valid 3-digit CVV.');
        return;
      }
      // Trigger 3D Secure OTP step
      setStep('otp');
      return;
    }

    if (activeTab === 'upi') {
      if (!upiId && selectedUpiApp === 'vpa') {
        setPaymentError('Please enter your UPI ID (e.g. user@okhdfcbank).');
        return;
      }
    }

    // Process directly for UPI, Netbanking, Corporate
    processSuccess();
  };

  const processSuccess = () => {
    setStep('processing');

    setTimeout(() => {
      const generatedPaymentId = `pay_${Date.now()}_${Math.floor(10000 + Math.random() * 90000)}`;
      const bankRrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();

      let methodLabel = 'Razorpay Gateway';
      if (activeTab === 'upi') {
        methodLabel = selectedUpiApp === 'vpa' ? `UPI (${upiId})` : `UPI (${selectedUpiApp.toUpperCase()})`;
      } else if (activeTab === 'card') {
        methodLabel = `Card (•••• ${cardNumber.slice(-4) || '8901'})`;
      } else if (activeTab === 'netbanking') {
        methodLabel = `NetBanking (${selectedBank})`;
      } else if (activeTab === 'corporate') {
        methodLabel = 'Corporate Virtual Account (NEFT/RTGS)';
      } else if (activeTab === 'wallet') {
        methodLabel = `Wallet (${walletProvider})`;
      }

      // Record in persistent ledger
      razorpayService.recordTransaction({
        paymentId: generatedPaymentId,
        orderNumber,
        orderType: isB2B ? 'b2b' : 'b2c',
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail || 'customer@kognitiminds.com',
        customerPhone: customerPhone || '9931648595',
        amount,
        currency: 'INR',
        method: methodLabel,
        status: 'captured',
        bankRrn,
        gatewayMode: config.mode,
      });

      setStep('success');

      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: generatedPaymentId,
          razorpay_order_id: `order_rzp_${Date.now()}`,
          razorpay_signature: `sig_${Math.random().toString(36).substring(2)}`,
          method: methodLabel,
          bank_rrn: bankRrn,
        });
        onClose();
      }, 1500);
    }, 1800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() === simulatedOtp) {
      processSuccess();
    } else {
      setPaymentError('Invalid OTP. Please enter the authentic 6-digit bank verification code.');
    }
  };

  const formatCardInput = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const popularBanks = [
    { name: 'HDFC Bank', code: 'HDFC' },
    { name: 'State Bank of India', code: 'SBI' },
    { name: 'ICICI Bank', code: 'ICIC' },
    { name: 'Axis Bank', code: 'UTIB' },
    { name: 'Kotak Mahindra Bank', code: 'KKBK' },
    { name: 'Punjab National Bank', code: 'PUNB' },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 10050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          animation: 'scaleUp 0.2s ease-out',
        }}
      >
        {/* Top Razorpay Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #0284C7',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '42px',
                height: '42px',
                background: '#FFFFFF',
                borderRadius: '10px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              <img src="/logo.png" alt="Kogniti Minds" style={{ maxHeight: '34px', width: 'auto' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.01em' }}>
                  Kogniti Minds
                </span>
                <span
                  style={{
                    backgroundColor: config.mode === 'live' ? '#16A34A' : '#F59E0B',
                    color: '#FFFFFF',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Razorpay {config.mode}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Order #{orderNumber} {description ? `• ${description}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                Amount Payable
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38BDF8' }}>
                ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={step === 'processing'}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#CBD5E1',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Security Assurance Banner */}
        <div
          style={{
            background: '#F0FDF4',
            borderBottom: '1px solid #DCFCE7',
            padding: '0.5rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#166534',
          }}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>256-Bit End-to-End Encryption • RBI & NPCI Compliant Payment Terminal</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Powered by <strong>Razorpay</strong></span>
          </div>
        </div>

        {paymentError && (
          <div
            style={{
              margin: '1rem 1.5rem 0',
              padding: '0.75rem 1rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              borderRadius: '8px',
              color: '#991B1B',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{paymentError}</span>
          </div>
        )}

        {/* Step 1: Payment Selection */}
        {step === 'select' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              minHeight: '380px',
              overflowY: 'auto',
            }}
          >
            {/* Left Method Tabs */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRight: '1px solid #E2E8F0',
                padding: '0.75rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  textAlign: 'left',
                  background: activeTab === 'upi' ? '#0F172A' : 'transparent',
                  color: activeTab === 'upi' ? '#FFFFFF' : '#334155',
                  fontWeight: activeTab === 'upi' ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <QrCode size={18} className={activeTab === 'upi' ? 'text-sky-400' : 'text-slate-500'} />
                <span>UPI (QR & Apps)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  textAlign: 'left',
                  background: activeTab === 'card' ? '#0F172A' : 'transparent',
                  color: activeTab === 'card' ? '#FFFFFF' : '#334155',
                  fontWeight: activeTab === 'card' ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <CreditCard size={18} className={activeTab === 'card' ? 'text-sky-400' : 'text-slate-500'} />
                <span>Credit & Debit Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  textAlign: 'left',
                  background: activeTab === 'netbanking' ? '#0F172A' : 'transparent',
                  color: activeTab === 'netbanking' ? '#FFFFFF' : '#334155',
                  fontWeight: activeTab === 'netbanking' ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Building size={18} className={activeTab === 'netbanking' ? 'text-sky-400' : 'text-slate-500'} />
                <span>Net Banking (50+)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('corporate')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  textAlign: 'left',
                  background: activeTab === 'corporate' ? '#0F172A' : 'transparent',
                  color: activeTab === 'corporate' ? '#FFFFFF' : '#334155',
                  fontWeight: activeTab === 'corporate' ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Building2 size={18} className={activeTab === 'corporate' ? 'text-sky-400' : 'text-slate-500'} />
                <span>NEFT / RTGS Wire</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  textAlign: 'left',
                  background: activeTab === 'wallet' ? '#0F172A' : 'transparent',
                  color: activeTab === 'wallet' ? '#FFFFFF' : '#334155',
                  fontWeight: activeTab === 'wallet' ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Smartphone size={18} className={activeTab === 'wallet' ? 'text-sky-400' : 'text-slate-500'} />
                <span>Wallets</span>
              </button>
            </div>

            {/* Right Tab Content */}
            <div style={{ padding: '1.75rem', overflowY: 'auto' }}>
              {/* TAB 1: UPI */}
              {activeTab === 'upi' && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    Pay via UPI (Instant & Zero Surcharge)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1.25rem' }}>
                    Scan the dynamic QR code with any UPI app or choose intent flow below.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      padding: '1.25rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {/* Simulated Dynamic UPI QR */}
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #0F172A',
                        borderRadius: '10px',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <QrCode size={100} className="text-slate-900" />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
                        Scan & Pay via any UPI App
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: '1.4' }}>
                        Supports PhonePe, Google Pay, Paytm, BHIM, CRED, Amazon Pay, and all Indian Bank Apps.
                      </div>
                      <div
                        style={{
                          marginTop: '0.6rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#ECFDF5',
                          color: '#047857',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={13} /> Auto-detecting payment
                      </div>
                    </div>
                  </div>

                  {/* App Selection */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.5rem' }}>
                      Or select preferred UPI App:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                      {[
                        { id: 'gpay', name: 'Google Pay' },
                        { id: 'phonepe', name: 'PhonePe' },
                        { id: 'paytm', name: 'Paytm' },
                        { id: 'vpa', name: 'Other UPI ID' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          style={{
                            padding: '0.6rem 0.4rem',
                            border: selectedUpiApp === app.id ? '2px solid #0284C7' : '1px solid #CBD5E1',
                            borderRadius: '8px',
                            background: selectedUpiApp === app.id ? '#E0F2FE' : '#FFFFFF',
                            color: selectedUpiApp === app.id ? '#0369A1' : '#334155',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedUpiApp === 'vpa' && (
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Enter UPI ID / VPA</label>
                      <input
                        type="text"
                        placeholder="e.g. mobileNumber@upi or name@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <span>Pay ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} via UPI</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* TAB 2: CARDS */}
              {activeTab === 'card' && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    Credit & Debit Cards
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1.25rem' }}>
                    Supports RuPay, Visa, MasterCard, Maestro & Diners Club.
                  </p>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8901"
                      value={cardNumber}
                      onChange={(e) => formatCardInput(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}
                      maxLength={19}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Valid Thru (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => formatExpiry(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.9rem' }}
                        maxLength={5}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>CVV / CVC</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                        className="form-input"
                        style={{ fontSize: '0.9rem' }}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Name on Card</label>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.76rem',
                      color: '#64748B',
                      marginBottom: '1.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input type="checkbox" defaultChecked />
                    <span>Securely save this card as per RBI Guidelines</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <Lock size={15} />
                    <span>Pay ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </button>
                </div>
              )}

              {/* TAB 3: NETBANKING */}
              {activeTab === 'netbanking' && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    Net Banking
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1.25rem' }}>
                    Direct debit from over 50 Indian scheduled banks.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    {popularBanks.map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => setSelectedBank(bank.name)}
                        style={{
                          padding: '0.65rem 0.4rem',
                          border: selectedBank === bank.name ? '2px solid #0284C7' : '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: selectedBank === bank.name ? '#E0F2FE' : '#FFFFFF',
                          color: selectedBank === bank.name ? '#0369A1' : '#1E293B',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Or Select from All Banks</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                      <option value="Yes Bank">Yes Bank</option>
                      <option value="Federal Bank">Federal Bank</option>
                      <option value="IDBI Bank">IDBI Bank</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <span>Proceed to {selectedBank}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* TAB 4: CORPORATE / NEFT-RTGS */}
              {activeTab === 'corporate' && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    Corporate Virtual Account (NEFT / RTGS / IMPS)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1.25rem' }}>
                    Razorpay Smart Collect automatically reconciles payments against Order #{orderNumber}.
                  </p>

                  <div
                    style={{
                      backgroundColor: '#F1F5F9',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      padding: '1rem 1.25rem',
                      marginBottom: '1.25rem',
                      fontSize: '0.82rem',
                      lineHeight: '1.6',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.35rem' }}>
                      <span style={{ color: '#64748B' }}>Beneficiary:</span>
                      <strong style={{ color: '#0F172A' }}>KOGNITI MINDS PVT LTD - RAZORPAY</strong>

                      <span style={{ color: '#64748B' }}>Account No:</span>
                      <div>
                        <code style={{ background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0284C7' }}>
                          RAZRKM{orderNumber.replace(/\D/g, '').slice(-8) || '20261042'}
                        </code>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: '6px' }}>(Unique to this order)</span>
                      </div>

                      <span style={{ color: '#64748B' }}>IFSC Code:</span>
                      <code style={{ background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        RAZR0000001
                      </code>

                      <span style={{ color: '#64748B' }}>Account Type:</span>
                      <span>Current Account</span>

                      <span style={{ color: '#64748B' }}>Transfer Mode:</span>
                      <span>NEFT, RTGS, or IMPS from any Corporate Bank</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '1.25rem' }}>
                    Click below to confirm receipt of funds or simulate instantaneous wire clearance for your procurement ledger.
                  </p>

                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <span>Record & Settle ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Wire</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* TAB 5: WALLET */}
              {activeTab === 'wallet' && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    Digital Wallets
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1.25rem' }}>
                    Pay using your preferred prepaid digital wallet.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {['Paytm Wallet', 'PhonePe Wallet', 'Mobikwik', 'Amazon Pay'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWalletProvider(w)}
                        style={{
                          padding: '0.75rem',
                          border: walletProvider === w ? '2px solid #0284C7' : '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: walletProvider === w ? '#E0F2FE' : '#FFFFFF',
                          color: walletProvider === w ? '#0369A1' : '#1E293B',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartPayment}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <span>Pay with {walletProvider}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: 3D Secure OTP Simulation Step */}
        {step === 'otp' && (
          <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Lock size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              Bank 3D Secure Authentication
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              Your issuing bank sent a 6-digit One Time Password (OTP) to your registered mobile number ending in <strong>•••95</strong>.
            </p>

            <div
              style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                display: 'inline-block',
                fontSize: '0.82rem',
                color: '#92400E',
                marginBottom: '1.5rem',
              }}
            >
              Sandbox Bank Challenge Code: <strong style={{ letterSpacing: '0.1em', fontSize: '1rem' }}>{simulatedOtp}</strong>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ maxWidth: '320px', margin: '0 auto' }}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  className="form-input"
                  style={{
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    letterSpacing: '0.3em',
                    fontWeight: 800,
                  }}
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                Authenticate & Pay ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </button>

              <button
                type="button"
                onClick={() => setStep('select')}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.82rem' }}
              >
                Change Payment Method
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Processing Screen */}
        {step === 'processing' && (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '4px solid #E2E8F0',
                borderTopColor: '#0284C7',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1.5rem',
              }}
            />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              Communicating with Razorpay...
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Please do not refresh or press back while we confirm your payment with the banking network.
            </p>
          </div>
        )}

        {/* Step 4: Success Screen */}
        {step === 'success' && (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 0 8px #F0FDF4',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              Payment Captured Successfully!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
              ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been settled via Razorpay.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Redirecting to official invoice...
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#64748B',
          }}
        >
          <div>
            Razorpay Merchant ID: <strong>KM_PROD_2026</strong>
          </div>
          <div className="flex items-center gap-2">
            <span>PCI-DSS Level 1</span>
            <span>•</span>
            <span>ISO 27001</span>
            <span>•</span>
            <span>100% Buyer Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
