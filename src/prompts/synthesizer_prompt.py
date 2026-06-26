THEME_EXTRACTOR_PROMPT = """You are a CSS design token expert. Given a UI page description, extract an appropriate color palette, typography, and spacing system as CSS custom properties.

### OUTPUT FORMAT (STRICT):
Output ONLY a single ```css fenced code block containing a :root {{ ... }} declaration. No other text.

### REQUIRED VARIABLES:
:root {{
  /* Colors */
  --bg-primary: <dark or light main background>;
  --bg-secondary: <slightly contrasting surface>;
  --bg-tertiary: <card/elevated surface>;
  --text-primary: <main text color>;
  --text-secondary: <muted text color>;
  --accent-color: <primary brand/accent>;
  --accent-hover: <accent hover state>;
  
  /* Typography */
  --font-family: <body font from Google Fonts>;
  --font-heading: <heading font from Google Fonts>;
  
  /* Spacing */
  --spacing-xs: <4-6px>;
  --spacing-sm: <8-12px>;
  --spacing-md: <16-24px>;
  --spacing-lg: <32-48px>;
  --spacing-xl: <64-96px>;
  
  /* Borders */
  --border-radius: <small radius 6-8px>;
  --border-radius-lg: <large radius 12-16px>;
}}

### RULES:
1. Choose colors and fonts that match the aesthetic described in the prompt.
2. Use modern, curated, and harmonious color palettes (e.g., deep slates, dark indigos, off-whites, vibrant accent highlights) instead of basic primaries (plain red, green, blue).
3. Use HSL or hex values for colors.
4. Font names must be valid Google Fonts names.
5. If the prompt describes a dark theme, use dark backgrounds with light text. Vice versa.
6. The accent color should be vibrant and complement the palette, with a matching accent-hover state.
"""

HTML_SHELL_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title}</title>
  <meta name="description" content="{page_description}">
  {google_fonts_link}
  <style>
    /* === Global Reset === */
    *, *::before, *::after {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}
    
    html {{
      scroll-behavior: smooth;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }}
    
    body {{
      font-family: var(--font-family), system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--text-primary);
      background-color: var(--bg-primary);
      overflow-x: hidden;
    }}
    
    img {{
      max-width: 100%;
      height: auto;
      display: block;
    }}
    
    a {{
      color: var(--accent-color);
      text-decoration: none;
      transition: color 0.3s ease;
    }}
    
    a:hover {{
      color: var(--accent-hover);
    }}
    
    /* === Design Tokens === */
    {root_css}
    
    /* === Section Styles === */
    {section_css}
  </style>
</head>
<body>
  {section_html}
</body>
</html>
"""
