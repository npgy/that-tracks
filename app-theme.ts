import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const appTheme: CustomThemeConfig = {
	name: 'app-theme',
	properties: {
		// =~= Theme Properties =~=
		'--theme-font-family-base': `system-ui`,
		'--theme-font-family-heading': `system-ui`,
		'--theme-font-color-base': '0 0 0',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '4px',
		'--theme-rounded-container': '8px',
		'--theme-border-base': '1px',
		// =~= Theme On-X Colors =~=
		'--on-primary': '0 0 0',
		'--on-secondary': '0 0 0',
		'--on-tertiary': '0 0 0',
		'--on-success': '0 0 0',
		'--on-warning': '0 0 0',
		'--on-error': '0 0 0',
		'--on-surface': '255 255 255',
		// =~= Theme Colors  =~=
		// primary | #e6c833
		'--color-primary-50': '251 247 224', // #fbf7e0
		'--color-primary-100': '250 244 214', // #faf4d6
		'--color-primary-200': '249 241 204', // #f9f1cc
		'--color-primary-300': '245 233 173', // #f5e9ad
		'--color-primary-400': '238 217 112', // #eed970
		'--color-primary-500': '230 200 51', // #e6c833
		'--color-primary-600': '207 180 46', // #cfb42e
		'--color-primary-700': '173 150 38', // #ad9626
		'--color-primary-800': '138 120 31', // #8a781f
		'--color-primary-900': '113 98 25', // #716219
		// secondary | #53d5fd
		'--color-secondary-50': '229 249 255', // #e5f9ff
		'--color-secondary-100': '221 247 255', // #ddf7ff
		'--color-secondary-200': '212 245 255', // #d4f5ff
		'--color-secondary-300': '186 238 254', // #baeefe
		'--color-secondary-400': '135 226 254', // #87e2fe
		'--color-secondary-500': '83 213 253', // #53d5fd
		'--color-secondary-600': '75 192 228', // #4bc0e4
		'--color-secondary-700': '62 160 190', // #3ea0be
		'--color-secondary-800': '50 128 152', // #328098
		'--color-secondary-900': '41 104 124', // #29687c
		// tertiary | #939ed3
		'--color-tertiary-50': '239 240 248', // #eff0f8
		'--color-tertiary-100': '233 236 246', // #e9ecf6
		'--color-tertiary-200': '228 231 244', // #e4e7f4
		'--color-tertiary-300': '212 216 237', // #d4d8ed
		'--color-tertiary-400': '179 187 224', // #b3bbe0
		'--color-tertiary-500': '147 158 211', // #939ed3
		'--color-tertiary-600': '132 142 190', // #848ebe
		'--color-tertiary-700': '110 119 158', // #6e779e
		'--color-tertiary-800': '88 95 127', // #585f7f
		'--color-tertiary-900': '72 77 103', // #484d67
		// success | #77bb41
		'--color-success-50': '235 245 227', // #ebf5e3
		'--color-success-100': '228 241 217', // #e4f1d9
		'--color-success-200': '221 238 208', // #ddeed0
		'--color-success-300': '201 228 179', // #c9e4b3
		'--color-success-400': '160 207 122', // #a0cf7a
		'--color-success-500': '119 187 65', // #77bb41
		'--color-success-600': '107 168 59', // #6ba83b
		'--color-success-700': '89 140 49', // #598c31
		'--color-success-800': '71 112 39', // #477027
		'--color-success-900': '58 92 32', // #3a5c20
		// warning | #ff8647
		'--color-warning-50': '255 237 227', // #ffede3
		'--color-warning-100': '255 231 218', // #ffe7da
		'--color-warning-200': '255 225 209', // #ffe1d1
		'--color-warning-300': '255 207 181', // #ffcfb5
		'--color-warning-400': '255 170 126', // #ffaa7e
		'--color-warning-500': '255 134 71', // #ff8647
		'--color-warning-600': '230 121 64', // #e67940
		'--color-warning-700': '191 101 53', // #bf6535
		'--color-warning-800': '153 80 43', // #99502b
		'--color-warning-900': '125 66 35', // #7d4223
		// error | #ff4013
		'--color-error-50': '255 226 220', // #ffe2dc
		'--color-error-100': '255 217 208', // #ffd9d0
		'--color-error-200': '255 207 196', // #ffcfc4
		'--color-error-300': '255 179 161', // #ffb3a1
		'--color-error-400': '255 121 90', // #ff795a
		'--color-error-500': '255 64 19', // #ff4013
		'--color-error-600': '230 58 17', // #e63a11
		'--color-error-700': '191 48 14', // #bf300e
		'--color-error-800': '153 38 11', // #99260b
		'--color-error-900': '125 31 9', // #7d1f09
		// surface | #232323
		'--color-surface-50': '222 222 222', // #dedede
		'--color-surface-100': '211 211 211', // #d3d3d3
		'--color-surface-200': '200 200 200', // #c8c8c8
		'--color-surface-300': '167 167 167', // #a7a7a7
		'--color-surface-400': '101 101 101', // #656565
		'--color-surface-500': '35 35 35', // #232323
		'--color-surface-600': '32 32 32', // #202020
		'--color-surface-700': '26 26 26', // #1a1a1a
		'--color-surface-800': '21 21 21', // #151515
		'--color-surface-900': '17 17 17' // #111111
	}
};
