import { assert } from '../../../utils.js';
import * as $ from 'svelte/internal/client';
import { create_test } from './util.js';

let len = 50;
const iter = 50;

export const { owned: kairo_deep_owned, unowned: kairo_deep_unowned } = create_test(
	'kairo_deep',
	() => {
		let head = $.state(0);
		let current = head;
		for (let i = 0; i < len; i++) {
			let c = current;
			current = $.derived(() => {
				return $.get(c) + 1;
			});
		}
		let counter = 0;

		const destroy = $.effect_root(() => {
			$.render_effect(() => {
				$.get(current);
				counter++;
			});
		});

		return {
			destroy,
			run() {
				$.flush(() => {
					$.set(head, 1);
				});
				counter = 0;
				for (let i = 0; i < iter; i++) {
					$.flush(() => {
						$.set(head, i);
					});
					assert($.get(current) === len + i);
				}
				assert(counter === iter);
			}
		};
	}
);
