import "./share.scss";
import Image from "../../assets/img.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Share = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [type, setType] = useState("");
  const [errors, setErrors] = useState({
    description: "",
    companyName: "",
    companyEmail: "",
    type: "",
  });

  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const mutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newErrors = {
      description: "",
      companyName: "",
      companyEmail: "",
      type: "",
    };

    if (!description.trim()) {
      newErrors.description = "La description est obligatoire.";
      hasError = true;
    }

    if (!companyName.trim()) {
      newErrors.companyName = "Le nom de la société est requis.";
      hasError = true;
    }

    if (!companyEmail.trim()) {
      newErrors.companyEmail = "L'email de la société est requis.";
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(companyEmail)) {
        newErrors.companyEmail = "L'adresse e-mail est invalide.";
        hasError = true;
      }
    }

    if (!type) {
      newErrors.type = "Le type est requis.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ description: "", companyName: "", companyEmail: "", type: "" });

    let imgUrl = "";
    if (file) imgUrl = await upload(file);

    mutation.mutate({
      description,
      img: imgUrl,
      companyName,
      companyEmail,
      type,
    });

    setDescription("");
    setCompanyName("");
    setCompanyEmail("");
    setFile(null);
    setType("");
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
            <img src={"/upload/" + currentUser.profilePic} alt="profile" />
            <input
              type="text"
              placeholder={`Décrivez votre problème, ${currentUser.name}...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="right">
            {file && (
              <div className="preview">
                <img src={URL.createObjectURL(file)} alt="preview" />
              </div>
            )}
          </div>
        </div>
        {errors.description && (
          <p className="error-message">{errors.description}</p>
        )}

        <div className="extra-fields">
          <input
            type="text"
            placeholder="Nom de la société"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          {errors.companyName && (
            <p className="error-message">{errors.companyName}</p>
          )}

          <input
            type="email"
            placeholder="Email de la société"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
          />
          {errors.companyEmail && (
            <p className="error-message">{errors.companyEmail}</p>
          )}
        </div>

        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file" className="upload-item">
              <img src={Image} alt="upload" />
              <span>Ajouter une image</span>
            </label>
          </div>

          <div className="right">
            <div className="select-wrapper">
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Sélectionner un type</option>
                <option value="vente services en ligne">
                  Vente de services en ligne
                </option>
                <option value="vente conditionnelle">
                  Vente conditionnelle
                </option>
                <option value="publicites mensongeres">
                  Publicités mensongères
                </option>
                <option value="vente ou distribution des article périmes ou mal finis de vêtements">
                  Articles périmés ou mal finis
                </option>
                <option value="produit cosmétique">Produit cosmétique</option>
                <option value="autre">Autre</option>
              </select>
              {errors.type && <p className="error-message">{errors.type}</p>}
            </div>
            {errors.type && <p className="error-message">{errors.type}</p>}
            <button onClick={handleClick}>Partager</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
