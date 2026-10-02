import React, { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { StoreContext } from "../../../content/storeContext";
import { imageMap } from "../../../utils/imageMap";
import { assets } from "../../../assets/frontend_assets/assets";
import AdminAnalytics from "./AdminAnalytics";
import "./Admin.css";

const AddItem = () => {
  const { url, token } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState("add");


  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);


  const [nameToDelete, setNameToDelete] = useState("");
  const [deleteMessage, setDeleteMessage] = useState({ text: "", type: "" });
  const [deleting, setDeleting] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${url}/api/products`);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load products for admin", err);
    } finally {
      setLoadingProducts(false);
    }};

  useEffect(() => {
    fetchProducts();
  }, [url]);

  const onChangeHandler = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please choose an image file.", type: "error" });
      return;
    }
    setMessage({ text: "", type: "" });
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
    setMessage({ text: "", type: "" });

    if (!imageFile) {
      setMessage({ text: "Please add a product image.", type: "error" });
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
        },
      });
      setMessage({
        text: `Item "${data.name}" added successfully!`,
        type: "success",
      });
      setData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
      });
      clearImage();
      fetchProducts();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to add item",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }};

  // --- Delete by Name Handler ---
  const handleDeleteByName = async (e) => {
    e?.preventDefault();
    setDeleteMessage({ text: "", type: "" });

    const trimmedName = nameToDelete.trim();
    if (!trimmedName) {
      setDeleteMessage({
        text: "Please enter or select a product name to delete.",
        type: "error",
      });
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete the item "${trimmedName}"?`,
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      // Find product by name (case-insensitive) in current products list
      const matched = products.find(
        (p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );

      let res;
      if (matched) {
        // Direct ID delete (compatible with both current and updated backend)
        res = await axios.delete(`${url}/api/products/${matched.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Fallback to delete by name endpoint
        res = await axios.delete(
          `${url}/api/products/name/${encodeURIComponent(trimmedName)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      setDeleteMessage({
        text: res.data?.message || `"${trimmedName}" deleted successfully!`,
        type: "success",
      });
      setNameToDelete("");
      fetchProducts();
    } catch (err) {
      setDeleteMessage({
        text:
          err.response?.data?.message ||
          `Failed to delete "${trimmedName}". Please make sure the name exists or restart backend if newly updated.`,
        type: "error",
      });
    } finally {
      setDeleting(false);
    }};

  // --- Quick Delete Handler from list ---
  const handleQuickDelete = async (product) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${url}/api/products/${product.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteMessage({
        text: `"${product.name}" deleted successfully!`,
        type: "success",
      });
      fetchProducts();
    } catch (err) {
      setDeleteMessage({
        text: err.response?.data?.message || `Failed to delete ${product.name}`,
        type: "error",
      });
    }};

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <div className="add-item-wrapper">
      <div className="admin-container">

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("add");
              setMessage({ text: "", type: "" });
            }}
          >
            ➕ Add New Item
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "delete" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("delete");
              setDeleteMessage({ text: "", type: "" });
            }}
          >
            🗑️ Delete / Manage Items ({products.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("analytics");
              setMessage({ text: "", type: "" });
            }}
          >
            📊 Analytics
          </button>
        </div>


        {activeTab === "add" && (
          <form onSubmit={onSubmitHandler} className="add-item-form">
            <h2>Add new item</h2>
            {message.text && (
              <p
                className={`add-item-message ${
                  message.type === "success" ? "success" : "error"
                }`}
              >
                {message.text}
              </p>)}

            <label>Product name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Chicken Chowmein"
              value={data.name}
              onChange={onChangeHandler}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              placeholder="Brief description of the dish..."
              value={data.description}
              onChange={onChangeHandler}
              rows={3}
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
                  </button></div>
              ) : (
                <span>Click or drag an image here</span>
              )}
            </div>

            <label>Category</label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Salad, Rolls, Deserts, Noodles"
              value={data.category}
              onChange={onChangeHandler}
            />

            <div className="add-item-row">
              <div>
                <label>Price (Rs)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="250"
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
                  placeholder="10"
                  value={data.stock}
                  onChange={onChangeHandler}
                  min="0"
                />
              </div></div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add item"}
            </button></form>
        )}


        {activeTab === "delete" && (
          <div className="admin-manage-card">
            <h2>Delete & Manage Items</h2>

            {deleteMessage.text && (
              <p
                className={`add-item-message ${
                  deleteMessage.type === "success" ? "success" : "error"
                }`}
              >
                {deleteMessage.text}
              </p>)}


            <form
              onSubmit={handleDeleteByName}
              className="admin-delete-by-name-form"
            >
              <label>Delete dish by exact name:</label>
              <div className="admin-delete-input-group">
                <input
                  type="text"
                  list="product-names-list"
                  placeholder="Type product name (e.g. Greek salad)..."
                  value={nameToDelete}
                  onChange={(e) => setNameToDelete(e.target.value)}
                />
                <datalist id="product-names-list">
                  {products.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={deleting || !nameToDelete.trim()}
                >
                  {deleting ? "Deleting..." : "Delete by Name"}
                </button></div>
            </form>

            <hr className="admin-divider" />


            <div className="admin-products-header">
              <h3>All Dishes ({products.length})</h3>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search dishes to delete..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            {loadingProducts ? (
              <p className="admin-loading-text">Loading dishes...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="admin-no-results">No dishes matching "{searchFilter}"</p>
            ) : (
              <div className="admin-products-table-wrapper">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr></thead>
                  <tbody>
                    {filteredProducts.map((item) => (
                      <tr key={item.id}>
                        <td className="table-img-cell">
                          <img
                            src={imageMap[item.imageUrl] || assets.food_1}
                            alt={item.name}
                            onError={(e) => {
                              if (e.currentTarget.src !== assets.food_1) {
                                e.currentTarget.src = assets.food_1;
                              }}}
                          />
                        </td>
                        <td className="table-name-cell">
                          <strong>{item.name}</strong>
                          {item.description && (
                            <span className="table-desc">{item.description}</span>
                          )}
                        </td>
                        <td>
                          <span className="table-category-badge">
                            {item.category || "General"}
                          </span></td>
                        <td>Rs {item.price}</td>
                        <td>{item.stock ?? 0}</td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="table-delete-btn"
                            onClick={() => handleQuickDelete(item)}
                            title={`Delete ${item.name}`}
                          >
                            Delete
                          </button></td>
                      </tr>))}
                  </tbody></table>
              </div>)}
          </div>)}

        {activeTab === "analytics" && <AdminAnalytics />}
      </div></div>
  );
};

export default AddItem;
