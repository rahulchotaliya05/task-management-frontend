import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchBoards } from "./boardSlice";
import { Loader } from "../../components/common";
import useDebounce from "../../hooks/useDebounce";

const ITEMS_PER_PAGE = 9;

const BoardListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, loading } = useSelector((state) => state.boards);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    dispatch(fetchBoards(params));
    setCurrentPage(1);
  }, [debouncedSearch]);

  if (loading) {
    return <Loader className="mt-20" />;
  }

  const isAdmin = user?.role === "admin";
  const visibleBoards = isAdmin ? boards : boards.filter((b) => b.owner?._id !== user?._id);

  const totalPages = Math.ceil(visibleBoards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBoards = visibleBoards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Boards</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? "All your boards" : "Boards you are assigned to"}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search boards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {visibleBoards.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500">
            {debouncedSearch
              ? "No boards found matching your search."
              : isAdmin
                ? "No boards yet. Go to Manage Boards to create one."
                : "No boards assigned to you yet. Contact your admin."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedBoards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/boards/${board._id}`)}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <h3 className="font-medium text-gray-800 mb-2">{board.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Owner: {board.owner?.name}</span>
                  <span>{board.members?.length || 0} members</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoardListPage;
