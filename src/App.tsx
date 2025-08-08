import React, { useState, useRef, useCallback, useEffect } from 'react';
import Pill from './components/Pill';
import Instructions from './components/Instructions';
import { generateRandomColor } from './utils/colorUtils';
import { isPointInPill, doesLineIntersectPill } from './utils/pillHelpers';
import type { Point, Pill as PillType, DrawingState, DragState } from './types';
import useMousePosition from './hooks/useMousePosition';

const App: React.FC = () => {
    const [pills, setPills] = useState<PillType[]>([]);
    const [drawingState, setDrawingState] = useState<DrawingState>({
        isDrawing: false,
        startPoint: { x: 0, y: 0 },
        currentPill: null
    });
    const [dragState, setDragState] = useState<DragState>({
        isDragging: false,
        draggedPill: null,
        offset: { x: 0, y: 0 }
    });

    const containerRef = useRef<HTMLDivElement>(null);

    // Fix: cast containerRef to RefObject<HTMLElement> to satisfy useMousePosition
    const mousePosition = useMousePosition(containerRef as React.RefObject<HTMLElement>);

    const splitPill = useCallback((pill: PillType, splitPoint: Point): PillType[] => {
        const intersection = doesLineIntersectPill(splitPoint, pill);
        const parts: PillType[] = [];

        const minSize = 20;

        if (intersection.horizontal && intersection.vertical) {
            const left = splitPoint.x - pill.x;
            const right = pill.width - left;
            const top = splitPoint.y - pill.y;
            const bottom = pill.height - top;

            if (left >= minSize && top >= minSize) {
                parts.push({ ...pill, id: `${pill.id}-tl`, width: left, height: top });
            } else {
                parts.push({ ...pill, id: `${pill.id}-tl`, x: pill.x - 25, y: pill.y - 25, width: minSize, height: minSize });
            }

            if (right >= minSize && top >= minSize) {
                parts.push({ ...pill, id: `${pill.id}-tr`, x: splitPoint.x, width: right, height: top });
            } else {
                parts.push({ ...pill, id: `${pill.id}-tr`, x: splitPoint.x + 25, y: pill.y - 25, width: minSize, height: minSize });
            }

            if (left >= minSize && bottom >= minSize) {
                parts.push({ ...pill, id: `${pill.id}-bl`, y: splitPoint.y, width: left, height: bottom });
            } else {
                parts.push({ ...pill, id: `${pill.id}-bl`, x: pill.x - 25, y: splitPoint.y + 25, width: minSize, height: minSize });
            }

            if (right >= minSize && bottom >= minSize) {
                parts.push({ ...pill, id: `${pill.id}-br`, x: splitPoint.x, y: splitPoint.y, width: right, height: bottom });
            } else {
                parts.push({ ...pill, id: `${pill.id}-br`, x: splitPoint.x + 25, y: splitPoint.y + 25, width: minSize, height: minSize });
            }
        } else if (intersection.vertical) {
            const left = splitPoint.x - pill.x;
            const right = pill.width - left;

            if (left >= minSize) {
                parts.push({ ...pill, id: `${pill.id}-l`, width: left });
            } else {
                parts.push({ ...pill, id: `${pill.id}-l`, x: pill.x - 25, width: minSize });
            }

            if (right >= minSize) {
                parts.push({ ...pill, id: `${pill.id}-r`, x: splitPoint.x, width: right });
            } else {
                parts.push({ ...pill, id: `${pill.id}-r`, x: splitPoint.x + 25, width: minSize });
            }
        } else if (intersection.horizontal) {
            const top = splitPoint.y - pill.y;
            const bottom = pill.height - top;

            if (top >= minSize) {
                parts.push({ ...pill, id: `${pill.id}-t`, height: top });
            } else {
                parts.push({ ...pill, id: `${pill.id}-t`, y: pill.y - 25, height: minSize });
            }

            if (bottom >= minSize) {
                parts.push({ ...pill, id: `${pill.id}-b`, y: splitPoint.y, height: bottom });
            } else {
                parts.push({ ...pill, id: `${pill.id}-b`, y: splitPoint.y + 25, height: minSize });
            }
        }

        return parts;
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const pos = {
            x: e.clientX - (containerRef.current?.getBoundingClientRect().left || 0),
            y: e.clientY - (containerRef.current?.getBoundingClientRect().top || 0)
        };

        const clickedPill = pills.find(p => isPointInPill(pos, p));
        if (clickedPill) {
            setDragState({
                isDragging: true,
                draggedPill: clickedPill.id,
                offset: { x: pos.x - clickedPill.x, y: pos.y - clickedPill.y }
            });
        } else {
            const newPill: PillType = {
                id: `pill-${Date.now()}`,
                x: pos.x,
                y: pos.y,
                width: 40,
                height: 40,
                color: generateRandomColor()
            };

            setDrawingState({
                isDrawing: true,
                startPoint: pos,
                currentPill: newPill
            });
        }
    }, [pills]);

    const handleMouseUp = useCallback(() => {
        if (drawingState.isDrawing && drawingState.currentPill) {
            setPills(prev => [...prev, drawingState.currentPill!]);
        }

        setDrawingState({
            isDrawing: false,
            startPoint: { x: 0, y: 0 },
            currentPill: null
        });

        setDragState({
            isDragging: false,
            draggedPill: null,
            offset: { x: 0, y: 0 }
        });
    }, [drawingState]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (drawingState.isDrawing || dragState.isDragging) return;

        const pos = {
            x: e.clientX - (containerRef.current?.getBoundingClientRect().left || 0),
            y: e.clientY - (containerRef.current?.getBoundingClientRect().top || 0)
        };

        const clickedPill = pills.find(p => isPointInPill(pos, p));
        if (clickedPill) return;

        const newPills: PillType[] = [];
        const remove: string[] = [];

        pills.forEach(pill => {
            const intersect = doesLineIntersectPill(pos, pill);
            if (intersect.horizontal || intersect.vertical) {
                newPills.push(...splitPill(pill, pos));
                remove.push(pill.id);
            }
        });

        if (newPills.length) {
            setPills(prev => [...prev.filter(p => !remove.includes(p.id)), ...newPills]);
        }
    }, [pills, drawingState.isDrawing, dragState.isDragging, splitPill]);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            const pos = {
                x: e.clientX - (containerRef.current?.getBoundingClientRect().left || 0),
                y: e.clientY - (containerRef.current?.getBoundingClientRect().top || 0)
            };

            if (drawingState.isDrawing && drawingState.currentPill) {
                const width = Math.max(40, pos.x - drawingState.startPoint.x);
                const height = Math.max(40, pos.y - drawingState.startPoint.y);

                setDrawingState(prev => ({
                    ...prev,
                    currentPill: prev.currentPill ? {
                        ...prev.currentPill,
                        width,
                        height
                    } : null
                }));
            }

            if (dragState.isDragging && dragState.draggedPill) {
                setPills(prev => prev.map(p => p.id === dragState.draggedPill ? {
                    ...p,
                    x: pos.x - dragState.offset.x,
                    y: pos.y - dragState.offset.y
                } : p));
            }
        };

        const handleUp = () => handleMouseUp();

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };
    }, [drawingState, dragState, handleMouseUp]);

    return (
        <div className="w-full h-screen bg-gray-100 relative overflow-hidden select-none">
            <div
                ref={containerRef}
                className="w-full h-full relative cursor-crosshair"
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                {/* Cursor-guiding split lines */}
                <div
                    className="absolute w-full h-0.5 bg-red-500 opacity-50 pointer-events-none z-10"
                    style={{ top: mousePosition.y }}
                />
                <div
                    className="absolute h-full w-0.5 bg-red-500 opacity-50 pointer-events-none z-10"
                    style={{ left: mousePosition.x }}
                />

                {/* Render pills */}
                {pills.map(pill => <Pill key={pill.id} pill={pill} />)}

                {/* Drawing pill */}
                {drawingState.currentPill && (
                    <div
                        className={`absolute border-2 border-gray-600 ${drawingState.currentPill.color} opacity-70`}
                        style={{
                            left: drawingState.currentPill.x,
                            top: drawingState.currentPill.y,
                            width: drawingState.currentPill.width,
                            height: drawingState.currentPill.height,
                            borderRadius: '20px'
                        }}
                    />
                )}
            </div>

            <Instructions />
        </div>
    );
};

export default App;
