import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  BarChart3,
  Activity
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const features = [
  {
    icon: Users,
    title: 'Worker Management',
    description: 'Track and manage your workforce efficiently with real-time updates'
  },
  {
    icon: Calendar,
    title: 'Auto Attendance',
    description: 'Automated expense tracking when marking attendance'
  },
  {
    icon: DollarSign,
    title: 'Smart Payroll',
    description: 'Automatic payroll calculations and budget updates'
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description: 'Real-time dashboards with beautiful charts'
  },
  {
    icon: Activity,
    title: 'Activity Tracking',
    description: 'Monitor all system activities and changes'
  },
  {
    icon: TrendingUp,
    title: 'Budget Control',
    description: 'Keep projects within budget with auto-sync'
  }
];

const stats = [
  { value: '500+', label: 'Projects Managed' },
  { value: '10K+', label: 'Workers Tracked' },
  { value: '$50M+', label: 'Payroll Processed' },
  { value: '99.9%', label: 'Uptime' }
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 gradient-dark opacity-50" />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Build Smarter.
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">
                Manage Better.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              The all-in-one Construction Management System to track workers, 
              automate payroll, manage budgets, and grow your projects with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View Dashboard Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to manage your construction business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="p-6 glass hover:shadow-2xl transition-all duration-300 h-full">
                  <div className="p-3 rounded-xl bg-gradient-primary w-fit mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Card className="p-12 glass">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of construction companies managing smarter.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Trial
              </Button>
            </Link>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2025 Consty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
