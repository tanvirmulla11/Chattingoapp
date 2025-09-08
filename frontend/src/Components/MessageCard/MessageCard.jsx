import React from "react";

function MessageCard({ isReqUserMessage, content, timestamp, profilePic }) {
  return (
    <div
      className={`flex items-end ${
        isReqUserMessage ? "justify-end" : "justify-start"
      }`}
    >
      {!isReqUserMessage && (
        <img
          src={profilePic}
          alt="profile"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div
        className={`max-w-[60%] px-4 py-2 rounded-xl shadow-md ${
          isReqUserMessage
            ? "bg-[#d9fdd3] self-end text-right" // green bubble for sender
            : "bg-white self-start text-left" // white bubble for receiver
        }`}
      >
        <p className="text-gray-800">{content}</p>
        <span className="text-xs text-gray-500 block mt-1">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

export default MessageCard;
