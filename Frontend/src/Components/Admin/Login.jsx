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
                src="data:image/jpeg;base64,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"
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
