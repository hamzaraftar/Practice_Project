import { useEffect, useState } from "react";
const Users = () => {
  const [users, setUsers] = useState([]);

  const URL = "https://api.github.com/users";
  useEffect(() => {
    async function getUsers() {
      const res = await fetch(URL);
      const data = await res.json();
      setUsers(data);
    }
    getUsers();
  }, []);
  return (
    <div>
      <div className="flex flex-wrap">
        {users.map((items) => (
          <div
            key={items.id}
            className="bg-white m-5 w-auto h-auto rounded-xl  py-5 shadow-2xl "
          >
            <img
              src={items.avatar_url}
              alt="img"
              width={"100px"}
              height={"100px"}
              className="rounded-full   mx-auto"
            />
            <h2 className="text-2xl font-bold text-center uppercase">
              {items.login}
            </h2>
            <span className="my-10  overflow-hidden text-center px-5">
              {items.url}
            </span>
            <div className="rounded-full flex justify-center ">
              <p className="bg-slate-400 p-1 rounded-xl mx-2 my-5 font-medium px-2">
                Following
              </p>
              <p className="bg-slate-400 p-1 rounded-xl mx-2 my-5 font-medium px-2">
                Followers
              </p>
              <p className="bg-slate-400 p-1 rounded-xl mx-2 my-5 font-medium px-2">
                Aritcls
              </p>
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
