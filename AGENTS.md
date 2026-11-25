# GV Coaching project guidance

## Persistent owner preference: one website background

- Keep one continuous background across the GV Coaching website, including existing and future full-width sections, the page canvas, and the footer.
- The current base is dark navy `#07111F`, exposed as `--site-bg` in `app/public/assets/css/pages/home.css`. Reuse this token for new homepage sections.
- Keep collage edge fades and other media masks blended into the same page background. Avoid introducing alternating light and dark section backgrounds unless the owner explicitly changes this preference.
- Media, buttons, and contained component surfaces may retain their own styling; they should sit on the continuous page canvas.

## Scroll text motion

- Keep text reveals linked to scroll progress and reversible when scrolling back.
- Preserve readable static content when reduced motion is requested or animation libraries are unavailable.
- The owner wants cinematic staging inspired by thegrind.nl: oversized changing display text, slow image movement, and a portrait that pulls back into a staggered image collage. Keep Gabriel and the GV Coaching identity central.

## Claude review preference

- For project design and copy work, consult the owner's Claude session when available. The owner explicitly welcomes its use in ongoing conversations.
- Only claim Claude reviewed work when that review actually happened. Continue implementation and live verification here.
