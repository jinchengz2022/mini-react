import { REACT_ELEMENT_TYPE } from '../../share/ReactSymbols';
import {
	Type,
	ReactElement,
	Ref,
	Props,
	Key,
	ElementType
} from '../../share/ReactTypes';

const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElement {
	const element: ReactElement = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		_mark: 'jinchengz'
	};

	return element;
};

// babel 编译
// _jsx("div", { children: "123" });

export const jsx = (type: ElementType, config: any, ...args: any) => {
	let key: Key = null;
	let ref: Ref = null;
	const props: Props = {};

	for (const prop in config) {
		const val = config[prop];

		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}

		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}

		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	const maybeChildrenLength = args.length;
	if (maybeChildrenLength) {
		if (maybeChildrenLength === 1) {
			props.children = args[0];
		} else {
			props.children = args;
		}
	}

	return ReactElement(type, key, ref, props);
};

export const jsxDEV = jsx;
