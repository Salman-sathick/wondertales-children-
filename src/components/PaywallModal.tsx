/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Crown, Check, X, ShieldCheck, Heart, Wand2, Star } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockPass: () => void;
  storiesGeneratedCount: number;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onUnlockPass,
  storiesGeneratedCount = 2,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');
  const [parentAnswer, setParentAnswer] = useState<string>('');
  const [parentGateError, setParentGateError] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  // Simple parent gate: 4 + 3 = 7
  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentAnswer.trim() !== '7') {
      setParentGateError(true);
      return;
    }

    setParentGateError(false);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onUnlockPass();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full my-auto shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[95vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
        {/* Banner with Crown and Gold Sparkles */}
        <div className="relative bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-400 p-6 sm:p-8 text-center text-amber-950">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-amber-900/70 hover:text-amber-950 hover:bg-white/30 rounded-full transition-colors cursor-pointer"
            aria-label="Close upgrade modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-3xl bg-white/90 shadow-md flex items-center justify-center mb-3">
            <Crown className="w-9 h-9 text-amber-600 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>

          <div className="inline-block px-3 py-1 bg-amber-900/10 rounded-full text-xs font-extrabold uppercase tracking-widest text-amber-950 mb-1">
            Free Story Limit Reached ({storiesGeneratedCount}/2)
          </div>

          <h2 id="paywall-title" className="font-serif text-2xl sm:text-3xl font-black text-amber-950">
            Unlock WonderTales Magic Pass
          </h2>

          <p className="text-amber-900/90 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            You've woven your 2 free AI bedtime tales! Unlock unlimited stories and magical features for your young reader.
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-2 bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/80">
            {[
              '✨ Unlimited Custom AI Story Weaving',
              '🎨 Full Blank Drawing Studio with Infinite Saves',
              '🐾 Complete Animal Sounds Orchestra & Games',
              '🎙️ All 5 Expressive Bedtime Storyteller Voices',
              '🖼️ 4K Ultra-HD Printable Page Illustrations',
            ].map((perk, i) => (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lifetime Option */}
            <div
              onClick={() => setSelectedPlan('lifetime')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                selectedPlan === 'lifetime'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300'
                  : 'border-stone-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-2xs">
                Best Value
              </div>
              <span className="font-serif font-bold text-sm text-stone-900 block">
                Lifetime Family Pass
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-serif font-black text-2xl text-amber-950">$19.99</span>
                <span className="text-[11px] text-stone-500">one-time</span>
              </div>
              <span className="text-[11px] text-amber-800 block mt-1">Keep forever, all devices</span>
            </div>

            {/* Monthly Option */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedPlan === 'monthly'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300'
                  : 'border-stone-200 bg-white hover:border-amber-300'
              }`}
            >
              <span className="font-serif font-bold text-sm text-stone-900 block">
                Monthly Storyteller
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-serif font-black text-2xl text-amber-950">$4.99</span>
                <span className="text-[11px] text-stone-500">/month</span>
              </div>
              <span className="text-[11px] text-stone-500 block mt-1">7 days free trial, cancel anytime</span>
            </div>
          </div>

          {/* Parental Gate Check */}
          <form onSubmit={handleUpgrade} className="space-y-3 pt-2 border-t border-stone-100">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Parental Gate (Grown-ups only)</span>
              </div>
              <p className="text-[11px] text-stone-500">
                To confirm you are a parent or guardian, please solve: <strong className="text-stone-800">4 + 3 = ?</strong>
              </p>
              <input
                type="text"
                value={parentAnswer}
                onChange={(e) => {
                  setParentAnswer(e.target.value);
                  setParentGateError(false);
                }}
                placeholder="Enter answer (7)"
                className="w-full p-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500"
                required
              />
              {parentGateError && (
                <span className="text-[11px] text-rose-600 font-bold block">
                  Please enter 7 to confirm adult verification.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Activating Magic Pass...</span>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 text-amber-900" />
                  <span>
                    Unlock Magic Pass ({selectedPlan === 'lifetime' ? '$19.99 Once' : '$4.99/mo'})
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer Restore & Terms */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
            <button
              onClick={() => {
                onUnlockPass();
              }}
              className="hover:text-stone-800 underline cursor-pointer"
            >
              Restore Purchases
            </button>
            <span>Safe for Kids · No Ads</span>
            <button onClick={onClose} className="hover:text-stone-800 underline cursor-pointer">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
