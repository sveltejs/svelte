import { cubicOut } from "svelte/easing";
import { run_duration, TimeableConfig, CssTransitionConfig } from "svelte/internal";
export function flip(
	node: Element,
	animation: { from: DOMRect; to: DOMRect },
	{ delay = 0, duration = (d: number) => Math.sqrt(d) * 30, easing = cubicOut }: TimeableConfig
): CssTransitionConfig {
	const style = getComputedStyle(node).transform;
	const transform = style === "none" ? "" : style;
	const scaleX = animation.from.width / node.clientWidth;
	const scaleY = animation.from.height / node.clientHeight;

	const dx = (animation.from.left - animation.to.left) / scaleX;
	const dy = (animation.from.top - animation.to.top) / scaleY;

	return {
		delay,
		duration: run_duration(duration, Math.sqrt(dx * dx + dy * dy)),
		easing,
		css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
	};
}
