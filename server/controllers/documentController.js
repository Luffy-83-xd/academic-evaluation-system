const Document = require('../models/Document');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc   Student uploads a document
// @route  POST /api/documents/upload
// @access Private (Student)
exports.uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  try {
    const newDocument = new Document({
      student: req.user.id,
      fileName: req.body.fileName || req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
    });

    await newDocument.save();
    res.status(201).json({ success: true, message: 'Document uploaded successfully', data: newDocument });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc   Get documents for the logged-in student
// @route  GET /api/documents/student
// @access Private (Student)
exports.getStudentDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// Add these new functions to documentController.js

// @desc   Get all documents for proctor view with pagination
// @route  GET /api/documents
// @access Private (Proctor)
exports.getAllDocuments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get the IDs of students assigned to this proctor
        const students = await User.find({ assignedProctor: req.user.id }).select('_id');
        const studentIds = students.map(s => s._id);

        // Find only documents belonging to those students
        const documentQuery = { student: { $in: studentIds } };

        const totalDocuments = await Document.countDocuments(documentQuery);
        const totalPages = Math.ceil(totalDocuments / limit);

        const documents = await Document.find(documentQuery)
            .populate('student', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
            
        res.status(200).json({ 
            success: true, 
            data: documents,
            page,
            pages: totalPages,
            total: totalDocuments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Update a document's status
// @route  PUT /api/documents/status/:id
// @access Private (Proctor)
exports.updateDocumentStatus = async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const document = await Document.findByIdAndUpdate(
          req.params.id,
          { status, feedback },
          { new: true, runValidators: true }
        ).populate('student', 'name'); // Populate student details

        if (!document) {
          return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // --- NOTIFICATION LOGIC ---
        const notificationMessage = `Your document '${document.fileName}' has been ${status}.`;
        const newNotification = new Notification({
            user: document.student._id,
            message: notificationMessage,
            link: '/student/documents'
        });
        await newNotification.save();

        // Emit event to the specific student if they are online
        const receiverSocketId = req.onlineUsers[document.student._id];
        if (receiverSocketId) {
            req.io.to(receiverSocketId).emit('newNotification', newNotification);
        }
        // --- END NOTIFICATION LOGIC ---

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Delete a document
// @route  DELETE /api/documents/:id
// @access Private (Student)
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Ensure the user deleting the document is the one who uploaded it
    if (document.student.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }
    
    // For now, allow deleting any document. We can restrict to 'Pending' later.
    // fs.unlinkSync(document.filePath); // This would delete the file from the server
    await document.deleteOne();

    res.status(200).json({ success: true, message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// Add this new function to documentController.js

// @desc   Download a specific document
// @route  GET /api/documents/download/:id
// @access Private
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    // Use res.download() to trigger a download
    res.download(document.filePath, document.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};