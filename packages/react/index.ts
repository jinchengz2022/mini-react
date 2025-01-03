import currentDispatcher, {
	Dispatcher,
	resolveDispatcher
} from './src/currentDispatcher';

export const useState = <State>(initialState: (() => State) | State) => {
	const dispatcher = resolveDispatcher() as Dispatcher;
	return dispatcher.useState<State>(initialState);
};

export const useEffect: Dispatcher['useEffect'] = (create, deps) => {
	const dispatcher = resolveDispatcher() as Dispatcher;
	return dispatcher.useEffect(create, deps);
};

export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
};

import { jsxDEV } from './src/jsx';

export default {
	version: '0.0.0',
	createElement: jsxDEV
};
