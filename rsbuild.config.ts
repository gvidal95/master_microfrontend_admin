import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

import mfConfig from './module-federation.config';

// Remote assets are loaded cross-origin by the shell, so the prefix must be absolute
const assetPrefix = process.env.ASSET_PREFIX ?? 'http://localhost:3002';

export default defineConfig({
  server: {
    port: 3002,
  },

  dev: {
    assetPrefix,
  },

  output: {
    assetPrefix,
  },

  plugins: [
    pluginReact(),
    pluginModuleFederation(mfConfig),
  ],
});