import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { routes } from "./routes";
import ProtectedRoute from "./ProtectedRoute";

const RoleGuard = ({ role, children }) => {
  const { user } = useSelector((state) => state.auth);

  if (role && user?.role !== role) {
    return <Navigate to="/boards" replace />;
  }

  return children;
};

const renderRoutes = (routeList) => {
  return routeList.map((route) => {
    const element = route.requiresAuth ? (
      <ProtectedRoute>{route.element}</ProtectedRoute>
    ) : (
      route.element
    );

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
  });
};

const AppRoutes = () => {
  return (
    <Routes>
      {renderRoutes(routes)}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
