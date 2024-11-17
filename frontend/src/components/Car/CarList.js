import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./CarList.css"

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const { data } = await axios.get("/cars");
        setCars(data);
      } catch (error) {
        alert("Failed to fetch cars.");
      }
    };
    fetchCars();
  }, []);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`/cars/search?q=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCars(data);
    } catch (error) {
      alert("Failed to fetch search results.");
    }
  };

  return (
    <div className="container">
      <div className="page-title">
        <h1>Your Cars</h1>
      </div>
      <div className="container-content" style={{minWidth: "100%", padding: "2rem"}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <input
            type="text"
            className="form-control w-75"
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary ms-3" onClick={handleSearch}>
            Search
          </button>
        </div>
        <div className="car-grid">
          {cars.map((car) => (
            <div className="car-tile" key={car._id}>
              <img
                src={car.images[0] || "https://via.placeholder.com/300"}
                alt={car.title}
                className="car-tile-image"
              />
              <div className="car-tile-content">
                <h5 className="car-title">{car.title}</h5>
                <p className="car-description">{car.description}</p>
                <Link to={`/cars/${car._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <Link to="/cars/add" className="btn btn-success">
            Add New Car
          </Link>
        </div>
      </div>
    </div>

  );
};

export default CarList;
