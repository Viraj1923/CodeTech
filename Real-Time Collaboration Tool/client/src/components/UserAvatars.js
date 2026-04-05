import React from "react";

const UserAvatars = ({ users }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="user-avatars">
      {users.slice(0, 5).map((user, i) => (
        <div
          key={user.id || i}
          className="avatar"
          style={{
            background: user.color || "#6c757d",
            marginLeft: i > 0 ? "-8px" : "0",
            zIndex: users.length - i,
          }}
          title={user.name}
        >
          {(user.name || "?")[0].toUpperCase()}
        </div>
      ))}
      {users.length > 5 && (
        <div className="avatar avatar-more">+{users.length - 5}</div>
      )}
    </div>
  );
};

export default UserAvatars;
