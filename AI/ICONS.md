# Icons & Visual Assets

## Icon System

### Icon Library
- **Primary**: Lucide React icons for consistency and modern look
- **Fallback**: Custom SVG icons for specific LifeOS features
- **Size Scale**: 16px, 20px, 24px, 32px, 48px, 64px
- **Style**: Outline style for consistency, filled for active states

### Icon Categories

#### **Navigation Icons**
- `Home` - Dashboard
- `Kanban` - Project management
- `BookOpen` - Diary/Journal
- `Target` - Habits
- `Book` - Notebook
- `HelpCircle` - Q&A
- `Settings` - Settings

#### **Action Icons**
- `Plus` - Create/Add
- `Edit` - Edit
- `Trash2` - Delete
- `Archive` - Archive
- `Search` - Search
- `Filter` - Filter
- `Sort` - Sort
- `MoreHorizontal` - More options

#### **Status Icons**
- `CheckCircle` - Completed
- `Clock` - Pending
- `AlertCircle` - Warning
- `XCircle` - Error
- `Info` - Information

#### **Project Icons**
- `Briefcase` - Work projects
- `Heart` - Personal projects
- `Lightbulb` - Ideas
- `Star` - Favorites
- `Folder` - General projects
- `Calendar` - Time-based projects

### Icon Implementation

#### **React Component**
```typescript
interface IconProps {
  name: string;
  size?: 16 | 20 | 24 | 32 | 48 | 64;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className, color }) => {
  const LucideIcon = lucideIcons[name as keyof typeof lucideIcons];
  return LucideIcon ? <LucideIcon size={size} className={className} style={{ color }} /> : null;
};
```

#### **Usage Examples**
```tsx
<Icon name="Plus" size={20} className="text-blue-500" />
<Icon name="CheckCircle" size={24} color="#10B981" />
<Icon name="Settings" size={32} />
```

### App Icons

#### **Application Icon**
- **Size**: 256x256px (PNG), 512x512px (PNG), 1024x1024px (PNG)
- **Format**: PNG with transparency
- **Style**: Modern, minimalist, recognizable
- **Variants**: Light, dark, monochrome

#### **Platform-Specific Icons**
- **Windows**: `.ico` files (16, 32, 48, 64, 128, 256px)
- **macOS**: `.icns` files with multiple resolutions
- **Linux**: `.png` files (16, 24, 32, 48, 64, 128, 256, 512px)

#### **Icon Generation**
```bash
# Generate Windows icons
npx electron-icon-builder --input=assets/icon.png --output=build/icons --platforms=win32

# Generate macOS icons  
npx electron-icon-builder --input=assets/icon.png --output=build/icons --platforms=darwin

# Generate Linux icons
npx electron-icon-builder --input=assets/icon.png --output=build/icons --platforms=linux
```

### Icon Assets Structure
```
assets/
  icons/
    app/
      icon-16.png
      icon-32.png
      icon-48.png
      icon-64.png
      icon-128.png
      icon-256.png
      icon-512.png
      icon-1024.png
    custom/
      lifeos-logo.svg
      lifeos-symbol.svg
    projects/
      briefcase.svg
      heart.svg
      lightbulb.svg
      star.svg
      folder.svg
      calendar.svg
```

### Icon Guidelines

#### **Design Principles**
- **Consistency**: Use same stroke width (2px) across all icons
- **Clarity**: Icons should be recognizable at smallest size (16px)
- **Accessibility**: Ensure sufficient contrast (4.5:1 ratio)
- **Scalability**: Vector-based for crisp rendering at all sizes

#### **Color Usage**
- **Primary**: `#6200EE` (purple)
- **Secondary**: `#03DAC6` (teal)
- **Success**: `#00E676` (green)
- **Warning**: `#FF9800` (orange)
- **Error**: `#D50000` (red)
- **Neutral**: `#757575` (gray)

#### **Animation**
- **Hover**: Scale 1.1x with 150ms ease-out
- **Active**: Scale 0.95x with 100ms ease-in
- **Loading**: Rotate 360deg with 1s linear infinite

### Integration with Electron

#### **Window Icon**
```typescript
const mainWindow = new BrowserWindow({
  icon: path.join(__dirname, '../assets/icons/app/icon-256.png'),
  // ... other options
});
```

#### **Tray Icon**
```typescript
const tray = new Tray(path.join(__dirname, '../assets/icons/app/icon-32.png'));
```

#### **Menu Icons**
```typescript
const menu = Menu.buildFromTemplate([
  {
    label: 'New Project',
    icon: path.join(__dirname, '../assets/icons/plus.png'),
    click: () => createProject()
  }
]);
```

### Performance Considerations

#### **Icon Loading**
- **Lazy loading**: Load icons only when needed
- **Caching**: Cache frequently used icons
- **Bundle optimization**: Tree-shake unused icons

#### **Memory Usage**
- **SVG optimization**: Minimize file size
- **Icon sprites**: Combine small icons into sprite sheets
- **Dynamic loading**: Load icons on demand

### Accessibility

#### **Screen Reader Support**
```tsx
<Icon 
  name="Settings" 
  aria-label="Settings" 
  role="img"
/>
```

#### **High Contrast Mode**
- **Outline variants**: Thicker strokes for high contrast
- **Color alternatives**: Monochrome versions
- **Size scaling**: Larger icons for accessibility

### Future Enhancements

#### **Icon Themes**
- **Light theme**: Standard outline icons
- **Dark theme**: Filled variants for better visibility
- **High contrast**: Bold, thick stroke icons
- **Custom themes**: User-defined icon styles

#### **Dynamic Icons**
- **Status indicators**: Animated icons for real-time updates
- **Progress icons**: Icons that show completion status
- **Interactive icons**: Icons that respond to user actions
