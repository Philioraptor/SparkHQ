import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return new Response(
      `<html><body><script>alert('LinkedIn Connection Cancelled'); window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // HTML callback window to save token into opener window's localStorage vault
  const htmlResponse = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>LinkedIn Connected - SparkHQ</title>
        <style>
          body { background: #080B11; color: #f1f5f9; font-family: sans-serif; text-align: center; padding: 40px; }
          .card { background: #0f172a; padding: 30px; border-radius: 16px; border: 1px solid #1e293b; max-width: 400px; margin: 0 auto; }
          h2 { color: #38bdf8; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🎉 LinkedIn Connected!</h2>
          <p>Saving OAuth token to your browser vault...</p>
          <script>
            try {
              const existing = JSON.parse(localStorage.getItem('sparkhq_user_api_vault') || '{}');
              existing.linkedinAccessToken = "${code}";
              localStorage.setItem('sparkhq_user_api_vault', JSON.stringify(existing));
            } catch (e) {}
            setTimeout(() => {
              window.close();
            }, 1500);
          </script>
        </div>
      </body>
    </html>
  `;

  return new Response(htmlResponse, { headers: { 'Content-Type': 'text/html' } });
}
