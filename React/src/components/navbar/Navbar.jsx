// components/navbar/Navbar.jsx

import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();

  // Charger tous les utilisateurs une fois
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8800/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs :", err);
      }
    };
    fetchUsers();
  }, []);

  // Mettre à jour les résultats filtrés
  useEffect(() => {
    const results = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Erreur logout :", err);
    }
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>Mauvais Plan</span>
        </Link>
        <Link
          to="/"
          className="admin-link"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <HomeOutlinedIcon />
        </Link>
        {/* Barre de recherche */}
        <div className="search-container">
          <SearchIcon />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <div className="search-results">
              {filteredUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="search-result"
                  onClick={() => {
                    navigate(`/profile/${user.id}`);
                    window.location.reload(); // recharge la page après redirection
                  }}
                >
                  <img src={`/upload/${user.profilePic}`} alt="" />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentUser?.role === "administrateur" && (
          <>
            <Link
              to="/admin/users"
              className="admin-link"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <PersonOutlinedIcon />
            </Link>
            <Link
              to="/admin/posts"
              className="admin-link"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <EmailOutlinedIcon />
            </Link>
          </>
        )}
      </div>

      <div className="right">
        {currentUser?.role === "responsable" && (
          <Link to="/notifications" style={{ textDecoration: "none" }}>
            <NotificationsOutlinedIcon />
          </Link>
        )}
        <div className="user">
          <Link
            to={`/profile/${currentUser.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img src={`/upload/${currentUser.profilePic}`} alt="" />
          </Link>
          <Link
            to={`/profile/${currentUser.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <span>{currentUser.name}</span>
          </Link>
          <LogoutIcon onClick={handleLogout} style={{ cursor: "pointer" }} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
