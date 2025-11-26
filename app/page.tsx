'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/ide?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen bg-membrane-bg flex justify-center items-center p-4">
      <div className="max-w-[680px] w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-12">
          <svg
            className="w-7 h-7"
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
          <span className="text-lg font-semibold text-membrane-dark">Membrane</span>
        </div>

        <h1 className="text-[28px] xs:text-[32px] sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-membrane-dark mb-4 whitespace-nowrap">
          AI for product integrations
        </h1>

        <p className="font-geist text-sm md:text-base lg:text-[17px] leading-relaxed text-membrane-gray mb-10 max-w-[540px] mx-auto">
          Describe what you need. Watch integrations build, test and maintain themselves.
        </p>

        <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="url"
              className="block text-left text-sm font-medium text-[#1E1F2A] mb-2"
            >
              Please enter your website URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="E.g. attio.com"
              className="w-full px-4 py-3 font-geist text-[15px] border border-membrane-border rounded-lg mb-5 transition-all duration-200 focus:outline-none focus:border-membrane-dark focus:ring-4 focus:ring-membrane-dark/10 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="w-full px-6 py-3.5 bg-gradient-to-b from-[#35374F] to-[#0D0D12] text-white text-[15px] font-medium rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,30,75,0.16)] active:translate-y-0"
            >
              Open Membrane Integration IDE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
