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
import { userAPI } from "../../api/user.api";
import { Button, Input, Loader } from "../../components/common";
import toast from "react-hot-toast";

const AdminBoardDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBoard, loading } = useSelector((state) => state.boards);

  const [title, setTitle] = useState("");
  const [updating, setUpdating] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    dispatch(fetchBoardById(id));
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
    const result = await dispatch(removeMember({ boardId: id, userId }));

    if (removeMember.fulfilled.match(result)) {
      toast.success("Member removed");
    } else {
      toast.error(result.payload);
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
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/admin/boards")}
        className="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Back to Manage Boards
      </button>

      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Board Settings</h1>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase mb-4">General</h2>
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
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase mb-4">
            Members ({currentBoard.members?.length || 0})
          </h2>

          <div className="flex gap-3 mb-6">
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
              Add Member
            </Button>
          </div>

          {currentBoard.members?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No members assigned to this board yet.
            </p>
          ) : (
            <div className="border border-gray-100 rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentBoard.members?.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{member.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{member.email}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBoardDetail;
