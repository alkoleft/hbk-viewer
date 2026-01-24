import { FormControl, Select, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppInfo } from '@shared/api';
import { useStore } from '@core/store';

export function LanguageSelector() {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const { data: appInfo } = useAppInfo();
  const setCurrentLocale = useStore((state) => state.setCurrentLocale);
  
  const availableLocales = appInfo?.availableLocales || [];

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
        {availableLocales.map((loc: string) => (
          <MenuItem key={loc} value={loc}>
            {loc.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
