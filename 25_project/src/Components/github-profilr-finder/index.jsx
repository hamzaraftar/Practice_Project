import React, { useEffect, useState } from "react";
import User from "./User";
import "./style.css";

function GithubProfileFinder() {
  const [username, setUserName] = useState("hamzaraftar");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  function handleSubmit() {
    fetchGithubUserData();
  }

  async function fetchGithubUserData() {
    setLoading(true);
    const res = await fetch(`https://api.github.com/users/${username}`);
    const data = await res.json();

    if (data) {
      setUserData(data);
      setLoading(false);
      setUserName("");
    }
  }

  useEffect(() => {
    fetchGithubUserData();
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Loading ...</h1>
      </div>
    );
  }

  return (
    <div className="github-profile-container">
      <div className="input-wrapper">
        <input
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          type="text"
          name="search-by-username"
          placeholder="Search Username ..."
        />
        <button onClick={handleSubmit}>Search</button>
      </div>
      {userData !== null ? <User user={userData} /> : null}
    </div>
  );
}

export default GithubProfileFinder;
