const Resource = require('../models/Resource');
const fs = require('fs');
const path = require('path');

// @desc   Upload a new resource
// @route  POST /api/resources
// @access Private (Proctor)
exports.uploadResource = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    try {
        const { title } = req.body;
        const newResource = new Resource({
            title,
            uploadedBy: req.user.id,
            filePath: req.file.path,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
        });
        await newResource.save();
        res.status(201).json({ success: true, data: newResource });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Get all resources
// @route  GET /api/resources
// @access Private
exports.getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find({})
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: resources });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Delete a resource
// @route  DELETE /api/resources/:id
// @access Private (Proctor)
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }
        
        // Delete the file from the server's filesystem
        fs.unlink(path.join(__dirname, '..', resource.filePath), async (err) => {
            if (err) {
                console.error("File deletion error:", err);
                // Still proceed to delete from DB, but log the error
            }
            await resource.deleteOne();
            res.status(200).json({ success: true, message: 'Resource removed' });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};