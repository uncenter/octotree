/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
	theme: {
		extend: {
			flex: {
				0: '0 0 auto',
			},
			colors: {
				bg: 'var(--bg)',
				fg: 'var(--fg)',
			},
		},
	},
	plugins: [require('tailwindcss-logical')],
};
