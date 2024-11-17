import "./CarForm.css"
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const CarForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [],
    tags: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dctllbdwf/upload";
  const UPLOAD_PRESET = "car_manegement";

  useEffect(() => {
    if (id) {
      const fetchCar = async () => {
        try {
          const token = localStorage.getItem("token");
          const { data } = await axios.get(`https://car-management-system-api.vercel.app/cars/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData({
            title: data.title || "",
            description: data.description || "",
            images: data.images || [],
            tags: Object.entries(data.tags || {})
              .map(([key, value]) => `${key}:${value}`)
              .join(","),
          });
        } catch (error) {
          console.error("Failed to fetch car details", error);
          alert("Failed to fetch car details.");
        }
      };
      fetchCar();
    }
  }, [id]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      alert("You can only upload up to 10 images.");
      return;
    }

    setLoading(true);
    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", UPLOAD_PRESET);

          const { data } = await axios.post(CLOUDINARY_URL, formData);
          return data.secure_url;
        })
      );

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: formData.title,
        description: formData.description,
        images: formData.images,
        tags: formData.tags.split(",").reduce((acc, tag) => {
          const [key, value] = tag.split(":").map((item) => item.trim());
          if (key && value) acc[key] = value;
          return acc;
        }, {}),
        user_id: token
      };

      if (!token) throw new Error("You are not authorized. Please log in.");

      if (id) {
        await axios.put(`/cars/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(token)
        });
        alert("Car updated successfully!");
      } else {
        await axios.post("/cars", payload, {
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(token)
        });
        alert("Car added successfully!");
      }
      navigate("https://car-management-system-api.vercel.app/cars");
    } catch (error) {
      console.error("Error saving car:", error);
      setError(error.response?.data?.message || "Failed to save car.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="text-center mb-4">{id ? "Edit Car" : "Add Car"}</h2>
              {error && <p className="text-danger text-center">{error}</p>}
              <form onSubmit={handleSubmit}>
                {/* Title Input */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Car Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter car title"
                    required
                  />
                </div>

                {/* Description Input */}
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter car description"
                    rows="4"
                    required
                  ></textarea>
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  <label htmlFor="images" className="form-label">
                    Upload Images (max 10)
                  </label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    className="form-control"
                    onChange={handleImageUpload}
                  />
                  {loading && <p className="text-primary">Uploading...</p>}
                </div>

                {/* Display Uploaded Images */}
                <div className="mb-3">
                  <h5>Uploaded Images</h5>
                  <div className="d-flex flex-wrap">
                    {formData.images.map((image, index) => (
                      <div key={index} className="me-2 mb-2">
                        <img
                          src={image}
                          alt={`Car ${index}`}
                          width="100"
                          className="img-thumbnail"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm mt-1"
                          onClick={() => handleRemoveImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags Input */}
                <div className="mb-3">
                  <label htmlFor="tags" className="form-label">
                    Tags (key:value pairs, comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="form-control"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Enter tags as key:value, separated by commas"
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {id ? "Update Car" : "Add Car"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarForm;
