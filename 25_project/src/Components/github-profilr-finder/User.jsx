import React from "react";

function User({ user }) {
  const {
    avatar_url,
    followers,
    following,
    public_repos,
    url,
    login,
    name,
    created_at,
  } = user;
  const createDate = new Date(created_at);
  return (
    <div className="user">
      <div>
        <img src={avatar_url} alt="User" className="avatar" />
      </div>
      <div className="name-container">
        <a href={`https://github.com/${login}`}>{name || login}</a>
        <p>
          User Join on{" "}
          {`${createDate.getDate()}  ${createDate.toLocaleDateString("en-us", {
            month: "short",
          })} ${createDate.getFullYear()}`}
        </p>
      </div>
      <div className="profile-info">
        <div>
          <p>Public Repos</p>
          <p>{public_repos}</p>
        </div>
        <div>
          <p>Fllowers</p>
          <p>{followers}</p>
        </div>
        <div>
          <p>Following </p>
          <p>{following}</p>
        </div>
      </div>
    </div>
  );
}

export default User;
