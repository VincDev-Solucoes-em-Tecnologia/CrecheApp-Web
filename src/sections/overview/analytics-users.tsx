import type { CardProps } from '@mui/material/Card';
import type { PaletteColorKey } from 'src/theme/core';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { fShortenNumber } from 'src/utils/format-number';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: string;
  total: number;
  inativos: number;
  color?: PaletteColorKey;
  icon: React.ReactNode;
};

export function AnalyticsUserWidget({
  sx,
  icon,
  title,
  total,
  inativos,
  color = 'primary',
  ...other
}: Props) {
  const theme = useTheme();

  return (
    <Card
      sx={[
        () => ({
          p: 3,
          boxShadow: 'none',
          position: 'relative',
          color: `${color}.darker`,
          backgroundColor: 'common.white',
          backgroundImage: `linear-gradient(135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)})`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ mb: 1, typography: 'subtitle2', opacity: 0.8 }}>{title}</Box>

        <Stack direction="row" alignItems="flex-end" spacing={2}>
          <Box sx={{ typography: 'h5' }}>Ativos: {fShortenNumber(total)}</Box>
          <Box sx={{ typography: 'h5' }}>Inativos: {fShortenNumber(inativos)}</Box>
        </Stack>
      </Box>

      <SvgColor
        src="/assets/background/shape-square.svg"
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          color: `${color}.main`,
        }}
      />
    </Card>
  );
}
