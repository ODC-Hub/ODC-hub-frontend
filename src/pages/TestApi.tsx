import { useEffect, useState } from "react";
import api from "../api/axios";

export default function TestApi() {
  const [message, setMessage] = useState("NOT LOADED YET");

  useEffect(() => {
    api.get("/hello")
      .then(res => {
        console.log("API OK:", res.data);
        setMessage(res.data);
      })
      .catch(err => {
        console.error("API ERROR:", err);
        setMessage("ERROR");
      });
  }, []);

  return (
    <div style={{ padding: 40, background: "yellow" }}>
      <h1 style={{ fontSize: 30 }}>TEST API PAGE</h1>
      <p>{message}</p>
    </div>
  );
}