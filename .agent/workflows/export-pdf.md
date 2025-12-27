---
description: Convert markdown files to PDF using md-to-pdf
---

# /export-pdf - Markdown to PDF Conversion

Use this workflow to convert markdown documentation to professional dark-mode PDFs.

## When to Use
- Creating shareable documentation
- Generating printable reports
- Exporting walkthroughs or guides

## Output Directory

All PDFs are exported to: `c:\antigravity\exports\`

## Prerequisites

- Node.js installed
- No additional installation required (uses npx)

## Steps

### 1. Prepare the Markdown File

Ensure images use **relative paths** (e.g., `./image.png`) and are in the same folder as the markdown file, or copy them to `exports/` first.

### 2. Add Dark Mode Styling

Add this frontmatter and CSS block at the top of your markdown file:

```markdown
---
pdf_options:
  format: A4
  margin: 0mm
  printBackground: true
---

<style>
body {
  font-family: 'Inter', sans-serif;
  background: #1a1b1e;
  color: #e0e0e0;
  line-height: 1.45;
  font-size: 10pt;
  padding: 10mm 14mm;
  margin: 0;
}
h1, h2, h3 { color: #ffffff; }
h1 { font-size: 20pt; border-bottom: 2px solid #4dabf7; }
h2 { font-size: 13pt; page-break-after: avoid; }
h3 { font-size: 10pt; color: #4dabf7; }
table { width: 100%; background: #1a1b1e; page-break-inside: avoid; }
th { background: #2a2b30; color: #fff; border-bottom: 2px solid #4dabf7; }
td { background: #1a1b1e; color: #fff; border-bottom: 1px solid #444; }
tr:nth-child(even) td { background: #222326; }
code { background: #2c2e33; color: #c9b1ff; }
img { max-width: 42%; display: block; margin: 6px auto; }
blockquote { background: #25262b; border-left: 3px solid #4dabf7; }
hr { border: none; height: 1px; background: #444; }
</style>
```

### 3. Generate PDF
// turbo
```powershell
npx -y md-to-pdf "c:\antigravity\exports\your-file.md"
```

### 4. Inspect with Browser Tool

After generating, **always inspect the PDF** using the browser subagent:

```
Use browser_subagent to open file:///c:/antigravity/exports/your-file.pdf
Check for:
- Image sizing (should be ~40-50% width, not overwhelming)
- Text contrast (white text on dark backgrounds)
- Page breaks (no content cut mid-section)
- Overall layout balance
```

### 5. Iterate Until Satisfied

If issues are found:
1. Adjust CSS in the markdown (font sizes, image max-width, margins)
2. Regenerate PDF
3. Re-inspect with browser tool
4. Repeat until layout looks professional

## Key CSS Adjustments

| Issue | Fix |
|-------|-----|
| Images too large | Reduce `img { max-width: X%; }` |
| Text hard to read | Increase color brightness (use `#ffffff` or `#e0e0e0`) |
| Content cut by page break | Add `page-break-inside: avoid;` to that element |
| Tables have light backgrounds | Ensure `td`, `th` have dark `background` values |
| Font too small/large | Adjust `font-size` in `body` or specific elements |

## Color Palette (Antigravity Dark Theme)

| Purpose | Color | Hex |
|---------|-------|-----|
| Page background | Dark charcoal | `#1a1b1e` |
| Table header bg | Slightly lighter | `#2a2b30` |
| Alternating row bg | Subtle contrast | `#222326` |
| Code block bg | Tertiary dark | `#2c2e33` |
| Primary text | Light gray | `#e0e0e0` |
| Headings | Pure white | `#ffffff` |
| Accent (links, h3) | Blue | `#4dabf7` |
| Code text | Purple | `#c9b1ff` |
| Borders | Medium gray | `#444` |

## Page Break Control

Add these CSS rules to prevent awkward page breaks:

```css
/* Keep headings with their content */
h2, h3 { page-break-after: avoid; }

/* Start major sections on new pages */
h2 { page-break-before: always; }
h2:first-of-type { page-break-before: avoid; }

/* Keep these elements from being split */
table, ul, ol, blockquote, pre, img {
  page-break-inside: avoid;
}

/* Prevent orphan/widow lines */
p { orphans: 3; widows: 3; }
```

## Notes

- First run downloads Chromium (~150MB) - subsequent runs are fast
- `printBackground: true` is **required** for dark mode to render
- Images must use relative paths from the markdown file location
- All exports go to `c:\antigravity\exports\` for easy access
