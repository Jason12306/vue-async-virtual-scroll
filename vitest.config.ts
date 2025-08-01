import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    exclude: [],
    coverage: {
      enabled: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      reporter: [
        'text',
        [
          'html',
        ],
      ],
    },
  },
})
