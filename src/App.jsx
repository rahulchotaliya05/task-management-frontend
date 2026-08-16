import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./features/auth/authSlice";
import { Loader } from "./components/common";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      dispatch(fetchCurrentUser()).finally(() => {
        setInitializing(false);
      });
    } else {
      setInitializing(false);
    }
  }, [dispatch]);

  if (initializing) {
    return <Loader className="min-h-screen" />;
  }

  return <AppRoutes />;
};

export default App;
