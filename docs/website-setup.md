# GV Coaching website connections

Vercel serves the existing static site from `app/public`. The separate `/api/leads` Vercel Function accepts both existing form payloads: `contact` and `performance-check`.

## Contact delivery

1. Set the server-only Vercel environment variable `LEAD_WEBHOOK_URL` to the client's confirmed HTTPS CRM or automation endpoint. If that endpoint requires a bearer token, set `LEAD_WEBHOOK_TOKEN` as a secret environment variable. Never put either value in public JavaScript.
2. Configure the receiving workflow to retain the submission ID and notify the confirmed recipient. Treat question answers as user-supplied information. Do not make medical or eligibility decisions from them.
3. Redeploy after setting the environment variables. Confirm an authorized end-to-end test reaches the intended recipient before announcing form readiness.
4. Set `formEndpoint` in `app/public/assets/js/config.js` to `/api/leads` only after delivery is configured. Keep it empty until then, so visitors do not submit to an unconfigured service. `contactEmail` is now set to the client-approved `support@gvcoaching.com`; with no server endpoint, the existing forms open a local email draft and clearly require the visitor to send it. This is not verified delivery. Set `bookingUrl` only after a real calendar is provided.

The function validates the origin, payload size, required fields, email and explicit consent. It strips query parameters from the page URL and forwards an allowlisted payload. It reports success only after the receiving service accepts the request; absent configuration and upstream failures produce errors. Its honeypot does not replace server-side rate limiting: enable provider/WAF rate limiting before activation. Do not put personal form data into logs.

## Confirmed client details

Supplied in the client message on 23 November 2026:

- Operator: Gabriel Vogt / GV Coaching
- Address: Lukasstraße 17, 75172 Pforzheim, Deutschland
- Approved support address: support@gvcoaching.com
- Logo: option 03, the kettlebell / V emblem with the blue COACHING wordmark
- Domain: the client says it still needs to be purchased; ownership of gvcoaching.com is not established.

The address and email are displayed in the homepage, Impressum and privacy contact details. No telephone, tax ID or registration number has been invented.

## Domain

The live canonical URL and sitemap currently use https://gv-coaching-rho.vercel.app/. Do not change DNS or send a domain-purchase request on behalf of the client. Wait for the exact purchased domain and authorized DNS access; then update canonical/social/structured-data URLs consistently and verify email delivery. The existing unrelated page on gvcoaching.com is not evidence of client ownership.


For the previously configured target, Vercel's project instructions showed these Cloudflare records (verify the target in Vercel before changing DNS):

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | @ | 0832d504a4eb3d13.vercel-dns-017.com | DNS only |
| CNAME | www | 0832d504a4eb3d13.vercel-dns-017.com | DNS only |

Replace only conflicting web records. Preserve MX, email-related TXT records and unrelated subdomains. The existing Vercel apex redirect sends `gvcoaching.com` to `www.gvcoaching.com`.

## Legal details

The confirmed operator name, address and approved email have been applied. Remaining provider/privacy wording must be checked against the eventual active setup. Do not substitute agency details, invent contact data or remove placeholder notices before this information is supplied. Check that the privacy text describes the actual configured workflow before activating delivery.

The supplied ChatGPT share (https://chatgpt.com/s/t_6afd5e164024819195f94d89e1896f73) contains the offer and page copy, but no contact email, address or booking URL. ClickUp task 869e6fzec links a Drive folder containing section images; it has no task attachments or custom-field contact details.

## Search indexing

The homepage permits indexing and `robots.txt` allows crawling and declares the existing sitemap. Error/thank-you page exclusions remain unchanged. The temporary live URL is used as the homepage canonical until the client owns and connects the final domain. Allowing indexing does not guarantee immediate inclusion in search results.
