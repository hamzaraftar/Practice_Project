import React, { useEffect, useState } from "react";
import Search from "./Search";

function Weather() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  async function fetchWearherData(param) {
    setLoading(!loading);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${param}&appid=64a2fa777c1027c555d067d6d8e83fa9`
      );
      const data = await res.json();

      if (data) {
        setWeatherData(data);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.log(e.message);
    }
  }
  async function handleSearch() {
    fetchWearherData(input);
  }
  function getCurrentDate() {
    return new Date().toLocaleDateString(`en-us`, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  useEffect(() => {
    fetchWearherData(`lahore`);
  }, []);

  return (
    <div>
      <Search input={input} setInput={setInput} handleSearch={handleSearch} />
      {loading ? (
        <h1 className="loading">Loading ...</h1>
      ) : (
        <div>
          <div className="city_name">
            <h2>
              {weatherData?.name}, <span>{weatherData?.sys?.country}</span>
            </h2>
          </div>
          <div className="date">
            <span>{getCurrentDate()}</span>
          </div>
          <div className="temp">{weatherData?.main?.temp}</div>
          <p className="description">
            {weatherData && weatherData.weather && weatherData.weather[0]
              ? weatherData.weather[0].description
              : ""}
          </p>
          <div className="weather_info">
            <div className="column">
              <div>
                <p className="wind">{weatherData?.wind?.speed}</p>
                <p>Wind Speed</p>
              </div>
            </div>
            <div>
              <div>
                <p className="humidity">{weatherData?.main?.humidity}%</p>
                <p>Humidity</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Weather;
