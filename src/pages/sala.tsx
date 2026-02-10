import { CONFIG } from 'src/config-global';

import { SalaView } from 'src/sections/sala/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Salas - ${CONFIG.appName}`}</title>

      <SalaView />
    </>
  );
}
