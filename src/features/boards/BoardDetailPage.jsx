import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoardById, clearCurrentBoard } from "./boardSlice";
import { Loader } from "../../components/common";

const BoardDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBoard, columns, loading } = useSelector((state) => state.boards);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBoardById(id));

    return () => {
      dispatch(clearCurrentBoard());
    };
  }, [dispatch, id]);

  if (loading || !currentBoard) {
    return <Loader className="mt-20" />;
  }

  const isOwner = currentBoard.owner?._id === user?._id;

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col -m-6">
      {/* Board Header */}
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
            <div className="flex items-center gap-2 ml-2">
              <div className="flex -space-x-2">
                {currentBoard.members?.slice(0, 3).map((member) => (
                  <div
                    key={member._id}
                    className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
                    title={member.name}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {currentBoard.members?.length > 3 && (
                  <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                    +{currentBoard.members.length - 3}
                  </div>
                )}
              </div>
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

      {/* Board Content */}
      {columns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1">No columns on this board</p>
            <p className="text-sm text-gray-400">
              {isOwner ? "Go to Settings to add columns." : "Ask the board admin to set up columns."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto bg-gray-50 p-6">
          <div className="flex gap-5 h-full">
            {columns.map((column) => (
              <div
                key={column._id}
                className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col"
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {column.title}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      0
                    </span>
                  </div>
                </div>

                {/* Column Body — cards go here */}
                <div className="flex-1 p-3 min-h-[400px] overflow-y-auto">
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-300">Drop cards here</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add column placeholder for owner */}
            {isOwner && (
              <div
                onClick={() => navigate(`/admin/boards/${id}`)}
                className="flex-shrink-0 w-80 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors min-h-[400px]"
              >
                <div className="text-center">
                  <span className="text-2xl text-gray-300">+</span>
                  <p className="text-sm text-gray-400 mt-1">Add Column</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetailPage;
