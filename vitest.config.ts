import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['playground/**'],
    coverage: {
      reporter: [
        'text',
        [
          'html',
          {
            subdir: 'coverage-html',
          },
        ],
      ],
      enabled: true,
    },
  },
})
