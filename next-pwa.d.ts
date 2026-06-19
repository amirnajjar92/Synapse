declare module '@ducanh2912/next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    cacheOnFrontEndNav?: boolean;
    aggressiveFrontEndNavCaching?: boolean;
    reloadOnOnline?: boolean;
    swcMinify?: boolean;
    disable?: boolean;
    workboxOptions?: {
      disableDevLogs?: boolean;
    };
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
