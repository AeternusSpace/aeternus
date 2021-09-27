import dotenv from 'dotenv';
import { build } from 'esbuild';
import NodeGlobalsPolyfill from '@esbuild-plugins/node-globals-polyfill';
import ESBuildNodePolyfills from 'esbuild-plugin-node-polyfills';

dotenv.config();

build({
  entryPoints: ['./js/bundle.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'deploy/aeternus-bundle.js',
  platform: "browser",
  define: {
    global: 'window',
    'process.env.SPEECHLY_APPID': JSON.stringify(process.env.SPEECHLY_APPID)
  },
  inject: [
    './shims.js'
  ],
  plugins: [
    ESBuildNodePolyfills,
    NodeGlobalsPolyfill.default({ buffer: true, process: true })
  ],
}).catch(() => process.exit(1))