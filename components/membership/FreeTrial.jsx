'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createMembership } from '@/lib/pocketbase';
import { toast } from '@/lib/toast';

export function FreeTrial() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleFreeTrial = async () => {
    if (!user) {
      toast.error('Please log in to claim free trial');
      return;
    }

    setLoading(true);
    try {
      const result = await createMembership(user.id, 'trial', 30);

      if (result.success) {
        setCompleted(true);
        toast.success('🎉 Free trial activated for 30 days!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to activate free trial');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 w-full max-w-[340px] animate-pulse">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✓</span>
          <div>
            <p className="text-[11px] text-green-600 dark:text-green-400 tracking-widest font-bold">
              TRIAL ACTIVATED
            </p>
            <p className="text-[13px] text-green-700 dark:text-green-300">
              Enjoy 30 days of premium access!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleFreeTrial}
      disabled={loading}
      className="w-full max-w-[340px] group relative overflow-hidden rounded-xl p-[1px] transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin" 
           style={{ animationDuration: '3s' }} />

      {/* Card background */}
      <div className="relative bg-slate-50 dark:bg-gray-800 rounded-[10px] p-4 flex items-center gap-3 transition-all">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
            ✨
          </div>
        </div>

        <div className="flex-1 text-left">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 tracking-widest font-bold">
            TRY FOR FREE
          </p>
          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
            {loading ? 'Activating...' : '30-Day Free Trial'}
          </p>
        </div>

        <div className="flex-shrink-0">
          <span className={`text-xl transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:scale-110'}`}>
            {loading ? '⏳' : '→'}
          </span>
        </div>
      </div>
    </button>
  );
}
