import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Effect() {
  const [post, setPost] = useState({
    id: 0,
    title: "",
    body: "",
  });

  const [id, setId] = useState(1);
  useEffect(() => {
    try {
      async function fetchData() {
        const response = await axios.get(
          `https://jsonplaceholder.typicode.com/posts/${id}`
        );
        setPost(response.data);
      }
      fetchData();
    } catch (error) {
      console.log(error.message);
    }
  }, [id]);

  return (
    <div>
      <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
        <h1>{post.title}</h1>
        <p>{post.body}</p>

      {/* {post.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </div>
      ))} */}
    </div>
  );
}
