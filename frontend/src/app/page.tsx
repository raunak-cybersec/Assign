'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Kanban,
  Bell,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

/* ---------- animated floating task card ---------- */
function FloatingCard({
  title,
  priority,
  status,
  delay,
  x,
  y,
  rotate,
}: {
  title: string;
  priority: string;
  status: string;
  delay: number;
  x: string;
  y: string;
  rotate: number;
}) {
  const priorityColors: Record<string, { bg: string; text: string }> = {
    High: { bg: 'bg-red-100', text: 'text-red-600' },
    Medium: { bg: 'bg-amber-100', text: 'text-amber-600' },
    Low: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  };
  const pc = priorityColors[priority] || priorityColors.Medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotate - 5 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y }}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/60 w-56"
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
            {priority}
          </span>
          <span className="text-[10px] text-gray-400">{status}</span>
        </div>
        <p className="text-xs font-medium text-gray-800 leading-snug">{title}</p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-purple-600" />
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 -ml-1.5 ring-2 ring-white" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- animated feature pill ---------- */
function FeaturePill({ icon: Icon, label, delay }: { icon: React.ElementType; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/60 rounded-full px-4 py-2 shadow-sm"
    >
      <Icon size={14} className="text-[#7c3aed]" />
      <span className="text-xs font-medium text-[#4b5563]">{label}</span>
    </motion.div>
  );
}

/* ---------- main page ---------- */
export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ede9fe] via-[#f5f3ff] to-[#faf5ff]">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0c0a1d]">
      {/* ========== BACKGROUND LAYER ========== */}

      {/* Gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#0c0a1d]" />
        {/* Animated glowing orbs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-[#7c3aed] rounded-full blur-[180px] opacity-20"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[5%] right-[10%] w-[600px] h-[600px] bg-[#6366f1] rounded-full blur-[200px] opacity-15"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-[#a855f7] rounded-full blur-[160px] opacity-10"
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-[#8b5cf6] rounded-full opacity-40"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20 - i * 5, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}

      {/* ========== CONTENT LAYER ========== */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 py-12 gap-8 lg:gap-20">

        {/* ---------- LEFT: Hero Content ---------- */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 max-w-xl text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles size={14} className="text-[#a78bfa]" />
            <span className="text-xs font-medium text-[#c4b5fd]">Built for productive teams</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            <span className="text-white">Delegate.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#8b5cf6] to-[#7c3aed]">
              Track.
            </span>
            <br />
            <span className="text-white">Done.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-base sm:text-lg text-[#94a3b8] leading-relaxed mb-8 max-w-md mx-auto lg:mx-0"
          >
            Assign helps teams delegate tasks, track progress, and get things done
            — without the chaos. Beautiful. Powerful. Simple.
          </motion.p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start mb-8">
            <FeaturePill icon={Kanban} label="Kanban Board" delay={0.6} />
            <FeaturePill icon={Bell} label="Smart Notifications" delay={0.7} />
            <FeaturePill icon={Users} label="Team Collaboration" delay={0.8} />
            <FeaturePill icon={BarChart3} label="Progress Tracking" delay={0.9} />
            <FeaturePill icon={Zap} label="Real-time Updates" delay={1.0} />
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex gap-8 justify-center lg:justify-start"
          >
            {[
              { value: 'Drag & Drop', label: 'Kanban Board' },
              { value: 'OAuth 2.0', label: 'Google Login' },
              { value: 'Real-time', label: 'Email Alerts' },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <p className="text-sm font-bold text-white">{stat.value}</p>
                <p className="text-xs text-[#64748b]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ---------- RIGHT: Login Card + Floating Cards ---------- */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex-shrink-0"
        >
          {/* Floating task cards (desktop only) */}
          <div className="hidden lg:block">
            <FloatingCard
              title="Design system — finalize color tokens and typography"
              priority="High"
              status="In Progress"
              delay={0.8}
              x="-200px"
              y="-30px"
              rotate={-6}
            />
            <FloatingCard
              title="Set up CI/CD pipeline for staging environment"
              priority="Medium"
              status="Todo"
              delay={1.0}
              x="250px"
              y="60px"
              rotate={4}
            />
            <FloatingCard
              title="User onboarding flow complete ✓"
              priority="Low"
              status="Completed"
              delay={1.2}
              x="-160px"
              y="350px"
              rotate={-3}
            />
          </div>

          {/* Glow behind card */}
          <div className="absolute -inset-6 bg-gradient-to-r from-[#7c3aed]/20 to-[#6366f1]/20 rounded-3xl blur-2xl" />

          {/* Main login card */}
          <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-2xl border border-white/10 p-8 w-[380px] shadow-2xl shadow-purple-900/20">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center shadow-lg shadow-[#7c3aed]/40">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Assign
              </span>
            </div>

            <h2 className="text-lg font-semibold text-white text-center mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-[#94a3b8] text-center mb-8">
              Sign in to access your workspace
            </p>

            <Button
              onClick={signIn}
              variant="primary"
              size="lg"
              className="w-full !bg-gradient-to-r !from-[#7c3aed] !to-[#6d28d9] hover:!from-[#6d28d9] hover:!to-[#5b21b6] !shadow-lg !shadow-purple-600/25"
            >
              <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                <path
                  fill="#fff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#fff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#fff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-[#64748b]">Secure authentication</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#64748b]">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                OAuth 2.0
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Encrypted
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                No passwords
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========== BOTTOM FOOTER ========== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-6 left-0 right-0 text-center"
      >
        <p className="text-xs text-[#475569]">
          Built with Next.js, Flask, Supabase & Tailwind CSS
        </p>
      </motion.div>
    </div>
  );
}
