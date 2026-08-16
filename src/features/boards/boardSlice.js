import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { boardAPI } from "../../api/board.api";

export const fetchBoards = createAsyncThunk(
  "boards/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await boardAPI.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch boards"
      );
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  "boards/fetchById",
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.getById(id, params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch board"
      );
    }
  }
);

export const createBoard = createAsyncThunk(
  "boards/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await boardAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create board"
      );
    }
  }
);

export const updateBoard = createAsyncThunk(
  "boards/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update board"
      );
    }
  }
);

export const deleteBoard = createAsyncThunk(
  "boards/delete",
  async (id, { rejectWithValue }) => {
    try {
      await boardAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete board"
      );
    }
  }
);

export const addMember = createAsyncThunk(
  "boards/addMember",
  async ({ boardId, userId }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.addMember(boardId, { userId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add member"
      );
    }
  }
);

export const removeMember = createAsyncThunk(
  "boards/removeMember",
  async ({ boardId, userId }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.removeMember(boardId, userId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove member"
      );
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  columns: [],
  cards: [],
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    clearBoardError: (state) => {
      state.error = null;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.columns = [];
      state.cards = [];
    },
    optimisticMoveCard: (state, action) => {
      const { cardId, targetColumnId, position } = action.payload;
      const cardIndex = state.cards.findIndex((c) => c._id === cardId);

      if (cardIndex === -1) return;

      const card = state.cards[cardIndex];
      const sourceColumnId = card.column;

      // Remove card from source position
      state.cards.forEach((c) => {
        if (c.column === sourceColumnId && c.position > card.position && c._id !== cardId) {
          c.position -= 1;
        }
      });

      // Make space in target column
      state.cards.forEach((c) => {
        if (c.column === targetColumnId && c.position >= position && c._id !== cardId) {
          c.position += 1;
        }
      });

      // Move the card
      state.cards[cardIndex].column = targetColumnId;
      state.cards[cardIndex].position = position;
    },
    setCards: (state, action) => {
      state.cards = action.payload;
    },
    addCard: (state, action) => {
      state.cards.push(action.payload);
    },
    updateCardInState: (state, action) => {
      const index = state.cards.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
    removeCard: (state, action) => {
      state.cards = state.cards.filter((c) => c._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload.boards;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchBoardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
        state.columns = action.payload.columns || [];
        state.cards = action.payload.cards || [];
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.unshift(action.payload.board);
      })

      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex(
          (b) => b._id === action.payload.board._id
        );
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
        if (state.currentBoard?._id === action.payload.board._id) {
          state.currentBoard = action.payload.board;
        }
      })

      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter((b) => b._id !== action.payload);
      })

      .addCase(addMember.fulfilled, (state, action) => {
        if (state.currentBoard?._id === action.payload.board._id) {
          state.currentBoard = action.payload.board;
        }
        const index = state.boards.findIndex(
          (b) => b._id === action.payload.board._id
        );
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
      })

      .addCase(removeMember.fulfilled, (state, action) => {
        if (state.currentBoard?._id === action.payload.board._id) {
          state.currentBoard = action.payload.board;
        }
        const index = state.boards.findIndex(
          (b) => b._id === action.payload.board._id
        );
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
      });
  },
});

export const {
  clearBoardError,
  clearCurrentBoard,
  optimisticMoveCard,
  setCards,
  addCard,
  updateCardInState,
  removeCard,
} = boardSlice.actions;

export default boardSlice.reducer;
