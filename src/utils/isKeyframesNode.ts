import { Node } from '../interfaces';

export default function isKeyframesNode(node: Node): boolean {
	return ['', '-webkit-', '-moz-', '-o-'].some(
		prefix => node.name === `${prefix}keyframes`
	);
}
