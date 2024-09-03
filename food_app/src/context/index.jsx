import { createContext, useState } from "react";

export const GlobalContext = createContext(null);
export default function GlobelState({ children }) {
  const [searchParam, setSearchParam] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipeList, setRecipeList] = useState([]);
  const [recipeDetailsData, setRecipeDetailsData] = useState("");
  const [favoritesList, setFavoritesList] = useState([]);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `https://forkify-api.herokuapp.com/api/v2/recipes?search=${searchParam}`
      );
      const data = await res.json();
      if (data?.data?.recipes) {
        setRecipeList(data?.data?.recipes);
        setLoading(false);
        setSearchParam("");
      }
    } catch (e) {
      console.log(e.message);
      setSearchParam("");
    }
  }
  function handleAddToFavorites(getCurrentItem) {
    console.log(getCurrentItem);
    let cpyFavorites = [...favoritesList];
    const index = cpyFavorites.findIndex(
      (item) => item.id === getCurrentItem.id
    );
    if (index === -1) {
      cpyFavorites.push(getCurrentItem);
    } else {
      cpyFavorites.splice(index);
    }
    setFavoritesList(cpyFavorites);
  }
  return (
    <GlobalContext.Provider
      value={{
        searchParam,
        setSearchParam,
        handleSubmit,
        loading,
        recipeList,
        recipeDetailsData,
        setRecipeDetailsData,
        handleAddToFavorites,
        favoritesList,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
