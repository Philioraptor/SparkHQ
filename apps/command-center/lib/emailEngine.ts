export interface OnboardingEmailPayload {
  toEmail: string;
  userName?: string;
  sequenceType: 'DAY_0_WELCOME' | 'DAY_3_FEATURE_SPOTLIGHT' | 'DAY_7_INACTIVITY_ALERT';
}

export async function sendOnboardingEmail({ toEmail, userName = 'Founder', sequenceType }: OnboardingEmailPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;

  let subject = '';
  let htmlContent = '';

  switch (sequenceType) {
    case 'DAY_0_WELCOME':
      subject = `Welcome to SparkHQ, ${userName}! 🚀 Here is your 1-minute Quickstart`;
      htmlContent = `
        <div style="font-family: sans-serif; background: #0B0F17; color: #F3F4F6; padding: 24px; borderRadius: 12px;">
          <h2 style="color: #3B82F6;">Welcome to Project SparkHQ AI C-Suite!</h2>
          <p>Hi ${userName},</p>
          <p>You have unlocked the autonomous AI C-Suite built for solo founders. Turn vision into GitHub PRs and LinkedIn posts with 1-click approvals.</p>
          <div style="background: #111827; padding: 16px; border-radius: 8px; border: 1px solid #1F2937; margin: 16px 0;">
            <strong>🚀 1-Minute Quickstart:</strong>
            <ol>
              <li>Open your Command Center Dashboard.</li>
              <li>Input your feature request in the Founder Console.</li>
              <li>Click <strong>Approve & Execute</strong> on generated PRs.</li>
            </ol>
          </div>
          <p style="color: #9CA3AF; font-size: 12px;">SparkHQ Autonomous Systems • Dhruv Mishra</p>
        </div>
      `;
      break;

    case 'DAY_3_FEATURE_SPOTLIGHT':
      subject = `💡 Pro Tip: Zero-Exhaustion 1-Click Approvals in SparkHQ`;
      htmlContent = `
        <div style="font-family: sans-serif; background: #0B0F17; color: #F3F4F6; padding: 24px; borderRadius: 12px;">
          <h2 style="color: #8B5CF6;">Feature Spotlight: Self-Healing Bug Loop</h2>
          <p>Hi ${userName},</p>
          <p>Did you know? When users report bugs on your app, the <strong>AI Support Agent</strong> automatically logs the issue, and the <strong>CTO Agent</strong> writes the bugfix PR for you!</p>
          <p style="color: #9CA3AF; font-size: 12px;">SparkHQ Autonomous Systems</p>
        </div>
      `;
      break;

    case 'DAY_7_INACTIVITY_ALERT':
      subject = `⚡ We missed you! SparkHQ AI C-Suite is ready for your next feature`;
      htmlContent = `
        <div style="font-family: sans-serif; background: #0B0F17; color: #F3F4F6; padding: 24px; borderRadius: 12px;">
          <h2 style="color: #06B6D4;">Keep Your Product Momentum Going</h2>
          <p>Hi ${userName},</p>
          <p>Your AI CTO and CMO agents are waiting for your next goal prompt. Launch a new feature or draft a LinkedIn update today!</p>
          <a href="https://sparkhq.vercel.app" style="background: #3B82F6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 12px;">Open Command Center</a>
        </div>
      `;
      break;
  }

  if (!resendApiKey) {
    console.log(`[Email Engine Notice] RESEND_API_KEY not configured. Executing simulated email dispatch [${sequenceType}] to ${toEmail}`);
    return {
      success: true,
      delivered: true,
      mode: 'SIMULATED',
      toEmail,
      subject,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SparkHQ <onboarding@sparkhq.ai>',
        to: [toEmail],
        subject,
        html: htmlContent
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API error: ${errText}`);
    }

    const data = await res.json();
    return {
      success: true,
      delivered: true,
      mode: 'LIVE_RESEND_API',
      emailId: data.id,
      toEmail
    };
  } catch (err: any) {
    console.error('[Email Engine Error]', err.message);
    return {
      success: false,
      delivered: false,
      error: err.message
    };
  }
}
