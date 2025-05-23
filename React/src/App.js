import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
// import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import "./style.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import AdminRoute from "./routes/AdminRoute";
// import AdminLayout from "./pages/Admin/AdminLayout";
import Admin from "./pages/Admin/Admin";
import Notifications from "./pages/Notification/Notification";
import PostPage from "./pages/PostPage/PostPage";
import AdminPosts from "./pages/Admin/AdminPosts";

function App() {
  const { currentUser } = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar />
          <div style={{ display: "flex" }}>
            {/* <LeftBar /> */}
            <div style={{ flex: 6 }}>
              <Outlet />
            </div>
            <RightBar />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) return <Navigate to="/login" />;
    return children;
  };

  // const AdminRoute = ({ children }) => {
  //   if (!currentUser) return <Navigate to="/login" />;
  //   if (currentUser.role !== "administrateur") return <Navigate to="/" />;
  //   return children;
  // };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/profile/:id",
          element: <Profile />,
        },
        {
          path: "/notifications",
          element: <Notifications />,
        },
        {
          path: "/post/:id",
          element: <PostPage />,
        },
        {
          path: "/admin/users",
          element: <Admin />,
        },
        {
          path: "/admin/posts",
          element: <AdminPosts />,
        },
      ],
    },
    // {
    //   path: "/admin",
    //   element: (
    //     <AdminRoute>
    //       <AdminLayout />
    //     </AdminRoute>
    //   ),
    //   children: [
    //     {
    //       path: "/admin",
    //       element: <Admin />,
    //     },
    //   ],
    // },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>{" "}
    </div>
  );
}

export default App;
