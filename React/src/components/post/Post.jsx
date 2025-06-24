import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import moment from "moment";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Comments from "../comments/Comments";
import { AuthContext } from "../../context/authContext";
import "./post.scss";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  // console.log(currentUser.role);

  // Récupération des likes pour chaque post
  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () =>
      makeRequest.get(`/likes?postId=${post.id}`).then((res) => res.data),
  });

  const queryClient = useQueryClient();

  // Mutation pour ajouter ou supprimer un like
  const mutation = useMutation({
    mutationFn: (liked) => {
      if (liked) return makeRequest.delete(`/likes?postId=${post.id}`);
      return makeRequest.post("/likes", { postId: post.id });
    },
    onSuccess: () => queryClient.invalidateQueries(["likes"]),
  });

  const handleLike = () => mutation.mutate(data?.includes(currentUser.id));

  const [editMode, setEditMode] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState("");

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
  const handleEdit = () => {
    setEditMode(true);
    setCompanyName(post.companyName);
    setDescription(post.description);
    setImg(post.img);
  };

  const updateMutation = useMutation({
    mutationFn: ({ postId, updatedData }) =>
      makeRequest.put(`/posts/${postId}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      setEditMode(false);
    },
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    let imgUrl = post.img;

    if (img && typeof img === "object") {
      // si l'utilisateur a sélectionné un nouveau fichier
      imgUrl = await upload(img);
    }

    updateMutation.mutate({
      postId: post.id,
      updatedData: { companyName, description, img: imgUrl },
    });
  };

  // Mutation pour supprimer le post
  const deleteMutation = useMutation({
    mutationFn: (postId) => makeRequest.delete(`/posts/${postId}`),
    onSuccess: () => queryClient.invalidateQueries(["posts"]),
  });

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce post ?"
    );
    if (!confirmDelete) return;

    deleteMutation.mutate(post.id);
    setMenuOpen(false);
  };

  return (
    <div className="post">
      <div className="container">
        {/* User Info */}
        <div className="user">
          <div className="userInfo">
            <Link
              to={`/profile/${post.userId}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img src={`/upload/${post.profilePic}`} alt="" />
            </Link>
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <div className="menu">
            <MoreHorizIcon
              onClick={() => setMenuOpen(!menuOpen)}
              className="menu-icon"
            />
            {menuOpen &&
              (currentUser.id === post.userId ||
                currentUser.role === "administrateur") && (
                <div className="menu-options">
                  {currentUser.id === post.userId && (
                    <button className="menu-btn edit" onClick={handleEdit}>
                      Modifier
                    </button>
                  )}
                  <button className="menu-btn delete" onClick={handleDelete}>
                    Supprimer
                  </button>
                </div>
              )}
          </div>
        </div>
        {editMode && (
          <form className="edit-form" onSubmit={handleUpdate}>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nom de l'entreprise"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <input type="file" onChange={(e) => setImg(e.target.files[0])} />
            <button type="submit" className="submit-btn">
              Mettre à jour
            </button>
          </form>
        )}
        {/* Post Content */}
        <div className="content">
          {post.companyName && (
            <span className="company">
              <span>Entreprise concernée : </span>
              <strong>{post.companyName}</strong>
            </span>
          )}
          <br />
          {/* Affichage du type */}
          {post.type && (
            <span className="post-type">
              <span>Type : </span>
              <strong>{post.type}</strong>
            </span>
          )}

          <p>{post.description}</p>
          {/* <img src={`/upload/${post.img}`} alt="" /> */}
          {post.img && (
            <div className="image-grid">
              {post.img.split(",").map((imgName, index) => (
                <img
                  key={index}
                  src={`/upload/${imgName.trim()}`}
                  alt={`post-img-${index}`}
                  className="post-image"
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="info">
          <div className="item">
            {data?.includes(currentUser.id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {!isLoading && !error && data && <span>{data.length} Likes</span>}
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            Comments
          </div>
        </div>

        {commentOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;
