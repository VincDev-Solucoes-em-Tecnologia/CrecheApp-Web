import { CONFIG } from 'src/config-global';

import { EstudanteView } from 'src/sections/estudante/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Estudantes - ${CONFIG.appName}`}</title>

      <EstudanteView />
    </>
  );
}
