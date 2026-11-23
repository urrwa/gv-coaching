# GV Coaching website connections

Vercel serves the existing static site from `app/public`. The separate `/api/leads` Vercel Function accepts both existing form payloads: `contact` and `performance-check`.

## Contact delivery

1. Set the server-only Vercel environment variable `LEAD_WEBHOOK_URL` to the client's confirmed HTTPS CRM or automation endpoint. If that endpoint requires a bearer token, set `LEAD_WEBHOOK_TOKEN` as a secret environment variable. Never put either value in public JavaScript.
2. Configure the receiving workflow to retain the submission ID and notify the confirmed recipient. Treat question answers as user-supplied information. Do not make medical or eligibility decisions from them.
3. Redeploy after setting the environment variables. Confirm an authorized end-to-end test reaches the intended recipient before announcing form readiness.
4. Set `formEndpoint` in `app/public/assets/js/config.js` to `/api/leads` only after delivery is configured. Keep it empty until then, so visitors do not submit to an unconfigured service. Set `contactEmail` and `bookingUrl` only to client-confirmed values.

The function validates the origin, payload size, required fields, email and explicit consent. It strips query parameters from the page URL and forwards an allowlisted payload. It reports success only after the receiving service accepts the request; absent configuration and upstream failures produce errors. Its honeypot does not replace server-side rate limiting: enable provider/WAF rate limiting before activation. Do not put personal form data into logs.

## Domain

Vercel's current project instructions require these Cloudflare records (verify the target in Vercel before changing DNS):

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | @ | 0832d504a4eb3d13.vercel-dns-017.com | DNS only |
| CNAME | www | 0832d504a4eb3d13.vercel-dns-017.com | DNS only |

Replace only conflicting web records. Preserve MX, email-related TXT records and unrelated subdomains. The existing Vercel apex redirect sends `gvcoaching.com` to `www.gvcoaching.com`.

## Legal details

The current page still requires the client's confirmed legal business name, address/country, email, telephone, applicable registration/tax details and actual data-retention/provider information. Do not substitute agency details, invent contact data or remove placeholder notices before this information is supplied. Check that the privacy text describes the actual configured workflow before activating delivery.

The supplied ChatGPT share (https://chatgpt.com/s/t_6afd5e164024819195f94d89e1896f73) contains the offer and page copy, but no contact email, address or booking URL. ClickUp task 869e6fzec links a Drive folder containing section images; it has no task attachments or custom-field contact details.

## Search indexing

The homepage permits indexing and `robots.txt` allows crawling and declares the existing sitemap. Error/thank-you page exclusions remain unchanged. The custom domain must serve this website before Google can use its canonical URL reliably; allowing indexing does not guarantee immediate inclusion in search results.
