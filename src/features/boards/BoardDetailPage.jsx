import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoardById, clearCurrentBoard } from "./boardSlice";
import { Loader } from "../../components/common";

const BoardDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBoard, loading } = useSelector((state) => state.boards);

  useEffect(() => {
    dispatch(fetchBoardById(id));

    return () => {
      dispatch(clearCurrentBoard());
    };
  }, [dispatch, id]);

  if (loading || !currentBoard) {
    return <Loader className="mt-20" />;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/boards")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Boards
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{currentBoard.title}</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">Kanban board view will be implemented.</p>
      </div>
    </div>
  );
};

export default BoardDetailPage;
