import EachBlock from './EachBlock';
import Element from './Element/Element';
import IfBlock from './IfBlock';
import MustacheTag from './MustacheTag';
import RawMustacheTag from './RawMustacheTag';
import Text from './Text';
import YieldTag from './YieldTag';
import { Visitor } from '../interfaces';

const visitors: Record<string, Visitor> = {
	EachBlock,
	Element,
	IfBlock,
	MustacheTag,
	RawMustacheTag,
	Text,
	YieldTag,
};

export default visitors;