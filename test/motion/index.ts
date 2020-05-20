import { assert } from '../test';
import { get } from '../../store';
import { spring, tweened } from '../../motion';
import { set_framerate, set_now, set_raf, flush } from '../../internal';
let raf;
beforeEach(() => {
	set_framerate(1);
	raf = {
		time: 0,
		callback: null,
		tick: (now) => {
			raf.time = now;
			if (raf.callback) raf.callback();
		},
	};
	set_now(() => raf.time);
	set_raf((cb) => {
		raf.callback = () => {
			raf.callback = null;
			cb(raf.time);
			flush();
		};
	});
});
describe('motion', () => {
	describe('spring', () => {
		it('handles initially undefined values', () => {
			const size = spring();

			size.set(100);
			assert.equal(get(size), 100);
		});
	});

	describe('tweened', () => {
		it('handles initially undefined values', () => {
			const size = tweened();

			size.set(100);
			raf.tick(1);
			assert.equal(get(size), 100);
		});

		it('sets immediately when duration is 0', () => {
			const size = tweened(0);

			size.set(100, { duration: 0 });
			raf.tick(1);
			assert.equal(get(size), 100);
		});
	});
});
