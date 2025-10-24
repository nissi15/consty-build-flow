import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OwnerContextType {
  isOwner: boolean;
  ownerCode: string | null;
  ownerName: string | null;
  managerId: string | null;
  loginAsOwner: (code: string) => Promise<boolean>;
  logoutOwner: () => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [isOwner, setIsOwner] = useState(false);
  const [ownerCode, setOwnerCode] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);

  useEffect(() => {
    // Check if owner is logged in from localStorage
    const savedOwnerData = localStorage.getItem('owner_session');
    if (savedOwnerData) {
      const data = JSON.parse(savedOwnerData);
      setIsOwner(true);
      setOwnerCode(data.code);
      setOwnerName(data.name);
      setManagerId(data.managerId);
    }
  }, []);

  const loginAsOwner = async (code: string): Promise<boolean> => {
    try {
      // Verify the code
      const { data, error } = await supabase
        .from('owner_access_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return false;
      }

      // Update access count and last accessed time
      await supabase
        .from('owner_access_codes')
        .update({
          access_count: (data.access_count || 0) + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      // Save to state and localStorage
      const ownerData = {
        code: data.code,
        name: data.owner_name,
        managerId: data.manager_id,
      };

      setIsOwner(true);
      setOwnerCode(data.code);
      setOwnerName(data.owner_name);
      setManagerId(data.manager_id);
      localStorage.setItem('owner_session', JSON.stringify(ownerData));

      return true;
    } catch (error) {
      console.error('Owner login error:', error);
      return false;
    }
  };

  const logoutOwner = () => {
    setIsOwner(false);
    setOwnerCode(null);
    setOwnerName(null);
    setManagerId(null);
    localStorage.removeItem('owner_session');
  };

  return (
    <OwnerContext.Provider
      value={{
        isOwner,
        ownerCode,
        ownerName,
        managerId,
        loginAsOwner,
        logoutOwner,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (context === undefined) {
    throw new Error('useOwner must be used within an OwnerProvider');
  }
  return context;
}

