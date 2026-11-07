// @vitest-environment jsdom
import '../helpers.js'; // for the matchMedia polyfill
import { describe, it, assert } from 'vitest';
import { get } from 'svelte/store';
import { spring, Spring, tweened, Tween } from 'svelte/motion';
import type { SpringOptions } from 'svelte/motion';
import { raf } from '../animation-helpers.js';

describe('motion', () => {
	describe('spring', () => {
		it('handles initially undefined values', () => {
			const size = spring();

			size.set(100);
			assert.equal(get(size), 100);
		});
	});

	describe('spring frame rates', () => {
		const schedules = {
			'60 Hz': [1000 / 60],
			'120 Hz': [1000 / 120],
			'144 Hz': [1000 / 144],
			irregular: [5, 21, 9, 30, 12]
		};

		function advance(from: number, to: number, intervals: number[]) {
			let time = from;
			let frame = 0;
			while (time < to - 1e-8) {
				time = Math.min(to, time + intervals[frame++ % intervals.length]);
				raf.tick(time);
			}
		}

		it('spring preserves an unfinished step when retargeting with soft recovery', () => {
			raf.reset();
			const motion = spring(0);
			motion.set(100);
			raf.tick(1000 / 120);
			assert.closeTo(get(motion), 7.5, 1e-10);
			motion.set(-1000, { soft: true });
			raf.tick(1000 / 120);
			assert.closeTo(get(motion), 7.5, 1e-10);
			raf.tick(1000 / 60);
			assert.closeTo(get(motion), 15, 1e-10);
			raf.tick(1000 / 40);
			assert.closeTo(get(motion), 19.7625, 1e-10);
			raf.tick(1000 / 30);
			assert.closeTo(get(motion), 24.525, 1e-10);
		});

		it('spring applies deferred soft recovery at the boundary across frame schedules', () => {
			for (const initial_soft of [undefined, 0.2]) {
				for (const soft of [true, 0.2]) {
					const trajectories = [];
					for (const intervals of [schedules['60 Hz'], [1000 / 30], ...Object.values(schedules)]) {
						raf.reset();
						const motion = spring(0);
						motion.set(100, { soft: initial_soft });
						// Use a public-API boundary retarget as the reference. Other runs
						// retarget halfway through its old step, including during recovery.
						raf.tick(trajectories.length === 0 ? 1000 / 60 : 1000 / 120);
						const before = get(motion);
						motion.set(-1000, { soft });
						raf.tick(raf.time);
						assert.closeTo(get(motion), before, 1e-10);
						const samples = [];
						// The first 30 Hz frame crosses two boundaries with a remainder.
						for (const time of [1000 / 120 + 1000 / 30, 250, 500, 1500]) {
							advance(raf.time, time, intervals);
							samples.push(get(motion));
						}
						trajectories.push(samples);
					}
					if (initial_soft === undefined && soft === true) {
						assert.closeTo(trajectories[0][0], 23.910875, 1e-10);
					}
					assert.equal(trajectories[0][3], -1000);
					for (const samples of trajectories.slice(1)) {
						for (let i = 0; i < samples.length; i++) {
							assert.closeTo(samples[i], trajectories[0][i], 1e-8);
						}
					}
				}
			}
		});

		it('Spring preserves an unfinished recovery step when retargeting with momentum', () => {
			for (const target of [100, -1000]) {
				raf.reset();
				const motion = new Spring(0);
				motion.set(100, { preserveMomentum: 200 });
				raf.tick(25);
				const before = motion.current;
				motion.set(target, { preserveMomentum: 200 });
				raf.tick(25);
				assert.closeTo(motion.current, before, 1e-10);
				raf.tick(25.000001);
				assert.isAbove(motion.current, before);
				raf.tick(1000 / 30);
				assert.closeTo(motion.current, 4.802083333333333, 1e-10);
			}
		});

		it('Spring applies deferred momentum at the boundary across frame schedules', () => {
			for (const [initial_momentum, input_time] of [
				[undefined, 25],
				[200, 25],
				[200, 225]
			] as const) {
				for (const preserveMomentum of [200, 400]) {
					const trajectories: number[][] = [];
					const boundary = ((Math.floor((input_time * 60) / 1000) + 1) * 1000) / 60;
					for (const intervals of [schedules['60 Hz'], [1000 / 30], ...Object.values(schedules)]) {
						raf.reset();
						const motion = new Spring(0);
						motion.set(100, { preserveMomentum: initial_momentum });
						// Compare fractional retargets with the same reset at the old step's boundary.
						advance(0, trajectories.length === 0 ? boundary : input_time, intervals);
						const before = motion.current;
						motion.set(-1000, { preserveMomentum });
						raf.tick(raf.time);
						assert.closeTo(motion.current, before, 1e-10);
						const samples = [];
						for (const time of [boundary + 1000 / 120, boundary + 1000 / 30, 500, 1500]) {
							advance(raf.time, time, intervals);
							samples.push(motion.current);
						}
						trajectories.push(samples);
					}
					for (const samples of trajectories.slice(1)) {
						for (let i = 0; i < samples.length; i++) {
							assert.closeTo(samples[i], trajectories[0][i], 1e-8);
						}
					}
				}
			}
		});

		for (const api of ['spring', 'Spring'] as const) {
			function create<T>(value: T, options?: SpringOptions) {
				if (api === 'Spring') {
					const motion = new Spring(value, options);
					return {
						set: (value: T, opts?: { instant?: boolean; momentum?: number }) =>
							motion.set(value, { instant: opts?.instant, preserveMomentum: opts?.momentum }),
						read: () => motion.current
					};
				}
				const motion = spring(value, options);
				return {
					set: (value: T, opts?: { instant?: boolean; momentum?: number }) =>
						motion.set(value, {
							hard: opts?.instant,
							soft: opts?.momentum && opts.momentum / 1000
						}),
					read: () => get(motion)
				};
			}

			it(`${api} has the same trajectory and settling time at different frame rates`, async () => {
				const results: [number, boolean][][] = [];
				for (const intervals of Object.values(schedules)) {
					raf.reset();
					const motion = create(0);
					let settled = false;
					motion.set(100).then(() => (settled = true));
					const samples: [number, boolean][] = [];
					for (const time of [250, 500, 750, 1000]) {
						advance(time - 250, time, intervals);
						await Promise.resolve();
						await Promise.resolve();
						samples.push([motion.read(), settled]);
					}
					results.push(samples);
				}
				assert.isBelow(results[0][0][0], 100);
				assert.deepEqual(
					results[0].map((sample) => sample[1]),
					[false, false, true, true]
				);
				for (const samples of results.slice(1)) {
					for (let i = 0; i < samples.length; i++) {
						assert.closeTo(samples[i][0], results[0][i][0], 1e-8);
						assert.equal(samples[i][1], results[0][i][1]);
					}
				}
			});

			it(`${api} preserves the 60 Hz response and interpolates between simulation steps`, () => {
				raf.reset();
				const motion = create(0);
				motion.set(100);
				raf.tick(1000 / 120);
				assert.closeTo(motion.read(), 7.5, 1e-10);
				// A repeated RAF timestamp must neither advance mass nor discard velocity.
				raf.tick(1000 / 120);
				assert.closeTo(motion.read(), 7.5, 1e-10);
				raf.tick(1000 / 60);
				assert.closeTo(motion.read(), 15, 1e-10);
				raf.tick(1000 / 40);
				assert.closeTo(motion.read(), (15 + 30.75) / 2, 1e-10);
				raf.tick(1000 / 30);
				assert.closeTo(motion.read(), 30.75, 1e-10);
			});

			it(`${api} preserves input-time progress when another spring retargets it during a shared frame`, () => {
				raf.reset();
				const driver = spring(0);
				driver.set(100);
				const motion = create(0);
				motion.set(100);
				let retargeted = false;
				const unsubscribe = driver.subscribe((value) => {
					if (value === 0 || retargeted) return;
					retargeted = true;
					// Input during the earlier task is newer than the batch timestamp.
					raf.time = 16.7;
					motion.set(-1000);
				});
				raf.tick(16.6);
				assert.isTrue(retargeted);
				assert.closeTo(motion.read(), 15.0315, 1e-10);
				raf.tick(1000 / 30);
				assert.closeTo(motion.read(), 30.75, 1e-10);
				unsubscribe();
			});

			it(`${api} applies a fractional-frame retarget at the next simulation boundary`, () => {
				for (const render of [false, true]) {
					raf.reset();
					const motion = create(0);
					motion.set(100);
					if (render) raf.tick(1000 / 120);
					else raf.time = 1000 / 120;
					motion.set(-1000);
					raf.tick(1000 / 120);
					assert.closeTo(motion.read(), 7.5, 1e-10);
					raf.tick(1000 / 60);
					assert.closeTo(motion.read(), 15, 1e-10);
					raf.tick(1000 / 40);
					assert.closeTo(motion.read(), (15 - 134.25) / 2, 1e-10);
					raf.tick(1000 / 30);
					assert.closeTo(motion.read(), -134.25, 1e-10);
				}
			});

			for (const momentum of [undefined, 200]) {
				it(`${api} preserves velocity on retarget${momentum ? ' with mass recovery' : ''}`, () => {
					const trajectories = [];
					for (const intervals of Object.values(schedules)) {
						raf.reset();
						const motion = create(0, { stiffness: 0.1, damping: 0.1 });
						motion.set(100, { momentum });
						advance(0, 250, intervals);
						const before = motion.read();
						motion.set(-50);
						assert.equal(motion.read(), before);
						const samples = [before];
						for (const time of [500, 750, 1000]) {
							advance(time - 250, time, intervals);
							samples.push(motion.read());
						}
						trajectories.push(samples);
					}
					for (const samples of trajectories.slice(1)) {
						for (let i = 0; i < samples.length; i++) {
							assert.closeTo(samples[i], trajectories[0][i], 1e-8);
						}
					}
					// Recorded through the public APIs at 60 Hz before the fix.
					const expected = momentum
						? [141.04390054752326, -35.159621124591006, -87.80399753296805, -56.95361515601502]
						: [94.84431144451837, -22.208976446934923, -76.95652201922879, -58.50151394281217];
					for (let i = 0; i < expected.length; i++) {
						assert.closeTo(trajectories[0][i], expected[i], 1e-8);
					}
				});
			}

			it(`${api} handles nested numbers, arrays, objects and Dates consistently`, () => {
				const value = (n: number) => ({
					x: n,
					nested: [n * 2, { date: new Date(100000 + n * 10) }]
				});
				const trajectories = [];
				for (const intervals of Object.values(schedules)) {
					raf.reset();
					// Date positions have integer-millisecond precision. Use a larger
					// precision for this structure so Date rounding cannot stall settling.
					const motion = create(value(0), { precision: 10 });
					motion.set(value(10000));
					const samples = [];
					for (const time of [250, 500, 750, 1000]) {
						advance(time - 250, time, intervals);
						samples.push(motion.read());
					}
					trajectories.push(samples);
				}
				assert.deepEqual(trajectories[0][3], value(10000));
				for (const samples of trajectories.slice(1)) assert.deepEqual(samples, trajectories[0]);
			});

			it(`${api} resets fractional simulation state on ${api === 'spring' ? 'hard' : 'instant'} updates`, () => {
				raf.reset();
				const motion = create(0);
				motion.set(100);
				raf.tick(5);
				motion.set(20, { instant: true });
				assert.equal(motion.read(), 20);
				raf.tick(10);
				assert.equal(motion.read(), 20);
				motion.set(120);
				raf.tick(10 + 1000 / 120);
				assert.closeTo(motion.read(), 27.5, 1e-10);
			});

			it(`${api} clamps a paused gap to two simulation steps`, () => {
				const results = [];
				for (const gap of [1000 / 30, 5000]) {
					raf.reset();
					const motion = create(0);
					motion.set(100, { momentum: 200 });
					raf.tick(5);
					raf.tick(5 + gap);
					const after_gap = motion.read();
					raf.tick(10 + gap);
					results.push([after_gap, motion.read()]);
				}
				assert.deepEqual(results[1], results[0]);
				assert.isAbove(results[0][1], results[0][0]);
				assert.isBelow(results[0][1], 100);
			});
		}
	});

	describe('tweened', () => {
		it('handles initially undefined values', () => {
			const size = tweened();

			size.set(100);
			assert.equal(get(size), 100);
		});

		it('sets immediately when duration is 0', () => {
			const size = tweened(0);

			size.set(100, { duration: 0 });
			assert.equal(get(size), 100);
		});

		it('updates correctly when initialized with a `null`-ish value', () => {
			const size = tweened(undefined as unknown as number, { duration: 0 });

			size.set(10);
			assert.equal(get(size), 10);

			size.update((v) => v + 10);
			assert.equal(get(size), 20);
		});

		it('updates non-numeric values immediately', () => {
			raf.reset();
			const boolean = tweened(false);

			boolean.set(true, { duration: 100 });

			raf.tick(1);
			assert.equal(get(boolean), true);
		});
	});

	describe('Tween', () => {
		it('sets immediately when duration is 0', () => {
			const size = new Tween(0);

			size.set(100, { duration: 0 });
			assert.equal(size.current, 100);
		});

		it('updates non-numeric values immediately', () => {
			raf.reset();
			const boolean = new Tween(false);

			boolean.set(true, { duration: 100 });

			raf.tick(1);
			assert.equal(boolean.current, true);
		});
	});

	it('updates correctly when initialized with a `null`-ish value', () => {
		const size = new Tween(undefined as unknown as number, { duration: 0 });

		size.set(10);
		assert.equal(size.current, 10);
	});
});
