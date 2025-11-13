# Membrane Lead Magnet - Interactive Integration IDE

A Next.js demo showcasing real-time AI-powered integration code generation with an IDE-like interface.

## Features

- 🤖 **AI-Powered Integration Builder** - Uses Claude Sonnet 4.5 to generate integration code in real-time
- 💻 **VS Code-Style IDE Interface** - Familiar file tree, code editor, and chat interface
- ⚡ **Real-Time Code Streaming** - Watch as AI writes code character-by-character
- 📁 **Dynamic File Generation** - Files appear instantly in the tree as they're created
- 🔧 **Live Terminal Feedback** - See AI thinking and progress in a terminal-style console
- 📧 **Email Capture Overlay** - Smart timing for lead generation (45 seconds after load)

## Tech Stack

- **Next.js 14** - App Router with Edge Runtime
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Anthropic Claude API** - AI code generation with streaming
- **Server-Sent Events** - Real-time streaming from Edge functions

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd lead-magnet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Then add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `ANTHROPIC_API_KEY`
   - Click "Deploy"

3. Your app will be live at `https://your-project.vercel.app`

## How It Works

1. **Company Analysis** - Enter a company URL (e.g., `salesforce.com`)
2. **AI Suggestions** - Claude analyzes the company and suggests 3 integration ideas
3. **Real-Time Generation** - Click a suggestion to watch AI build the integration live
4. **Interactive IDE** - View generated code in a familiar VS Code-style interface

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/          # Streaming chat endpoint
│   │   └── analyze-company/  # Company analysis endpoint
│   ├── [url]/             # Dynamic route for company URLs
│   └── page.tsx           # Landing page
├── components/
│   ├── ChatPanel.tsx      # AI chat interface
│   ├── CodePanel.tsx      # Code viewer with syntax highlighting
│   ├── FileTree.tsx       # File explorer sidebar
│   ├── IDEInterface.tsx   # Main IDE layout
│   └── EmailCaptureOverlay.tsx  # Lead capture modal
└── lib/
    └── claude.ts          # Claude API integration
```

## Performance Optimizations

- ✅ Edge Runtime for low-latency streaming
- ✅ Real-time file detection during streaming (no waiting for completion)
- ✅ Immutable state patterns to prevent UI glitches
- ✅ Efficient regex parsing for file markers
- ✅ Optimized React re-renders

## License

MIT

## Created By

Built as a demo for Membrane's integration platform.
