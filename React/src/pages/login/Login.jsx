import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./login.scss";

const Login = () => {
  const { currentUser } = useContext(AuthContext);

  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (currentUser) {
      navigate("/"); // Redirection si l'utilisateur est déjà connecté
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await login(inputs);
      // navigate("/");
    } catch (err) {
      setErr(err.response?.data || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h3>
            Bienvenue sur<h1>Mauvais Plan.</h1>
          </h3>
          <p>
            Connecte-toi à ta plateforme pour partager, collaborer et rester à
            jour avec ta communauté.
          </p>
          <span>Pas encore de compte ?</span>
          <Link to="/register">
            <button className="register-btn">Créer un compte</button>
          </Link>
        </div>

        <div className="right">
          <h1>Connexion</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              onChange={handleChange}
              required
            />
            {err && <div className="error">{err}</div>}
            <button type="submit" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
