import { CONFIG } from 'src/config-global';

import { DiarioView } from 'src/sections/diario/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Diario - ${CONFIG.appName}`}</title>

      <DiarioView />
    </>
  );
}
