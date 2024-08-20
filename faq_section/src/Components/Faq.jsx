import { useState } from "react";
import Faq_data from "./Faq_data";

const Faq = () => {
  const [open, setOpen] = useState(false);
  const toggle = (index) => {
    if (index === open) {
      return setOpen(false);
    }
    setOpen(index);
  };
  return (
    <>
      <div className="">
        {data.map((items, index) => (
          <Faq_data
            key={items.id}
            title={items.q}
            description={items.ans}
            open={index === open}
            toggle={() => toggle(index)}
          />
        ))}
      </div>
    </>
  );
};

export default Faq;

const data = [
  {
    id: 1,
    q: "What is React JS ?",
    ans: "React is Frontend javascript library which is used for building userinterface based on UI component",
  },
  {
    id: 2,
    q: "Who Develop React JS ?",
    ans: "Jordan Walk",
  },
  {
    id: 3,
    q: "When React JS Deploy ?",
    ans: "React was deploy in 2013",
  },
  {
    id: 4,
    q: "what is Component in React JS ?",
    ans: "Component are independent and reuseable bit of code",
  },
  {
    id: 5,
    q: "Types of component in React JS?",
    ans: "Functional Component and Class component",
  },
];
