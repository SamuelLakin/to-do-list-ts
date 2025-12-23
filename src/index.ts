import { addTodo, fetchTodos, updateTodoStatus, deleteTodo } from './api.js';
import type { Todo } from './types.js';

const addtodobutton = document.getElementById('add-todo-button') as HTMLButtonElement;
const getTitleInput = document.getElementById('todo-title') as HTMLInputElement;
const getDescriptionInput = document.getElementById('todo-description') as HTMLInputElement;
const getDueDateInput = document.getElementById('todo-due-date') as HTMLInputElement;
const getStatusSelect = document.getElementById('todo-status') as HTMLSelectElement;

let todoData: Todo[] = [];

// Creates a new todo and adds it via the API
async function createTodo(): Promise<void> {
    try {
        const newTodo: Todo = {
            title: getTitleInput.value,
            description: getDescriptionInput.value,
            dueDate: getDueDateInput.value ? new Date(getDueDateInput.value) : undefined,
            status: getStatusSelect.value as Todo['status'],
            createdAt: new Date(),
            is: Date.now(),
        };
        await addTodo(newTodo);
        alert('Todo added successfully.');
    } 
    catch (error) {
        alert('Failed to add todo.');
    }
}

// Deleted todo from the list via an index and deleted via the API
async function deleteTodoEvent(index: number): Promise<void> {
    const todo = todoData[index];
    if(!todo) {
        alert('Todo not found.');
        return;
    }
    try {
        await deleteTodo(todo);
        alert('Todo deleted successfully.');
    } catch (error) {
        alert('Failed to delete todo.');
    }
}

// Updates the status of a todo via an index and the API
async function updateTodo(index:number, newStatus: Todo['status']) {
    const todo = todoData[index];
    if(!todo) {
        alert('Todo not found.');
        return;
    }
    try {
        await updateTodoStatus(todo, newStatus);
        alert('Todo status updated successfully.');
    } catch (error) {
        alert('Failed to update todo status.');
    }
    
}
    
// Maps todo data to HTML table rows
function mapDataToTableRows(todos: Todo[]): string {
    return todos.map(todo => `
        <tr class="todo-row-${todo.status}" data-id="${todo.is}">
            <td>${todo.title}</td>
            <td>${todo.description}</td>
            <td> 
                <select class="status-select">
                    <option value="pending" ${todo.status === "pending" ? "selected" : ""}>Pending</option>
                    <option value="in-progress" ${todo.status === "in-progress" ? "selected" : ""}>In Progress</option>
                    <option value="completed" ${todo.status === "completed" ? "selected" : ""}>Completed</option>
                </select>
            </td>
            <td>${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'N/A'}</td>
            <td>${todo.dueDate ? calcDayOverdue(new Date(todo.dueDate)) : 'N/A'}</td>
            <td>${new Date(todo.createdAt).toLocaleDateString()}</td>
            <td><input type="button" class="delete-todo-button" value="Delete" /></td>
        </tr>
    `).join('');
}

// Calculates how many days a todo is overdue or due in
function calcDayOverdue(dueDate: Date): string {
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - dueDate.getTime();
    if(timeDiff > 0) {
        return "\u26A0 OVERDUE BY " + Math.ceil(-timeDiff / (1000 * 3600 * 24) * -1) + " DAYS";
    }
    return "DUE IN " + Math.ceil(timeDiff / (1000 * 3600 * 24) * -1) + " DAYS";
}

// inits the app
async function initializeApp(): Promise<void> {
    // Fetches todos 
    try {
        todoData = await fetchTodos();

        const tbody = document.getElementById('todoTableBody');
        if (!tbody) {
            throw new Error('Table body not found');
        }
        tbody.innerHTML = mapDataToTableRows(todoData);
    } catch (error) {
        alert('Failed to initialize application.');
    }
    
        // Event listener for creating a new todo
    addtodobutton.addEventListener('click', async () => {
        try {
            await createTodo();
        } catch (error) {
            alert('Failed to create todo.');
        }
    })
    const buttons = document.querySelectorAll<HTMLButtonElement>('.delete-todo-button');
    buttons.forEach((button: HTMLButtonElement) => {
        button.addEventListener('click', async (event:Event) => {
            try {
                const todoId: number = ((event?.currentTarget as HTMLElement).closest('tr')?.rowIndex ?? 1) - 1;
                await deleteTodoEvent(todoId);
            } catch (error) {
                alert('Failed to delete todo.');
            }
        });
    });

    const filterbutton = document.getElementById('apply-filters') as HTMLButtonElement;

    // Event listener for applying filters
    filterbutton.addEventListener('click', async (event: Event) => {
        todoData = await fetchTodos();
        let filterstatus = document.getElementById('filter-status') as HTMLSelectElement;
        let newStatus = filterstatus.value;
        let newTodo: any[] = [];
        const tbody = document.getElementById('todoTableBody');
        if (!tbody) {
            throw new Error('Table body not found');
        }
        console.log(todoData)
        if(newStatus === "all") {
            tbody.innerHTML = mapDataToTableRows(todoData);
            return;

        }
        for(let i = 0; i <= todoData.length - 1; i++) {
            if (todoData[i]?.status === undefined && todoData[i] === undefined) continue;
            else if(todoData[i]?.status === newStatus && todoData[i] !== undefined) {

                newTodo.push(todoData[i]);
            }
        }
        // For filterting by due date range
        let filterdatefrom = document.getElementById('filter-due-date-from') as HTMLInputElement;
        let filterdateTo = document.getElementById('filter-due-date-to') as HTMLInputElement;
        let newDateFrom = filterdatefrom.value as string;
        let newDateTo = filterdateTo.value as string;
        for(let i = 0; i <= todoData.length - 1; i++) {
            console.log(newDateFrom, newDateTo, "DATE FILTERS");
            console.log(typeof(newDateFrom), typeof(newDateTo), "DATE FILTERS");
            if(!newDateFrom.trim() || !newDateTo.trim()) break;
            if(todoData[i] === undefined) continue;
            if(todoData[i]?.dueDate === undefined) continue;
            const dueDate = todoData[i]!.dueDate;
            if (!dueDate) continue;
            let todoDateFormat = new Date(dueDate).toISOString().split("T")[0] ;
            if(!todoDateFormat) continue;
            if(todoDateFormat === undefined) continue;
            if (newDateFrom === "" || newDateTo === "") break;
            if (todoDateFormat >= newDateFrom && todoDateFormat <= newDateTo) {
                newTodo.push(todoData[i]);
            }
        }
        todoData = newTodo;
        // Maps data to the table
        tbody.innerHTML = mapDataToTableRows(todoData);
    })

    document.addEventListener('change', async (event: Event) => {
        const target = event.target as HTMLSelectElement;
        
        if (!target.classList.contains("status-select")) return;

        const select = target as HTMLSelectElement;
        if(select.closest("tr") === null) return;
        const row = select.closest("tr")
        if (row === undefined || row === null) return;
        const newStatus = select.value;

        
        const index = row.rowIndex - 1;
        await updateTodo(index, newStatus as Todo['status']);
    });

    const sortbutton = document.getElementById('sort-due-date') as HTMLButtonElement;

        // Event listener for sorting todos by due date
    sortbutton.addEventListener('click', async (event: Event) => {
        let sort = document.getElementById('sort-due-date') as HTMLSelectElement;

        if(sort.value === "asc") {
            todoData.sort((a: Todo, b: Todo) => {
                if(a === undefined || b === undefined) {
                    return 0;
                }
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();                    
            }
        return 0;
            
        })
    }

       else if(sort.value === "desc") {
            todoData.sort((a: Todo, b: Todo) => {
                if(a === undefined || b === undefined) {
                    return 0;
                }
                if (a.dueDate && b.dueDate) {
                    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
                }
        return 0;
            })
        }
        const tbody = document.getElementById('todoTableBody');
        if (!tbody) {
            throw new Error('Table body not found');
        }
        tbody.innerHTML = mapDataToTableRows(todoData);
    }
);
}
    
// When DOM is loaded, init the app
document.addEventListener('DOMContentLoaded', () => {

    initializeApp();

});
