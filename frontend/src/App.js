import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import CarList from "./components/Car/CarList";
import CarForm from "./components/Car/CarForm";
import CarDetail from "./components/Car/CarDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cars" element={<CarList />} />
        <Route path="/cars/add" element={<CarForm />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/cars/edit/:id" element={<CarForm />} />
      </Routes>
    </Router>
  );
}

export default App;
