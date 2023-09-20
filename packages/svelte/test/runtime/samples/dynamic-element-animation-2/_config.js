let original_div_get_bounding_client_rect;
let original_span_get_bounding_client_rect;
let original_paragraph_get_bounding_client_rect;

export default {
	skip_if_ssr: true,
	get props() {
		return {
			things: [
				{ id: 1, name: 'a' },
				{ id: 2, name: 'b' },
				{ id: 3, name: 'c' },
				{ id: 4, name: 'd' },
				{ id: 5, name: 'e' }
			],
			tag: 'div'
		};
	},

	html: `
		<div>a</div>
		<div>b</div>
		<div>c</div>
		<div>d</div>
		<div>e</div>
	`,

	before_test() {
		original_div_get_bounding_client_rect = window.HTMLDivElement.prototype.getBoundingClientRect;
		original_span_get_bounding_client_rect = window.HTMLSpanElement.prototype.getBoundingClientRect;
		original_paragraph_get_bounding_client_rect =
			window.HTMLParagraphElement.prototype.getBoundingClientRect;

		window.HTMLDivElement.prototype.getBoundingClientRect = fake_get_bounding_client_rect;
		window.HTMLSpanElement.prototype.getBoundingClientRect = fake_get_bounding_client_rect;
		window.HTMLParagraphElement.prototype.getBoundingClientRect = fake_get_bounding_client_rect;

		function fake_get_bounding_client_rect() {
			const index = [...this.parentNode.children].indexOf(this);
			const top = index * 30;

			return {
				left: 0,
				right: 100,
				top,
				bottom: top + 20
			};
		}
	},
	after_test() {
		window.HTMLDivElement.prototype.getBoundingClientRect = original_div_get_bounding_client_rect;
		window.HTMLSpanElement.prototype.getBoundingClientRect = original_span_get_bounding_client_rect;
		window.HTMLParagraphElement.prototype.getBoundingClientRect =
			original_paragraph_get_bounding_client_rect;
	},

	async test({ assert, component, raf }) {
		// switch tag and things at the same time
		await component.update('p', [
			{ id: 5, name: 'e' },
			{ id: 2, name: 'b' },
			{ id: 3, name: 'c' },
			{ id: 4, name: 'd' },
			{ id: 1, name: 'a' }
		]);

		const ps = document.querySelectorAll('p');
		assert.equal(ps[0].dy, 120);
		assert.equal(ps[4].dy, -120);

		raf.tick(50);
		assert.equal(ps[0].dy, 60);
		assert.equal(ps[4].dy, -60);

		raf.tick(100);
		assert.equal(ps[0].dy, 0);
		assert.equal(ps[4].dy, 0);

		await component.update('span', [
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' },
			{ id: 3, name: 'c' },
			{ id: 4, name: 'd' },
			{ id: 5, name: 'e' }
		]);

		const spans = document.querySelectorAll('span');

		assert.equal(spans[0].dy, 120);
		assert.equal(spans[4].dy, -120);

		raf.tick(150);
		assert.equal(spans[0].dy, 60);
		assert.equal(spans[4].dy, -60);

		raf.tick(200);
		assert.equal(spans[0].dy, 0);
		assert.equal(spans[4].dy, 0);
	}
};
