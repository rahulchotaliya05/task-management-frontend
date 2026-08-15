import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "./features/auth/authSlice";
import { Loader } from "./components/common";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  if (loading && localStorage.getItem("accessToken")) {
    return <Loader className="min-h-screen" />;
  }

  return <AppRoutes />;
};

export default App;
