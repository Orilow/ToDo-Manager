export class UnhandledTask {
    id: number;
    title: string;
    description: string;
    type: { id: number; };
    status: { id: number; };
    dueDate: string;
    manDay: number;
}

export class Task {
    id: number;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    dueDate: Date;
    manDay: number;
    userId: number;
}

export class TaskType {
    id: number;
    typeName: string;
}

export class TaskStatus {
    id: number;
    statusName: string;
}