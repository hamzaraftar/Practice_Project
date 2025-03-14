import  {  useEffect } from "react";

export default function useDocTitle(count) {
  useEffect(() => {
    document.title = `Count ${count}`;
  }, [count]);
}
