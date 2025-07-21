---
"svelte": patch
---

docs: improve a11y_invalid_attribute warning documentation

Enhance documentation for href validation warnings to better explain accessibility concerns and provide clear alternatives. This addresses confusion from issue #15654.

- Explain why href="#", empty href, and javascript: URLs are problematic for accessibility
- Provide practical alternatives (buttons for actions, valid hrefs for navigation)
- Include styling examples for making buttons look like links
- Add development placeholder suggestions