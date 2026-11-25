# GV Coaching project guidance

## Persistent owner preference: one website background

- Keep one continuous background across the GV Coaching website, including existing and future full-width sections, the page canvas, and the footer.
- The current base is dark navy `#07111F`, exposed as `--site-bg` in `app/public/assets/css/pages/home.css`. Reuse this token for new homepage sections.
- Keep collage edge fades and other media masks blended into the same page background. Avoid introducing alternating light and dark section backgrounds unless the owner explicitly changes this preference.
- Media, buttons, and contained component surfaces may retain their own styling; they should sit on the continuous page canvas.

## Scroll text motion

- Keep text reveals linked to scroll progress and reversible when scrolling back.
- Preserve readable static content when reduced motion is requested or animation libraries are unavailable.
