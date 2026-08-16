import { useDroppable } from "@dnd-kit/core";

const DroppableColumn = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${isOver ? "ring-2 ring-blue-300 rounded-lg" : ""}`}
    >
      {children}
    </div>
  );
};

export default DroppableColumn;
