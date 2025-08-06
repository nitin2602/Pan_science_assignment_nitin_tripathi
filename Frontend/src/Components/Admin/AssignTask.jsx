import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBInput,
  MDBTextArea,
  MDBBtn,
  MDBIcon,
  MDBSpinner,
  MDBBadge,
  MDBListGroup,
  MDBListGroupItem
} from 'mdb-react-ui-kit';
import { API_ENDPOINTS } from '../config/api';

const AssignTask = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
    assignedTo: "",
  });
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("AdminToken");
      const response = await axios.get(API_ENDPOINTS.GET_USERS, {
        headers: { "x-access-token": token },
      });

      if (response.data.success) {
        const regularUsers = response.data.data.filter(user => 
          user.usertype !== 'admin' && user.role !== 'admin'
        );
        setUsers(regularUsers);
      } else {
        setMessage({ text: "Failed to fetch users", type: "danger" });
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage({ text: "Error fetching users", type: "danger" });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check if total files exceed 3
    if (files.length + selectedFiles.length > 3) {
      setMessage({ text: "You can upload maximum 3 files", type: "warning" });
      return;
    }
    
    // Check if all files are PDFs
    const invalidFiles = selectedFiles.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      setMessage({ text: "Only PDF files are allowed", type: "warning" });
      return;
    }
    
    // Check individual file size (5MB limit)
    const oversizedFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setMessage({ text: "File size should not exceed 5MB", type: "warning" });
      return;
    }
    
    setFiles([...files, ...selectedFiles]);
    setFileError("");
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFileError("");

    if (!formData.assignedTo || !formData.title || !formData.description || !formData.deadline) {
        setMessage({ text: "All fields are required!", type: "warning" });
        setLoading(false);
        return;
    }

    try {
        const token = localStorage.getItem("AdminToken");
        const formDataToSend = new FormData();
        
        // Append all form data as strings
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('deadline', formData.deadline);
        formDataToSend.append('priority', formData.priority);
        
        // Append files with the correct field name
        files.forEach(file => {
            formDataToSend.append('documents', file); // Must match Multer's field name
        });

        const response = await axios.post(
            API_ENDPOINTS.CREATE_TASK(formData.assignedTo),
            formDataToSend,
            {
                headers: {
                    "x-access-token": token,
                    "Content-Type": "multipart/form-data" // Explicitly set content type
                }
            }
        );

        setMessage({ text: "Task assigned successfully!", type: "success" });
        setFormData({
            title: "",
            description: "",
            deadline: "",
            priority: "medium",
            assignedTo: "",
        });
        setFiles([]);
    } catch (error) {
        console.error("Error:", error);
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           "Failed to assign task";
        setMessage({ text: errorMessage, type: "danger" });
    } finally {
        setLoading(false);
    }
};
  const dismissAlert = () => {
    setMessage({ text: '', type: '' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return (
    <MDBContainer className="py-5 mt-5">
      <MDBRow className="justify-content-center">
        <MDBCol md="8" lg="7" xl="6">
          <MDBCard className="shadow-lg">
            <MDBCardHeader className="bg-primary text-white p-4">
              <div className="d-flex align-items-center">
                <div className="text-center bg-white rounded-circle p-3 me-3">
                  <MDBIcon fas icon="tasks" size="2x" className="text-primary" />
                </div>
                <div>
                  <h3 className="mb-0">Assign New Task</h3>
                  <p className="mb-0 opacity-75">Create and assign task to user</p>
                </div>
              </div>
            </MDBCardHeader>

            <MDBCardBody className="p-4">
              {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
                  {message.text}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={dismissAlert}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <MDBInput
                    label='Task Title'
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-4">
                  <MDBTextArea
                    label='Task Description'
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-4">
                  <MDBInput
                    type='datetime-local'
                    label='Deadline'
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Priority Level</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label">Assign To</label>
                  <select
                    className="form-select"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                    required
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label">Attach Documents (PDF only, max 3)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    multiple
                    accept="application/pdf"
                  />
                  {fileError && (
                    <div className="text-danger small mt-1">{fileError}</div>
                  )}
                  
                  {files.length > 0 && (
                    <div className="mt-3">
                      <h6>Selected Files:</h6>
                      <MDBListGroup>
                        {files.map((file, index) => (
                          <MDBListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                            <span>
                              <MDBIcon far icon="file-pdf" className="me-2 text-danger" />
                              {file.name}
                              <MDBBadge color="light" className="ms-2">
                                {formatFileSize(file.size)}
                              </MDBBadge>
                            </span>
                            <button
                              type="button" 
                              className="btn btn-sm btn-danger"
                              onClick={() => removeFile(index)}
                            >
                              <MDBIcon fas icon="times" />
                            </button>
                          </MDBListGroupItem>
                        ))}
                      </MDBListGroup>
                    </div>
                  )}
                </div>

                <MDBBtn
                  type='submit'
                  color='primary'
                  className='w-100'
                  disabled={loading}
                >
                  {loading ? (
                    <MDBSpinner size='sm' role='status' tag='span' className='me-2' />
                  ) : (
                    <MDBIcon fas icon="plus-circle" className="me-2" />
                  )}
                  Assign Task
                </MDBBtn>
              </form>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default AssignTask;