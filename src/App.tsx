import { useState, useRef } from "react";

type Pill = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderRadius: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
};

function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>( null );
  const [drawingRect, setDrawingRect] = useState<Pill | null>(null);
  const [pills, setPills] = useState<Pill[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const getRandomColor = () => {
    const colors = [
      "#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#B980F0", "#00C49A", "#F67280", "#C06C84", "#355C7D", "#6C5B7B", "#F8B195", "#E07A5F", "#81B29A", "#F2CC8F", "#3D405B", "#118AB2", "#073B4C", "#EF476F", "#06D6A0", "#FFE66D", "#F4A261", "#2A9D8F", "#E76F51", "#B5EAEA", "#FFBCBC", "#A0E7E5", "#B4F8C8", "#FFAEBC", "#A9DEF9", "#D291BC", "#FF9770", "#70D6FF", "#B388EB", "#FDFFB6", "#CAFFBF", "#9BF6FF",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const splitPills = (clickX: number, clickY: number) => {
    setPills((prevPills) => {
      const newPills: Pill[] = [];

      prevPills.forEach((pill) => {
        const intersectsVertical = clickX > pill.x && clickX < pill.x + pill.width;
        const intersectsHorizontal = clickY > pill.y && clickY < pill.y + pill.height;

        if (!intersectsVertical && !intersectsHorizontal) {
          newPills.push(pill);
          return;
        }

        let pillsToProcess = [pill];

        if (intersectsVertical) {
          const tempPills: Pill[] = [];
          pillsToProcess.forEach((p) => {
            const leftWidth = clickX - p.x;
            const rightWidth = p.width - leftWidth;

            {/* Enough Large And Pills Split */}
            if (leftWidth >= 20 && rightWidth >= 20 && p.height >= 20) {
              tempPills.push({
                ...p,
                width: leftWidth,
                id: crypto.randomUUID(),
                borderRadius: {
                  topLeft: p.borderRadius.topLeft,
                  topRight: 0,
                  bottomLeft: p.borderRadius.bottomLeft,
                  bottomRight: 0,
                },
              });
              tempPills.push({
                ...p,
                x: clickX,
                width: rightWidth,
                id: crypto.randomUUID(),
                borderRadius: {
                  topLeft: 0,
                  topRight: p.borderRadius.topRight,
                  bottomLeft: 0,
                  bottomRight: p.borderRadius.bottomRight,
                },
              });
            } else {
              {/*Small Pills Move*/}
              if (leftWidth < rightWidth) {
                tempPills.push({
                  ...p,
                  x: clickX + 5,
                  id: crypto.randomUUID(),
                });
              } else {
                tempPills.push({
                  ...p,
                  x: clickX - p.width - 5,
                  id: crypto.randomUUID(),
                });
              }
            }
          });
          pillsToProcess = tempPills;
        }

        if (intersectsHorizontal) {
          const tempPills: Pill[] = [];
          pillsToProcess.forEach((p) => {
            const topHeight = clickY - p.y;
            const bottomHeight = p.height - topHeight;

            {/* Enough Large And Pills Split */}
            if (topHeight >= 20 && bottomHeight >= 20 && p.width >= 20) {
              tempPills.push({
                ...p,
                height: topHeight,
                id: crypto.randomUUID(),
                borderRadius: {
                  topLeft: p.borderRadius.topLeft,
                  topRight: p.borderRadius.topRight,
                  bottomLeft: 0,
                  bottomRight: 0,
                },
              });
              tempPills.push({
                ...p,
                y: clickY,
                height: bottomHeight,
                id: crypto.randomUUID(),
                borderRadius: {
                  topLeft: 0,
                  topRight: 0,
                  bottomLeft: p.borderRadius.bottomLeft,
                  bottomRight: p.borderRadius.bottomRight,
                },
              });
            } else {
              {/*Small Pills Move*/}
              if (topHeight < bottomHeight) {
                tempPills.push({
                  ...p,
                  y: clickY + 5,
                  id: crypto.randomUUID(),
                });
              } else {
                tempPills.push({
                  ...p,
                  y: clickY - p.height - 5,
                  id: crypto.randomUUID(),
                });
              }
            }
          });

          pillsToProcess = tempPills;
        }

        newPills.push(...pillsToProcess);
      });

      return newPills;
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = Math.round(e.clientX);
    const y = Math.round(e.clientY);
    setMousePos({ x, y });

    if (draggingId) {
      setPills((prev) =>
        prev.map((pill) =>
          pill.id === draggingId
            ? {
                ...pill,
                x: x - dragOffset.current.x,
                y: y - dragOffset.current.y,
              }
            : pill
        )
      );
    } else if (startPos) {
      const x1 = Math.min(startPos.x, x);
      const y1 = Math.min(startPos.y, y);
      const width = Math.abs(startPos.x - x);
      const height = Math.abs(startPos.y - y);

      setDrawingRect({
        id: "preview",
        x: x1,
        y: y1,
        width,
        height,
        color: "rgba(0,0,0,0.1)",
        borderRadius: {
          topLeft: 0,
          topRight: 0,
          bottomLeft: 0,
          bottomRight: 0,
        },
      });
    }

    {/* Last Pill On Top */}
    const hovered = pills
      .slice()
      .reverse()
      .find(
        (pill) =>
          x >= pill.x &&
          x <= pill.x + pill.width &&
          y >= pill.y &&
          y <= pill.y + pill.height
      );
    setHoveredId(hovered?.id ?? null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const x = Math.round(e.clientX);
    const y = Math.round(e.clientY);
    mouseDownPos.current = { x, y };

    const targetPill = pills
      .slice()
      .reverse()
      .find(
        (pill) =>
          x >= pill.x &&
          x <= pill.x + pill.width &&
          y >= pill.y &&
          y <= pill.y + pill.height
      );

    if (targetPill) {
      dragOffset.current = {
        x: x - targetPill.x,
        y: y - targetPill.y,
      };
      setDraggingId(targetPill.id);
    } else {
      setStartPos({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const x = Math.round(e.clientX);
    const y = Math.round(e.clientY);

    const isClick =
      mouseDownPos.current &&
      Math.abs(x - mouseDownPos.current.x) < 5 &&
      Math.abs(y - mouseDownPos.current.y) < 5;

    if (draggingId) {
      if (isClick) {
        splitPills(x, y);
      }
      setDraggingId(null);
      mouseDownPos.current = null;
      return;
    }

    if (drawingRect) {
      if (!isClick) {
        const width = Math.max(40, drawingRect.width);
        const height = Math.max(40, drawingRect.height);

        setPills((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            x: drawingRect.x,
            y: drawingRect.y,
            width,
            height,
            color: getRandomColor(),
            borderRadius: {
              topLeft: 20,
              topRight: 20,
              bottomLeft: 20,
              bottomRight: 20,
            },
          },
        ]);
      }
    } else if (isClick) {
      splitPills(x, y);
    }

    setStartPos(null);
    setDrawingRect(null);
    mouseDownPos.current = null;
  };

  const getCursor = () => {
    if (draggingId) return "grabbing";
    if (hoveredId) return "pointer";
    return "crosshair";
  };

  return (
    <div className="w-full h-screen relative">
      {/* Interaction Area */}
      <div
        className="fixed inset-0 z-10"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ cursor: getCursor() }}
      >
        {/* Pills */}
        {pills.map((pill) => (
          <div
            key={pill.id}
            className="absolute border border-gray-800"
            style={{
              left: pill.x,
              top: pill.y,
              width: pill.width,
              height: pill.height,
              backgroundColor: pill.color,
              opacity: 0.8,
              borderTopLeftRadius: pill.borderRadius.topLeft,
              borderTopRightRadius: pill.borderRadius.topRight,
              borderBottomLeftRadius: pill.borderRadius.bottomLeft,
              borderBottomRightRadius: pill.borderRadius.bottomRight,
              pointerEvents: "none",
            }}
          />
        ))}

        {/*Preview Pill(Drawing)*/}
        {drawingRect && (
          <div
            className="absolute border border-dashed border-gray-500 pointer-events-none"
            style={{
              left: drawingRect.x,
              top: drawingRect.y,
              width: drawingRect.width,
              height: drawingRect.height,
              backgroundColor: drawingRect.color,
              borderRadius: 20,
              opacity: 0.5,
            }}
          />
        )}
      </div>

      {/* axis lines */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div
          className="absolute w-px bg-black [transform:translateZ(0)]"
          style={{ left: `${mousePos.x}px`, top: 0, bottom: 0 }}
        />
        <div
          className="absolute h-px bg-black [transform:translateZ(0)]"
          style={{ top: `${mousePos.y}px`, left: 0, right: 0 }}
        />
      </div>
    </div>
  );
}

export default App;
