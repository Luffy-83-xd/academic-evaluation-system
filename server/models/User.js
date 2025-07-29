const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // Common Details
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'proctor'], required: true },
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String },

    // Student-specific details
    class: { type: String },
    sec: { type: String },
    dob: { type: Date }, // Date of Birth
    department: { type: String },
    remarks: { type: String, default: '' },
    assignedProctor: {  // Add this field
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },

    // Proctor-specific details
    designation: { type: String },
    degree: { type: String },

    // Profile picture
    avatar: { type: String, default: 'default_avatar_url_here' } // You can host a default image somewhere
}, { timestamps: true });


// Hash password before saving the user model
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);