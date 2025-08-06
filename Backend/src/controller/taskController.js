import { createTaskService, deleteTaskService, getAllTaskService, getTaskByUserService, updateTaskService} from "../service/taskService.js";
import {taskRepository} from '../repository/taskRepository.js';
import upload from '../config/multerConfig.js'; // Import Multer config
import path from 'path';
import fs from 'fs';

// Modified createTaskController with file upload support

export const createTaskController = async (req, res) => {
    try {
        // Handle file upload first
        const uploadMiddleware = upload.array('documents', 3);
        
        await new Promise((resolve, reject) => {
            uploadMiddleware(req, res, (err) => {
                if (err) {
                    console.error('Multer error:', err);
                    return reject(err);
                }
                resolve();
            });
        });

        // Now process the rest of the request
        console.log("Request body:", req.body);
        console.log("Uploaded files:", req.files);

        const { title, description, deadline, priority } = req.body;
        const assignedBy = req.user._id;
        const assignedTo = req.params.userId;

        if (!title || !description || !deadline || !priority) {
            // Clean up uploaded files if validation fails
            if (req.files?.length) {
                req.files.forEach(file => {
                    fs.unlink(file.path, () => {});
                });
            }
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const documents = req.files?.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            path: file.path.replace(/\\/g, '/'), // Ensure consistent path format
            size: file.size,
            mimetype: file.mimetype
        })) || [];

        const taskData = {
            title,
            description,
            deadline: new Date(deadline),
            priority,
            assignedBy,
            assignedTo,
            documents
        };

        const createdTask = await createTaskService(taskData);
        
        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: createdTask
        });

    } catch (error) {
        console.error("Error in createTaskController:", error);
        
        // Clean up any uploaded files on error
        if (req.files?.length) {
            req.files.forEach(file => {
                fs.unlink(file.path, () => {});
            });
        }
        
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
// Add document download controller
export const downloadDocumentController = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const docIndex = parseInt(req.params.docIndex);
        
        if (isNaN(docIndex)) {
            return res.status(400).json({
                success: false,
                message: "Invalid document index"
            });
        }

        const task = await taskRepository.getTaskById(taskId);
        if (!task || !task.documents || !task.documents[docIndex]) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        const document = task.documents[docIndex];
        const filePath = path.join(__dirname, '..', '..', document.path);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File not found on server"
            });
        }

        res.download(filePath, document.originalname);
    } catch (error) {
        console.error("Error downloading document:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const updateTaskController = async function (req, res) {
    try {
        const taskId = req.params.taskId;
        const updateData = req.body;
        const userId = req.user._id;
        const userType = req.user.usertype;
        const updatedTask = await updateTaskService(taskId, updateData, userId, userType);
        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteTaskController = async function (req, res) {
    try {
        const taskId = req.params.taskId;

        const response = await deleteTaskService(taskId);
        res.status(201).send({
            success: true,
            message: "Task Deleted",
            data: response
        });
    } catch (error) {
        console.error("Error in deleting Task controller", error);
        res.status(500).send({
        success: false,
        message: "Internal Server Error",
        error: error.message
      });
    }
};

export const getAllTaskController = async function (req, res) {
    try {
        const response = await getAllTaskService();
        res.status(201).send({
            success: true,
            message: "All Task Fetched",
            data: response
        });
    } catch (error) {
        console.error("Error in get all Task controller", error);
        res.status(500).send({
        success: false,
        message: "Internal Server Error",
        error: error.message
      });
    }
};

export const getTaskByUserController = async function (req, res) {
    try {
        const userId = req.params.userId;

        // Allow admins to view any user's tasks
        if (req.user.usertype !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own tasks."
            });
        }

        const response = await getTaskByUserService(userId);
        res.status(201).send({
            success: true,
            message: "Task Fetched for a user",
            data: response
        });
    } catch (error) {
        console.error("Error in get Task By User controller", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }  
};


export const modifyTaskController = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { title, description, deadline, priority, status, assignedTo } = req.body;
        console.log('Received update request for task:', taskId);
        console.log('Update data:', { title, description, deadline, priority, status, assignedTo });

        // Check if task exists
        const existingTask = await taskRepository.getTaskById(taskId);
        if (!existingTask) {
            console.log('Task not found:', taskId);
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }
        console.log('Existing task:', existingTask);

        // Validate required fields
        if (!title || !description || !deadline || !priority || !status || !assignedTo) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Update task details
        const updatedTask = await taskRepository.update(taskId, {
            title,
            description,
            deadline: new Date(deadline),
            priority,
            status,
            assignedTo
        });
        console.log('Task updated:', updatedTask);

        if (!updatedTask) {
            console.log('Failed to update task');
            return res.status(400).json({
                success: false,
                message: 'Failed to update task'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
export const getAdminTasks = async (req, res) => {

    console.log("✅ Inside getAdmintasks function");

    
    console.log("✅ Decoded Admin ID from Token (req.user.id):", req.user.id);
    console.log("✅ Admin ID from Query (req.query.adminId):", req.query.adminId);

    // Ensure both are strings for comparison
    const decodedAdminId = req.user.id.toString();
    const queryAdminId = req.query.adminId.toString();

    console.log("🔍 After Conversion → Token ID:", decodedAdminId, " | Query ID:", queryAdminId);

    if (decodedAdminId !== queryAdminId) {
        console.log("❌ Admin ID mismatch. Access Denied.");
        return res.status(403).json({
            success: false,
            message: "Access denied. You can only view your own tasks."
        });
    }

    try {
        const tasks = await Task.find({ assignedBy: req.user.id });
        console.log("✅ Found Tasks:", tasks);
        
        res.status(200).json({
            success: true,
            tasks
        });
    } catch (error) {
        console.log("❌ Error Fetching Tasks:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// User requests review
export const userRequestReviewController = async function (req, res) {
    try {
        const taskId = req.params.taskId;
        const userId = req.user._id;
        const userType = req.user.usertype;
        const updateData = { status: 'review-requested' };
        const updatedTask = await updateTaskService(taskId, updateData, userId, userType);
        return res.status(200).json({
            success: true,
            message: "Task review requested",
            data: updatedTask
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// Admin approves task
export const adminApproveTaskController = async function (req, res) {
    try {
        const taskId = req.params.taskId;
        const userId = req.user._id;
        const userType = req.user.usertype;
        const updateData = { status: 'completed' };
        const updatedTask = await updateTaskService(taskId, updateData, userId, userType);
        return res.status(200).json({
            success: true,
            message: "Task approved and marked as completed",
            data: updatedTask
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// Admin rejects task
export const adminRejectTaskController = async function (req, res) {
    try {
        const taskId = req.params.taskId;
        const userId = req.user._id;
        const userType = req.user.usertype;
        const { rejectionReason } = req.body;
        const updateData = { status: 'rejected', rejectionReason };
        const updatedTask = await updateTaskService(taskId, updateData, userId, userType);
        return res.status(200).json({
            success: true,
            message: "Task review rejected",
            data: updatedTask
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};