import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome {user?.username}</h1>
      {user?.is_admin ? (
        <p>You are logged in as an Admin</p>
      ) : (
        <p>You are a Regular User</p>
      )}
    </div>
  );
};

export default Dashboard;
