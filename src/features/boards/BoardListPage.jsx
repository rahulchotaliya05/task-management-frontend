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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Boards</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? "All your boards" : "Boards you are assigned to"}
          </p>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
      </div>

      {visibleBoards.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">
            {debouncedSearch ? "No boards found" : "No boards available"}
          </p>
          <p className="text-sm text-gray-400">
            {debouncedSearch
              ? "Try a different search term."
              : isAdmin
                ? "Go to Manage Boards to create one."
                : "Contact your admin to get assigned to a board."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedBoards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/boards/${board._id}`)}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {board.title}
                  </h3>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {board.owner?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-500">{board.owner?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="text-xs text-gray-500">{board.members?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 text-sm rounded-lg ${currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
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
