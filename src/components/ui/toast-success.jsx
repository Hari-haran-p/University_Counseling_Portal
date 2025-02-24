const SuccessIcon = () => (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3"
            stroke="#1E40AF" // Tailwind primary-800 color
            className="w-4 h-4"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    </div>
);

export default SuccessIcon;