// src/pages/PostPage.jsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import Post from "../../components/post/Post";

const PostPage = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => makeRequest.get(`/posts/${id}`).then((res) => res.data),
  });
// console.log(data);
  if (isLoading) return <p>Chargement du post...</p>;
  if (error) return <p>Erreur lors du chargement du post</p>;

  return (
    <div className="postPage">
      <Post post={data} />
    </div>
  );
};

export default PostPage;
