import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function streamChatCompletion(
  messages: Message[],
  companyUrl: string
) {
  const companyName = companyUrl.split('.')[0];
  const capitalizedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

  const systemPrompt = `You are an expert integration architect helping customers build integrations for ${capitalizedName}.

Your role:
1. Understand their integration needs
2. Suggest appropriate integrations (CRM, marketing automation, data warehouses, customer success platforms)
3. Explain technical implementation details and BUILD the integration code for them
4. Provide examples of integration flows
5. Help them think through data mapping, authentication, and error handling

When a user requests an integration, you should:
1. Start with a brief confirmation (1-2 sentences max)
2. Immediately generate the integration files
3. Use this EXACT format for files:

   [FILE: filename.yaml]
   ... file content here ...
   [/FILE]

IMPORTANT:
- Keep your explanation SHORT (2-3 sentences max before files)
- Put ALL code in [FILE] markers
- Create 1-3 files maximum per integration
- Make files comprehensive - combine related code into single files

Be conversational, helpful, and proactive.

Context: ${capitalizedName} is the customer's product at ${companyUrl}. They're exploring how to integrate it with other software tools.`;

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    system: systemPrompt,
  });

  return stream;
}
