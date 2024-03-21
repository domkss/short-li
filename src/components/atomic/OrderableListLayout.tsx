import React, { useEffect, useState, ReactElement } from "react";
import { DragDropContext, Droppable, Draggable, DroppableProps } from "react-beautiful-dnd";
import { cn } from "@/lib/client/uiHelperFunctions";
interface Props {
  children: KeyedReactElement[] | null;
  className?: string;
  isDragDisabled?: boolean;
}

export type KeyedReactElement = React.ReactElement<{ id: string; className?: string }>;

const OrderableListLayout: React.FC<Props> = ({ children, className, isDragDisabled = false }) => {
  const [items, setItems] = useState<KeyedReactElement[] | null>(children);
  if (!children) return null;

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedItems = React.Children.toArray(items) as KeyedReactElement[];
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    setItems(reorderedItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StrictModeDroppable droppableId="reorder-layout">
        {(provided: any) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className={className}>
            {items!.map((item, index) => (
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
