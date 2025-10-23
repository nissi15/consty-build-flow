import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useState, useRef } from 'react';
import { ArrowRight, Users, DollarSign, TrendingUp, Clock, CheckCircle, Star, Zap, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Orb from '@/components/Orb';

// Orb Background - Main background animation
const OrbBackgroundMain = () => {
  return (
    <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-auto">
      <Orb
        hue={270}
        hoverIntensity={1.5}
        rotateOnHover={true}
        forceHoverState={false}
      />
    </div>
  );
};



const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Orb Background - Primary layer */}
      <OrbBackgroundMain />
    </div>
  );
};

// Glass Surface Component - Inspired by https://reactbits.dev/components/glass-surface
const GlassSurface = ({ 
  children, 
  className = "", 
  blur = "xl",
  opacity = 5,
  border = true,
  shadow = true 
}: { 
  children: React.ReactNode; 
  className?: string;
  blur?: "sm" | "md" | "lg" | "xl" | "2xl";
  opacity?: number;
  border?: boolean;
  shadow?: boolean;
}) => {
  const blurClass = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
    "2xl": "backdrop-blur-2xl",
  }[blur];

  return (
    <div 
      className={`${blurClass} bg-white/${opacity} ${border ? 'border border-white/10' : ''} ${shadow ? 'shadow-2xl shadow-black/20' : ''} ${className}`}
      style={{
        WebkitBackdropFilter: `blur(${blur === 'sm' ? '4px' : blur === 'md' ? '12px' : blur === 'lg' ? '16px' : blur === 'xl' ? '24px' : '40px'})`,
      }}
    >
      {children}
    </div>
  );
};

// Simplified Card Border for Performance
const CardShapeBlur = ({ index = 0 }: { index?: number }) => {
  const colors = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899'];
  const color = colors[index % colors.length];
  
  return (
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `0 0 20px ${color}20`,
      }}
    />
  );
};

const GlassmorphicCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay }}
      className={`relative ${className}`}
      whileHover={{ y: -5 }}
    >
      {/* Simplified border */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <CardShapeBlur index={Math.floor(delay * 10)} />
      </div>
      
      {/* Glass card */}
      <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.12] hover:border-purple-500/30 transition-all duration-300">
        {children}
      </div>
    </motion.div>
  );
};

const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.span
      className={`bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        backgroundSize: '200% 200%',
        textShadow: '0 0 80px rgba(139, 92, 246, 0.3)',
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
      className={`relative overflow-hidden rounded-xl px-10 py-5 font-semibold text-lg transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)' }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4, #8B5CF6)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          boxShadow: isHovered ? '0 0 40px rgba(139, 92, 246, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)' : '0 0 20px rgba(139, 92, 246, 0.3)',
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Ripple effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
      
      <span className="relative z-10 flex items-center gap-3 text-white font-medium">
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
      whileHover={{ scale: 1.03, y: -3 }}
      className="group cursor-pointer"
    >
      <GlassmorphicCard delay={delay}>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/20">
            <Icon className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {value}
            </h3>
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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <GlassmorphicCard delay={delay}>
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/20">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
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

const ReviewCard = ({ name, role, company, review, rating, delay = 0 }: { name: string; role: string; company: string; review: string; rating: number; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3 }}
      className="group"
    >
      <GlassmorphicCard delay={delay}>
        <div className="space-y-4">
          {/* Rating Stars */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i}
                className={`h-5 w-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
              />
            ))}
          </div>
          
          {/* Review Text */}
          <p className="text-gray-300 text-sm leading-relaxed italic">
            "{review}"
          </p>
          
          {/* Author Info */}
          <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {name.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{name}</h4>
              <p className="text-gray-400 text-xs">{role} at {company}</p>
            </div>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = [
    { icon: TrendingUp, value: "500+", label: "Projects Managed" },
    { icon: Users, value: "2.5K+", label: "Workers Tracked" },
    { icon: DollarSign, value: "50M+ RWF", label: "Payroll Processed" },
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
      description: "Calculate daily wages in RWF, lunch deductions, and bonuses automatically. Generate reports and export data seamlessly."
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

  const reviews = [
    {
      name: "Michael Rodriguez",
      role: "Project Manager",
      company: "BuildTech Construction",
      review: "Constry has completely transformed how we manage our construction projects. The automated payroll feature alone saves us 10+ hours every week. Highly recommended!",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "Operations Director",
      company: "Elite Builders Inc",
      review: "The real-time analytics and budget tracking features are game-changers. We can now make data-driven decisions and keep our projects on track and under budget.",
      rating: 5
    },
    {
      name: "James Patterson",
      role: "Site Supervisor",
      company: "Metro Construction Co",
      review: "Worker management has never been easier. The attendance tracking and scheduling features are intuitive and save us so much time. Our team loves it!",
      rating: 5
    },
    {
      name: "Emily Thompson",
      role: "Finance Manager",
      company: "Skyline Developments",
      review: "The expense tracking and reporting capabilities are outstanding. We have complete visibility into our project finances, making month-end closings a breeze.",
      rating: 5
    },
    {
      name: "David Kumar",
      role: "CEO",
      company: "Apex Construction Group",
      review: "Constry is the most comprehensive construction management platform we've used. It's intuitive, powerful, and has significantly improved our operational efficiency.",
      rating: 5
    },
    {
      name: "Lisa Anderson",
      role: "HR Director",
      company: "Premier Build Solutions",
      review: "Managing our workforce across multiple sites used to be a nightmare. Constry makes it simple and efficient. The support team is also incredibly responsive!",
      rating: 5
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation - Glass Surface */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 px-3 md:px-4 py-3 md:py-4"
      >
        <GlassSurface className="rounded-2xl" blur="2xl" opacity={3}>
          <nav className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <motion.div
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
            >
              <GradientText className="text-2xl md:text-3xl">Constry</GradientText>
            </motion.div>
            
            {/* Desktop Navigation */}
            <motion.div
              className="hidden md:flex items-center space-x-6"
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
              <motion.a
                href="#reviews"
                className="text-gray-300 hover:text-white transition-colors relative group"
                whileHover={{ y: -2 }}
              >
                Reviews
                <motion.div
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all duration-300"
                />
              </motion.a>
              <FloatingButton onClick={() => navigate(user ? '/dashboard' : '/auth')}>
                {user ? 'Dashboard' : 'Get Started'}
                <ArrowRight className="h-4 w-4" />
              </FloatingButton>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 px-4 py-4 space-y-3"
            >
              <a
                href="#features"
                className="block text-gray-300 hover:text-white transition-colors py-2 text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#stats"
                className="block text-gray-300 hover:text-white transition-colors py-2 text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Stats
              </a>
              <a
                href="#reviews"
                className="block text-gray-300 hover:text-white transition-colors py-2 text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reviews
              </a>
              <button
                onClick={() => {
                  navigate(user ? '/dashboard' : '/auth');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </GlassSurface>
      </motion.div>

      {/* Hero Section */}
      <motion.section
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[75vh] px-4 md:px-6 text-center pt-24 md:pt-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Glow effect behind hero */}
          <motion.div
            className="absolute -inset-40 bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-purple-600/20 rounded-full blur-3xl -z-10"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ letterSpacing: '-0.02em' }}
          >
            Build{' '}
            <motion.span
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
            >
              <GradientText className="text-5xl md:text-7xl lg:text-8xl">Smarter.</GradientText>
              <motion.div
                className="absolute -bottom-2 md:-bottom-3 left-0 right-0 h-2 md:h-3 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                style={{ filter: 'blur(3px)' }}
              />
            </motion.span>
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ letterSpacing: '-0.01em' }}
          >
            The all-in-one Construction Management System to track workers, automate payroll, 
            manage budgets, and grow your projects with{' '}
            <GradientText className="text-lg md:text-xl lg:text-2xl font-medium">ease</GradientText>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <FloatingButton onClick={() => navigate(user ? '/dashboard' : '/auth')}>
              {user ? 'Go to Dashboard' : 'Start Building'}
              <Zap className="h-5 w-5" />
            </FloatingButton>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        id="stats"
        className="relative py-12 md:py-20 px-4 md:px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="relative z-10 max-w-6xl mx-auto">
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
              Join construction companies worldwide who trust Constry to manage their projects
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
        className="relative z-10 py-12 md:py-20 px-4 md:px-6"
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

      {/* Reviews Section */}
      <motion.section
        id="reviews"
        className="relative z-10 py-12 md:py-20 px-4 md:px-6"
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
              Loved by{' '}
              <GradientText className="text-4xl md:text-5xl">Professionals</GradientText>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See what construction professionals are saying about Constry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <ReviewCard
                key={review.name}
                name={review.name}
                role={review.role}
                company={review.company}
                review={review.review}
                rating={review.rating}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="relative py-12 md:py-20 px-4 md:px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="relative z-10 max-w-4xl mx-auto text-center">
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
                Join thousands of construction companies already using Constry to streamline their operations
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

      {/* Footer - Glass Surface */}
      <motion.footer
        className="relative px-6 py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="relative z-10 max-w-6xl mx-auto">
          <GlassSurface className="rounded-2xl" blur="xl" opacity={3}>
            <div className="text-center px-6 py-8">
              <motion.div
                className="mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <GradientText className="text-3xl font-bold">Constry</GradientText>
              </motion.div>
              <p className="text-gray-400 mb-6">
                © 2024 Constry. All rights reserved. Built with precision for construction professionals.
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
          </GlassSurface>
        </div>
      </motion.footer>
    </div>
  );
}