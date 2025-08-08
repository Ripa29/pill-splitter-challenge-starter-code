import { useEffect, useState } from 'react';
import type {Point} from '../types';

const useMousePosition = (containerRef: React.RefObject<HTMLElement>): Point => {
    const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [containerRef]);

    return mousePosition;
};

export default useMousePosition;
