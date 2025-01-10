import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import inject from '@rollup/plugin-inject'
import UnheadVite from '@unhead/addons/vite'
import { unheadVueComposablesImports } from '@unhead/vue'
import vue from '@vitejs/plugin-vue'
import _ from 'lodash'
import { createRequire } from 'module'
import path from 'path'
import copy from 'rollup-plugin-copy'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import SvgLoader from 'vite-svg-loader'

const require = createRequire(import.meta.url)

const outputDir = 'build'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    envPrefix: 'APP_',
    define: {
      'process.env': {},
      __APP_NAME__: JSON.stringify(
        _.startCase(_.camelCase(process.env.npm_package_name))
      ),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    },
    build: {
      rollupOptions: {
        plugins: [
          inject({
            process: 'process',
          }),
          copy({
            targets: [
              {
                src: 'htaccess-http',
                dest: outputDir,
                rename: '.htaccess',
              },
              {
                src: 'htaccess-https',
                dest: outputDir,
              },
              {
                src: [
                  'server/*',
                  'server/.*',
                  '!**/.git/**',
                  '!**/.gitignore',
                  '!**/composer.json',
                  '!**/composer.lock',
                ],
                dest: outputDir + '/server',
              },
              {
                src: 'docs/.vitepress/build/*',
                dest: outputDir + '/docs',
              },
            ],
            hook: 'writeBundle',
            verbose: false,
            flatten: true,
          }),
        ],
        output: {
          manualChunks: {
            // Chunks
          },
        },
      },
      assetsDir: 'assets',
      outDir: outputDir,
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
        },
      ],
      dedupe: ['vue'],
    },
    plugins: [
      vue(),
      VueI18nPlugin({
        include: path.resolve(__dirname, './src/i18n/locales/**'),
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: env.APP_TITLE,
            favicon: env.APP_FAVICON,
          },
        },
      }),
      Components({
        dts: true,
        extensions: ['vue', 'md'],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [NaiveUiResolver(), IconsResolver()],
        dirs: ['src/components', 'src/layouts'],
      }),
      AutoImport({
        // targets to transform
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],

        // global imports to register
        imports: [
          // presets
          'vue',
          'pinia',
          'vue-i18n',
          'vue-router',
          // custom
          {
            '@vueuse/core': [
              // named imports
              'useMouse', // import { useMouse } from '@vueuse/core',
              'useOnline',
              'useFavicon',
              'usePageLeave',
              'useClipboard',
              'useFileDialog',
              'useMediaQuery',
              'onClickOutside',
              'useGeolocation',
              'useElementSize',
              'useWindowSize',
              'useInfiniteScroll',
              // alias
              ['useFetch', 'useMyFetch'], // import { useFetch as useMyFetch } from '@vueuse/core',
            ],
            '@vueuse/router': [
              'useRouteHash',
              'useRouteQuery',
              'useRouteParams',
            ],
            'naive-ui': [
              'useModal',
              'useDialog',
              'useMessage',
              ['useNotification', 'useNaiveNotification'],
              'useLoadingBar',
            ],
            slugify: [['default', 'slugify']],
            validator: [['default', '_v']],
            lodash: [['default', '_']],
            axios: [['default', 'axios']],
            uuid: [['v4', 'uuidv4']],
          },
          unheadVueComposablesImports,
        ],

        // Auto import for module exports under directories
        // by default it only scan one level of modules under the directory
        dirs: ['./src/stores/**', './src/composables/**', './src/modules/**'],

        // Auto import inside Vue template
        // see https://github.com/unjs/unimport/pull/15 and https://github.com/unjs/unimport/pull/72
        vueTemplate: true,

        eslintrc: {
          enabled: true, // Default `false`
          filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
      }),
      TurboConsole({}),
      Markdown({}),
      Icons({ compiler: 'vue3' }),
      ckeditor5({ theme: require.resolve('@ckeditor/ckeditor5-theme-lark') }),
      UnheadVite(),
      SvgLoader({
        defaultImport: 'url',
      }),
      UnoCSS(),
    ],
    optimizeDeps: {
      include: [
        '@ckeditor/ckeditor5-vue',
        '@fawmi/vue-google-maps',
        'fast-deep-equal',
      ],
    },
    server: {
      port: 4320,
      watch: {
        ignored: ['**/server/**'],
      },
    },
  }
})
