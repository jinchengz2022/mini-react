import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { Props, ReactElement } from 'shared/ReactTypes';
import {
	createFiberFromElement,
	createWorkInProgress,
	FiberNode
} from './fiber';
import { ChildDeletion, Placement } from './fiberFlags';
import { HostText } from './workTags';

/**
 * mount/reconcile只负责 Placement(插入)/Placement(移动)/ChildDeletion(删除)
 * 更新（文本节点内容更新、属性更新）在completeWork中，对应Update flag
 */

function ChildReconciler(shouldTrackEffect: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffect) {
			return;
		}
		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	}

	function deleteRemainingChildren(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null
	) {
		if (!shouldTrackEffect) {
			return;
		}

		let childToDelete = currentFirstChild;
		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	}

	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		element: ReactElement
	) {
		const key = element.key;
		while (currentFirstChild !== null) {
			if (currentFirstChild.key === key) {
				// key相同，比较type
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFirstChild.type === element.type) {
						// type相同 可以复用
						const existing = useFiber(currentFirstChild, element.props);
						existing.return = returnFiber;
						deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
						return existing;
					}
					// type不同，删除所有旧的
					deleteRemainingChildren(returnFiber, currentFirstChild);
					break;
				} else {
					console.error('未定义的element.$$typeof', element.$$typeof);
					break;
				}
			} else {
				// key不同，删除旧的
				deleteChild(returnFiber, currentFirstChild);
				currentFirstChild = currentFirstChild.sibling;
			}
		}
		// 创建新的
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffect && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		content: string
	) {
		while (currentFirstChild !== null) {
			if (currentFirstChild.tag === HostText) {
				const existing = useFiber(currentFirstChild, { content });
				existing.return = returnFiber;
				deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
				return existing;
			}
			deleteChild(returnFiber, currentFirstChild);
			currentFirstChild = currentFirstChild.sibling;
		}

		const created = new FiberNode(HostText, { content }, null);
		created.return = returnFiber;
		return created;
	}

	function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		newChild?: ReactElement
	): FiberNode | null {
		// newChild 为 JSX
		// currentFirstChild 为 fiberNode
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFirstChild, newChild)
					);
			}
		}
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFirstChild, newChild + '')
			);
		}
		console.error('reconcile时未实现的child 类型');
		return null;
	}

	return reconcileChildFibers;
}

function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
	const clone = createWorkInProgress(fiber, pendingProps);
	clone.index = 0;
	clone.sibling = null;

	return clone;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
