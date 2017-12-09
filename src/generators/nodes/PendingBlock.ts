import Node from './shared/Node';
import Block from '../dom/Block';

export default class PendingBlock extends Node {
	block: Block;
	children: Node[];
}