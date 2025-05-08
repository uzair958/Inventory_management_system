import { styled } from '@mui/material/styles';
import {
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  OutlinedInput
} from '@mui/material';

// Styled TextField with consistent width and label display
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    overflow: 'visible',
    whiteSpace: 'nowrap',
    textOverflow: 'clip',
    // Ensure label is always visible
    transform: 'translate(14px, -9px) scale(0.75)',
    backgroundColor: theme.palette.background.paper,
    padding: '0 5px',
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  },
  '& .MuiOutlinedInput-root': {
    minHeight: '56px', // Ensure consistent height
  },
  '& .MuiOutlinedInput-input': {
    padding: '16.5px 14px', // Consistent padding
  },
}));

// Styled FormControl for dropdowns with consistent width and label display
export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    overflow: 'visible',
    whiteSpace: 'nowrap',
    textOverflow: 'clip',
    // Ensure label is always visible
    transform: 'translate(14px, -9px) scale(0.75)',
    backgroundColor: theme.palette.background.paper,
    padding: '0 5px',
    zIndex: 1, // Ensure label is above the input
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  },
  '& .MuiOutlinedInput-root': {
    minHeight: '56px', // Ensure consistent height
    width: '100%', // Ensure full width
  },
  // Ensure the FormControl takes full width of its container
  width: '100%',
  // Add margin to prevent overlap
  marginBottom: theme.spacing(1),
}));

// Styled Select component
export const StyledSelect = styled(Select)(() => ({
  '& .MuiSelect-select': {
    padding: '16.5px 14px', // Consistent padding
    width: '100%', // Ensure full width
    minWidth: '120px', // Minimum width to prevent too narrow dropdowns
  },
  // Ensure the select takes full width of its container
  width: '100%',
}));

// Styled OutlinedInput for multi-select
export const StyledOutlinedInput = styled(OutlinedInput)(() => ({
  minHeight: '56px', // Ensure consistent height
  width: '100%', // Ensure full width
  '& .MuiOutlinedInput-input': {
    padding: '16.5px 14px', // Consistent padding
    width: '100%', // Ensure full width
  },
}));

// Styled MenuItem for consistent dropdown items
export const StyledMenuItem = styled(MenuItem)(() => ({
  minHeight: '40px', // Ensure consistent height
  padding: '8px 16px', // Consistent padding
  whiteSpace: 'normal', // Allow text to wrap
  wordBreak: 'break-word', // Break long words
}));

// Styled InputLabel for consistent label display
export const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  overflow: 'visible',
  whiteSpace: 'nowrap',
  textOverflow: 'clip',
  backgroundColor: theme.palette.background.paper,
  padding: '0 5px',
}));
