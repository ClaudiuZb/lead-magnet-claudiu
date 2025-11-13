'use client';

import { useState } from 'react';

interface EmailCaptureOverlayProps {
  onSubmit: (email: string) => void;
  onSkip: () => void;
}

export default function EmailCaptureOverlay({ onSubmit, onSkip }: EmailCaptureOverlayProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      onSubmit(email.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12"
            viewBox="0 0 180 225"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M177.996 55.3189C178.991 55.8951 179.604 56.9578 179.604 58.1076V164.277C179.604 166.264 177.452 167.504 175.733 166.508L153.939 153.886C153.143 153.425 152.653 152.575 152.653 151.655V77.9606C152.653 76.8108 152.04 75.7481 151.045 75.1718L83.7567 36.2047C82.9606 35.7437 82.4705 34.8936 82.4705 33.9737V4.47239C82.4705 2.48618 84.6222 1.24596 86.3411 2.24139L177.996 55.3189Z"
              fill="#03030D"
            />
            <path
              d="M0 60.7224C0 58.7362 2.15168 57.496 3.8706 58.4914L95.5256 111.569C96.5207 112.145 97.1333 113.208 97.1333 114.358V220.527C97.1333 222.514 94.9817 223.754 93.2627 222.758L1.28618 169.495C0.490121 169.034 0 168.184 0 167.264V60.7224Z"
              fill="#03030D"
            />
            <path
              d="M136.761 83.4439C137.756 84.0201 138.368 85.0828 138.368 86.2326V192.402C138.368 194.389 136.217 195.629 134.498 194.633L112.703 182.011C111.907 181.55 111.417 180.7 111.417 179.78V106.086C111.417 104.936 110.805 103.873 109.81 103.297L42.5214 64.3297C41.7254 63.8687 41.2353 63.0186 41.2353 62.0987V32.5974C41.2353 30.6112 43.3869 29.371 45.1059 30.3664L136.761 83.4439Z"
              fill="#03030D"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-3 text-[#03030D]">
          Want to take this build further?
        </h2>

        <p className="text-center text-[#6B7280] mb-6 leading-relaxed font-geist">
          Enter your email to get a personalized integration plan and see how Membrane can bring
          your integrations to life.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 text-base font-geist border border-[#DFE0EB] rounded-lg focus:outline-none focus:border-[#03030D] focus:ring-4 focus:ring-[#03030D]/10 transition-all placeholder:text-[#9CA3AF]"
            required
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 h-12 px-4 border border-[#DFE0EB] rounded-lg text-[#6B7280] hover:bg-gray-50 transition-colors font-medium"
            >
              Maybe later
            </button>
            <button
              type="submit"
              className="flex-1 h-12 px-4 bg-gradient-to-b from-[#35374F] to-[#0D0D12] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium flex items-center justify-center gap-2"
            >
              Get Started
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
