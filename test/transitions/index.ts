import * as assert from 'assert';
import { create_out_transition, group_outros } from 'svelte/internal';
import { TransitionConfig } from 'svelte/transition';

declare const global: any;

describe('transitions', () => {
	let originalRequestAnimationFrame: () => void;

	before(() => {
		originalRequestAnimationFrame = global.requestAnimationFrame;
		global.requestAnimationFrame = (cb) => cb();
	});

	after(() => {
		global.requestAnimationFrame = originalRequestAnimationFrame;
	});

	beforeEach(() => {
		group_outros();
	});

	describe('create_out_transition', () => {
		describe('when then transition function does not return a tick function', () => {
			describe('when calling the end function with reset param equals to true', () => {
				it('should not throw an exception', () => {
					const noTickConfigs: TransitionConfig[] = [undefined, null, {}];

					noTickConfigs.forEach((config) => {
						const node = document.createElement('div');
						const { end } = create_out_transition(node, () => config, {});
						let error: Error | null = null;

						try {
							end(true);
						} catch (e) {
							error = e;
						}

						assert.equal(error, null);
					});
				});
			});
		});

		describe('when the transition function returns a config object with defined tick function', () => {
			describe('when calling the end function with reset param equals to true', () => {
				it('should call the tick function', () => {
					const node = document.createElement('div');
					let tick = 0;
					const transitionConfig: TransitionConfig = {
						duration: 0,
						tick: () => (tick += 1)
					};
					const { end } = create_out_transition(
						node,
						() => transitionConfig,
						{}
					);

					end(true);

					assert.equal(tick, 1);
				});
			});
		});
	});
});
