import * as assert from 'assert';
import { create_out_transition, group_outros } from 'svelte/internal';
import { TransitionConfig } from 'svelte/transition';

declare const global: any;

describe('transitions', () => {
  let originalRequestAnimationFrame: () => void;

  before(() => {
    originalRequestAnimationFrame = global.requestAnimationFrame;
    global.requestAnimationFrame = cb => cb();
  });

  after(() => {
    global.requestAnimationFrame = originalRequestAnimationFrame;
  });

  beforeEach(() => {
    group_outros();
  });
  
	describe('create_out_transition', () => {
		describe('when then transition function returns undefined', () => {
			describe('when calling the end function with reset param equals to true', () => {
				it('should not throw an exception', () => {
					const node = document.createElement('div');
					const transitionConfig: TransitionConfig = {
						duration: 0
					};
					const { end } = create_out_transition(
						node,
						() => undefined,
						transitionConfig
					);
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
});
