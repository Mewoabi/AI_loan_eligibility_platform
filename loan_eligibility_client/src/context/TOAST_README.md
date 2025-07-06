# Toast Context Documentation

This documentation explains how to use the toast context in your React application.

## Setup

The toast context is already set up in your application. The `ToastProvider` wraps your entire app in `App.tsx`, so you can use the toast functionality anywhere in your component tree.

## Basic Usage

### Import the hook
```typescript
import { useToast } from '../context/toastContext';
```

### Use in your component
```typescript
const MyComponent: React.FC = () => {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast('Hello World!', 'success');
  };

  return (
    <button onClick={handleClick}>
      Show Toast
    </button>
  );
};
```

## API Reference

### `useToast()` Hook

Returns an object with the following methods:

- `showToast(message, typeOrOptions)` - Display a new toast
- `hideToast(id)` - Hide a specific toast by ID
- `clearAllToasts()` - Remove all currently visible toasts
- `toasts` - Array of current toast objects

### `showToast()` Function

#### Method 1: Simple Usage
```typescript
showToast('Your message here', 'success');
showToast('Error occurred', 'error');
showToast('Warning message', 'warning');
showToast('Info message', 'info');
```

#### Method 2: With Options Object
```typescript
showToast('Custom message', {
  type: 'success',
  duration: 10000  // 10 seconds
});
```

#### Method 3: Default (Info Type)
```typescript
showToast('This will be an info toast');
```

### Toast Types

- `'success'` - Green background with checkmark icon
- `'error'` - Red background with X icon
- `'warning'` - Yellow background with warning icon
- `'info'` - Blue background with info icon

### Duration Options

- `5000` (default) - Toast disappears after 5 seconds
- `0` - Toast persists until manually closed
- Any positive number - Custom duration in milliseconds

## Examples

### Success Message
```typescript
const handleSave = async () => {
  try {
    await saveData();
    showToast('Data saved successfully!', 'success');
  } catch (error) {
    showToast('Failed to save data', 'error');
  }
};
```

### Form Validation
```typescript
const handleSubmit = (formData) => {
  if (!formData.email) {
    showToast('Email is required', 'warning');
    return;
  }
  
  // Process form...
  showToast('Form submitted successfully!', 'success');
};
```

### Loading States
```typescript
const handleLoad = async () => {
  showToast('Loading data...', { type: 'info', duration: 0 });
  
  try {
    await loadData();
    clearAllToasts(); // Remove loading message
    showToast('Data loaded successfully!', 'success');
  } catch (error) {
    clearAllToasts();
    showToast('Failed to load data', 'error');
  }
};
```

### Persistent Notifications
```typescript
// For important messages that shouldn't auto-dismiss
showToast('Please verify your email address', {
  type: 'warning',
  duration: 0  // Won't auto-dismiss
});
```

## Styling

The toasts automatically adapt to your app's dark/light theme. They appear in the top-right corner with:

- Smooth animations (slide in/out, hover effects)
- Backdrop blur for modern glass effect
- Responsive design for mobile devices
- Proper z-index to appear above other content

## Best Practices

1. **Use appropriate types**: Match the toast type to the message context
2. **Keep messages concise**: Short, clear messages work best
3. **Don't spam**: Avoid showing multiple toasts rapidly
4. **Use persistent toasts sparingly**: Only for critical messages
5. **Clear loading toasts**: Always clear persistent loading messages

## Error Handling

The toast context includes error handling for:
- Invalid toast types (falls back to 'info')
- Missing ToastProvider (throws helpful error)
- Duplicate or rapid-fire toasts (automatically managed)

## Demo Component

Check out `src/components/ToastDemo.tsx` for interactive examples of all toast functionality.
