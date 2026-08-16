import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  fetchBoardById,
  clearCurrentBoard,
  optimisticMoveCard,
  addCard,
  updateCardInState,
  removeCard,
  setCards,
} from "./boardSlice";
import { cardAPI } from "../../api/card.api";
import { Loader, Button } from "../../components/common";
import TaskCard from "../../components/board/TaskCard";
import CardModal from "../../components/board/CardModal";
import SortableCard from "../../components/board/SortableCard";
import DroppableColumn from "../../components/board/DroppableColumn";
import useSocket from "../../hooks/useSocket";
import toast from "react-hot-toast";

const BoardDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBoard, columns, cards, loading, error } = useSelector((state) => state.boards);
  const { user } = useSelector((state) => state.auth);

  const [activeCard, setActiveCard] = useState(null);
  const [cardModal, setCardModal] = useState({ open: false, card: null, columnId: null });
  const [saving, setSaving] = useState(false);
  const [previousCards, setPreviousCards] = useState(null);

  useSocket(id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    dispatch(fetchBoardById(id));

    return () => {
      dispatch(clearCurrentBoard());
    };
  }, [dispatch, id]);

  // Memoized: cards grouped by column, sorted by position
  const cardsByColumn = useMemo(() => {
    const grouped = {};
    columns.forEach((col) => {
      grouped[col._id] = cards
        .filter((card) => card.column === col._id)
        .sort((a, b) => a.position - b.position);
    });
    return grouped;
  }, [cards, columns]);

  const getMembers = () => {
    return currentBoard?.members || [];
  };

  const handleDragStart = (event) => {
    const card = cards.find((c) => c._id === event.active.id);
    setActiveCard(card);
    setPreviousCards([...cards]);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeCard = cards.find((c) => c._id === activeId);
    if (!activeCard) return;

    const overCard = cards.find((c) => c._id === overId);
    const overColumn = columns.find((c) => c._id === overId);

    let targetColumnId;
    let targetPosition;

    if (overCard) {
      targetColumnId = overCard.column;
      targetPosition = overCard.position;
    } else if (overColumn) {
      targetColumnId = overColumn._id;
      const colCards = cards.filter((c) => c.column === targetColumnId);
      targetPosition = colCards.length;
    } else {
      return;
    }

    if (activeCard.column === targetColumnId && activeCard.position === targetPosition) return;

    dispatch(optimisticMoveCard({ cardId: activeId, targetColumnId, position: targetPosition }));
  };

  const handleDragEnd = useCallback(async (event) => {
    const { active } = event;
    setActiveCard(null);

    const movedCard = cards.find((c) => c._id === active.id);
    if (!movedCard) {
      setPreviousCards(null);
      return;
    }

    try {
      await cardAPI.move(active.id, {
        targetColumnId: movedCard.column,
        position: movedCard.position,
      });
    } catch (error) {
      toast.error("Failed to move card, reverting");
      if (previousCards) {
        dispatch(setCards(previousCards));
      }
    }

    setPreviousCards(null);
  }, [cards, dispatch, previousCards]);

  const handleCreateCard = async (data) => {
    setSaving(true);
    try {
      const response = await cardAPI.create(cardModal.columnId, data);
      dispatch(addCard(response.data.data.card));
      setCardModal({ open: false, card: null, columnId: null });
      toast.success("Card created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create card");
    }
    setSaving(false);
  };

  const handleUpdateCard = async (data) => {
    setSaving(true);
    try {
      const response = await cardAPI.update(cardModal.card._id, data);
      dispatch(updateCardInState(response.data.data.card));
      setCardModal({ open: false, card: null, columnId: null });
      toast.success("Card updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update card");
    }
    setSaving(false);
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Delete this card?")) return;

    try {
      await cardAPI.delete(cardId);
      dispatch(removeCard(cardId));
      toast.success("Card deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete card");
    }
  };

  if (loading) {
    return <Loader className="mt-20" />;
  }

  if (error || !currentBoard) {
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <p className="text-gray-600 font-medium mb-2">
          {error || "You don't have access to this board"}
        </p>
        <p className="text-sm text-gray-400 mb-4">You may have been removed or the board doesn't exist.</p>
        <Button onClick={() => navigate("/boards")}>Go to Boards</Button>
      </div>
    );
  }

  const isOwner = currentBoard.owner?._id === user?._id;

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col -m-6">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/boards")}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{currentBoard.title}</h1>
            <div className="flex -space-x-2 ml-2">
              {currentBoard.members?.slice(0, 4).map((member) => (
                <div
                  key={member._id}
                  className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {currentBoard.members?.length > 4 && (
                <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                  +{currentBoard.members.length - 4}
                </div>
              )}
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => navigate(`/admin/boards/${id}`)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          )}
        </div>
      </div>

      {columns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 font-medium mb-1">No columns on this board</p>
            <p className="text-sm text-gray-400">
              {isOwner ? "Go to Settings to add columns." : "Ask the board admin to set up columns."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide bg-gray-50 p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-5 h-full">
              {columns.map((column) => {
                const columnCards = cardsByColumn[column._id] || [];

                return (
                  <DroppableColumn key={column._id} id={column._id}>
                    <div className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col max-h-full">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            {column.title}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                            {columnCards.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto scrollbar-hide min-h-[200px]">
                        <SortableContext
                          items={columnCards.map((c) => c._id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {columnCards.map((card) => (
                              <SortableCard key={card._id} id={card._id}>
                                <TaskCard
                                  card={card}
                                  onClick={() => setCardModal({ open: true, card, columnId: column._id })}
                                />
                              </SortableCard>
                            ))}
                          </div>
                        </SortableContext>

                        {columnCards.length === 0 && (
                          <div className="flex items-center justify-center h-full min-h-[100px]">
                            <p className="text-sm text-gray-300">Drop cards here</p>
                          </div>
                        )}
                      </div>

                      <div className="px-3 pb-3">
                        <button
                          onClick={() => setCardModal({ open: true, card: null, columnId: column._id })}
                          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md hover:text-gray-700 transition-colors"
                        >
                          + Add card
                        </button>
                      </div>
                    </div>
                  </DroppableColumn>
                );
              })}

              {isOwner && (
                <div
                  onClick={() => navigate(`/admin/boards/${id}`)}
                  className="flex-shrink-0 w-80 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors min-h-[300px]"
                >
                  <div className="text-center">
                    <span className="text-2xl text-gray-300">+</span>
                    <p className="text-sm text-gray-400 mt-1">Add Column</p>
                  </div>
                </div>
              )}
            </div>

            <DragOverlay>
              {activeCard && <TaskCard card={activeCard} />}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      <CardModal
        isOpen={cardModal.open}
        onClose={() => setCardModal({ open: false, card: null, columnId: null })}
        onSubmit={cardModal.card ? handleUpdateCard : handleCreateCard}
        initialValues={cardModal.card}
        members={getMembers()}
        loading={saving}
      />

      {cardModal.open && cardModal.card && (
        <div className="fixed bottom-6 right-6">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              handleDeleteCard(cardModal.card._id);
              setCardModal({ open: false, card: null, columnId: null });
            }}
          >
            Delete Card
          </Button>
        </div>
      )}
    </div>
  );
};

export default BoardDetailPage;
