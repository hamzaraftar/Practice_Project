export default function PermissionPopup({ message, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur and fade effect */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Popup container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Header with linear border */}
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Animated warning icon */}
            <div className="shrink-0">
              <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Attention Required
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Action needed to continue
              </p>
            </div>
          </div>
        </div>

        {/* Message content */}
        <div className="px-6 py-5">
          <p className="text-slate-700 leading-relaxed text-center font-bold text-2xl">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-6 py-4 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-3 cursor-pointer px-4 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
