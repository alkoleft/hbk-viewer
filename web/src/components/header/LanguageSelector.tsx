import { FormControl, Select, MenuItem, Box, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAvailableLocales } from '../../hooks/useGlobalData';

const LOCALE_NAMES: Record<string, string> = {
  ru: 'Русский',
  en: 'English',
  root: 'English',
};

export function LanguageSelector() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const navigate = useNavigate();
  const { setCurrentLocale } = useAppStore();
  const { data: availableLocales } = useAvailableLocales();

  if (!availableLocales || availableLocales.length <= 1) {
    return null;
  }

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocale(newLocale);
    // Keep the same section when changing locale, or go to root if no section
    const targetPath = section ? `/${newLocale}/${section}` : `/${newLocale}`;
    navigate(targetPath);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Язык:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={locale || 'ru'}
          onChange={(e) => handleLocaleChange(e.target.value)}
          variant="outlined"
          sx={{ 
            height: 32,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
            },
          }}
        >
          {availableLocales.map((loc) => (
            <MenuItem key={loc} value={loc}>
              {LOCALE_NAMES[loc] || loc}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
