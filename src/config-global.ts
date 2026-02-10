import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
};

export const CONFIG: ConfigValue = {
  appName: import.meta.env.VITE_APP_NAME,
  appVersion: packageJson.version,
};
