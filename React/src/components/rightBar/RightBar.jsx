import "./rightBar.scss";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const RightBar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { isLoading, error, data } = useQuery({
    queryKey: ["notifications", currentUser.id],
    queryFn: () =>
      makeRequest.get(`/comments/notifications`).then((res) => res.data),
  });

  const handleClick = (postId) => {
    navigate(`/post/${postId}`);
  } 

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <h3>Dernières notifications</h3>

          {isLoading ? (
            <p>Chargement...</p>
          ) : error ? (
            <p>Erreur lors du chargement</p>
          ) : data.length === 0 ? (
            <p>Aucune notification pour le moment.</p>
          ) : (
            data.map((notif) => (
              <div
                className="notif"
                key={notif.id}
                onClick={() => handleClick(notif.postId)} // ← ici
                style={{ cursor: "pointer" }}
              >
                <div className="info">
                  <img src={"/upload/" + notif.profilePic} alt="notif user" />
                  <div className="details">
                    <p>
                      <span className="name">{notif.senderName}</span>
                      <span> a commenté votre publication.</span>
                    </p>
                  </div>
                </div>
                <span className="date">
                  {moment(notif.createdAt).fromNow()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
