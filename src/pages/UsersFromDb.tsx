import { useEffect, useState } from "react";
import api from "../api/axios";

type User = {
  id: string;
  email: string;
  role: string;
};

export default function UsersFromDb() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<User[]>("/users")
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error(err);
        setError("Failed to load users");
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Users from DB</h1>

      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id} className="border p-3 rounded">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
