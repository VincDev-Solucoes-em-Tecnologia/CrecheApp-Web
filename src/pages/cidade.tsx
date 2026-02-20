import { CONFIG } from 'src/config-global';

import { CidadeView } from 'src/sections/cidade/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Cidade - ${CONFIG.appName}`}</title>

      <CidadeView />
    </>
  );
}
