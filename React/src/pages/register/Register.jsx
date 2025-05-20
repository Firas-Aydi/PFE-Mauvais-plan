import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./register.scss";
import axios from "axios";

const Register = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "utilisateur",
    entreprise: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // reset error
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Le nom est requis.";
        if (value.trim().length < 3) return "Le nom doit contenir au moins 3 caractères.";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return "L'adresse e-mail est requise.";
        if (!emailRegex.test(value)) return "Format d'e-mail invalide. exemple@domaine.com";
        break;
      case "password":
        if (!value) return "Le mot de passe est requis.";
        if (value.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
        if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
          return "Le mot de passe doit contenir lettres et chiffres.";
        }
        break;
      case "confirmPassword":
        if (value !== inputs.password) return "Les mots de passe ne correspondent pas.";
        break;
      case "entreprise":
        if (inputs.role === "responsable" && value.trim().length < 2) {
          return "Le nom de l'entreprise est requis. Min. 3 caractères.";
        }
        break;
      default:
        return "";
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(inputs).forEach((key) => {
      const error = validateField(key, inputs[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { confirmPassword, ...dataToSend } = inputs;
      await axios.post("http://localhost:8800/api/auth/register", dataToSend);
      alert("Utilisateur créé avec succès !");
      window.location.replace("/login");
    } catch (err) {
      alert(err.response?.data || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Mauvais Plan.</h1>
          <p>
            Rejoignez notre communauté et commencez à partager vos avis, images,
            et bien plus encore.
          </p>
          <span>Vous avez déjà un compte ?</span>
          <Link to="/login">
            <button>Connexion</button>
          </Link>
        </div>
        <div className="right">
          <h1>Inscription</h1>
          <form>
            {/* <small>Nom min. 3 caractères</small> */}
            <input
              type="text"
              placeholder="Nom complet"
              name="name"
              value={inputs.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <input
              type="email"
              placeholder="Adresse e-mail"
              name="email"
              value={inputs.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {/* <small>Format attendu : exemple@domaine.com</small> */}
            {errors.email && <p className="error">{errors.email}</p>}

            <small>Minimum 6 caractères avec lettres et chiffres</small>
            <input
              type="password"
              placeholder="Mot de passe"
              name="password"
              value={inputs.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && <p className="error">{errors.password}</p>}

            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              name="confirmPassword"
              value={inputs.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {/* <small>Répétez le mot de passe pour confirmation</small> */}
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

            <select name="role" value={inputs.role} onChange={handleChange}>
              <option value="utilisateur">Client</option>
              <option value="responsable">Entreprise</option>
            </select>

            {inputs.role === "responsable" && (
              <>
                <input
                  type="text"
                  placeholder="Nom de l'entreprise"
                  name="entreprise"
                  value={inputs.entreprise}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {/* <small>Obligatoire pour les responsables d'entreprise</small> */}
                {errors.entreprise && <p className="error">{errors.entreprise}</p>}
              </>
            )}

            <button onClick={handleClick}>S'inscrire</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
