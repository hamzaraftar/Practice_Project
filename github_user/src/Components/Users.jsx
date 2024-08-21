import { useEffect, useState } from "react";
const Users = () => {
  const [users, setUsers] = useState([]);

  const URL = "https://api.github.com/users";
  useEffect(() => {
    async function getUsers() {
      const res = await fetch(URL);
      const data = await res.json();
      setUsers(data);
      console.log(data);
    }
    getUsers();
  }, []);
  return (
    <div>
      <div className="flex flex-wrap">
        {users.map((items) => (
          <div key={items.id}>
            <img
              src={items.avatar_url}
              alt="img"
              width={"300px"}
              height={"300px"}
            />
            <h2>{items.login}</h2>
            <span>{items.url}</span>
            <div>
              <p>Following</p>
              <p>Followers</p>
              <p>Aritcls</p>
            </div>
            <div>
              {/* <img src={items.followers_url} alt="g" />
              <img src={items.following_url} alt="g" />
              <img src={items.gists_url} alt="g" /> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
