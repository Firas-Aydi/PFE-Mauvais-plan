import { useContext, useState } from "react";
import "./comments.scss";
import Image from "../../assets/img.png";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";

const Comments = ({ postId }) => {
  const [description, setDesc] = useState("");
  const [Comfile, setFile] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      makeRequest.get("/comments?postId=" + postId).then((res) => res.data),
  });

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
    mutationFn: (newComment) => makeRequest.post("/comments", newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    let imgUrl = "";
    if (Comfile) imgUrl = await upload(Comfile);

    mutation.mutate({ img: imgUrl, description, postId });

    setDesc("");
    setFile(null);
  };

  return (
    <div className="comments">
      <div className="write">
        <div className="left">
          <img src={"/upload/" + currentUser.profilePic} alt="user" />

          <div className="inputs">
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              value={description}
              onChange={(e) => setDesc(e.target.value)}
            />

            <div className="actions">
              <input
                type="file"
                id="Comfile"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="Comfile" className="upload-item">
                <img src={Image} alt="upload" />
                <span>Ajouter une image</span>
              </label>
              <button onClick={handleClick}>Envoyer</button>
            </div>
          </div>
        </div>

        <div className="right">
          {Comfile && (
            <div className="preview">
              <img src={URL.createObjectURL(Comfile)} alt="preview" />
            </div>
          )}
        </div>
      </div>

      {error ? (
        <span>Une erreur est survenue.</span>
      ) : isLoading ? (
        <span>Chargement...</span>
      ) : data?.length > 0 ? (
        data.map((comment) => (
          <div className="comment" key={comment.id}>
            <div className="info">
              <img src={"/upload/" + comment.profilePic} alt="comment user" />
              <div className="details">
                <span className="name">{comment.name}</span>
                <p>{comment.description}</p>
                {comment.img && (
                  <img
                    src={"/upload/" + comment.img}
                    alt="comment-img"
                    className="comment-img"
                  />
                )}
              </div>
            </div>
            <span className="date">{moment(comment.createdAt).fromNow()}</span>
          </div>
        ))
      ) : (
        <p>Aucun commentaire</p>
      )}
    </div>
  );
};

export default Comments;
