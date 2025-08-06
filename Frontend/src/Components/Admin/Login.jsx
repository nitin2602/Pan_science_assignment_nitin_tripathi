import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBInput,
  MDBIcon,
} from "mdb-react-ui-kit";
import { API_ENDPOINTS } from "../config/api";

import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "../styles/Auth.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMessage({ type: "error", text: "Email and Password are required!" });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.USER_LOGIN, formData);
      if (response.data.success) {
        const { token, user } = response.data.data;

        if (user.usertype !== "admin") {
          throw new Error("Not authorized as admin");
        }

        localStorage.setItem("AdminToken", token);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userType", "admin");

        dispatch({
          type: "LOGIN",
          payload: {
            id: user._id,
            email: user.email,
            role: "admin",
            usertype: "admin",
            token: token,
          },
        });

        setMessage({ type: "success", text: "Login Successful. Redirecting..." });
        navigate("/admin-dashboard");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      let errorMessage = "Invalid admin credentials";
      if (error.message === "Not authorized as admin") {
        errorMessage = "This account does not have admin privileges";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer fluid className="d-flex align-items-center justify-content-center auth-container min-vh-100">
      <MDBCard className="shadow-lg border-0 rounded-4 p-3 glass-card">
        <MDBCardBody>
          <MDBRow className="align-items-center">
            <MDBCol lg="6" className="text-center text-lg-start p-4">
              <h2 className="fw-bold mb-4" style={{ color: "blue  " }}>
                Hello! Mr.Admin 👋
              </h2>

              {message.text && (
                <div className={`alert alert-${message.type === "error" ? "danger" : "success"}`} role="alert">
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3 position-relative custom-light-input">
  <MDBIcon fas icon="envelope" className="position-absolute" style={{ left: "15px", top: "12px", color: "black" }} />
  <MDBInput
    label="Admin Email"
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    className="ps-5"
    required
  />
</div>

<div className="form-group mb-4 position-relative custom-light-input">
  <MDBIcon fas icon="lock" className="position-absolute" style={{ left: "15px", top: "12px", color: "black" }} />
  <MDBInput
    label="Password"
    type="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    className="ps-5"
    required
  />
</div>


                <MDBBtn
                  type="submit"
                  className="w-100 btn-lg"
                  style={{ backgroundColor: "blue" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </MDBBtn>

                <p className="text-muted mt-3">
                  Don't have an admin account?{" "}
                  <Link to="/register-admin" className="text-decoration-none" style={{ color: "#ff69b4" }}>
                    Sign Up Here
                  </Link>
                </p>
              </form>
            </MDBCol>

            <MDBCol lg="6" className="text-center">
              <MDBCardImage
                src="https://img.freepik.com/premium-vector/image-3d-paper-tablet-pink-background_627230-339.jpg"
                fluid
                className="rounded-4"
                alt="Admin Login"
              />
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default AdminLogin;
