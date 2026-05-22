'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#f4f4f5] flex items-center justify-center">
            <FileQuestion size={36} className="text-[#a1a1aa]" />
          </div>
        </motion.div>

        <h1 className="text-7xl font-bold text-[#1c1c1e] mb-2 tracking-tight">
          404
        </h1>
        <h2 className="text-xl font-semibold text-[#1c1c1e] mb-3">
          Page not found
        </h2>
        <p className="text-sm text-[#71717a] mb-8 leading-relaxed">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <Link href="/dashboard">
          <Button variant="primary" size="lg">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
