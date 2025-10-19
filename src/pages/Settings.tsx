import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

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
      </div>
    </div>
  );
};

export default Settings;
