import {
	unstable_ImmediatePriority as ImmediatePriority,
	unstable_UserBlockingPriority as UserBlockingPriority,
	unstable_LowPriority as LowPriority,
	unstable_IdlePriority as IdlePriority,
	unstable_NormalPriority as NormalPriority,
	CallbackNode,
	unstable_getFirstCallbackNode as getFirstCallbackNode,
	unstable_cancelCallback as cancelCallback,
	unstable_shouldYield as shouldYield,
	unstable_scheduleCallback as scheduleCallback
} from 'scheduler';

import './test.css';

// react 并发更新实现原理示例

type Priority =
	| typeof ImmediatePriority
	| typeof UserBlockingPriority
	| typeof LowPriority
	| typeof NormalPriority
	| typeof IdlePriority;

interface Work {
	count: number;
	priority: Priority;
}

const workList: Work[] = [];
let prevPriority: Priority = IdlePriority;
let curCallback: CallbackNode | null = null;

const root = document.querySelector('#root');
[LowPriority, NormalPriority, UserBlockingPriority, ImmediatePriority].forEach(
	(priority) => {
		const btn = document.createElement('button');
		root?.appendChild(btn);
		btn.innerText = [
			'',
			'ImmediatePriority',
			'UserBlockingPriority',
			'NormalPriority',
			'LowPriority'
		][priority];
		btn.onclick = () => {
			workList.unshift({
				count: 100,
				priority: priority as Priority
			});
			schedule();
		};
	}
);

function schedule() {
	const cbNode = getFirstCallbackNode();
	// 优先级从高到低
	const curWork = workList.sort((a, b) => a.priority - b.priority)[0];

	if (!curWork) {
		curCallback = null;
		cbNode && cancelCallback(cbNode);
		return;
	}

	const { priority: curPriority } = curWork;
	if (curPriority === prevPriority) {
		return;
	}

	// 更高优先级 work
	cbNode && cancelCallback(cbNode);

	curCallback = scheduleCallback(curPriority, perform.bind(null, curWork));
}

function perform(work: Work, didTimeout?: boolean) {
	/**
	 * 1. priority
	 * 2. 饥饿问题（优先级相同但一直等不到执行）
	 * 3. 时间切片
	 */
	const needSync = work.priority === ImmediatePriority || didTimeout;
	// shouldyield ---> 是否应该被中断
	while ((needSync || !shouldYield()) && work.count) {
		work.count--;
		insertSpan(work.priority);
	}

	// 中断执行 || 执行完成
	prevPriority = work.priority;

	if (!work.count) {
		const workIndex = workList.indexOf(work);
		workList.splice(workIndex, 1);
		prevPriority = IdlePriority;
	}

	const prevCallback = curCallback;
	schedule();
	const newCallback = curCallback;

	if (newCallback && prevCallback === newCallback) {
		return perform.bind(null, work);
	}
}

function insertSpan(content: any) {
	const span = document.createElement('span');
	span.innerText = content;
	doSomeBuzyWork(8000000);
	root?.appendChild(span);
}

function doSomeBuzyWork(len: number) {
	let res = 0;
	while (len--) {
		res += len;
	}
}
