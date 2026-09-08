import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, B2CUser, B2BBusiness } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  role: UserRole;
  b2cUser: B2CUser | null;
  b2bBusiness: B2BBusiness | null;
  isAdmin: boolean;
  loginB2C: (email: string) => boolean;
  loginB2B: (email: string) => boolean;
  registerB2C: (user: Partial<B2CUser>) => B2CUser;
  registerB2B: (biz: Partial<B2BBusiness>) => B2BBusiness;
  loginAdmin: () => void;
  logout: () => void;
  quickSwitch: (target: 'guest' | 'b2c' | 'b2b_approved' | 'b2b_pending' | 'admin') => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('guest');
  const [b2cUser, setB2cUser] = useState<B2CUser | null>(null);
  const [b2bBusiness, setB2bBusiness] = useState<B2BBusiness | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check saved session
    const savedRole = localStorage.getItem('km_active_role') as UserRole | null;
    const savedEntityId = localStorage.getItem('km_active_entity_id');

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
      setIsAdmin(true);
      setRole('admin');
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
  };

  const loginB2C = (email: string): boolean => {
    const users = storageService.getB2CUsers();
    let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // Auto-create for demo convenience if new
      found = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        phone: '+91 98765 00000',
        createdAt: new Date().toISOString(),
        addresses: [
          {
            id: `addr_${Date.now()}`,
            fullName: email.split('@')[0],
            phone: '+91 98765 00000',
            street: '12th Main, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
            isDefault: true,
            addressType: 'home',
          },
        ],
      };
      storageService.saveB2CUser(found);
    }
    setB2cUser(found);
    setB2bBusiness(null);
    setIsAdmin(false);
    setRole('b2c');
    localStorage.setItem('km_active_role', 'b2c');
    localStorage.setItem('km_active_entity_id', found.id);
    return true;
  };

  const loginB2B = (email: string): boolean => {
    const businesses = storageService.getB2BBusinesses();
    const found = businesses.find((b) => b.businessEmail.toLowerCase() === email.toLowerCase());
    if (found) {
      setB2bBusiness(found);
      setB2cUser(null);
      setIsAdmin(false);
      setRole('b2b');
      localStorage.setItem('km_active_role', 'b2b');
      localStorage.setItem('km_active_entity_id', found.id);
      return true;
    }
    return false;
  };

  const registerB2C = (data: Partial<B2CUser>): B2CUser => {
    const newUser: B2CUser = {
      id: `usr_${Date.now()}`,
      name: data.name || 'Valued Customer',
      email: data.email || 'customer@kognitiminds.com',
      phone: data.phone || '+91 98000 11223',
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
      companyName: data.companyName || 'Enterprise Client',
      contactPerson: data.contactPerson || 'Authorized Representative',
      businessEmail: data.businessEmail || 'procurement@company.com',
      mobile: data.mobile || '+91 98000 00000',
      gstin: data.gstin?.toUpperCase() || '29AAAAA0000A1Z5',
      pan: data.pan?.toUpperCase() || (data.gstin ? data.gstin.slice(2, 12).toUpperCase() : 'AAAAA0000A'),
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
    setIsAdmin(true);
    setRole('admin');
    setB2cUser(null);
    setB2bBusiness(null);
    localStorage.setItem('km_active_role', 'admin');
    localStorage.removeItem('km_active_entity_id');
  };

  const logout = () => {
    setRole('guest');
    setB2cUser(null);
    setB2bBusiness(null);
    setIsAdmin(false);
    localStorage.removeItem('km_active_role');
    localStorage.removeItem('km_active_entity_id');
  };

  const quickSwitch = (target: 'guest' | 'b2c' | 'b2b_approved' | 'b2b_pending' | 'admin') => {
    if (target === 'guest') {
      logout();
    } else if (target === 'b2c') {
      const demo = storageService.getB2CUserById('usr_b2c_demo');
      if (demo) {
        setB2cUser(demo);
        setB2bBusiness(null);
        setIsAdmin(false);
        setRole('b2c');
        localStorage.setItem('km_active_role', 'b2c');
        localStorage.setItem('km_active_entity_id', demo.id);
      }
    } else if (target === 'b2b_approved') {
      const biz = storageService.getB2BBusinessById('biz_edutech');
      if (biz) {
        setB2bBusiness(biz);
        setB2cUser(null);
        setIsAdmin(false);
        setRole('b2b');
        localStorage.setItem('km_active_role', 'b2b');
        localStorage.setItem('km_active_entity_id', biz.id);
      }
    } else if (target === 'b2b_pending') {
      const biz = storageService.getB2BBusinessById('biz_innovate');
      if (biz) {
        setB2bBusiness(biz);
        setB2cUser(null);
        setIsAdmin(false);
        setRole('b2b');
        localStorage.setItem('km_active_role', 'b2b');
        localStorage.setItem('km_active_entity_id', biz.id);
      }
    } else if (target === 'admin') {
      loginAdmin();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        b2cUser,
        b2bBusiness,
        isAdmin,
        loginB2C,
        loginB2B,
        registerB2C,
        registerB2B,
        loginAdmin,
        logout,
        quickSwitch,
        refreshUserData,
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
