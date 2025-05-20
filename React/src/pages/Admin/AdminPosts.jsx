import "./admin.scss";
import Posts from "../../components/posts/Posts";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { useState } from "react";
// import { makeRequest } from "../../axios";

const AdminPosts = () => {
//   const { data: users, refetch: refetchUsers } = useQuery({
//     queryKey: ["users"],
//     queryFn: () =>
//       axios.get("http://localhost:8800/api/users").then((res) => res.data),
//   });

//   const handleDeleteUser = async (id) => {
//     const confirmDelete = window.confirm(
//       "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
//     );
//     if (!confirmDelete) return;

//     try {
//       await axios.delete(`http://localhost:8800/api/users/${id}`);
//       refetchUsers();
//     } catch (err) {
//       console.error("Erreur lors de la suppression :", err);
//     }
//   };

//   const [profile, setProfile] = useState(null);
//   const [editingUser, setEditingUser] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     profilePic: "",
//     password: "",
//     role: "",
//   });

//   const upload = async (file) => {
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       const res = await makeRequest.post("/upload", formData);
//       return res.data;
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const startEditUser = (user) => {
//     setEditingUser(user.id);
//     setFormData({
//       name: user.name || "",
//       email: user.email || "",
//       profilePic: user.profilePic || "",
//       password: "", // vide pour sécurité
//       role: user.role || "",
//     });
//   };

//   const handleUpdateUser = async (e) => {
//     e.preventDefault();
//     try {
//       let profilePicUrl = formData.profilePic;
//       if (profile) {
//         const uploaded = await upload(profile);
//         profilePicUrl = uploaded; // Nouveau nom du fichier renvoyé par le backend
//       }

//       await axios.put(`http://localhost:8800/api/users/${editingUser}`, {
//         ...formData,
//         profilePic: profilePicUrl,
//       });

//       setEditingUser(null);
//       setProfile(null);
//       refetchUsers();
//     } catch (err) {
//       console.error("Erreur de mise à jour :", err);
//     }
//   };

  return (
    <div className="admin-page">
      <h2>Gestion des Posts</h2>
      <Posts />
    </div>
  );
};

export default AdminPosts;
