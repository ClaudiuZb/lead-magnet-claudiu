'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_INTEGRATIONS = [
  { name: 'Salesforce', domain: 'salesforce.com' },
  { name: 'HubSpot', domain: 'hubspot.com' },
  { name: 'Slack', domain: 'slack.com' },
  { name: 'Gmail', domain: 'google.com' },
  { name: 'Stripe', domain: 'stripe.com' },
  { name: 'Shopify', domain: 'shopify.com' },
  { name: 'Zendesk', domain: 'zendesk.com' },
  { name: 'Intercom', domain: 'intercom.com' },
  { name: 'Mailchimp', domain: 'mailchimp.com' },
  { name: 'Twilio', domain: 'twilio.com' },
  { name: 'SendGrid', domain: 'sendgrid.com' },
  { name: 'Airtable', domain: 'airtable.com' },
  { name: 'Notion', domain: 'notion.so' },
  { name: 'Asana', domain: 'asana.com' },
  { name: 'Jira', domain: 'atlassian.com' },
  { name: 'GitHub', domain: 'github.com' },
  { name: 'Linear', domain: 'linear.app' },
  { name: 'Figma', domain: 'figma.com' },
  { name: 'NimbusCRM', domain: 'nimbuscrmsolutions.com' },
  { name: 'OrbitERP', domain: 'orbiterp.com' },
  { name: 'SableDesk', domain: 'webdesksolution.com' },
  { name: 'QuantaMail', domain: 'quantamail.ch' },
  { name: 'HelioBilling', domain: 'hel.io' },
  { name: 'VistaHR', domain: 'vistahrpro.com' },
  { name: 'PolarBI', domain: 'polaranalytics.com' },
  { name: 'TidalSupport', domain: 'tidalsoftware.com' },
  { name: 'AquilaAuth', domain: 'authelia.com' },
  { name: 'ZenSubs', domain: 'zensubs.com' },
  { name: 'KiteAnalytics', domain: 'kiteanalytix.com' },
  { name: 'NovaBooks', domain: 'novabook.com' },
  { name: 'EchoChat', domain: 'echochat.io' },
  { name: 'VertexOps', domain: 'vertexoperations.com' },
  { name: 'AtlasDocs', domain: 'atlasdocs.app' },
  { name: 'PulseMarketing', domain: 'pulsemarketing.digital' },
  { name: 'DeltaPay', domain: 'deltapay.biz' },
  { name: 'HorizonPM', domain: 'horizonppm.com' }
];

const BUILD_TIME_MS = 2500; // Faster build time
const LANES = 6;

function hashColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 65% 55%)`;
}

function AppLogo({ name, domain }: { name: string; domain?: string }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

  const initials = name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
  const bg = hashColor(name);

  return (
    <div
      className="flex items-center justify-center rounded-lg shadow-lg overflow-hidden"
      style={{ width: 32, height: 32, background: logoUrl && !imgError ? '#fff' : bg }}
      title={name}
    >
      {logoUrl && !imgError ? (
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-xs font-bold text-white">{initials || '∴'}</span>
      )}
    </div>
  );
}

interface IntegrationRushGameProps {
  onClose?: () => void;
}

export default function IntegrationRushGame({ onClose }: IntegrationRushGameProps) {
  type Customer = { id: number; need: string; domain: string; lane: number; y: number; spawnedAt: number; built?: boolean };
  type Build = { id: number; need: string; endsAt: number };
  type Particle = { id: number; x: number; y: number; color: string; emoji: string };

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(0);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [paused, setPaused] = useState(false);
  const [membrane, setMembrane] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [combo, setCombo] = useState(0);
  const [lastBuildTime, setLastBuildTime] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  const lastSpawnRef = useRef<number>(0);
  const startRef = useRef<number>(Date.now());
  const integrationQueueRef = useRef<typeof ALL_INTEGRATIONS>([]);
  const usedIntegrationsRef = useRef<Set<string>>(new Set());
  const customerIdCounter = useRef<number>(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('integration-rush-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const needsInPlay = useMemo(() => Array.from(new Set(customers.map((c) => c.need))), [customers]);


  const effectiveBuildTime = membrane ? BUILD_TIME_MS / 3 : BUILD_TIME_MS;

  useEffect(() => {
    const tickMs = 50; // More frequent updates for smoother animation
    const id = setInterval(() => {
      if (paused) return;
      const now = Date.now();
      const elapsed = now - startRef.current;

      const rateFactor = 1 + Math.floor(elapsed / 5000) * 0.3;
      const spawnInterval = Math.max(200, 900 / rateFactor);

      let shouldSpawn = false;
      let newCustomer = null;

      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;

        // Smart queue system: cycle through all integrations without repetition
        if (integrationQueueRef.current.length === 0) {
          // Refill queue with all integrations in random order
          const shuffled = [...ALL_INTEGRATIONS].sort(() => Math.random() - 0.5);
          integrationQueueRef.current = shuffled;
          usedIntegrationsRef.current.clear();
        }

        // Pick next integration from queue
        const integration = integrationQueueRef.current.shift()!;
        usedIntegrationsRef.current.add(integration.name);

        const lane = Math.floor(Math.random() * LANES);

        // Check if there's already a customer at the top of this lane
        const MIN_SPACING = 60; // Minimum pixels between customers
        const customersInLane = customers.filter(c => c.lane === lane);
        const topCustomer = customersInLane.length > 0
          ? customersInLane.reduce((min, c) => c.y < min.y ? c : min)
          : null;

        // Only spawn if there's enough space or no customer in lane
        if (!topCustomer || topCustomer.y > MIN_SPACING) {
          shouldSpawn = true;
          customerIdCounter.current += 1;
          newCustomer = { id: customerIdCounter.current, need: integration.name, domain: integration.domain, lane, y: 0, spawnedAt: now };
        }
      }

      setCustomers((prev) => {
        const dy = 1.6; // Smaller increments for smoother movement
        let arr = shouldSpawn && newCustomer ? [...prev, newCustomer] : prev;
        const newCustomers = arr.map((c) => ({ ...c, y: c.y + dy }));
        const lostCustomers = newCustomers.filter((c) => c.y >= 420 && !c.built);
        if (lostCustomers.length > 0) {
          setLost((l) => l + lostCustomers.length);
        }
        return newCustomers.filter((c) => c.y < 420);
      });

      if (membrane && needsInPlay.length) {
        setBuilds((prev) => {
          const activeNeeds = new Set(prev.map((b) => b.need));
          const next = [...prev];
          needsInPlay.forEach((need) => {
            if (!activeNeeds.has(need)) {
              next.push({ id: now + Math.random() * 1e6, need, endsAt: now + effectiveBuildTime });
            }
          });
          return next;
        });
      }

      setBuilds((prev) => {
        const completed = prev.filter((b) => now >= b.endsAt);
        if (completed.length) {
          // Combo tracking: builds within 3 seconds count as combo
          if (now - lastBuildTime < 3000) {
            setCombo((c) => c + completed.length);
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 1500);
          } else {
            setCombo(completed.length);
          }
          setLastBuildTime(now);

          setCustomers((prevCust) => {
            let arr = [...prevCust];
            completed.forEach((b) => {
              // Find customers that match this build and create particles
              const matchingCustomers = arr.filter((c) => c.need === b.need && !c.built);
              matchingCustomers.forEach((c) => {
                const xPercent = ((c.lane + 0.5) / LANES) * 100;
                const yPercent = (c.y / 500) * 100;
                const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
                const emojis = ['✨', '⭐', '💫', '🎉', '🔥'];

                // Create all particles at once instead of one by one
                const newParticles: Particle[] = [];
                for (let i = 0; i < 6; i++) { // Reduced from 8 to 6 for performance
                  const particleId = now + Math.random() * 1e6;
                  newParticles.push({
                    id: particleId,
                    x: xPercent + (Math.random() - 0.5) * 8,
                    y: yPercent + (Math.random() - 0.5) * 8,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    emoji: emojis[Math.floor(Math.random() * emojis.length)]
                  });
                }

                setParticles((p) => [...p, ...newParticles]);

                // Remove all particles after animation
                setTimeout(() => {
                  const particleIds = new Set(newParticles.map(np => np.id));
                  setParticles((p) => p.filter((particle) => !particleIds.has(particle.id)));
                }, 1000);
              });
              arr = arr.map((c) => (c.need === b.need ? { ...c, built: true } : c));
            });
            const newScore = score + completed.length;
            setScore(newScore);
            // Update high score
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('integration-rush-highscore', newScore.toString());
            }
            return arr;
          });
        }
        return prev.filter((b) => now < b.endsAt);
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [paused, membrane, needsInPlay, effectiveBuildTime, lastBuildTime, score, highScore]);

  const startBuild = (need: string) => {
    if (paused) return;
    const now = Date.now();

    if (membrane) {
      // In membrane mode, clicking does nothing (auto-build is on)
      return;
    }

    // Manual mode: start building if not already building this integration
    const alreadyBuilding = builds.some((b) => b.need === need);
    if (alreadyBuilding) return;

    setBuilds((prev) => [...prev, { id: now + Math.random() * 1e6, need, endsAt: now + effectiveBuildTime }]);
  };

  const reset = () => {
    setCustomers([]);
    setScore(0);
    setLost(0);
    setBuilds([]);
    setParticles([]);
    setCombo(0);
    setLastBuildTime(0);
    startRef.current = Date.now();
    lastSpawnRef.current = 0;
    integrationQueueRef.current = [];
    usedIntegrationsRef.current.clear();
    customerIdCounter.current = 0;
    setPaused(false);
  };

  const activeBuildsByNeed = useMemo(() => {
    const map: Record<string, Build | undefined> = {};
    builds.forEach((b) => {
      if (!map[b.need] || b.endsAt < (map[b.need]!.endsAt)) map[b.need] = b;
    });
    return map;
  }, [builds]);

  // Get customer emotion based on proximity to churn line
  const getCustomerEmotion = (y: number) => {
    const churnY = 420; // Approximate churn position (500 - 80)
    const progress = y / churnY;
    if (progress < 0.4) return '😊'; // Happy - far from churn
    if (progress < 0.7) return '😐'; // Neutral - getting closer
    return '😰'; // Anxious - near churn
  };

  return (
    <div className="h-full flex flex-col bg-membrane-bg text-membrane-dark overflow-hidden">
      {/* How to Play Banner */}
      <div className="px-6 py-3 bg-white border-b border-membrane-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <h3 className="text-sm font-bold text-membrane-dark">How to Play</h3>
              <p className="text-xs text-membrane-gray">
                Click on falling customers to build their integrations before they reach the churn zone! Enable <span className="text-membrane-dark font-semibold">Membrane</span> for auto-building at 3× speed!
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
              <span>😊 Happy</span>
              <span className="text-gray-400">→</span>
              <span>😐 Close</span>
              <span className="text-gray-400">→</span>
              <span>😰 Churn!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-membrane-border bg-white">
        <div>
          <h1 className="text-xl font-semibold text-membrane-dark">
            Integration Rush
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <div className="text-xs text-membrane-gray">Built</div>
                <div className="text-xl font-bold text-green-600">{score}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              <div>
                <div className="text-xs text-membrane-gray">Churned</div>
                <div className="text-xl font-bold text-red-600">{lost}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="text-xs text-membrane-gray">High Score</div>
                <div className="text-xl font-bold text-yellow-600">{highScore}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative w-full h-full max-w-[1200px] rounded-xl bg-white shadow-sm border border-membrane-border overflow-hidden"
        >
          {/* Lane dividers */}
          {[...Array(LANES - 1)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"
              style={{ left: `${((i + 1) * 100) / LANES}%` }}
            />
          ))}

          {/* Churn line */}
          <div className="absolute inset-x-0 bottom-[80px] h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent" />
          <div className="absolute inset-x-0 bottom-[60px] text-center">
            <span className="text-xs text-red-600 font-medium px-3 py-1 rounded-lg bg-red-50 border border-red-200">
              Churn Zone
            </span>
          </div>

          {/* Customers */}
          <AnimatePresence>
            {customers.map((c) => {
              const isBuilding = !!activeBuildsByNeed[c.need];
              const isClickable = !c.built && !paused && (!membrane || membrane);

              return (
                <motion.div
                  key={c.id}
                  className={`absolute flex items-center gap-2 ${
                    isClickable && !c.built ? 'cursor-pointer hover:scale-110' : ''
                  } transition-transform`}
                  style={{
                    left: `calc(${((c.lane + 0.5) / LANES) * 100}% - 80px)`,
                    top: `${(c.y / 500) * 100}%`,
                    willChange: 'transform'
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'linear' }}
                  onClick={() => !c.built && startBuild(c.need)}
                >
                  <span className="text-2xl filter drop-shadow-lg">{c.built ? '🕴️' : getCustomerEmotion(c.y)}</span>
                  <div className="flex items-center gap-2">
                    <AppLogo name={c.need} domain={c.domain} />
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all ${
                        c.built
                          ? 'bg-green-50 text-green-700 border border-green-200 line-through'
                          : isBuilding
                          ? 'bg-gray-100 text-membrane-dark border border-gray-300 animate-pulse'
                          : 'bg-gray-50 text-membrane-dark border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {c.built && <span className="mr-1">✅</span>}
                      {!c.built && isBuilding && <span className="mr-1">⚙️</span>}
                      {c.need}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Particle Effects */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute pointer-events-none text-2xl"
                style={{ left: `${particle.x}%`, top: `${particle.y}%`, color: particle.color }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0, y: -80 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                {particle.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Combo Display */}
          <AnimatePresence>
            {showCombo && combo >= 2 && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
                  {combo}x COMBO!
                </div>
                <div className="text-center mt-2 text-2xl">
                  🔥🔥🔥
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Panel */}
      <div className="px-6 pb-6">
        <div className="rounded-xl bg-white border border-membrane-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMembrane((m) => !m)}
                className={`relative px-6 py-3.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                  membrane
                    ? 'bg-gradient-to-b from-[#35374F] to-[#0D0D12] text-white shadow-sm hover:-translate-y-0.5'
                    : 'bg-gray-100 text-membrane-dark hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {membrane && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
                {membrane ? '✨ Membrane ON' : 'Enable Membrane'}
              </button>
              <div className="text-xs text-membrane-gray">
                {membrane ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Auto-building in parallel at 3× speed</span>
                  </div>
                ) : (
                  <span>Click customers to build manually</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPaused((p) => !p)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-membrane-dark text-sm font-medium transition-colors border border-gray-200"
              >
                {paused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-colors border border-red-200"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
