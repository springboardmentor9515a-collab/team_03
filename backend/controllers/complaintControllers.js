const User = require('../SchemaModels/user');
const Complaint = require('../SchemaModels/complaints');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
      return cb(new Error("Only .jpeg, .jpg and .png formats are allowed!"));
    }
    cb(null, true);
  },
});

exports.createComplaint = async (req, res) => {
  try {
    console.log("Uploaded file:", req.file); // ✅ Debug

    let photo_url = null;

    // 1️⃣ Upload image to Cloudinary if file exists
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "complaints" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          require("streamifier").createReadStream(req.file.buffer).pipe(stream);
        });

        photo_url = uploadResult.secure_url;
        console.log("✅ Uploaded to Cloudinary:", photo_url);
      } catch (cloudErr) {
        console.error("❌ Cloudinary Upload Error:", cloudErr);
        return res.status(500).json({
          success: false,
          message: "Cloudinary upload failed",
          error: cloudErr.message,
        });
      }
    } else {
      console.log("⚠️ No file received from frontend");
    }

    // 2️⃣ Parse & validate location
    let location = req.body.location;
    if (location && typeof location === "string") {
      try {
        location = JSON.parse(location);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON for location",
          error: err.message,
        });
      }
    }

    if (
      !location ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Location must include coordinates [longitude, latitude]",
      });
    }

    // 3️⃣ Save complaint
    const complaint = new Complaint({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || "medium",
      photo_url, // ✅ store the Cloudinary image URL
      location,
      admin_notes: req.body.admin_notes || "",
      created_by: req.user.id,
    });

    await complaint.save();
    await complaint.populate("created_by", "name email role");

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("❌ Error creating complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create complaint",
      error: error.message,
    });
  }
};


// Admin - Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      assigned_to,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assigned_to) filter.assigned_to = assigned_to;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(filter)
      .populate('created_by', 'name email role')
      .populate('assigned_to', 'name email role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const totalComplaints = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComplaints / parseInt(limit)),
        totalComplaints,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------
// Admin - Assign Complaint to Volunteer
// -----------------------------------------------------------------------------
exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteer_id } = req.body;

    const volunteer = await User.findById(volunteer_id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found',
      });
    }

    if (volunteer.role !== 'volunteer') {
      return res.status(400).json({
        success: false,
        message: 'User must have volunteer role',
        error: `User role is '${volunteer.role}'`,
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    complaint.assigned_to = volunteer_id;
    complaint.status = 'in_review';
    await complaint.save();

    await complaint.populate([
      { path: 'created_by', select: 'name email role' },
      { path: 'assigned_to', select: 'name email role' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint',
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------
// Volunteer - Get Assigned Complaints
// -----------------------------------------------------------------------------
exports.getMyAssignedComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter = { assigned_to: req.user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(filter)
      .populate('created_by', 'name email role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const totalComplaints = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComplaints / parseInt(limit)),
        totalComplaints,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned complaints',
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------
// Volunteer/Admin - Update Complaint Status
// -----------------------------------------------------------------------------
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const allowedStatuses = ['received', 'in_review', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (req.user.role === 'volunteer') {
      if (
        !complaint.assigned_to ||
        complaint.assigned_to.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only update complaints assigned to you',
          error: 'Not authorized to update this complaint',
        });
      }
    }

    complaint.status = status;
    if (admin_notes) complaint.admin_notes = admin_notes;
    if (status === 'resolved' && !complaint.resolved_at) {
      complaint.resolved_at = new Date();
    }

    await complaint.save();

    await complaint.populate([
      { path: 'created_by', select: 'name email role' },
      { path: 'assigned_to', select: 'name email role' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------
// Citizen - Get My Complaints
// -----------------------------------------------------------------------------
exports.getMyComplaints = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, sort = '-createdAt' } =
      req.query;

    const filter = { created_by: req.user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(filter)
      .populate('assigned_to', 'name email role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const totalComplaints = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComplaints / parseInt(limit)),
        totalComplaints,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your complaints',
      error: error.message,
    });
  }
};
