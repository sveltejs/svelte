import { hydrating } from '../../hydration.js';
import { destroy_effect, managed_effect, render_effect } from '../../../reactivity/effects.js';
import { listen } from './shared.js';

/** @param {TimeRanges} ranges */
function time_ranges_to_array(ranges) {
	var array = [];

	for (var i = 0; i < ranges.length; i += 1) {
		array.push({ start: ranges.start(i), end: ranges.end(i) });
	}

	return array;
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => number | undefined} get_value
 * @param {(value: number) => void} update
 * @returns {void}
 */
export function bind_current_time(media, get_value, update) {
	/** @type {number} */
	var raf_id;
	var updating = false;

	// Ideally, listening to timeupdate would be enough, but it fires too infrequently for the currentTime
	// binding, which is why we use a raf loop, too. We additionally still listen to timeupdate because
	// the user could be scrubbing through the video using the native controls when the media is paused.
	var callback = () => {
		cancelAnimationFrame(raf_id);

		if (!media.paused) {
			raf_id = requestAnimationFrame(callback);
		}

		updating = true;
		update(media.currentTime);
	};

	raf_id = requestAnimationFrame(callback);
	media.addEventListener('timeupdate', callback);

	render_effect(() => {
		var value = get_value();

		// through isNaN we also allow number strings, which is more robust
		if (!updating && !isNaN(/** @type {any} */ (value))) {
			media.currentTime = /** @type {number} */ (value);
		}

		updating = false;
	});

	render_effect(() => () => cancelAnimationFrame(raf_id));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(array: Array<{ start: number; end: number }>) => void} update
 */
export function bind_buffered(media, update) {
	listen(media, ['loadedmetadata', 'progress'], () => update(time_ranges_to_array(media.buffered)));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(array: Array<{ start: number; end: number }>) => void} update
 */
export function bind_seekable(media, update) {
	listen(media, ['loadedmetadata'], () => update(time_ranges_to_array(media.seekable)));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(array: Array<{ start: number; end: number }>) => void} update
 */
export function bind_played(media, update) {
	listen(media, ['timeupdate'], () => update(time_ranges_to_array(media.played)));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(seeking: boolean) => void} update
 */
export function bind_seeking(media, update) {
	listen(media, ['seeking', 'seeked'], () => update(media.seeking));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(seeking: boolean) => void} update
 */
export function bind_ended(media, update) {
	listen(media, ['timeupdate', 'ended'], () => update(media.ended));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(ready_state: number) => void} update
 */
export function bind_ready_state(media, update) {
	listen(
		media,
		['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing', 'waiting', 'emptied'],
		() => update(media.readyState)
	);
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => number | undefined} get_value
 * @param {(playback_rate: number) => void} update
 */
export function bind_playback_rate(media, get_value, update) {
	var updating = false;

	var callback = () => {
		if (!updating) {
			update(media.playbackRate);
		}
		updating = false;
	};

	// Needs to happen after the element is inserted into the dom, else playback will be set back to 1 by the browser.
	// For hydration we could do it immediately but the additional code is not worth the lost microtask.

	/** @type {import('#client').Effect | undefined} */
	var render;
	var destroyed = false;

	var effect = managed_effect(() => {
		destroy_effect(effect);

		if (destroyed) return;

		if (get_value() == null) {
			callback();
		}

		listen(media, ['ratechange'], callback, false);

		render = render_effect(() => {
			var value = get_value();

			// through isNaN we also allow number strings, which is more robust
			if (!isNaN(/** @type {any} */ (value)) && value !== media.playbackRate) {
				updating = true;
				media.playbackRate = /** @type {number} */ (value);
			}
		});
	});

	render_effect(() => () => {
		destroyed = true;
		if (render) {
			destroy_effect(render);
		}
	});
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => boolean | undefined} get_value
 * @param {(paused: boolean) => void} update
 */
export function bind_paused(media, get_value, update) {
	var mounted = hydrating;
	var paused = get_value();

	var callback = () => {
		if (paused !== media.paused) {
			paused = media.paused;
			update((paused = media.paused));
		}
	};

	if (paused == null) {
		callback();
	}

	// Defer listening if not mounted yet so that the first canplay event doesn't cause a potentially wrong update
	if (mounted) {
		// If someone switches the src while media is playing, the player will pause.
		// Listen to the canplay event to get notified of this situation.
		listen(media, ['play', 'pause', 'canplay'], callback, false);
	}

	render_effect(() => {
		paused = !!get_value();

		if (paused !== media.paused) {
			var toggle = () => {
				mounted = true;
				if (paused) {
					media.pause();
				} else {
					media.play().catch(() => {
						update((paused = true));
					});
				}
			};

			if (mounted) {
				toggle();
			} else {
				// If this is the first invocation in dom mode, the media element isn't mounted yet,
				// and therefore its resource isn't loaded yet. We need to wait for the canplay event
				// in this case or else we'll get a "The play() request was interrupted by a new load request" error.
				media.addEventListener(
					'canplay',
					() => {
						listen(media, ['play', 'pause', 'canplay'], callback, false);
						toggle();
					},
					{ once: true }
				);
			}
		}
	});
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => number | undefined} get_value
 * @param {(volume: number) => void} update
 */
export function bind_volume(media, get_value, update) {
	var updating = false;
	var callback = () => {
		updating = true;
		update(media.volume);
	};

	if (get_value() == null) {
		callback();
	}

	listen(media, ['volumechange'], callback, false);

	render_effect(() => {
		var value = get_value();

		// through isNaN we also allow number strings, which is more robust
		if (!updating && !isNaN(/** @type {any} */ (value))) {
			media.volume = /** @type {number} */ (value);
		}

		updating = false;
	});
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => boolean | undefined} get_value
 * @param {(muted: boolean) => void} update
 */
export function bind_muted(media, get_value, update) {
	var updating = false;

	var callback = () => {
		updating = true;
		update(media.muted);
	};

	if (get_value() == null) {
		callback();
	}

	listen(media, ['volumechange'], callback, false);

	render_effect(() => {
		var value = get_value();

		if (!updating) media.muted = !!value;
		updating = false;
	});
}
