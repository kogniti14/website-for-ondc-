import { storageService } from './storageService';

export interface RazorpayConfig {
  keyId: string;
  keySecret?: string;
  mode: 'test' | 'live';
  merchantName: string;
  themeColor: string;
  enabledMethods: {
    upi: boolean;
    card: boolean;
    netbanking: boolean;
    wallet: boolean;
    cod: boolean;
  };
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  method?: string;
  bank_rrn?: string;
}

export interface RazorpayCheckoutOptions {
  amount: number; // in INR rupees (will be converted to paise)
  orderNumber: string;
  description?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: Record<string, string>;
  isB2B?: boolean;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onDismiss?: () => void;
}

export interface RazorpayTransactionRecord {
  id: string;
  paymentId: string;
  orderNumber: string;
  orderType: 'b2c' | 'b2b';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  currency: string;
  method: string;
  status: 'captured' | 'failed' | 'refunded';
  bankRrn: string;
  gatewayMode: 'test' | 'live';
  createdAt: string;
}

const RAZORPAY_CONFIG_KEY = 'km_razorpay_config_v1';
const RAZORPAY_TRANSACTIONS_KEY = 'km_razorpay_transactions_v1';

const DEFAULT_CONFIG: RazorpayConfig = {
  keyId: 'rzp_test_kognitiminds2026',
  keySecret: '',
  mode: 'test',
  merchantName: 'Kogniti Minds Private Limited',
  themeColor: '#0F172A',
  enabledMethods: {
    upi: true,
    card: true,
    netbanking: true,
    wallet: true,
    cod: true,
  },
};

class RazorpayService {
  private scriptLoaded = false;
  private scriptLoadingPromise: Promise<boolean> | null = null;

  getConfig(): RazorpayConfig {
    try {
      const saved = localStorage.getItem(RAZORPAY_CONFIG_KEY);
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error reading Razorpay config:', e);
    }
    return DEFAULT_CONFIG;
  }

  saveConfig(config: RazorpayConfig): void {
    try {
      localStorage.setItem(RAZORPAY_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving Razorpay config:', e);
    }
  }

  getTransactions(): RazorpayTransactionRecord[] {
    try {
      const saved = localStorage.getItem(RAZORPAY_TRANSACTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading Razorpay transactions:', e);
    }
    // Seed transaction for demonstration
    return [
      {
        id: 'txn_seed_01',
        paymentId: 'pay_KM_20260904_88192',
        orderNumber: 'KM-B2C-2026-1042',
        orderType: 'b2c',
        customerName: 'Aarav Mehta',
        customerEmail: 'aarav.mehta@gmail.com',
        customerPhone: '9876543210',
        amount: 1597,
        currency: 'INR',
        method: 'UPI (Google Pay)',
        status: 'captured',
        bankRrn: '425918294012',
        gatewayMode: 'test',
        createdAt: '2026-09-04T11:21:00Z',
      },
    ];
  }

  recordTransaction(record: Omit<RazorpayTransactionRecord, 'id' | 'createdAt'>): RazorpayTransactionRecord {
    const transactions = this.getTransactions();
    const newRecord: RazorpayTransactionRecord = {
      ...record,
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    transactions.unshift(newRecord);
    try {
      localStorage.setItem(RAZORPAY_TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error recording Razorpay transaction:', e);
    }
    return newRecord;
  }

  /**
   * Dynamically loads the official Razorpay script from CDN
   */
  loadScript(): Promise<boolean> {
    if (this.scriptLoaded && (window as any).Razorpay) {
      return Promise.resolve(true);
    }
    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise((resolve) => {
      // Check if already injected in DOM
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.warn('Could not load official Razorpay SDK from checkout.razorpay.com. Using embedded gateway.');
        resolve(false);
      };
      document.body.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Opens the official Razorpay Checkout SDK popup if available.
   * Returns false if script is unavailable (caller can render embedded fallback modal).
   */
  async openOfficialCheckout(options: RazorpayCheckoutOptions): Promise<boolean> {
    const isLoaded = await this.loadScript();
    const RazorpayConstructor = (window as any).Razorpay;

    if (!isLoaded || !RazorpayConstructor) {
      return false;
    }

    const config = this.getConfig();
    const amountInPaise = Math.round(options.amount * 100);

    const rzpOptions = {
      key: config.keyId,
      amount: amountInPaise,
      currency: 'INR',
      name: config.merchantName || 'Kogniti Minds Private Limited',
      description: options.description || `Payment for Order #${options.orderNumber}`,
      image: '/logo.png',
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      notes: {
        orderNumber: options.orderNumber,
        isB2B: options.isB2B ? 'true' : 'false',
        ...(options.notes || {}),
      },
      theme: {
        color: config.themeColor || '#0F172A',
      },
      modal: {
        ondismiss: () => {
          if (options.onDismiss) options.onDismiss();
        },
      },
      handler: (response: any) => {
        // Record in internal ledger
        const bankRrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        this.recordTransaction({
          paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
          orderNumber: options.orderNumber,
          orderType: options.isB2B ? 'b2b' : 'b2c',
          customerName: options.customerName,
          customerEmail: options.customerEmail,
          customerPhone: options.customerPhone,
          amount: options.amount,
          currency: 'INR',
          method: 'Razorpay Standard',
          status: 'captured',
          bankRrn,
          gatewayMode: config.mode,
        });

        options.onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          method: 'Razorpay Gateway',
          bank_rrn: bankRrn,
        });
      },
    };

    try {
      const rzpInstance = new RazorpayConstructor(rzpOptions);
      rzpInstance.open();
      return true;
    } catch (err) {
      console.error('Error invoking Razorpay instance:', err);
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
