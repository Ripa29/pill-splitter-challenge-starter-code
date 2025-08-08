export interface Point {
    x: number;
    y: number;
}

export interface Pill {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export interface DrawingState {
    isDrawing: boolean;
    startPoint: Point;
    currentPill: Pill | null;
}

export interface DragState {
    isDragging: boolean;
    draggedPill: string | null;
    offset: Point;
}
