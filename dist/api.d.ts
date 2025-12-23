import type { Todo } from './types.js';
export declare const todos: Todo[];
declare function addTodo(todo: Todo): Promise<void>;
declare function fetchTodos(): Promise<Todo[]>;
declare function deleteTodo(todo: any): Promise<void>;
declare function updateTodoStatus(todo: any, status: Todo['status']): Promise<void>;
export { addTodo, fetchTodos, updateTodoStatus, deleteTodo };
//# sourceMappingURL=api.d.ts.map