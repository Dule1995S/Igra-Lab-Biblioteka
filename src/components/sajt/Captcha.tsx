import Script from "next/script";

/** Cloudflare Turnstile. Prikazuje se samo ako je podešen NEXT_PUBLIC_TURNSTILE_SITE_KEY. */
export default function Captcha() {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!key) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="cf-turnstile" data-sitekey={key} />
    </>
  );
}

/** Token koji Turnstile upisuje u formu; undefined ako captcha nije uključena. */
export function captchaToken(formData: FormData) {
  return String(formData.get("cf-turnstile-response") ?? "") || undefined;
}
