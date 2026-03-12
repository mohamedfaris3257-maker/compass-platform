/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // New EdTech palette
        orange:       '#fb8403',
        yellow:       '#ffb705',
        dark:         '#013147',
        teal:         '#229ebc',
        lightBlue:    '#8ec9e6',
        bg:           '#e8f6fb',
        textSecondary:'#64748b',
        error:        '#ef4444',
        // Legacy aliases — keep all existing class names working
        gold:         '#ffb705',
        goldLight:    '#ffd041',
        navy:         '#013147',
        navyMid:      '#1a4a63',
        cream:        '#e8f6fb',
        muted:        '#64748b',
        cborder:      '#e2e8f0',
        success:      '#22c55e',
        amber:        '#ffb705',
      },
      fontFamily: {
        display:   ['"Montserrat"', 'sans-serif'],
        body:      ['"Inter"',      'sans-serif'],
        'mono-data': ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card:       '0 2px 12px rgba(1,49,71,0.07)',
        'card-hover':'0 4px 20px rgba(1,49,71,0.12)',
      },
    },
  },
  plugins: [],
}
