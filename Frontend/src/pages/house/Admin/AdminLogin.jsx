import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../../content/storeContext";
import "./Admin.css";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { url, setToken } = useContext(StoreContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.post(`${url}/api/auth/login`, { email, password });
            const { token, user } = res.data;

            if (!user || user.role !== "admin") {
                setError("This account does not have admin access.");
                return;
            }

            localStorage.setItem("token", token);
            setToken(token);
            navigate("/admin/add-item");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="admin-login-wrapper">
            <form onSubmit={handleLogin} className="admin-login-form">
                <h2>Admin login</h2>
                {error && <p className="admin-login-error">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Log in</button>
            </form>
        </div>
    );
};

export default AdminLogin;