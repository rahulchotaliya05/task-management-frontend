import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes";
import ProtectedRoute from "./ProtectedRoute";

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
          {route.children.map((child) => (
            <Route
              key={child.path || "index"}
              index={child.index}
              path={child.path}
              element={child.element}
            />
          ))}
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
