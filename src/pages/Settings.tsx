import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Palette, Crown, Copy, Check, Trash2, Plus, Database, Loader2, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { seedDemoPortfolio, type DemoSeedResult } from '@/lib/demo-data';

interface OwnerCode {
  id: string;
  code: string;
  owner_name: string;
  owner_phone: string;
  is_active: boolean;
  access_count: number;
  last_accessed_at: string | null;
  created_at: string;
}

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [ownerCodes, setOwnerCodes] = useState<OwnerCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState('');
  const [demoResult, setDemoResult] = useState<DemoSeedResult | null>(null);
  const [newOwner, setNewOwner] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    fetchOwnerCodes();
  }, []);

  const fetchOwnerCodes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('owner_access_codes')
        .select('*')
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOwnerCodes(data || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    }
  };

  const generateCode = async () => {
    if (!user || !newOwner.name || !newOwner.phone) {
      toast.error('Please enter owner name and phone');
      return;
    }

    // Check if there's already an active code
    const hasActiveCode = ownerCodes.some(code => code.is_active);
    if (hasActiveCode) {
      toast.error('You already have an active code. Please revoke it first to generate a new one.');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const { error } = await supabase
        .from('owner_access_codes')
        .insert({
          code,
          manager_id: user.id,
          owner_name: newOwner.name,
          owner_phone: newOwner.phone,
          is_active: true,
        });

      if (error) throw error;

      toast.success(`Code ${code} generated for ${newOwner.name}!`);
      setNewOwner({ name: '', phone: '' });
      setIsDialogOpen(false); // Auto-close dialog
      fetchOwnerCodes();
    } catch (error: unknown) {
      console.error('Error generating code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const revokeCode = async (id: string, ownerName: string) => {
    try {
      const { error } = await supabase
        .from('owner_access_codes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Access revoked for ${ownerName}`);
      fetchOwnerCodes();
    } catch (error) {
      console.error('Error revoking code:', error);
      toast.error('Failed to revoke access');
    }
  };

  const loadDemoPortfolio = async () => {
    const confirmed = window.confirm(
      'Refresh the 11-month complexity demo? This updates the generated demo records while preserving manually entered records.',
    );
    if (!confirmed) return;

    setIsSeedingDemo(true);
    setDemoResult(null);
    setDemoProgress('Preparing the Musanze Town Buildings portfolio…');
    try {
      const result = await seedDemoPortfolio(setDemoProgress);
      setDemoResult(result);
      toast.success('The 11-month demo portfolio is ready.');
    } catch (error: unknown) {
      console.error('Error loading demo portfolio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load the demo portfolio');
      setDemoProgress('The load stopped. You can safely retry; completed records will be reused.');
    } finally {
      setIsSeedingDemo(false);
    }
  };

  return (
    <div className="min-h-full space-y-6 bg-background p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#73777f]">
          <MapPin className="h-3.5 w-3.5" /> Rwanda · Musanze District · Musanze Town Buildings
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#111214] dark:text-[#f5f5f7] sm:text-4xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage project access, appearance and demonstration data.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden border-black bg-black text-white shadow-[0_18px_60px_rgba(0,0,0,0.14)] dark:border-[#292b2f]">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
              <div>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Complexity demo</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Load 11 months of realistic project operations</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
                  Adds 90 Rwandan workers, six-day attendance history, monthly payroll, detailed construction materials,
                  operating expenses and a RWF 500M project budget. Manually entered records remain untouched.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
                  {['90 abbreviated names', '11 months', '14k+ attendance rows', '990 payroll rows', '528 cost entries', 'RWF 500M budget'].map((item) => (
                    <span key={item} className="rounded-full border border-white/15 px-3 py-1.5">{item}</span>
                  ))}
                </div>
                {(demoProgress || demoResult) && (
                  <div className="mt-5 border-l-2 border-white/70 pl-3 text-sm text-white/75" aria-live="polite">
                    {demoResult
                      ? `${demoResult.workers} workers, ${demoResult.attendance.toLocaleString()} attendance records, ${demoResult.payroll.toLocaleString()} payroll records and ${demoResult.expenses} expenses are ready.`
                      : demoProgress}
                  </div>
                )}
              </div>
              <Button
                onClick={loadDemoPortfolio}
                disabled={isSeedingDemo}
                className="h-12 min-w-56 bg-white px-6 font-semibold text-black hover:bg-[#f0f1f2]"
              >
                {isSeedingDemo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                {isSeedingDemo ? 'Refreshing portfolio…' : 'Refresh demo portfolio'}
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="h-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-tile p-2.5">
                <Palette className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">Appearance</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="h-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-tile p-2.5">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">Signed-in account</h3>
            </div>
            <div className="surface-row p-4">
              <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</Label>
              <p className="mt-2 font-medium">{user?.email || 'No account email available'}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Password changes and recovery are handled through Supabase authentication so credentials are never stored in this interface.
            </p>
          </Card>
        </motion.div>

        {/* Owner Access Codes Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-tile p-2.5">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Owner Access Codes</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate codes for building owners to view project progress
                  </p>
                </div>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="gap-2"
                    disabled={ownerCodes.some(code => code.is_active)}
                  >
                    <Plus className="h-4 w-4" />
                    {ownerCodes.some(code => code.is_active) ? 'Code Already Active' : 'Generate Code'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Owner Access Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input
                        id="ownerName"
                        value={newOwner.name}
                        onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                        placeholder="e.g., John Doe"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerPhone">Owner Phone *</Label>
                      <Input
                        id="ownerPhone"
                        value={newOwner.phone}
                        onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                        placeholder="e.g., +250 788 123 456"
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={generateCode} 
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? 'Generating...' : 'Generate 6-Digit Code'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      A 6-digit code will be generated. Share it with the owner via WhatsApp, SMS, or email.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Codes List */}
            <div className="space-y-3">
              {ownerCodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No access codes generated yet</p>
                  <p className="text-sm mt-1">Click "Generate Code" to create one</p>
                </div>
              ) : (
                ownerCodes.map((ownerCode) => (
                  <motion.div
                    key={ownerCode.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="surface-row p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-[#111214] dark:text-[#f5f5f7]">
                            {ownerCode.owner_name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={
                              ownerCode.is_active
                                ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                            }
                          >
                            {ownerCode.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{ownerCode.owner_phone}</span>
                          <span>•</span>
                          <span>Accessed {ownerCode.access_count} times</span>
                          {ownerCode.last_accessed_at && (
                            <>
                              <span>•</span>
                              <span>Last: {format(new Date(ownerCode.last_accessed_at), 'MMM dd, yyyy')}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Code Display */}
                        <div className="flex items-center gap-2 rounded-lg border border-[#e2e4e7] bg-white px-4 py-2 dark:border-[#292b2f] dark:bg-[#111214]">
                          <code className="font-mono text-2xl font-bold tracking-widest text-[#0071e3] dark:text-[#69a8ff]">
                            {ownerCode.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(ownerCode.code)}
                            className="h-8 w-8 p-0"
                          >
                            {copiedCode === ownerCode.code ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Revoke Button */}
                        {ownerCode.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeCode(ownerCode.id, ownerCode.owner_name)}
                            className="gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="h-4 w-4" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
