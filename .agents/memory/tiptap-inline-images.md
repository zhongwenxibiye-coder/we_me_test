---
name: TipTap inline images
description: How inline image insertion works in RichTextArea and episode editor
---

**Package:** `@tiptap/extension-image` installed in `artifacts/wemi`. Peer dependency warning (core 3.27.0 vs 3.29.2 expected) is non-blocking.

**Usage:** `<RichTextArea enableImages />` adds Image extension + image upload toolbar button. Images are stored as base64 in the HTML content.

**Express body limit:** Increased to `20mb` in api-server to accommodate base64 images in episode content.

**Episode editor migration:** When admin opens old episode for editing (`startEdit`), if `ep.images` array is non-empty AND content doesn't already have `<img>` tags, old images are appended as inline `<img>` elements at the end of content. This auto-migrates old episodes to inline format.

**Backward compat:** Old episodes that were never re-edited still display `episode.images` at the bottom via CreativeEpisode.tsx rendering.

**Why:** Users wanted to position images between paragraphs, not just at the bottom. Inline HTML approach avoids custom JSON format and keeps content portable.
