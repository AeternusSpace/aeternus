import { build } from 'esbuild';
import NodeGlobalsPolyfill from '@esbuild-plugins/node-globals-polyfill';
import ESBuildNodePolyfills from 'esbuild-plugin-node-polyfills';

build({
  entryPoints: ['./js/bundle.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'deploy/aeternus-bundle.js',
  platform: "browser",
  define: {
    global: 'window',
    XMLHttpRequest: 'null'
  },
  plugins: [
    ESBuildNodePolyfills,
    NodeGlobalsPolyfill.default({ buffer: true, process: true })
  ],
}).catch(() => process.exit(1))