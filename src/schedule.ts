import { ITask } from './type';

const queue: ITask[] = [];
const threshold: number = 5;

let deadline: number = 0;

/**
 * 添加任务 并触发任务循环
 * @param task 外部任务
 */
export const schedule = (task: any): void => {
  queue.push(task) && postTask();
};

/**
 * 创建任务分片
 * @param pending 是否超时
 * @returns 返回一个触发任务循环的函数
 */
const task = (pending: boolean) => {
  if (!pending && typeof Promise !== 'undefined') {
    // TODO: 可以直接运行flush方法吗
    return () => Promise.resolve().then(flush);
  }
  if (typeof MessageChannel !== 'undefined') {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = flush;
    return () => port2.postMessage(null);
  }
  return () => setTimeout(flush);
};

let postTask = task(false);

/**
 * 任务循环
 */
const flush = (): void => {
  let task, next;
  deadline = getTime() + threshold; // TODO: heuristic algorithm
  while ((task = queue.pop()) && !shouldYield()) {
    next = task();
    if (next) {
      // TODO: 为什么 push了还需要调用schedule方法
      queue.push(next);
      schedule(next);
    }
    // (next = task()) && queue.push(next) && schedule(next);
  }
};

/**
 * 判断是否超时，若未超时添加一个微任务的while循环，若超时添加一个宏任务的while循环
 * @returns 返回是否超时
 */
export const shouldYield = (): boolean => {
  const pending = getTime() >= deadline;
  postTask = task(pending);
  return pending;
};

export const getTime = () => performance.now();
