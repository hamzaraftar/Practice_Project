import React, { useEffect, useState } from "react";
import "./scroll.css";

function ScrollIndecator({ url }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrollPersentage, setSceollPersentage] = useState(0);

  async function fetchData(getUrl) {
    try {
      setLoading(!loading);
      const response = await fetch(getUrl);
      const data = await response.json();

      if (data && data.products && data.products.length > 0) {
        setData(data.products);
        setLoading(false);
      }
    } catch (e) {
      setErrorMessage(e.message);
    }
  }
  useEffect(() => {
    fetchData(url);
  }, [url]);

  function handleScrollPersentTage() {
    console.log(
      document.body.scrollTop,
      document.documentElement.scrollTop,
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight
    );
    const howMuchScrolled =
      document.body.scrollTop || document.documentElement.scrollTop;
    const hight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    setSceollPersentage((howMuchScrolled / hight) * 100);
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScrollPersentTage);
    return () => {
      window.removeEventListener("scroll", () => {});
    };
  }, []);
  console.log(scrollPersentage);

  return (
    <div>
      <div className="top-container">
        <h1>Custon Scroll Indicator</h1>
        <div className="scroll-progress">
          <div
            className="current-progress"
            style={{ width: `${scrollPersentage}%` }}
          ></div>
        </div>
      </div>

      <div className="data-container">
        {data && data.length > 0
          ? data.map((dataItem) => <p>{dataItem.title}</p>)
          : null}
      </div>
    </div>
  );
}

export default ScrollIndecator;
