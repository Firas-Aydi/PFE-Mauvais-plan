import { makeRequest } from "../../axios";
import "./update.scss";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";

const Update = ({ setOpenUpdate, user }) => {
  const { updateCurrentUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [texts, setTexts] = useState({
    name: "",
    // email: "",
    // password: "",
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
  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userUpdate) => {
      return makeRequest.put(`/users/${user.id}`, userUpdate);
    },    
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    const profilePicUrl = profile ? await upload(profile) : user.profilePic;
    const updatedUser = {
      name: texts.name || user.name,
      email: user.email,
      profilePic: profilePicUrl,
      role: user.role,
    };
        mutation.mutate(updatedUser, {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);
        updateCurrentUser({ ...user, ...updatedUser }); // ✅ mise à jour du contexte
        setOpenUpdate(false);
      },
    });
  };

  return (
    <div className="update">
      <div className="container">
        <h1>Update</h1>
        <form>
          <input type="file" onChange={(e) => setProfile(e.target.files[0])} />
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
          />
          {/* <input type="text" name="email" placeholder="Email" /> */}
          {/* <input type="text" name="password" placeholder="Password" /> */}
          <button onClick={handleClick}>Update</button>
        </form>
        <button onClick={() => setOpenUpdate(false)}>X</button>
      </div>
    </div>
  );
};
export default Update;
