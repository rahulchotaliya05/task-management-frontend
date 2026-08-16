import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBoardById,
  updateBoard,
  addMember,
  removeMember,
  clearCurrentBoard,
} from "../boards/boardSlice";
import { columnAPI } from "../../api/column.api";
import { userAPI } from "../../api/user.api";
import { Button, Input, Loader, Modal, ConfirmModal } from "../../components/common";
import toast from "react-hot-toast";

const AdminBoardDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBoard, columns, loading } = useSelector((state) => state.boards);

  const [title, setTitle] = useState("");
  const [updating, setUpdating] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [creatingColumn, setCreatingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");

  useEffect(() => {
    dispatch(fetchBoardById({ id }));
    loadUsers();

    return () => {
      dispatch(clearCurrentBoard());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentBoard) {
      setTitle(currentBoard.title);
    }
  }, [currentBoard]);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setAllUsers(response.data.data.users);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const handleUpdateTitle = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim() === currentBoard.title) return;

    setUpdating(true);
    const result = await dispatch(updateBoard({ id, data: { title: title.trim() } }));
    setUpdating(false);

    if (updateBoard.fulfilled.match(result)) {
      toast.success("Board title updated");
    } else {
      toast.error(result.payload);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    setAdding(true);
    const result = await dispatch(addMember({ boardId: id, userId: selectedUser }));
    setAdding(false);

    if (addMember.fulfilled.match(result)) {
      toast.success("Member added");
      setSelectedUser("");
    } else {
      toast.error(result.payload);
    }
  };

  const handleRemoveMember = async (userId) => {
    setRemoveLoading(true);
    const result = await dispatch(removeMember({ boardId: id, userId }));
    setRemoveLoading(false);

    if (removeMember.fulfilled.match(result)) {
      toast.success("Member removed");
    } else {
      toast.error(result.payload);
    }
    setRemovingMember(null);
  };

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    setCreatingColumn(true);
    try {
      await columnAPI.create(id, { title: newColumnTitle.trim() });
      toast.success("Column created");
      setNewColumnTitle("");
      dispatch(fetchBoardById({ id }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create column");
    }
    setCreatingColumn(false);
  };

  const handleEditColumn = async (columnId) => {
    if (!editColumnTitle.trim()) return;

    try {
      await columnAPI.update(columnId, { title: editColumnTitle.trim() });
      toast.success("Column updated");
      setEditingColumn(null);
      setEditColumnTitle("");
      dispatch(fetchBoardById({ id }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update column");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm("Delete this column? All cards inside will be removed.")) return;

    try {
      await columnAPI.delete(columnId);
      toast.success("Column deleted");
      dispatch(fetchBoardById({ id }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete column");
    }
  };

  if (loading || !currentBoard) {
    return <Loader className="mt-20" />;
  }

  const memberIds = currentBoard.members?.map((m) => m._id) || [];
  const availableUsers = allUsers.filter(
    (u) => !memberIds.includes(u._id) && u._id !== currentBoard.owner?._id
  );

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/admin/boards")}
        className="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Back to Manage Boards
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Board Settings</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/boards/${id}`)}
        >
          View Board
        </Button>
      </div>

      <div className="space-y-8">
        {/* General Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">General</h2>
          <form onSubmit={handleUpdateTitle} className="flex gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Board title"
            />
            <Button type="submit" loading={updating} size="sm">
              Save
            </Button>
          </form>
        </section>

        {/* Columns Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Columns <span className="text-sm font-normal text-gray-500">({columns.length})</span>
            </h2>
          </div>

          <form onSubmit={handleCreateColumn} className="flex gap-3 mb-5">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. To Do, In Progress, Done"
            />
            <Button type="submit" loading={creatingColumn} size="sm">
              Add
            </Button>
          </form>

          {columns.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">No columns yet. Add your first column above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {columns.map((col, index) => (
                <div
                  key={col._id}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-md group"
                >
                  {editingColumn === col._id ? (
                    <div className="flex items-center gap-2 flex-1 mr-3">
                      <input
                        type="text"
                        value={editColumnTitle}
                        onChange={(e) => setEditColumnTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditColumn(col._id);
                          if (e.key === "Escape") setEditingColumn(null);
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleEditColumn(col._id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingColumn(null)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5">{index + 1}.</span>
                      <span className="text-sm font-medium text-gray-700">{col.title}</span>
                    </div>
                  )}

                  {editingColumn !== col._id && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingColumn(col._id);
                          setEditColumnTitle(col.title);
                        }}
                        className="text-xs text-gray-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteColumn(col._id)}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Members Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Members <span className="text-sm font-normal text-gray-500">({currentBoard.members?.length || 0})</span>
          </h2>

          <div className="flex gap-3 mb-5">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user to add...</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <Button onClick={handleAddMember} loading={adding} size="sm">
              Add
            </Button>
          </div>

          {currentBoard.members?.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
              <p className="text-sm text-gray-500">No members assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentBoard.members?.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-md group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRemovingMember(member)}
                    className="text-xs text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={!!removingMember}
        onClose={() => setRemovingMember(null)}
        onConfirm={() => handleRemoveMember(removingMember._id)}
        title="Remove Member"
        message={`Are you sure you want to remove "${removingMember?.name}" from this board? They will lose access to all cards on this board.`}
        confirmText="Remove"
        loading={removeLoading}
      />
    </div>
  );
};

export default AdminBoardDetail;
