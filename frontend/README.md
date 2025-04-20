# Inventory Management System - Frontend

This is the frontend for the Inventory Management System, using React with Material UI for styling.

## Tech Stack

- React 19
- Material UI 7
- Emotion (for styled components)
- React Router 7
- Axios for API requests

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

## Material UI Usage Guidelines

### Theme Usage

The project uses a custom Material UI theme defined in `src/main.jsx`. If you need to add new theme tokens or modify existing ones, that's where you should make changes.

### Styling Components

This project uses Material UI's styling solution based on Emotion. There are several ways to style components:

#### 1. Using the `sx` prop

The `sx` prop is the recommended way to style one-off components:

```jsx
<Box sx={{ 
  display: 'flex', 
  flexDirection: 'column', 
  p: 2,
  bgcolor: 'background.paper',
  borderRadius: 1
}}>
  <Typography variant="h6" color="primary">Hello World</Typography>
</Box>
```

#### 2. Using styled components

For reusable styled components, use the `styled` utility:

```jsx
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

// Then use it like a regular component
<CustomButton>Click Me</CustomButton>
```

### CSS-Based Icons

We use CSS-based icons instead of icon libraries to keep the bundle size small. Here's how to create an icon button:

```jsx
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

// Create a button with an emoji icon using CSS
const AddButton = styled(Button)(({ theme }) => ({
  '&::before': {
    content: '"+"',
    marginRight: theme.spacing(1),
    fontSize: '1.2rem',
    fontWeight: 'bold'
  }
}));

// Use it in your component
<AddButton variant="contained" color="primary">
  Add Item
</AddButton>
```

For standalone icons:

```jsx
const UserIcon = styled('span')({
  display: 'inline-block',
  '&::before': {
    content: '"👤"',
    fontSize: '1.2rem'
  }
});

// Use it in your component
<UserIcon />
```

### Common Components

We've converted these components to use Material UI:

1. `Navbar` - Main navigation component with CSS-based icons
2. `NotFound` - 404 page
3. `StoreList` - Main store listing page
4. `App` - Main app layout structure

### Converting Legacy Components

When converting other components from CSS to Material UI:

1. Replace CSS class names with Material UI components
2. Use the `sx` prop for styling directly on components
3. Use `styled` for reusable styled components
4. For icons, use the CSS-based approach described above
5. Make components responsive using the breakpoints system
6. Use Material UI's responsive utility hooks (e.g., `useMediaQuery`)

### Breakpoints

```jsx
// In components
import { useMediaQuery, useTheme } from '@mui/material';

const Component = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ 
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Content */}
    </Box>
  );
};
```

## Project Structure

- `/src/components` - React components
- `/src/context` - React context providers
- `/src/hooks` - Custom React hooks
- `/src/pages` - Top-level page components
- `/src/utils` - Utility functions and API services
