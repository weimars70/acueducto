import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weimar.acueductos',
  appName: 'weimar-acueductos',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    hostname: 'localhost',
    allowNavigation: ['*']
  }
};

export default config;
