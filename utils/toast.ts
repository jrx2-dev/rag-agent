import toast from 'react-hot-toast';
import { Theme, ThemeSchema } from '@/schemas/theme';

export const ToastSuccess = (message: string, theme: Theme) => {
  toast(message, {
    icon: '👏',
    style: {
      borderRadius: '10px',
      background: theme === ThemeSchema.Enum.light ? 'white' : 'black',
      color: theme === ThemeSchema.Enum.light ? 'black' : 'white',
      border: '2px solid green',
    },
  });
};

export const ToastError = (message: string, theme: Theme) => {
  toast(message, {
    icon: '❌',
    style: {
      borderRadius: '10px',
      background: theme === ThemeSchema.Enum.light ? 'white' : 'black',
      color: 'red',
      border: '2px solid red',
    },
  });
};
