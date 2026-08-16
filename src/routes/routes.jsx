import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/RegisterPage"));
const BoardListPage = lazy(() => import("../features/boards/BoardListPage"));
const BoardDetailPage = lazy(() => import("../features/boards/BoardDetailPage"));
const AdminBoardsPage = lazy(() => import("../features/admin/AdminBoardsPage"));
const AdminBoardDetail = lazy(() => import("../features/admin/AdminBoardDetail"));

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
