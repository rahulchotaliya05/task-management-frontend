import { Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import Layout from "../components/layout/Layout";
import BoardListPage from "../features/boards/BoardListPage";
import BoardDetailPage from "../features/boards/BoardDetailPage";
import AdminBoardsPage from "../features/admin/AdminBoardsPage";
import AdminBoardDetail from "../features/admin/AdminBoardDetail";

export const routes = [
  {
    path: "/login",
    element: <LoginPage />,
    requiresAuth: false,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    requiresAuth: false,
  },
  {
    path: "/",
    element: <Layout />,
    requiresAuth: true,
    children: [
      {
        index: true,
        element: <Navigate to="/boards" replace />,
      },
      {
        path: "boards",
        element: <BoardListPage />,
      },
      {
        path: "boards/:id",
        element: <BoardDetailPage />,
      },
      {
        path: "admin/boards",
        element: <AdminBoardsPage />,
        requiredRole: "admin",
      },
      {
        path: "admin/boards/:id",
        element: <AdminBoardDetail />,
        requiredRole: "admin",
      },
    ],
  },
];
