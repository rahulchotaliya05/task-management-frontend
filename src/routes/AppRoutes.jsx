import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { routes } from "./routes";
import ProtectedRoute from "./ProtectedRoute";
import { Loader } from "../components/common";

const RoleGuard = ({ role, children }) => {
  const { user } = useSelector((state) => state.auth);

  if (role && user?.role !== role) {
    return <Navigate to="/boards" replace />;
  }

  return children;
};

const renderRoute = (route) => {
  let element = route.element;

  if (route.requiresAuth) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  if (route.children) {
    return (
      <Route key={route.path} path={route.path} element={element}>
        {route.children.map((child) => {
          const childElement = child.requiredRole ? (
            <RoleGuard role={child.requiredRole}>{child.element}</RoleGuard>
          ) : (
            child.element
          );

          return (
            <Route
              key={child.path || "index"}
              index={child.index}
              path={child.path}
              element={childElement}
            />
          );
        })}
      </Route>
    );
  }

  return <Route key={route.path} path={route.path} element={element} />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader className="min-h-screen" />}>
      <Routes>
        {routes.map(renderRoute)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
