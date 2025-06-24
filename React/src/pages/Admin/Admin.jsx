import "./admin.scss";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
// import Posts from "../../components/posts/Posts";
import { useState } from "react";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";

const Admin = () => {
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      axios.get("http://localhost:8800/api/users").then((res) => res.data),
  });

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8800/api/users/${id}`);
      refetchUsers();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  const [profile, setProfile] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePic: "",
    password: "",
    role: "",
  });

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      profilePic: user.profilePic || "",
      password: "", // vide pour sécurité
      role: user.role || "",
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      let profilePicUrl = formData.profilePic;
      if (profile) {
        const uploaded = await upload(profile);
        profilePicUrl = uploaded; // Nouveau nom du fichier renvoyé par le backend
      }

      await axios.put(`http://localhost:8800/api/users/${editingUser}`, {
        ...formData,
        profilePic: profilePicUrl,
      });

      setEditingUser(null);
      setProfile(null);
      refetchUsers();
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
    }
  };

  return (
    <div className="admin-page">
      <h2>Gestion des Utilisateurs</h2>
      {editingUser && (
        <form onSubmit={handleUpdateUser} className="edit-form">
          <h3>Modifier l'utilisateur</h3>
          {/* <input
            type="text"
            placeholder="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input type="file" onChange={(e) => setProfile(e.target.files[0])} />
          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          /> */}
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            {/* <option value="">Sélectionner un rôle</option> */}
            <option value="administrateur">administrateur</option>
            <option value="responsable">responsable</option>
            <option value="utilisateur">utilisateur</option>
          </select>
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => setEditingUser(null)}>
            Annuler
          </button>
        </form>
      )}

      <table className="user-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Photo</th>
            <th>Rôle</th>
            <th>Date de création</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td>
                <Link
                  to={`/profile/${user.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {user.name}
                </Link>
              </td>
              <td>{user.email}</td>
              <td>
                <Link
                  to={`/profile/${user.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {user.profilePic ? (
                    <img
                      src={"/upload/" + user?.profilePic}
                      width={40}
                      height={40}
                      alt="profile"
                      className="profilePic"
                    />
                  ) : (
                    "Aucune"
                  )}
                </Link>
              </td>
              <td>{user.role}</td>
              <td>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "Non disponible"}
              </td>
              <td>
                <button onClick={() => startEditUser(user)}>Modifier</button>
                <button onClick={() => handleDeleteUser(user.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <br />
    </div>
  );
};

export default Admin;
