const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Resource = require('../models/Resource');
const User = require('../models/User');

// @desc   Student uploads a project
// @route  POST /api/projects/upload
// @access Private (Student)
exports.uploadProject = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a project file' });
  }
  
  try {
    const { title, description } = req.body;
    const newProject = new Project({
      student: req.user.id,
      title,
      description,
      filePath: req.file.path,
      fileType: req.file.mimetype,
    });
    await newProject.save();
    res.status(201).json({ success: true, message: 'Project uploaded successfully', data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc   Get projects for the logged-in student
// @route  GET /api/projects/student
// @access Private (Student)
exports.getStudentProjects = async (req, res) => {
    try {
        const projects = await Project.find({ student: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Get all projects for proctor view
// @route  GET /api/projects
// @access Private (Proctor)
exports.getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get the IDs of students assigned to this proctor
        const students = await User.find({ assignedProctor: req.user.id }).select('_id');
        const studentIds = students.map(s => s._id);
        
        // Find only projects belonging to those students
        const projectQuery = { student: { $in: studentIds } };

        const totalProjects = await Project.countDocuments(projectQuery);
        const totalPages = Math.ceil(totalProjects / limit);

        const projects = await Project.find(projectQuery)
            .populate('student', 'name')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
            
        res.status(200).json({ 
            success: true, 
            data: projects,
            page,
            pages: totalPages,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Grade a project
// @route  PUT /api/projects/grade/:id
// @access Private (Proctor)
exports.gradeProject = async (req, res) => {
    try {
        const { grade, feedback, markAsResource } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Update the project's details
        project.grade = grade;
        project.feedback = feedback;
        project.status = 'Checked';
        project.isResource = markAsResource || project.isResource; // Mark as resource if requested

        await project.save();

        // If marked as a resource, create a new entry in the Resources collection
        if (markAsResource) {
            // Check if a resource for this project already exists to avoid duplicates
            const existingResource = await Resource.findOne({ filePath: project.filePath });

            if (!existingResource) {
                await Resource.create({
                    title: project.title,
                    uploadedBy: req.user.id, // The proctor is the one sharing it
                    filePath: project.filePath,
                    fileName: project.filePath.split('-').pop(), // Extract original filename
                    fileType: project.fileType,
                    sourceProject: true,
                    originalAuthor: project.student
                });
            }
        }

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};