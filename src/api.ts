import type { Todo } from './types.js';

export const todos: Todo[] = [];

// Adds a new todo
async function addTodo(todo: Todo): Promise<void> {

    const response = await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
    });
    if (!response.ok) {
        throw new Error(`Failed to add todo: ${response.statusText}`);
    }
    else {
        todos.push(todo);
        console.log(`Todo added successfully: ${todo.title}`);
    }
}

// Fetches all todos from DB
async function fetchTodos(): Promise<Todo[]> {
    const response = await fetch('http://localhost:3000/todos');
    if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`);
    }
    else {
        const data: Todo[] = await response.json();
        todos.splice(0, todos.length, ...data);
        console.log(`Fetched ${data.length} todos from server.`);

        return data;
    }
}

// Deletes a todo from DB
async function deleteTodo(todo:any): Promise<void> {
    const response = await fetch(`http://localhost:3000/todos/${todo.id}`, {
        method: 'DELETE',
    });
    console.log(response.body)
    if (!response.ok) {
        throw new Error(`Failed to delete todo: ${response.statusText}`);
    }
    else {

        const index = todos.findIndex(t => t.is === todo.is);
                console.log(index);
        if (index !== -1) {
            todos.splice(index, 1);
            console.log(`Todo deleted successfully: ${todos[index]?.title}`);
        }
    }
    
}

// Updates the status of a todo in the DB
async function updateTodoStatus(todo: any, status: Todo['status']): Promise<void> {
    const response = await fetch(`http://localhost:3000/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({  status: status }),
    });
    if (!response.ok) {
        throw new Error(`Failed to update todo status: ${response.statusText}`);
    }
    else {
        const updatedTodo = todos.find(t => t.is === todo.id);
        if (updatedTodo) {
            console.log(updatedTodo, "UPDATED TODO")
            updatedTodo.status = status as Todo['status'];
            console.log(`Todo status updated successfully: ${todo.title} is now ${todo.status}`);
        }
    }
}

export { addTodo, fetchTodos, updateTodoStatus, deleteTodo };