import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".\\61  sdf"',
			start: {
				line: 22,
				column: 1,
				character: 465
			},
			end: {
				line: 22,
				column: 10,
				character: 474
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".\\61\n\tsdf"',
			start: {
				line: 23,
				column: 1,
				character: 492
			},
			end: {
				line: 24,
				column: 4,
				character: 501
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".\\61\n sdf"',
			start: {
				line: 25,
				column: 1,
				character: 519
			},
			end: {
				line: 26,
				column: 4,
				character: 528
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "#\\31span"',
			start: {
				line: 28,
				column: 1,
				character: 547
			},
			end: {
				line: 28,
				column: 9,
				character: 555
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "#\\31 span"',
			start: {
				line: 29,
				column: 1,
				character: 573
			},
			end: {
				line: 29,
				column: 10,
				character: 582
			}
		}
	]
});
