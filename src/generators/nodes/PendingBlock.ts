import Node from './shared/Node';
import Block from '../dom/Block';
import State from '../dom/State';

export default class PendingBlock extends Node {
	_block: Block;
	children: Node[];
}