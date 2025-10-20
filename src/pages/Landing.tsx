import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Users, DollarSign, TrendingUp, Clock, CheckCircle, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-25"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, #8B5CF6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #06B6D4 0%, transparent 50%), radial-gradient(circle at 40% 80%, #F59E0B 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, #8B5CF6 0%, transparent 50%), radial-gradient(circle at 20% 80%, #06B6D4 0%, transparent 50%), radial-gradient(circle at 60% 40%, #F59E0B 0%, transparent 50%)',
            'radial-gradient(circle at 40% 20%, #8B5CF6 0%, transparent 50%), radial-gradient(circle at 60% 80%, #06B6D4 0%, transparent 50%), radial-gradient(circle at 20% 40%, #F59E0B 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Floating particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -120, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
};

const GlassmorphicCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.6, delay }}
      className={`relative ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-cyan-500/15 to-amber-500/15 rounded-2xl blur-xl" />
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
        {children}
      </div>
    </motion.div>
  );
};

const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.span
      className={`bg-gradient-to-r from-purple-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        backgroundSize: '200% 200%',
      }}
    >
      {children}
    </motion.span>
  );
};

const FloatingButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl px-8 py-4 font-semibold transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl"
        animate={{
          background: isHovered 
            ? ['linear-gradient(90deg, #8B5CF6, #06B6D4)', 'linear-gradient(90deg, #06B6D4, #8B5CF6)', 'linear-gradient(90deg, #8B5CF6, #06B6D4)']
            : 'linear-gradient(90deg, #8B5CF6, #06B6D4)'
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Ripple effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      <span className="relative z-10 flex items-center gap-2 text-white">
        {children}
      </span>
    </motion.button>
  );
};

const StatCard = ({ icon: Icon, value, label, delay = 0 }: { icon: any; value: string; label: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group cursor-pointer"
    >
      <GlassmorphicCard delay={delay}>
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            className="p-4 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/20"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="h-8 w-8 text-purple-400" />
          </motion.div>
          <div>
            <motion.h3
              className="text-3xl font-bold text-white mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {value}
            </motion.h3>
            <p className="text-gray-300 text-sm">{label}</p>
          </div>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: { icon: any; title: string; description: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ x: 10 }}
      className="group"
    >
      <GlassmorphicCard delay={delay}>
        <div className="flex items-start space-x-4">
          <motion.div
            className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="h-6 w-6 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
              {title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const stats = [
    { icon: TrendingUp, value: "500+", label: "Projects Managed" },
    { icon: Users, value: "2.5K+", label: "Workers Tracked" },
    { icon: DollarSign, value: "$50M+", label: "Payroll Processed" },
    { icon: Clock, value: "99.9%", label: "Uptime" },
  ];

  const features = [
    {
      icon: Users,
      title: "Smart Worker Management",
      description: "Track attendance, manage schedules, and automate payroll with real-time updates and intelligent insights."
    },
    {
      icon: DollarSign,
      title: "Automated Payroll",
      description: "Calculate daily wages, lunch deductions, and bonuses automatically. Generate reports and export data seamlessly."
    },
    {
      icon: TrendingUp,
      title: "Budget Tracking",
      description: "Monitor project expenses, track budget allocation, and get real-time financial insights with beautiful charts."
    },
    {
      icon: CheckCircle,
      title: "Real-time Analytics",
      description: "Get instant insights into project performance, worker productivity, and financial health with interactive dashboards."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between p-6"
      >
        <motion.div
          className="text-2xl font-bold"
          whileHover={{ scale: 1.05 }}
        >
          <GradientText className="text-3xl">Consty</GradientText>
        </motion.div>
        
        <motion.div
          className="flex items-center space-x-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.a
            href="#features"
            className="text-gray-300 hover:text-white transition-colors relative group"
            whileHover={{ y: -2 }}
          >
            Features
            <motion.div
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all duration-300"
            />
          </motion.a>
          <motion.a
            href="#stats"
            className="text-gray-300 hover:text-white transition-colors relative group"
            whileHover={{ y: -2 }}
          >
            Stats
            <motion.div
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all duration-300"
            />
          </motion.a>
          <FloatingButton onClick={() => navigate(user ? '/dashboard' : '/auth')}>
            {user ? 'Go to Dashboard' : 'Get Started'}
            <ArrowRight className="h-4 w-4" />
          </FloatingButton>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Build{' '}
            <motion.span
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
            >
              <GradientText className="text-6xl md:text-8xl">Smarter.</GradientText>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </motion.span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The all-in-one Construction Management System to track workers, automate payroll, 
            manage budgets, and grow your projects with{' '}
            <GradientText className="text-xl md:text-2xl">ease</GradientText>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <FloatingButton onClick={() => navigate(user ? '/dashboard' : '/auth')}>
              {user ? 'Go to Dashboard' : 'Start Building'}
              <Zap className="h-4 w-4" />
            </FloatingButton>
            
            <motion.button
              className="px-8 py-4 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
            >
              {user ? 'Dashboard' : 'Watch Demo'}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        id="stats"
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by{' '}
              <GradientText className="text-4xl md:text-5xl">Thousands</GradientText>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join construction companies worldwide who trust Consty to manage their projects
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You{' '}
              <GradientText className="text-4xl md:text-5xl">Need</GradientText>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features to manage your construction business with precision and ease
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <GlassmorphicCard delay={0}>
            <div className="py-16">
              <motion.h2
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Ready to{' '}
                <GradientText className="text-4xl md:text-5xl">Transform</GradientText>{' '}
                Your Business?
              </motion.h2>
              <motion.p
                className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Join thousands of construction companies already using Consty to streamline their operations
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <FloatingButton onClick={() => navigate(user ? '/dashboard' : '/auth')}>
                  {user ? 'Go to Dashboard' : 'Get Started Today'}
                  <ArrowRight className="h-4 w-4" />
                </FloatingButton>
              </motion.div>
            </div>
          </GlassmorphicCard>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 py-12 px-6 border-t border-white/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            className="mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <GradientText className="text-3xl font-bold">Consty</GradientText>
          </motion.div>
          <p className="text-gray-400 mb-6">
            © 2024 Consty. All rights reserved. Built with precision for construction professionals.
          </p>
          <div className="flex justify-center space-x-6">
            {['Privacy', 'Terms', 'Support', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.footer>
    </div>
  );
}