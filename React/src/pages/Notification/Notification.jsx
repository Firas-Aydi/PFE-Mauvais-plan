import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import Post from "../../components/post/Post";
import { useEffect, useState } from "react";
import "./Notification.scss";

const Notification = () => {
  const [userInfo, setUserInfo] = useState(null);

  // Récupérer les informations de l'utilisateur depuis localStorage
  useEffect(() => {
    const userInfoFromLocalStorage = JSON.parse(localStorage.getItem('user'));
    setUserInfo(userInfoFromLocalStorage);
  }, []);

  const { isLoading, error, data: posts } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      makeRequest.get("/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then((res) => res.data),
  });

  if (isLoading) {
    return <div className="loading-message">Chargement des notifications...</div>;
  }

  if (error) {
    return <div className="error-message">Une erreur est survenue lors du chargement des notifications. Veuillez réessayer plus tard.</div>;
  }

  // Filtrer les posts pour n'afficher que ceux de l'entreprise
  const filteredPosts = userInfo?.entreprise === "entreprise" 
    ? posts.filter(post => post.companyEmail === userInfo.email) 
    : posts;

  return (
    <div className="notification-page">
      <h2>Notifications</h2>
      {filteredPosts.length === 0 ? (
        <p className="no-notifications">Aucune notification pour le moment.</p>
      ) : (
        <div className="posts">
          {filteredPosts.map((post) => <Post post={post} key={post.id} />)}
        </div>
      )}
    </div>
  );
};

export default Notification;
