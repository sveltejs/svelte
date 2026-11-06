---
title: svelte/easing
---

This module provides easing functions for [transitions](transition), [animations](animate), and the [`svelte/motion`](svelte-motion) module.

An easing function receives the elapsed progress `t`, from `0` at the start to `1` at the end, and returns the eased progress. Svelte uses this value to interpolate between the starting and ending values. For example, `cubicIn(0.5)` returns `0.125`, so a numeric tween from `0` to `100` with this easing reaches `12.5` halfway through its duration.

You can also supply your own easing function, such as `(t) => t * t`. It should return `0` for `t = 0` and `1` for `t = 1`. The return value is an absolute progress value, not an increment from the previous call. Return the same value for the same input: when generating CSS transition keyframes, Svelte calls the function repeatedly before the transition begins.

The return value is not restricted to the range `0` to `1`. For example, `backIn` returns negative values and `elasticOut` can return values greater than `1`, causing the animation to move beyond its starting or ending value before settling.

> MODULE: svelte/easing
