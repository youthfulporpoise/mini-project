"use client";
import { BACKEND_URL } from "../utility";
import axios from "axios";
import Cookies from "js-cookie";
import { MouseEventHandler } from "react";

const page = () => {
  const handleLogout: MouseEventHandler = async () => {
    try {
      const url = `${BACKEND_URL}/logout/`;
      const csrfToken = Cookies.get("csrftoken");
      const options = {
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      };

      // Fix 1: pass empty object as body, options as the config (3rd argument)
      const response = await axios.post(url, {}, options);
      console.log(response.data);
      console.log("Successful Logout");
    } catch {
      console.log("Error");
    }
  };

  return (
    <div>
      {/* Fix 2: pass handleLogout directly, not wrapped in an arrow that never calls it */}
      <button onClick={handleLogout}>logout</button>
    </div>
  );
};

export default page;
