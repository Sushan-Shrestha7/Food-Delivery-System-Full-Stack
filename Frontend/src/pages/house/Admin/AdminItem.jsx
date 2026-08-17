import React, { useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../../content/storeContext";
import "./Admin.css";

const AddItem = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        category: "",
    });
    const [message, setMessage] = useState("");

    const onChangeHandler = (e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setMessage("");

        const payload = {
            name: data.name,
            price: Number(data.price),
        };
        if (data.description) payload.description = data.description;
        if (data.stock !== "") payload.stock = Number(data.stock);
        if (data.imageUrl) payload.imageUrl = data.imageUrl;
        if (data.category) payload.category = data.category;

        try {
            await axios.post(`${url}/api/products`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("Item added.");
            setData({ name: "", description: "", price: "", stock: "", imageUrl: "", category: "" });
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to add item");
        }
    };

    return (
        <div className="add-item-wrapper">
            <form onSubmit={onSubmitHandler} className="add-item-form">
                <h2>Add new item</h2>
                {message && <p className="add-item-message">{message}</p>}

                <label>Product name</label>
                <input type="text" name="name" value={data.name} onChange={onChangeHandler} required />

                <label>Description</label>
                <textarea name="description" value={data.description} onChange={onChangeHandler} rows={4} />

                <label>Image URL</label>
                <input type="text" name="imageUrl" value={data.imageUrl} onChange={onChangeHandler} placeholder="https://..." />

                <label>Category</label>
                <input type="text" name="category" value={data.category} onChange={onChangeHandler} />

                <div className="add-item-row">
                    <div>
                        <label>Price</label>
                        <input type="number" name="price" value={data.price} onChange={onChangeHandler} required min="0" />
                    </div>
                    <div>
                        <label>Stock</label>
                        <input type="number" name="stock" value={data.stock} onChange={onChangeHandler} min="0" />
                    </div>
                </div>

                <button type="submit">Add item</button>
            </form>
        </div>
    );
};

export default AddItem;