import { FormControl, Select, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAvailableLocales } from '../../hooks/useGlobalData';
import { useAppStore } from '../../store/useAppStore';

export function LanguageSelector() {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const availableLocales = useAvailableLocales();
  const { setCurrentLocale } = useAppStore();

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocale(newLocale);
    navigate(`/${newLocale}`);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 80 }}>
      <Select
        value={locale || 'ru'}
        onChange={(e) => handleLocaleChange(e.target.value)}
        sx={{
          color: 'white',
          height: 28,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '& .MuiSvgIcon-root': {
            color: 'white',
          },
        }}
      >
        {availableLocales.map((loc) => (
          <MenuItem key={loc} value={loc}>
            {loc.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
