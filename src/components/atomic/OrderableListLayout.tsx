import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DroppableProps, OnDragEndResponder } from "react-beautiful-dnd";

interface Props {
  onDragEnd: OnDragEndResponder;
  children: KeyedReactElement[] | null;
  className?: string;
  isDragDisabled?: boolean;
}

export type KeyedReactElement = React.ReactElement<{ id: string; className?: string }>;

const OrderableListLayout: React.FC<Props> = ({ onDragEnd, children, className, isDragDisabled = false }) => {
  if (!children) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StrictModeDroppable droppableId="reorder-layout">
        {(provided: any) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className={className}>
            {children!.map((item, index) => (
              <Draggable key={item.props.id} draggableId={item.props.id} index={index} isDragDisabled={isDragDisabled}>
                {(provided: any) => (
                  <>
                    {React.cloneElement(item, {
                      ref: provided.innerRef,
                      ...provided.draggableProps,
                      ...provided.dragHandleProps,
                      className: item.props.className,
                    })}
                  </>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
};

const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

export default OrderableListLayout;
