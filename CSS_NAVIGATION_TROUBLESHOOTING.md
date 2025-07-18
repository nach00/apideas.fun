# CSS Navigation Troubleshooting Guide

## 🔧 Fixed Issues
- **Fixed `cssmodules_ls` configuration** - Now correctly targets TypeScript/JavaScript files instead of CSS files
- **Added TypeScript plugin integration** - CSS Modules plugin now loads with TypeScript servers
- **Enhanced fallback navigation** - Manual CSS navigation when LSP fails
- **Resolved LSP conflicts** - Better handling of multiple TypeScript servers

## 🎯 Available Keybindings

### CSS Navigation
- `<leader>gd` - Enhanced go-to-definition (tries LSP first, then CSS fallback)
- `<leader>cd` - Direct CSS definition navigation  
- `gd` - Enhanced go-to-definition in TypeScript files

### Debugging
- `<leader>lr` - Restart LSP clients
- `<leader>li` - Show LSP client info
- `<leader>ct` - Test CSS navigation (shows debug info)

## 🚀 Testing Steps

### 1. Restart Neovim
```bash
# Exit and restart Neovim completely
:qa
nvim
```

### 2. Open a TypeScript file with CSS imports
```bash
# Example: Open the CardGenerator component
nvim components/dashboard/CardGenerator.tsx
```

### 3. Check LSP status
```vim
:LspInfo
# Should show cssmodules_ls attached to TypeScript files
```

### 4. Test navigation
1. Place cursor on a CSS class name like `cardGenerator` in:
   ```tsx
   <div className={styles.cardGenerator}>
   ```
2. Press `<leader>gd` or `gd`
3. Should jump to the CSS file and the class definition

### 5. Debug if not working
```vim
# Show active LSP clients for current buffer
<leader>li

# Test CSS navigation detection
<leader>ct

# Restart LSP if needed
<leader>lr
```

## 🔍 Expected Behavior

### With CSS Modules:
```tsx
// In CardGenerator.tsx
import styles from '@/styles/components/card-generator.module.css';

function Component() {
  return <div className={styles.cardGenerator}>  // gd here should jump to CSS
}
```

### With Regular CSS:
```tsx
// In any TSX file
import '@/styles/globals.css';

function Component() {
  return <div className="card-generator">  // gd here should jump to CSS
}
```

## 🐛 Common Issues & Solutions

### Issue: "No LSP definition found"
**Solution:** The enhanced navigation will automatically try CSS fallback

### Issue: CSS file not found
**Solutions:**
1. Check the CSS import path is correct
2. Verify `@/` alias resolves to project root
3. Ensure CSS file exists at the expected location

### Issue: Class not found in CSS file
**Solutions:**
1. For CSS Modules: Check if class uses camelCase vs kebab-case
2. Try both `cardGenerator` and `card-generator`
3. Manually search in the CSS file

### Issue: Multiple TypeScript servers conflicting
**Solution:** 
```vim
# Check which servers are running
:LspInfo

# Restart LSP if needed
<leader>lr
```

## 📁 File Structure Expected
```
your-project/
├── styles/
│   ├── globals.css
│   └── components/
│       ├── card-generator.css
│       └── card-generator.module.css
├── components/
│   └── dashboard/
│       └── CardGenerator.tsx
└── tsconfig.json (with CSS Modules plugin configured)
```

## 🔧 Manual Testing
If LSP navigation still doesn't work, you can use the enhanced manual navigation:

1. **Position cursor** on CSS class name
2. **Press `<leader>cd`** for direct CSS navigation
3. **Check console output** for debug messages

The manual navigation will:
- Find CSS import in current file
- Resolve `@/` path aliases
- Open CSS file
- Jump to class definition
- Convert camelCase to kebab-case for CSS Modules

## ⚡ Quick Fix Commands
```vim
# Reload current file and restart LSP
:edit!

# Manually trigger LSP attachment
:LspStart

# Show LSP log for debugging
:LspLog
```

Try these steps and let me know if the navigation works or if you see any specific error messages!