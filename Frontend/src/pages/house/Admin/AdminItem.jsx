import React, { useState, useContext, useRef } from "react";
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
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const onChangeHandler = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    setMessage("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!imageFile) {
      setMessage("Please add a product image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", Number(data.price));
    if (data.description) formData.append("description", data.description);
    if (data.stock !== "") formData.append("stock", Number(data.stock));
    if (data.category) formData.append("category", data.category);
    formData.append("image", imageFile);

    setSubmitting(true);
    try {
      await axios.post(`${url}/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // don't set Content-Type manually — axios/browser sets the
          // multipart boundary automatically for FormData
        },
      });
      setMessage("Item added.");
      setData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
      });
      clearImage();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-item-wrapper">
      <form onSubmit={onSubmitHandler} className="add-item-form">
        <h2>Add new item</h2>
        {message && <p className="add-item-message">{message}</p>}

        <label>Product name</label>
        <input
          type="text"
          name="name"
          value={data.name}
          onChange={onChangeHandler}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={data.description}
          onChange={onChangeHandler}
          rows={4}
        />

        <label>Product image</label>
        <div
          className="add-item-image-drop"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) onImageChange({ target: { files: [file] } });
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            style={{ display: "none" }}
          />
          {imagePreview ? (
            <div className="add-item-image-preview">
              <img src={imagePreview} alt="Preview" />
              <span>{imageFile?.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <span>Click or drag an image here</span>
          )}
        </div>

        <label>Category</label>
        <input
          type="text"
          name="category"
          value={data.category}
          onChange={onChangeHandler}
        />

        <div className="add-item-row">
          <div>
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={data.price}
              onChange={onChangeHandler}
              required
              min="0"
            />
          </div>
          <div>
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={data.stock}
              onChange={onChangeHandler}
              min="0"
            />
          </div>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add item"}
        </button>
      </form>
    </div>
  );
};

export default AddItem;
