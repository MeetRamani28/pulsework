import React from "react";
import TimerPopup from "../../components/molecules/TimerPopup";

// ✅ Standalone popup page (no DashboardLayout, no query params needed)
const TimerPopupPage: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4">
        <TimerPopup />
      </div>
    </div>
  );
};

export default TimerPopupPage;
