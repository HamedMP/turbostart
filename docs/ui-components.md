# UI Components

This guide covers the UI setup including shadcn/ui components, hugeicons, and theming.

## Stack Overview

- **[shadcn/ui](https://ui.shadcn.com/)** - Beautifully designed components built with Radix UI and Tailwind CSS
- **[hugeicons](https://hugeicons.com/)** - 4000+ beautiful icons with React support
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework

## Adding shadcn Components

Components are installed to the shared `packages/ui` package:

```bash
cd apps/frontend

# Add a component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dropdown-menu

# Add multiple components
npx shadcn@latest add dialog alert-dialog sheet
```

### Import Components

```tsx
import { Button } from '@workspace/ui/components/button'
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card'
```

### Configuration

The shadcn configuration is in `apps/frontend/components.json`:

```json
{
  "style": "base-maia",
  "iconLibrary": "hugeicons",
  "tailwind": {
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@workspace/ui/lib/utils",
    "ui": "@workspace/ui/components"
  }
}
```

## Using Hugeicons

### Installation

Already included in the template. The packages are:
- `@hugeicons/react` - React wrapper component
- `@hugeicons/core-free-icons` - Free icon set (4000+ icons)

### Basic Usage

```tsx
import { HugeiconsIcon } from '@hugeicons/react'
import { Rocket01Icon, SettingsIcon, UserIcon } from '@hugeicons/core-free-icons'

function MyComponent() {
  return (
    <div className="flex gap-4">
      <HugeiconsIcon icon={Rocket01Icon} className="w-6 h-6" />
      <HugeiconsIcon icon={SettingsIcon} className="w-6 h-6 text-primary" />
      <HugeiconsIcon icon={UserIcon} className="w-5 h-5 text-muted-foreground" />
    </div>
  )
}
```

### With Buttons

```tsx
import { Button } from '@workspace/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Download01Icon } from '@hugeicons/core-free-icons'

<Button>
  <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
  Add Item
</Button>

<Button variant="outline" size="icon">
  <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
</Button>
```

### Finding Icons

1. **MCP Server (Recommended):** The template includes hugeicons MCP server in `.mcp.json`. Claude Code can search icons automatically.

2. **Website:** Browse icons at [hugeicons.com](https://hugeicons.com/)

3. **Common Icons:**
   - Navigation: `ArrowLeft01Icon`, `ArrowRight01Icon`, `ChevronDownIcon`
   - Actions: `PlusSignIcon`, `Edit01Icon`, `Delete01Icon`, `Download01Icon`
   - UI: `SettingsIcon`, `SearchIcon`, `MenuIcon`, `CloseIcon`
   - Status: `CheckIcon`, `AlertCircleIcon`, `InfoCircleIcon`

## Theming

### Color System

The template uses a lime-based theme. Colors are defined in `apps/frontend/src/styles.css`:

```css
:root {
  --primary: oklch(0.65 0.18 132);          /* Lime green */
  --primary-foreground: oklch(0.99 0.03 121);
  --background: oklch(1 0 0);               /* White */
  --foreground: oklch(0.145 0 0);           /* Near black */
  /* ... more variables */
}

.dark {
  --primary: oklch(0.77 0.20 131);
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode overrides */
}
```

### Customizing Colors

1. **Change primary color:** Update `--primary` in both `:root` and `.dark`

2. **Use a different base:** Run shadcn init with a different base color:
   ```bash
   npx shadcn@latest init
   # Choose your preferred base color
   ```

3. **Generate colors:** Use [oklch color picker](https://oklch.com/) for OKLCH values

### Dark Mode

The template supports dark mode via the `.dark` class:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark')

// Or use a theme provider
import { ThemeProvider } from 'next-themes'
```

## Tailwind CSS 4

### Key Features

- **`@theme inline`:** CSS variables are mapped to Tailwind utilities in `styles.css`
- **No config file:** Tailwind 4 uses CSS-based configuration
- **Automatic dark mode:** Uses `@custom-variant dark (&:is(.dark *))`

### Using Theme Colors

```tsx
// Background and text
<div className="bg-background text-foreground">

// Primary colors
<button className="bg-primary text-primary-foreground">

// Muted/secondary
<p className="text-muted-foreground">
<div className="bg-muted">

// With opacity
<div className="bg-primary/10">
```

### Custom Utilities

Add custom utilities in `styles.css`:

```css
@layer base {
  .prose-custom {
    @apply text-foreground leading-relaxed;
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```
