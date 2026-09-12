import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserRole, B2CUser, B2BBusiness, AdminUser, AdminRole } from '../types';
import { storageService } from '../services/storageService';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { isFirebaseConfigured } from '../services/firebase';
import { emailOtpService } from '../services/emailOtpService';

export interface AuthContextType {
  role: UserRole;
  b2cUser: B2CUser | null;
  b2bBusiness: B2BBusiness | null;
  currentAdminUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isFirebaseLive: boolean;
  firebaseUser: FirebaseUser | null;

  // Traditional & Local fallback methods
  loginB2C: (email: string) => boolean;
  loginB2B: (email: string) => boolean;
  registerB2C: (user: Partial<B2CUser>) => B2CUser;
  registerB2B: (biz: Partial<B2BBusiness>) => B2BBusiness;
  loginAdmin: () => void;
  loginAdminWithCredentials: (
    identifier: string,
    password: string
  ) => { success: boolean; message: string; user?: AdminUser; isPending?: boolean };
  registerAdminUser: (data: {
    userId: string;
    name: string;
    email: string;
    password: string;
    role: AdminRole;
    department: string;
  }) => { success: boolean; message: string };
  approveAdminUser: (adminId: string) => boolean;
  rejectAdminUser: (adminId: string, reason?: string) => boolean;
  logout: () => void;
  quickSwitch: (
    target: 'guest' | 'b2c' | 'b2b_approved' | 'b2b_pending' | 'admin' | 'superadmin' | 'ops_admin'
  ) => void;
  refreshUserData: () => void;

  // Firebase Authentication Everywhere
  loginB2CWithFirebase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerB2CWithFirebase: (data: Partial<B2CUser>, password: string) => Promise<{ success: boolean; error?: string }>;
  loginB2BWithFirebase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerB2BWithFirebase: (biz: Partial<B2BBusiness>, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminWithFirebase: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: AdminUser; isPending?: boolean }>;
  loginWithGoogle: (portal: 'b2c' | 'b2b') => Promise<{ success: boolean; error?: string }>;
  sendFirebasePasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;

  // Production Email OTP Verification System
  sendEmailOtp: (
    email: string,
    purpose?: 'login' | 'register' | 'reset' | 'general'
  ) => Promise<{ success: boolean; message: string; cooldownSeconds?: number }>;
  verifyEmailOtp: (
    email: string,
    otp: string,
    purpose?: 'login' | 'register' | 'reset' | 'general'
  ) => { success: boolean; message: string };
  loginB2CWithEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  loginB2BWithEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  registerB2CWithEmailOtp: (
    data: Partial<B2CUser>,
    otp: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
  registerB2BWithEmailOtp: (
    biz: Partial<B2BBusiness>,
    otp: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPasswordWithEmailOtp: (
    email: string,
    otp: string,
    newPassword: string,
    userType?: 'b2c' | 'b2b' | 'admin'
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('guest');
  const [b2cUser, setB2cUser] = useState<B2CUser | null>(null);
  const [b2bBusiness, setB2bBusiness] = useState<B2BBusiness | null>(null);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(isFirebaseConfigured());

  const isSuperAdmin = currentAdminUser?.role === 'super_admin';

  // Listen to Firebase auth state
  useEffect(() => {
    setIsFirebaseLive(isFirebaseConfigured());
    const unsubscribe = firebaseAuthService.onAuthStateChanged((fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        // If logged in via Firebase, sync with active role
        const savedRole = localStorage.getItem('km_active_role') as UserRole | null;
        if (savedRole === 'b2c') {
          const users = storageService.getB2CUsers();
          let local = users.find((u) => u.email.toLowerCase() === fbUser.email!.toLowerCase());
          if (local) {
            local.firebaseUid = fbUser.uid;
            if (fbUser.photoURL && !local.avatarUrl) local.avatarUrl = fbUser.photoURL;
            storageService.saveB2CUser(local);
            setB2cUser(local);
          }
        } else if (savedRole === 'b2b') {
          const businesses = storageService.getB2BBusinesses();
          let localBiz = businesses.find((b) => b.businessEmail.toLowerCase() === fbUser.email!.toLowerCase());
          if (localBiz) {
            localBiz.firebaseUid = fbUser.uid;
            if (fbUser.photoURL && !localBiz.avatarUrl) localBiz.avatarUrl = fbUser.photoURL;
            storageService.saveB2BBusiness(localBiz);
            setB2bBusiness(localBiz);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Restore local session on initial render
  useEffect(() => {
    const savedRole = localStorage.getItem('km_active_role') as UserRole | null;
    const savedEntityId = localStorage.getItem('km_active_entity_id');
    const savedAdminId = localStorage.getItem('km_active_admin_id');

    if (savedRole === 'b2c' && savedEntityId) {
      const u = storageService.getB2CUserById(savedEntityId);
      if (u) {
        setB2cUser(u);
        setRole('b2c');
      }
    } else if (savedRole === 'b2b' && savedEntityId) {
      const b = storageService.getB2BBusinessById(savedEntityId);
      if (b) {
        setB2bBusiness(b);
        setRole('b2b');
      }
    } else if (savedRole === 'admin') {
      let admin = savedAdminId ? storageService.getAdminUserById(savedAdminId) : null;
      if (!admin || admin.status !== 'approved') {
        admin = storageService.getAdminUserById('adm_super_01');
      }
      if (admin && admin.status === 'approved') {
        setCurrentAdminUser(admin);
        setIsAdmin(true);
        setRole('admin');
      }
    }
  }, []);

  const refreshUserData = () => {
    if (b2cUser) {
      const updated = storageService.getB2CUserById(b2cUser.id);
      if (updated) setB2cUser(updated);
    }
    if (b2bBusiness) {
      const updated = storageService.getB2BBusinessById(b2bBusiness.id);
      if (updated) setB2bBusiness(updated);
    }
    if (currentAdminUser) {
      const updated = storageService.getAdminUserById(currentAdminUser.id);
      if (updated) setCurrentAdminUser(updated);
    }
  };

  // Traditional B2C login
  const loginB2C = (emailOrPhone: string): boolean => {
    const found = storageService.getB2CUserByIdentifier(emailOrPhone);
    if (!found) {
      return false;
    }
    setB2cUser(found);
    setB2bBusiness(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setRole('b2c');
    localStorage.setItem('km_active_role', 'b2c');
    localStorage.setItem('km_active_entity_id', found.id);
    localStorage.removeItem('km_active_admin_id');
    return true;
  };

  // Traditional B2B login
  const loginB2B = (email: string): boolean => {
    const businesses = storageService.getB2BBusinesses();
    const found = businesses.find((b) => b.businessEmail.toLowerCase() === email.toLowerCase());
    if (found) {
      setB2bBusiness(found);
      setB2cUser(null);
      setCurrentAdminUser(null);
      setIsAdmin(false);
      setRole('b2b');
      localStorage.setItem('km_active_role', 'b2b');
      localStorage.setItem('km_active_entity_id', found.id);
      localStorage.removeItem('km_active_admin_id');
      return true;
    }
    return false;
  };

  const registerB2C = (data: Partial<B2CUser>): B2CUser => {
    const newUser: B2CUser = {
      id: `usr_${Date.now()}`,
      name: data.name || 'Registered Customer',
      email: data.email || '',
      phone: data.phone || '',
      password: data.password,
      addresses: data.addresses || [],
      createdAt: new Date().toISOString(),
    };
    storageService.saveB2CUser(newUser);
    setB2cUser(newUser);
    setRole('b2c');
    localStorage.setItem('km_active_role', 'b2c');
    localStorage.setItem('km_active_entity_id', newUser.id);
    return newUser;
  };

  const registerB2B = (data: Partial<B2BBusiness>): B2BBusiness => {
    const newBiz: B2BBusiness = {
      id: `biz_${Date.now()}`,
      companyName: data.companyName || 'Registered Enterprise',
      contactPerson: data.contactPerson || 'Authorized Representative',
      businessEmail: data.businessEmail || '',
      mobile: data.mobile || '',
      password: data.password,
      gstin: data.gstin?.toUpperCase() || '',
      pan: data.pan?.toUpperCase() || (data.gstin ? data.gstin.slice(2, 12).toUpperCase() : ''),
      businessType: data.businessType || 'Corporate Office',
      status: 'pending',
      statusReason: 'Documents uploaded. Compliance desk verification underway (SLA: 24h).',
      creditLimit: 0,
      paymentTerms: 'Prepaid',
      registeredAt: new Date().toISOString(),
      accountManager: {
        name: 'Rohan Saxena',
        email: 'rohan.saxena@kognitiminds.com',
        phone: '+91 99100 88221',
        designation: 'Institutional Onboarding Lead',
      },
      billingAddress: data.billingAddress || {
        id: `baddr_${Date.now()}`,
        fullName: data.companyName || 'Registered Office',
        phone: data.mobile || '+91 98000 00000',
        street: 'Commercial Tower, Sector 44',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122003',
        addressType: 'work',
        isDefault: true,
      },
      shippingAddress: data.shippingAddress || {
        id: `saddr_${Date.now()}`,
        fullName: data.companyName || 'Receiving Warehouse',
        phone: data.mobile || '+91 98000 00000',
        street: 'Logistics Facility, Sector 44',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122003',
        addressType: 'work',
        isDefault: true,
      },
      documents: [
        {
          name: `GST_Certificate_${data.gstin || 'Doc'}.pdf`,
          type: 'GST Certificate',
          uploadedAt: new Date().toISOString(),
          status: 'pending',
        },
      ],
    };
    storageService.saveB2BBusiness(newBiz);
    setB2bBusiness(newBiz);
    setRole('b2b');
    localStorage.setItem('km_active_role', 'b2b');
    localStorage.setItem('km_active_entity_id', newBiz.id);
    return newBiz;
  };

  const loginAdmin = () => {
    const superAdmin = storageService.getAdminUserById('adm_super_01');
    if (superAdmin) {
      setCurrentAdminUser(superAdmin);
      localStorage.setItem('km_active_admin_id', superAdmin.id);
    }
    setIsAdmin(true);
    setRole('admin');
    setB2cUser(null);
    setB2bBusiness(null);
    localStorage.setItem('km_active_role', 'admin');
    localStorage.removeItem('km_active_entity_id');
  };

  const loginAdminWithCredentials = (
    identifier: string,
    password: string
  ): { success: boolean; message: string; user?: AdminUser; isPending?: boolean } => {
    const admin = storageService.getAdminUserByIdentifier(identifier);
    if (!admin) {
      return {
        success: false,
        message: 'No administrative account found with this User ID or Work Email.',
      };
    }

    if (admin.password && admin.password !== password) {
      return {
        success: false,
        message: 'Incorrect password entered. Please verify and try again.',
      };
    }

    if (admin.status === 'pending') {
      return {
        success: false,
        isPending: true,
        message:
          'Your administrative registration is currently PENDING review by the Super Admin. You cannot log in until your access is approved.',
        user: admin,
      };
    }

    if (admin.status === 'rejected') {
      return {
        success: false,
        message: `Your administrative request was rejected by the Super Admin. Reason: ${admin.rejectionReason || 'Access denied'}`,
        user: admin,
      };
    }

    // Approved - log in
    setCurrentAdminUser(admin);
    setIsAdmin(true);
    setRole('admin');
    setB2cUser(null);
    setB2bBusiness(null);
    localStorage.setItem('km_active_role', 'admin');
    localStorage.setItem('km_active_admin_id', admin.id);
    localStorage.removeItem('km_active_entity_id');

    return {
      success: true,
      message: `Authentication successful! Welcome, ${admin.name}.`,
      user: admin,
    };
  };

  const registerAdminUser = (data: {
    userId: string;
    name: string;
    email: string;
    password: string;
    role: AdminRole;
    department: string;
  }): { success: boolean; message: string } => {
    const existing = storageService.getAdminUserByIdentifier(data.userId) ||
      storageService.getAdminUserByIdentifier(data.email);

    if (existing) {
      return {
        success: false,
        message: 'A staff account with this User ID or Work Email already exists.',
      };
    }

    const newAdmin: AdminUser = {
      id: `adm_${Date.now()}`,
      userId: data.userId.trim().toLowerCase(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      department: data.department.trim(),
      status: 'pending',
      registeredAt: new Date().toISOString(),
    };

    storageService.saveAdminUser(newAdmin);
    return {
      success: true,
      message:
        'Registration request submitted! Your account is queued for Super Admin review and authorization.',
    };
  };

  const approveAdminUser = (adminId: string): boolean => {
    const updated = storageService.updateAdminStatus(
      adminId,
      'approved',
      undefined,
      currentAdminUser?.userId || 'superadmin'
    );
    if (updated) {
      if (currentAdminUser && currentAdminUser.id === adminId) {
        setCurrentAdminUser(updated);
      }
      return true;
    }
    return false;
  };

  const rejectAdminUser = (adminId: string, reason?: string): boolean => {
    const updated = storageService.updateAdminStatus(
      adminId,
      'rejected',
      reason || 'Authorization declined by Super Admin',
      currentAdminUser?.userId || 'superadmin'
    );
    if (updated) {
      if (currentAdminUser && currentAdminUser.id === adminId) {
        setCurrentAdminUser(updated);
      }
      return true;
    }
    return false;
  };

  // ==========================================
  // FIREBASE AUTHENTICATION ACTIONS EVERYWHERE
  // ==========================================

  const loginB2CWithFirebase = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await firebaseAuthService.loginWithEmail(email, password);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    const users = storageService.getB2CUsers();
    let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // First-time Firebase login on this device: persist verified profile
      found = {
        id: `usr_${Date.now()}`,
        name: res.user?.displayName || email.split('@')[0],
        email: email.toLowerCase(),
        phone: res.user?.phoneNumber || '',
        firebaseUid: res.user?.uid,
        authProvider: 'firebase_email',
        addresses: [],
        createdAt: new Date().toISOString(),
      };
    } else {
      found.firebaseUid = res.user?.uid;
      found.authProvider = 'firebase_email';
      if (password) found.password = password;
    }
    storageService.saveB2CUser(found);

    setB2cUser(found);
    setB2bBusiness(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setRole('b2c');
    localStorage.setItem('km_active_role', 'b2c');
    localStorage.setItem('km_active_entity_id', found.id);
    localStorage.removeItem('km_active_admin_id');
    return { success: true };
  };

  const registerB2CWithFirebase = async (
    data: Partial<B2CUser>,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const email = data.email?.trim() || '';
    const res = await firebaseAuthService.registerWithEmail(email, password, data.name);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    const newUser: B2CUser = {
      id: `usr_${Date.now()}`,
      name: data.name || email.split('@')[0],
      email,
      phone: data.phone || '+91 98000 11223',
      password,
      firebaseUid: res.user?.uid,
      authProvider: 'firebase_email',
      addresses: data.addresses || [],
      createdAt: new Date().toISOString(),
    };
    storageService.saveB2CUser(newUser);

    setB2cUser(newUser);
    setB2bBusiness(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setRole('b2c');
    localStorage.setItem('km_active_role', 'b2c');
    localStorage.setItem('km_active_entity_id', newUser.id);
    localStorage.removeItem('km_active_admin_id');
    return { success: true };
  };

  const loginB2BWithFirebase = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await firebaseAuthService.loginWithEmail(email, password);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    const businesses = storageService.getB2BBusinesses();
    const found = businesses.find((b) => b.businessEmail.toLowerCase() === email.toLowerCase());
    if (found) {
      found.firebaseUid = res.user?.uid;
      found.authProvider = 'firebase_email';
      if (password) found.password = password;
      storageService.saveB2BBusiness(found);

      setB2bBusiness(found);
      setB2cUser(null);
      setCurrentAdminUser(null);
      setIsAdmin(false);
      setRole('b2b');
      localStorage.setItem('km_active_role', 'b2b');
      localStorage.setItem('km_active_entity_id', found.id);
      localStorage.removeItem('km_active_admin_id');
      return { success: true };
    }

    return {
      success: false,
      error: 'Authenticated with Firebase, but no matching institutional business account exists for this corporate email. Please complete corporate registration.',
    };
  };

  const registerB2BWithFirebase = async (
    bizData: Partial<B2BBusiness>,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const email = bizData.businessEmail?.trim() || '';
    const res = await firebaseAuthService.registerWithEmail(email, password, bizData.companyName);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    const newBiz: B2BBusiness = {
      id: `biz_${Date.now()}`,
      companyName: bizData.companyName || 'Enterprise Client',
      contactPerson: bizData.contactPerson || 'Authorized Representative',
      businessEmail: email,
      mobile: bizData.mobile || '+91 98000 00000',
      password,
      firebaseUid: res.user?.uid,
      authProvider: 'firebase_email',
      gstin: bizData.gstin?.toUpperCase() || '29AAAAA0000A1Z5',
      pan: bizData.pan?.toUpperCase() || (bizData.gstin ? bizData.gstin.slice(2, 12).toUpperCase() : 'AAAAA0000A'),
      businessType: bizData.businessType || 'Corporate Office',
      status: 'pending',
      statusReason: 'Documents uploaded. Compliance desk verification underway (SLA: 24h).',
      creditLimit: 0,
      paymentTerms: 'Prepaid',
      registeredAt: new Date().toISOString(),
      accountManager: {
        name: 'Rohan Saxena',
        email: 'rohan.saxena@kognitiminds.com',
        phone: '+91 99100 88221',
        designation: 'Institutional Onboarding Lead',
      },
      billingAddress: bizData.billingAddress || {
        id: `baddr_${Date.now()}`,
        fullName: bizData.companyName || 'Registered Office',
        phone: bizData.mobile || '+91 98000 00000',
        street: 'Commercial Tower, Sector 44',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122003',
        addressType: 'work',
        isDefault: true,
      },
      shippingAddress: bizData.shippingAddress || {
        id: `saddr_${Date.now()}`,
        fullName: bizData.companyName || 'Receiving Warehouse',
        phone: bizData.mobile || '+91 98000 00000',
        street: 'Logistics Facility, Sector 44',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122003',
        addressType: 'work',
        isDefault: true,
      },
      documents: [
        {
          name: `GST_Certificate_${bizData.gstin || 'Doc'}.pdf`,
          type: 'GST Certificate',
          uploadedAt: new Date().toISOString(),
          status: 'pending',
        },
      ],
    };

    storageService.saveB2BBusiness(newBiz);
    setB2bBusiness(newBiz);
    setB2cUser(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setRole('b2b');
    localStorage.setItem('km_active_role', 'b2b');
    localStorage.setItem('km_active_entity_id', newBiz.id);
    localStorage.removeItem('km_active_admin_id');
    return { success: true };
  };

  const loginAdminWithFirebase = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: AdminUser; isPending?: boolean }> => {
    // 1. Check local admin record first for permissions & credentials
    const admin = storageService.getAdminUserByIdentifier(identifier);
    if (!admin) {
      return {
        success: false,
        message: 'No administrative account found with this User ID or Work Email.',
      };
    }

    if (admin.password && admin.password !== password) {
      return {
        success: false,
        message: 'Incorrect password entered. Please verify and try again.',
      };
    }

    if (admin.status === 'pending') {
      return {
        success: false,
        isPending: true,
        message: 'Your administrative registration is pending review by the Super Admin.',
        user: admin,
      };
    }

    if (admin.status === 'rejected') {
      return {
        success: false,
        message: `Your request was rejected. Reason: ${admin.rejectionReason || 'Access denied'}`,
        user: admin,
      };
    }

    // 2. Synchronize with Firebase session if email format
    if (admin.email && admin.email.includes('@')) {
      try {
        const fbRes = await firebaseAuthService.loginWithEmail(admin.email, password);
        if (fbRes.user) {
          admin.firebaseUid = fbRes.user.uid;
          admin.authProvider = 'firebase_email';
          storageService.saveAdminUser(admin);
        }
      } catch {
        // Fallback gracefully to local admin login
      }
    }

    setCurrentAdminUser(admin);
    setIsAdmin(true);
    setRole('admin');
    setB2cUser(null);
    setB2bBusiness(null);
    localStorage.setItem('km_active_role', 'admin');
    localStorage.setItem('km_active_admin_id', admin.id);
    localStorage.removeItem('km_active_entity_id');

    return {
      success: true,
      message: `Firebase & Master Authentication successful! Welcome, ${admin.name}.`,
      user: admin,
    };
  };

  const loginWithGoogle = async (
    portal: 'b2c' | 'b2b'
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await firebaseAuthService.signInWithGoogle();
    if (!res.success || !res.user) {
      return { success: false, error: res.error || 'Google Sign-In failed.' };
    }

    const email = res.user.email || 'user@kognitiminds.com';
    const name = res.user.displayName || email.split('@')[0];
    const photoURL = res.user.photoURL || undefined;

    if (portal === 'b2c') {
      const users = storageService.getB2CUsers();
      let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          id: `usr_${Date.now()}`,
          name,
          email,
          phone: res.user.phoneNumber || '+91 98765 00000',
          firebaseUid: res.user.uid,
          authProvider: 'firebase_google',
          avatarUrl: photoURL,
          createdAt: new Date().toISOString(),
          addresses: [],
        };
      } else {
        user.firebaseUid = res.user.uid;
        user.authProvider = 'firebase_google';
        if (photoURL) user.avatarUrl = photoURL;
      }
      storageService.saveB2CUser(user);

      setB2cUser(user);
      setB2bBusiness(null);
      setCurrentAdminUser(null);
      setIsAdmin(false);
      setRole('b2c');
      localStorage.setItem('km_active_role', 'b2c');
      localStorage.setItem('km_active_entity_id', user.id);
      localStorage.removeItem('km_active_admin_id');
      return { success: true };
    } else {
      // B2B Google Login
      const businesses = storageService.getB2BBusinesses();
      let biz = businesses.find((b) => b.businessEmail.toLowerCase() === email.toLowerCase());
      if (!biz) {
        // Create initial pending B2B profile from Google
        const domain = email.split('@')[1] || 'enterprise.com';
        const companyGuess = domain.split('.')[0].toUpperCase() + ' Pvt Ltd';
        biz = {
          id: `biz_${Date.now()}`,
          companyName: companyGuess,
          contactPerson: name,
          businessEmail: email,
          mobile: res.user.phoneNumber || '+91 98000 00000',
          gstin: '09AALCK4750F1ZC',
          pan: 'AALCK4750F',
          businessType: 'Corporate Office',
          status: 'pending',
          statusReason: 'Signed in via Google Workspace. Complete verification profile.',
          creditLimit: 0,
          paymentTerms: 'Prepaid',
          registeredAt: new Date().toISOString(),
          firebaseUid: res.user.uid,
          authProvider: 'firebase_google',
          avatarUrl: photoURL,
          accountManager: {
            name: 'Rohan Saxena',
            email: 'rohan.saxena@kognitiminds.com',
            phone: '+91 99100 88221',
            designation: 'Institutional Onboarding Lead',
          },
          billingAddress: {
            id: `baddr_${Date.now()}`,
            fullName: companyGuess,
            phone: '+91 98000 00000',
            street: 'Commercial Zone',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201306',
            addressType: 'work',
            isDefault: true,
          },
          shippingAddress: {
            id: `saddr_${Date.now()}`,
            fullName: companyGuess,
            phone: '+91 98000 00000',
            street: 'Commercial Zone',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201306',
            addressType: 'work',
            isDefault: true,
          },
          documents: [],
        };
      } else {
        biz.firebaseUid = res.user.uid;
        biz.authProvider = 'firebase_google';
        if (photoURL) biz.avatarUrl = photoURL;
      }
      storageService.saveB2BBusiness(biz);

      setB2bBusiness(biz);
      setB2cUser(null);
      setCurrentAdminUser(null);
      setIsAdmin(false);
      setRole('b2b');
      localStorage.setItem('km_active_role', 'b2b');
      localStorage.setItem('km_active_entity_id', biz.id);
      localStorage.removeItem('km_active_admin_id');
      return { success: true };
    }
  };

  const sendFirebasePasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    return firebaseAuthService.sendPasswordReset(email);
  };

  // ==========================================
  // PRODUCTION EMAIL OTP VERIFICATION SYSTEM
  // ==========================================

  const sendEmailOtp = async (
    email: string,
    purpose: 'login' | 'register' | 'reset' | 'general' = 'general'
  ): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> => {
    return emailOtpService.sendOtp(email, purpose);
  };

  const verifyEmailOtp = (
    email: string,
    otp: string,
    purpose: 'login' | 'register' | 'reset' | 'general' = 'general'
  ): { success: boolean; message: string } => {
    return emailOtpService.verifyOtp(email, otp, purpose);
  };

  const loginB2CWithEmailOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const verification = emailOtpService.verifyOtp(cleanEmail, otp, 'login');
    if (!verification.success) {
      return { success: false, error: verification.message };
    }

    const users = storageService.getB2CUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        error: 'No customer account registered with this email. Please sign up first.',
      };
    }

    setB2cUser(found);
    setB2bBusiness(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setRole('b2c');
    localStorage.setItem('km_active_role', 'b2c');
    localStorage.setItem('km_active_entity_id', found.id);
    localStorage.removeItem('km_active_admin_id');
    return { success: true };
  };

  const loginB2BWithEmailOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const verification = emailOtpService.verifyOtp(cleanEmail, otp, 'login');
    if (!verification.success) {
      return { success: false, error: verification.message };
    }

    const businesses = storageService.getB2BBusinesses();
    const found = businesses.find((b) => b.businessEmail.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        error: 'No corporate business account found with this email. Please complete corporate registration.',
      };
    }

    setB2bBusiness(found);
    setB2cUser(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setRole('b2b');
    localStorage.setItem('km_active_role', 'b2b');
    localStorage.setItem('km_active_entity_id', found.id);
    localStorage.removeItem('km_active_admin_id');
    return { success: true };
  };

  const registerB2CWithEmailOtp = async (
    data: Partial<B2CUser>,
    otp: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const email = data.email?.trim().toLowerCase() || '';
    if (!email) {
      return { success: false, error: 'Valid email address is required.' };
    }

    const verification = emailOtpService.verifyOtp(email, otp, 'register');
    if (!verification.success) {
      return { success: false, error: verification.message };
    }

    const existing = storageService.getB2CUserByIdentifier(email);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    let firebaseUid: string | undefined;
    if (password && isFirebaseConfigured()) {
      const fbRes = await firebaseAuthService.registerWithEmail(email, password, data.name);
      if (fbRes.success && fbRes.user) {
        firebaseUid = fbRes.user.uid;
      }
    }

    const newUser: B2CUser = {
      id: `usr_${Date.now()}`,
      name: data.name?.trim() || email.split('@')[0],
      email,
      phone: data.phone?.trim() || '',
      password: password || undefined,
      firebaseUid,
      authProvider: firebaseUid ? 'firebase_email' : 'email_otp',
      addresses: data.addresses || [],
      createdAt: new Date().toISOString(),
    };

    storageService.saveB2CUser(newUser);
    setB2cUser(newUser);
    setB2bBusiness(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setRole('b2c');
    localStorage.setItem('km_active_role', 'b2c');
    localStorage.setItem('km_active_entity_id', newUser.id);
    localStorage.removeItem('km_active_admin_id');
    return { success: true };
  };

  const registerB2BWithEmailOtp = async (
    bizData: Partial<B2BBusiness>,
    otp: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const email = bizData.businessEmail?.trim().toLowerCase() || '';
    if (!email) {
      return { success: false, error: 'Valid corporate email address is required.' };
    }

    const verification = emailOtpService.verifyOtp(email, otp, 'register');
    if (!verification.success) {
      return { success: false, error: verification.message };
    }

    const businesses = storageService.getB2BBusinesses();
    if (businesses.some((b) => b.businessEmail.toLowerCase() === email)) {
      return { success: false, error: 'A business account with this email is already registered.' };
    }

    let firebaseUid: string | undefined;
    if (password && isFirebaseConfigured()) {
      const fbRes = await firebaseAuthService.registerWithEmail(email, password, bizData.companyName);
      if (fbRes.success && fbRes.user) {
        firebaseUid = fbRes.user.uid;
      }
    }

    const newBiz: B2BBusiness = {
      id: `biz_${Date.now()}`,
      companyName: bizData.companyName?.trim() || 'Registered Enterprise',
      contactPerson: bizData.contactPerson?.trim() || 'Authorized Representative',
      businessEmail: email,
      mobile: bizData.mobile?.trim() || '',
      password: password || undefined,
      firebaseUid,
      authProvider: firebaseUid ? 'firebase_email' : 'email_otp',
      gstin: bizData.gstin?.toUpperCase() || '',
      pan: bizData.pan?.toUpperCase() || (bizData.gstin ? bizData.gstin.slice(2, 12).toUpperCase() : ''),
      businessType: bizData.businessType || 'Corporate Office',
      status: 'pending',
      statusReason: 'Documents uploaded. Compliance desk verification underway (SLA: 24h).',
      creditLimit: 0,
      paymentTerms: 'Prepaid',
      registeredAt: new Date().toISOString(),
      accountManager: {
        name: 'Rohan Saxena',
        email: 'rohan.saxena@kognitiminds.com',
        phone: '+91 99100 88221',
        designation: 'Institutional Onboarding Lead',
      },
      billingAddress: bizData.billingAddress || {
        id: `baddr_${Date.now()}`,
        fullName: bizData.companyName || 'Registered Office',
        phone: bizData.mobile || '',
        street: 'Commercial Tower, Sector 44',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122003',
        addressType: 'work',
        isDefault: true,
      },
      shippingAddress: bizData.shippingAddress || {
        id: `saddr_${Date.now()}`,
        fullName: bizData.companyName || 'Receiving Warehouse',
        phone: bizData.mobile || '',
        street: 'Logistics Facility, Sector 44',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122003',
        addressType: 'work',
        isDefault: true,
      },
      documents: [
        {
          name: `GST_Certificate_${bizData.gstin || 'Doc'}.pdf`,
          type: 'GST Certificate',
          uploadedAt: new Date().toISOString(),
          status: 'pending',
        },
      ],
    };

    storageService.saveB2BBusiness(newBiz);
    setB2bBusiness(newBiz);
    setB2cUser(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setRole('b2b');
    localStorage.setItem('km_active_role', 'b2b');
    localStorage.setItem('km_active_entity_id', newBiz.id);
    localStorage.removeItem('km_active_admin_id');
    return { success: true };
  };

  const resetPasswordWithEmailOtp = async (
    email: string,
    otp: string,
    newPassword: string,
    userType: 'b2c' | 'b2b' | 'admin' = 'b2c'
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const verification = emailOtpService.verifyOtp(cleanEmail, otp, 'reset');
    if (!verification.success) {
      return { success: false, message: verification.message };
    }

    if (userType === 'b2c') {
      const users = storageService.getB2CUsers();
      const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return { success: false, message: 'No consumer account found with this email address.' };
      }
      user.password = newPassword;
      storageService.saveB2CUser(user);
    } else if (userType === 'b2b') {
      const businesses = storageService.getB2BBusinesses();
      const biz = businesses.find((b) => b.businessEmail.toLowerCase() === cleanEmail);
      if (!biz) {
        return { success: false, message: 'No institutional account found with this corporate email.' };
      }
      biz.password = newPassword;
      storageService.saveB2BBusiness(biz);
    } else if (userType === 'admin') {
      const admins = storageService.getAdminUsers();
      const adm = admins.find((a) => a.email.toLowerCase() === cleanEmail);
      if (!adm) {
        return { success: false, message: 'No administrative account found with this email address.' };
      }
      adm.password = newPassword;
      storageService.saveAdminUser(adm);
    }

    // If Firebase is live, also trigger password reset email link
    if (isFirebaseConfigured()) {
      try {
        await firebaseAuthService.sendPasswordReset(cleanEmail);
      } catch {
        // Graceful fallback
      }
    }

    return {
      success: true,
      message: 'Password has been successfully updated. You can now log in securely with your new password.',
    };
  };

  const logout = async () => {
    await firebaseAuthService.logout();
    setRole('guest');
    setB2cUser(null);
    setB2bBusiness(null);
    setCurrentAdminUser(null);
    setIsAdmin(false);
    setFirebaseUser(null);
    localStorage.removeItem('km_active_role');
    localStorage.removeItem('km_active_entity_id');
    localStorage.removeItem('km_active_admin_id');
  };

  const quickSwitch = (
    target: 'guest' | 'b2c' | 'b2b_approved' | 'b2b_pending' | 'admin' | 'superadmin' | 'ops_admin'
  ) => {
    if (target === 'guest') {
      logout();
    } else if (target === 'b2c') {
      const users = storageService.getB2CUsers();
      const first = users[0];
      if (first) {
        setB2cUser(first);
        setB2bBusiness(null);
        setCurrentAdminUser(null);
        setIsAdmin(false);
        setRole('b2c');
        localStorage.setItem('km_active_role', 'b2c');
        localStorage.setItem('km_active_entity_id', first.id);
        localStorage.removeItem('km_active_admin_id');
      }
    } else if (target === 'b2b_approved') {
      const businesses = storageService.getB2BBusinesses();
      const approved = businesses.find((b) => b.status === 'approved') || businesses[0];
      if (approved) {
        setB2bBusiness(approved);
        setB2cUser(null);
        setCurrentAdminUser(null);
        setIsAdmin(false);
        setRole('b2b');
        localStorage.setItem('km_active_role', 'b2b');
        localStorage.setItem('km_active_entity_id', approved.id);
        localStorage.removeItem('km_active_admin_id');
      }
    } else if (target === 'b2b_pending') {
      const businesses = storageService.getB2BBusinesses();
      const pending = businesses.find((b) => b.status === 'pending');
      if (pending) {
        setB2bBusiness(pending);
        setB2cUser(null);
        setCurrentAdminUser(null);
        setIsAdmin(false);
        setRole('b2b');
        localStorage.setItem('km_active_role', 'b2b');
        localStorage.setItem('km_active_entity_id', pending.id);
        localStorage.removeItem('km_active_admin_id');
      }
    } else if (target === 'admin' || target === 'superadmin') {
      const superAdmin = storageService.getAdminUserById('adm_super_01');
      if (superAdmin) {
        setCurrentAdminUser(superAdmin);
        localStorage.setItem('km_active_admin_id', superAdmin.id);
      }
      setIsAdmin(true);
      setRole('admin');
      setB2cUser(null);
      setB2bBusiness(null);
      localStorage.setItem('km_active_role', 'admin');
      localStorage.removeItem('km_active_entity_id');
    } else if (target === 'ops_admin') {
      const admins = storageService.getAdminUsers();
      const opsAdmin = admins.find((a) => a.role === 'operations_admin');
      if (opsAdmin) {
        setCurrentAdminUser(opsAdmin);
        localStorage.setItem('km_active_admin_id', opsAdmin.id);
      }
      setIsAdmin(true);
      setRole('admin');
      setB2cUser(null);
      setB2bBusiness(null);
      localStorage.setItem('km_active_role', 'admin');
      localStorage.removeItem('km_active_entity_id');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        b2cUser,
        b2bBusiness,
        currentAdminUser,
        isAdmin,
        isSuperAdmin,
        isFirebaseLive,
        firebaseUser,
        loginB2C,
        loginB2B,
        registerB2C,
        registerB2B,
        loginAdmin,
        loginAdminWithCredentials,
        registerAdminUser,
        approveAdminUser,
        rejectAdminUser,
        logout,
        quickSwitch,
        refreshUserData,
        loginB2CWithFirebase,
        registerB2CWithFirebase,
        loginB2BWithFirebase,
        registerB2BWithFirebase,
        loginAdminWithFirebase,
        loginWithGoogle,
        sendFirebasePasswordReset,
        sendEmailOtp,
        verifyEmailOtp,
        loginB2CWithEmailOtp,
        loginB2BWithEmailOtp,
        registerB2CWithEmailOtp,
        registerB2BWithEmailOtp,
        resetPasswordWithEmailOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
