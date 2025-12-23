
export type Status = 'pending' | 'in-progress' | 'completed';

export type Todo = {
    is: number;
    title: string;
    description?: string;
    status: Status;
    dueDate?: Date;
    createdAt: Date;
};