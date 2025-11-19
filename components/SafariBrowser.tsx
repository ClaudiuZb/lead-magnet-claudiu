'use client';

interface SafariBrowserProps {
  companyUrl: string;
  integrationName: string;
  integrationUrl: string;
  integrationDescription: string;
}

export default function SafariBrowser({ companyUrl, integrationName, integrationUrl, integrationDescription }: SafariBrowserProps) {
  const companyName = companyUrl.split('.')[0];
  const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

  // Dummy integrations to make it look realistic
  const dummyIntegrations = [
    { name: 'Linear', url: 'linear.app', description: 'Streamline software projects, sprint planning, and bug tracking with Linear\'s tools.', enabled: true },
    { name: 'Loom', url: 'loom.com', description: 'Boost your team\'s productivity with async video collaboration and recording.', enabled: true },
    { name: 'Zapier', url: 'zapier.com', description: 'Build custom automations and integrations with apps that your team uses every day.', enabled: false },
    { name: 'Mailchimp', url: 'mailchimp.com', description: 'Grow your business an all-in-One marketing, automation & email marketing platform.', enabled: false },
    { name: 'Dropbox', url: 'dropbox.com', description: 'Seamlessly connect your team\'s cloud files and storage with current projects.', enabled: true },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Safari top bar */}
      <div className="h-12 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300 flex items-center px-4 gap-3">
        {/* Navigation arrows */}
        <div className="flex gap-2">
          <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition text-gray-300">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* URL bar */}
        <div className="flex-1 bg-white rounded-md border border-gray-300 px-3 py-1.5 flex items-center gap-2 shadow-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm text-gray-700">{capitalizedName}.com/settings/integrations</span>
        </div>

        {/* Share button */}
        <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Page content with sidebar */}
      <div className="flex flex-1 overflow-hidden bg-white">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
          {/* Company header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="font-semibold text-gray-900">{capitalizedName}</span>
              <div className="ml-auto">
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
                <svg className="ml-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Dashboard</span>
                <svg className="ml-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>Projects</span>
                <svg className="ml-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Tasks</span>
                <svg className="ml-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>

              {/* Settings - expanded */}
              <div>
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                  <svg className="ml-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>

                {/* Submenu */}
                <div className="ml-6 mt-1 space-y-1">
                  <div className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">My details</div>
                  <div className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Profile</div>
                  <div className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Security</div>
                  <div className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded cursor-pointer font-medium">Integrations</div>
                  <div className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Billing</div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Messages</span>
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations and connected apps</h1>
            <p className="text-gray-600">Supercharge your workflow and connect the tool you use every day.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200 mb-8">
            <button className="pb-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-gray-900">All integrations</button>
            <button className="pb-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">Developer tools</button>
            <button className="pb-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">Communication</button>
            <button className="pb-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">Productivity</button>
            <button className="pb-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">Custom integrations</button>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* NEW INTEGRATION - The one just created */}
            <div className="bg-white border-2 border-green-500 rounded-xl p-6 shadow-sm hover:shadow-md transition relative">
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                NEW
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://logo.clearbit.com/${integrationUrl}`}
                      onError={(e) => {
                        e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${integrationUrl}&sz=128`;
                      }}
                      alt={integrationName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integrationName}</h3>
                    <p className="text-xs text-gray-500">{integrationUrl}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{integrationDescription}</p>
              <div className="flex items-center justify-between">
                <button className="text-sm text-gray-700 hover:text-gray-900 font-medium">View integration</button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked readOnly />
                  <div className="w-11 h-6 bg-blue-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>

            {/* DUMMY INTEGRATIONS */}
            {dummyIntegrations.map((integration) => (
              <div key={integration.name} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://logo.clearbit.com/${integration.url}`}
                        onError={(e) => {
                          e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${integration.url}&sz=128`;
                        }}
                        alt={integration.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-xs text-gray-500">{integration.url}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{integration.description}</p>
                <div className="flex items-center justify-between">
                  <button className="text-sm text-gray-700 hover:text-gray-900 font-medium">View integration</button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={integration.enabled} readOnly />
                    <div className={`w-11 h-6 ${integration.enabled ? 'bg-blue-600' : 'bg-gray-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
