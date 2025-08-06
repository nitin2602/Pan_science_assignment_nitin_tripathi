import express from "express";
import { 
  createTaskController,
  deleteTaskController,
  getAdminTasks,
  getAllTaskController,
  getTaskByUserController,
  modifyTaskController,
  updateTaskController,
  userRequestReviewController,
  adminApproveTaskController,
  adminRejectTaskController,
  downloadDocumentController  // Make sure this is imported
} from "../../controller/taskController.js";
import { isAdmin, isAuthenticated } from "../../middleware/authValidation.js";
import upload from "../../config/multerConfig.js";  // Import Multer config
import { userRepository } from "../../repository/userRepository.js";

const taskRouter = express.Router();

// File upload route (updated with Multer middleware)
// In your taskRouter.js - Remove the upload.array() from here
taskRouter.post(
  '/create/:userId',
  isAuthenticated,
  isAdmin,
  createTaskController  // Multer is now ONLY handled in the controller
);

// Document download route (new addition)
taskRouter.get(
  '/:taskId/documents/:docIndex',
  isAuthenticated,
  downloadDocumentController
);

// Existing routes (keep these exactly as they were)
taskRouter.put('/status/:taskId', isAuthenticated, isAdmin, updateTaskController);
taskRouter.put('/user-status/:taskId', isAuthenticated, updateTaskController);
taskRouter.delete('/delete/:taskId', isAuthenticated, isAdmin, deleteTaskController);
taskRouter.get('/', isAuthenticated, isAdmin, getAllTaskController);
taskRouter.get('/:userId', isAuthenticated, getTaskByUserController);
taskRouter.put('/:taskId', isAuthenticated, isAdmin, modifyTaskController);
taskRouter.put('/request-review/:taskId', isAuthenticated, userRequestReviewController);
taskRouter.put('/approve/:taskId', isAuthenticated, isAdmin, adminApproveTaskController);
taskRouter.put('/reject/:taskId', isAuthenticated, isAdmin, adminRejectTaskController);

// Admin tasks route (improved version)
taskRouter.get("/admin-tasks", isAuthenticated, isAdmin, getAdminTasks);

// User management route (keep as is)
taskRouter.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await userRepository.getAllUsers();
        if (!users?.length) {
            return res.status(404).json({ 
                success: false, 
                message: "No users found" 
            });
        }
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});

export default taskRouter;