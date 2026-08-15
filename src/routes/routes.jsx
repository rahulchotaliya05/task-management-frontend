import { Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import Layout from "../components/layout/Layout";

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
        element: <div className="text-gray-700">Boards page coming soon</div>,
      },
    ],
  },
];
