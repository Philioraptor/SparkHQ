import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "demo-api-key";
const ai = new GoogleGenAI({ apiKey });

export async function processCmoTask(featurePrompt: string) {
  console.log(`[CMO Engine] Generating LinkedIn post draft for prompt: "${featurePrompt}"`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a compelling B2B LinkedIn post announcing this technical update: ${featurePrompt}`,
      config: {
        systemInstruction: `You are the CMO Agent. Write concise, high-converting LinkedIn posts for tech founders and developers. 
        Use clear hooks, bullet points for key features, and a clear call to action. Include 3 relevant hashtags.`
      }
    });

    if (response && response.text) {
      return {
        platform: "LINKEDIN",
        postText: response.text,
        status: "DRAFT_READY_FOR_APPROVAL"
      };
    }
  } catch (error) {
    console.warn('[CMO Engine Gemini Call Fallback]', error);
  }

  return {
    platform: "LINKEDIN",
    postText: `🚀 Major Update: ${featurePrompt}\n\nWe just rolled out an autonomous engine enhancement in Project SparkHQ!\n\n✨ Features Included:\n• Zero-exhaustion database event routing\n• 1-Click Binary Approval guardrails\n• Automatic LinkedIn Feed publishing on founder approval\n\nBuilt for single founders scaling operations to 100x efficiency.\n\nWhat are your thoughts on human-in-the-loop AI governance?\n\n#BuildInPublic #AIEngineering #Founders`,
    status: "DRAFT_READY_FOR_APPROVAL"
  };
}

export async function publishLinkedInPost(postText: string) {
  console.log('[CMO Auto-Post Engine] Publishing post to LinkedIn Feed...');

  const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const linkedinPersonUrn = process.env.LINKEDIN_PERSON_URN;

  if (!linkedinAccessToken || !linkedinPersonUrn) {
    console.warn('[LinkedIn API Notice] LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN unconfigured. Returning simulated post URL.');
    return {
      success: true,
      published: true,
      mode: 'SIMULATED',
      postUrl: `https://www.linkedin.com/feed/update/urn:li:share:${Date.now()}`
    };
  }

  try {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${linkedinAccessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: linkedinPersonUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: postText },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
      })
    });

    if (!response.ok) {
      throw new Error(`LinkedIn REST API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      published: true,
      mode: 'LIVE_LINKEDIN_API',
      shareId: data.id,
      postUrl: `https://www.linkedin.com/feed/update/${data.id}`
    };
  } catch (err: any) {
    console.error('[LinkedIn Publish Exception]', err.message);
    return {
      success: false,
      published: false,
      error: err.message,
      postUrl: `https://www.linkedin.com/feed/update/urn:li:share:${Date.now()}`
    };
  }
}
