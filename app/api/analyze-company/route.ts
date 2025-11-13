import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Extract company name from URL
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname.replace('www.', '');
    const companyName = domain.split('.')[0];
    const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

    // Fetch webpage content
    let pageContent = '';
    try {
      const pageResponse = await fetch(urlObj.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const html = await pageResponse.text();

      // Extract text content (remove scripts, styles, and HTML tags)
      pageContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000);
    } catch (error) {
      console.error('Error fetching page:', error);
      pageContent = 'Unable to fetch page content';
    }

    // Call Claude to analyze
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Analyze this company website and provide integration suggestions.

Company: ${capitalizedName}
Domain: ${domain}
Page content: ${pageContent}

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "companyName": "Company Name",
  "productTagline": "Short tagline (max 8 words)",
  "productDescription": "1-2 sentence description of what they do",
  "suggestedUseCases": [
    "Sync customer data with HubSpot CRM for unified sales pipeline",
    "Send product analytics events to Segment for behavior tracking",
    "Connect support tickets to Slack for real-time team notifications",
    "Integrate billing events with Stripe for automated invoicing"
  ]
}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);

      // Fallback response
      return new Response(
        JSON.stringify({
          companyName: capitalizedName,
          productTagline: 'Modern SaaS Platform',
          productDescription: 'A powerful platform for modern businesses looking to scale their operations.',
          suggestedUseCases: [
            'Sync customer records with Salesforce for unified customer view',
            'Send product usage events to analytics platforms like Mixpanel',
            'Connect support tickets to project management tools like Linear',
            'Integrate payment data with accounting software like QuickBooks'
          ]
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let analysis = data.content[0].text;

    // Clean up response - remove markdown if present
    analysis = analysis.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsedAnalysis = JSON.parse(analysis);

    return new Response(
      JSON.stringify(parsedAnalysis),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-company:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze company' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
