import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CarDetail.css";

const CarDetail = () => {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Track selected image index
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You are not authorized. Please log in.");

        const { data } = await axios.get(`https://car-management-system-api.vercel.app/cars/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCar(data);
      } catch (error) {
        console.error("Error fetching car details:", error);
        setError(error.response?.data?.message || "Failed to fetch car details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not authorized. Please log in.");

      await axios.delete(`https://car-management-system-api.vercel.app/cars/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Car deleted successfully!");
      navigate("https://car-management-system-api.vercel.app/cars");
    } catch (error) {
      console.error("Error deleting car:", error);
      alert(error.response?.data?.message || "Failed to delete car.");
    }
  };

  const nextImage = () => {
    if (selectedImageIndex !== null && car.images) {
      setSelectedImageIndex((selectedImageIndex + 1) % car.images.length);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null && car.images) {
      setSelectedImageIndex(
        (selectedImageIndex - 1 + car.images.length) % car.images.length
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="car-detail-container">
      <button className="back-button" onClick={() => navigate("https://car-management-system-api.vercel.app/cars")}>
        &larr; Back to Cars
      </button>
      <div className="car-detail">
        <div className="car-image-wrapper">
          <img
            src={car.images[0] || "https://via.placeholder.com/300"}
            alt={car.title}
            className="car-image"
          />
        </div>
        <div className="car-details-content">
          <h1 className="car-title">{car.title}</h1>
          <p className="car-description">{car.description}</p>
          <div className="car-tags">
            <h5>Tags:</h5>
            <ul>
              {car.tags &&
                Object.entries(car.tags).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}</strong>: {value}
                  </li>
                ))}
            </ul>
          </div>
          <div className="action-buttons">
            <button
              className="edit-button"
              onClick={() => navigate(`https://car-management-system-api.vercel.app/cars/edit/${id}`)}
            >
              Edit
            </button>
            <button className="delete-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="image-gallery">
        <h3>Car Images</h3>
        <div className="gallery">
          {car.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Car ${index}`}
              className="gallery-image"
              onClick={() => {
                console.log(`Image clicked: ${index}`);
                setSelectedImageIndex(index); // Open modal with clicked image
              }}// Open modal with clicked image
            />
          ))}
        </div>
      </div>

      {/* Modal for Enlarged Image */}
      {selectedImageIndex !== null && (
        <div className="modal"  onClick={() =>{console.log("closing modal"); setSelectedImageIndex(null)}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedImageIndex(null)}
            >
              &larr;
            </button>
            <img
              src={car.images[selectedImageIndex]}
              alt="Enlarged Car"
              className="modal-image"
            />
            <div className="nav-buttons">
              <button className="nav-button" onClick={prevImage}>
                Previous
              </button>
              &rarr;
              <button className="nav-button" onClick={nextImage}>
                Next
              </button>
              &times;
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetail;
