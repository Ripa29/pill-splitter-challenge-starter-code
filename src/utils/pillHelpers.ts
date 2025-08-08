import type {Point, Pill} from '../types';

export const isPointInPill = (point: Point, pill: Pill): boolean => {
    return point.x >= pill.x &&
        point.x <= pill.x + pill.width &&
        point.y >= pill.y &&
        point.y <= pill.y + pill.height;
};

export const doesLineIntersectPill = (mousePos: Point, pill: Pill): { horizontal: boolean; vertical: boolean } => {
    const horizontal = mousePos.y >= pill.y && mousePos.y <= pill.y + pill.height;
    const vertical = mousePos.x >= pill.x && mousePos.x <= pill.x + pill.width;
    return { horizontal, vertical };
};
