const Faq_data = ({ title, description, toggle, open }) => {
  return (
    <div
      onClick={toggle}
      className="w-[450px] rounded-3xl m-5 mx-auto cursor-pointer border-4 border-blue-100 relative top-40 bg-black p-2 "
    >
      <div className="font-semibold text-2xl text-white px-4 gap-10">
        {title} {open ? "-" : "+"}
      </div>
      <div
        className={`grid grid-rows-0fr transition:grid-rows-0.05s  ${
          open ? "grid-rows-1fr mt-5 " : ""
        }`}
      >
        {open && (
          <p className="overflow-hidden text-white py-2">{description}</p>
        )}
      </div>
    </div>
  );
};

export default Faq_data;
