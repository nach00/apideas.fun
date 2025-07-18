# CSS Modules Setup Guide

This project is now configured to use CSS Modules with TypeScript support. CSS Modules provide scoped CSS classes and help avoid naming conflicts.

## 🚀 What's Configured

- ✅ TypeScript support for CSS Modules
- ✅ Autocomplete in VS Code
- ✅ Type safety for CSS class names
- ✅ Automatic class name hashing for production
- ✅ Next.js optimized build process

## 📁 File Structure

```
styles/
├── globals.css                    # Global styles (imported in _app.tsx)
├── base/                          # Base styles (colors, typography, etc.)
└── components/
    ├── component-name.css         # Regular CSS (not scoped)
    └── component-name.module.css  # CSS Modules (scoped)

components/
└── ComponentName.tsx              # Component using CSS Modules
```

## 💡 Usage Examples

### 1. Creating a CSS Module

Create a file with `.module.css` extension:

```css
/* styles/components/button.module.css */
.primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.primary:hover {
  background-color: #0056b3;
}

.secondary {
  background-color: #6c757d;
  color: white;
}
```

### 2. Using CSS Modules in Components

```tsx
// components/Button.tsx
import React from 'react';
import styles from '@/styles/components/button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children }) => {
  return (
    <button className={styles[variant]}>
      {children}
    </button>
  );
};

export default Button;
```

### 3. Combining Multiple Classes

```tsx
// Combining classes
<div className={`${styles.card} ${styles.featured}`}>
  Content
</div>

// Conditional classes
<div className={`${styles.button} ${isActive ? styles.active : styles.inactive}`}>
  Button
</div>

// Using classnames library (optional)
import classNames from 'classnames';

<div className={classNames(styles.card, {
  [styles.featured]: isFeatured,
  [styles.disabled]: isDisabled
})}>
  Content
</div>
```

## 🔧 TypeScript Features

### Autocomplete Support
- VS Code will provide autocomplete for CSS class names
- IntelliSense shows available classes as you type `styles.`

### Type Safety
- TypeScript will warn you about typos in class names
- Unused CSS classes can be detected

### Import Path Aliases
Use the configured path aliases:
```tsx
import styles from '@/styles/components/my-component.module.css';
```

## 🏗️ Build Process

### Development
- CSS Modules classes are readable: `button__primary___2x3kj`
- Source maps are enabled for debugging

### Production
- Classes are minified and hashed for optimization
- All CSS is extracted and minimized
- Dead CSS elimination removes unused styles

## 📋 Best Practices

### 1. Naming Conventions
```css
/* Use camelCase or kebab-case consistently */
.primaryButton { }     /* ✅ Good - camelCase */
.primary-button { }    /* ✅ Good - kebab-case */
.primary_button { }    /* ❌ Avoid - snake_case */
```

### 2. Component-Specific Styles
```css
/* Keep styles close to components */
.card { }              /* ✅ Component-specific */
.cardHeader { }        /* ✅ BEM-like naming */
.cardBody { }
.cardFooter { }
```

### 3. Shared Styles
```css
/* For shared utilities, use global CSS or CSS variables */
:root {
  --primary-color: #007bff;
  --border-radius: 0.25rem;
}

.button {
  border-radius: var(--border-radius);
}
```

## 🔍 Debugging

### Check Generated Class Names
In browser dev tools, you'll see hashed class names:
```html
<!-- Development -->
<div class="button__primary___2x3kj">Button</div>

<!-- Production -->
<div class="a1b2c3">Button</div>
```

### VS Code Setup
1. Install "TypeScript Importer" extension
2. Ensure VS Code is using workspace TypeScript version:
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Select TypeScript Version"
   - Choose "Use Workspace Version"

## 🚨 Common Issues

### 1. Autocomplete Not Working
- Restart TypeScript server: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
- Check that VS Code is using workspace TypeScript version

### 2. Module Not Found
```tsx
// ❌ Wrong - relative path
import styles from './styles.module.css';

// ✅ Correct - use path alias
import styles from '@/styles/components/component.module.css';
```

### 3. Class Name Not Applied
```tsx
// ❌ Wrong - direct string
<div className="primary">

// ✅ Correct - CSS Modules object
<div className={styles.primary}>
```

## 📈 Migration Strategy

### Converting Existing CSS
1. Rename `.css` to `.module.css`
2. Update imports in components
3. Replace string class names with `styles.className`
4. Test and verify styles are applied correctly

### Gradual Adoption
- Keep existing global CSS files
- Convert components one by one
- Use CSS Modules for new components

## 🛠️ Example Component

See `components/examples/CSSModuleExample.tsx` for a complete working example of CSS Modules usage with TypeScript.

## 📚 Additional Resources

- [Next.js CSS Modules Documentation](https://nextjs.org/docs/basic-features/built-in-css-support#adding-component-level-css)
- [TypeScript CSS Modules Plugin](https://github.com/mrmckeb/typescript-plugin-css-modules)
- [CSS Modules Official Site](https://github.com/css-modules/css-modules)