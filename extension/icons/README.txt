Icon Requirements for Chrome Extension
======================================

You need to create PNG icons in the following sizes:

1. icon16.png  - 16x16 pixels (toolbar icon, small)
2. icon48.png  - 48x48 pixels (extensions page)
3. icon128.png - 128x128 pixels (Chrome Web Store)

Quick options:

Option 1: Use an online icon generator
- Go to https://favicon.io/ or similar
- Create a simple icon with initials "JT"
- Download and rename to the sizes above

Option 2: Create with ImageMagick (if installed)
- Run: convert -size 128x128 xc:#6366f1 -fill white -gravity center \
        -pointsize 64 -annotate 0 'JT' icon128.png
- Then resize for other sizes

Option 3: Use any image editor
- Create a simple purple (#6366f1) square
- Add white "JT" text
- Export at each size

The extension will still work without icons, but Chrome will show default placeholders.
