import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "../socket/socket";
import { addCard, updateCardInState, removeCard } from "../features/boards/boardSlice";
import toast from "react-hot-toast";

const useSocket = (boardId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!boardId) return;

    socket.connect();
    socket.emit("board:join", boardId);

    socket.on("card:created", (data) => {
      dispatch(addCard(data.card));
      toast.success(`New card: "${data.card.title}"`, { duration: 3000 });
    });

    socket.on("card:updated", (data) => {
      dispatch(updateCardInState(data.card));
      toast.success(`Card updated: "${data.card.title}"`, { duration: 3000 });
    });

    socket.on("card:moved", (data) => {
      dispatch(updateCardInState(data.card));
      toast.success(`Card moved: "${data.card.title}"`, { duration: 3000 });
    });

    socket.on("card:deleted", (data) => {
      dispatch(removeCard(data.cardId));
      toast("A card was deleted", { icon: "🗑️", duration: 3000 });
    });

    socket.on("user:joined", () => {
      toast("A team member joined the board", { icon: "👋", duration: 2000 });
    });

    socket.on("user:left", () => {
      toast("A team member left the board", { icon: "👋", duration: 2000 });
    });

    return () => {
      socket.emit("board:leave", boardId);
      socket.off("card:created");
      socket.off("card:updated");
      socket.off("card:moved");
      socket.off("card:deleted");
      socket.off("user:joined");
      socket.off("user:left");
      socket.disconnect();
    };
  }, [boardId, dispatch]);
};

export default useSocket;
