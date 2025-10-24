import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Crown, Copy, Check, Trash2, Plus } from 'lucide-react';
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
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast.error(error.message || 'Failed to generate code');
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

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <User className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Profile Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input placeholder="John Doe" className="mt-2" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="john@example.com" className="mt-2" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="tel" placeholder="+1 (555) 000-0000" className="mt-2" />
              </div>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-6 glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Palette className="h-5 w-5 text-white" />
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
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payroll Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about payroll updates
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Budget Warnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when approaching budget limits
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-6 glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Security</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input type="password" className="mt-2" />
              </div>
              <div>
                <Label>New Password</Label>
                <Input type="password" className="mt-2" />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input type="password" className="mt-2" />
              </div>
              <Button>Update Password</Button>
            </div>
          </Card>
        </motion.div>

        {/* Owner Access Codes Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
                  <Crown className="h-5 w-5 text-white" />
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
                    className="gap-2 bg-purple-500 hover:bg-purple-600"
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
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
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
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
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
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <code className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-widest">
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
