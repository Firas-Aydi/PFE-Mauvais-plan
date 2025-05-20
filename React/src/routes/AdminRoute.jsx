// // src/routes/AdminRoute.jsx
// import { Navigate } from "react-router-dom";
// import { useContext } from "react";
// import { AuthContext } from "../context/authContext";

// const AdminRoute = ({ children }) => {
//   const { currentUser } = useContext(AuthContext);

//   if (!currentUser) return <Navigate to="/login" />;
//   if (currentUser.role !== "administrateur") return <Navigate to="/" />;

//   return children;
// };

// export default AdminRoute;
