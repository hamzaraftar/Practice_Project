export default function PermissionPopup({ message, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
        `}
      </style>

      <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
            <span className="text-red-600 text-3xl">!</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Permission Required
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-5 text-sm">{message}</p>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
