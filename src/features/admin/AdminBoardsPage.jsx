import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchBoards, createBoard, deleteBoard } from "../boards/boardSlice";
import { Button, Loader, Modal, Input } from "../../components/common";
import useDebounce from "../../hooks/useDebounce";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const AdminBoardsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, loading } = useSelector((state) => state.boards);
  const { user } = useSelector((state) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
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

  const myBoards = boards.filter((b) => b.owner?._id === user?._id);

  const totalPages = Math.ceil(myBoards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBoards = myBoards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    const result = await dispatch(createBoard({ title: newTitle.trim() }));
    setCreating(false);

    if (createBoard.fulfilled.match(result)) {
      toast.success("Board created");
      setShowCreateModal(false);
      setNewTitle("");
      dispatch(fetchBoards());
    } else {
      toast.error(result.payload);
    }
  };

  const handleDelete = async (boardId) => {
    if (!window.confirm("Are you sure you want to delete this board?")) return;

    const result = await dispatch(deleteBoard(boardId));
    if (deleteBoard.fulfilled.match(result)) {
      toast.success("Board deleted");
      dispatch(fetchBoards());
    } else {
      toast.error(result.payload);
    }
  };

  if (loading) {
    return <Loader className="mt-20" />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Boards</h1>
          <p className="text-sm text-gray-500 mt-1">Create boards and manage team members</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>+ New Board</Button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search boards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
        />
      </div>

      {myBoards.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">
            {debouncedSearch
              ? "No boards found matching your search."
              : "You haven't created any boards yet."}
          </p>
          {!debouncedSearch && (
            <Button onClick={() => setShowCreateModal(true)}>Create Your First Board</Button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Board Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedBoards.map((board) => (
                  <tr key={board._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{board.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {board.members?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(board.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/admin/boards/${board._id}`)}
                        >
                          Settings
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(board._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Board"
      >
        <form onSubmit={handleCreate}>
          <Input
            label="Board Title"
            name="title"
            placeholder="e.g. Sprint Board, Project Alpha"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBoardsPage;
