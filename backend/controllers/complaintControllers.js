const User = require('../SchemaModels/user');
const Complaint = require('../SchemaModels/complaints');
const cloudinary = require('../config/cloudinary');
const Notification = require('../SchemaModels/notification');

// -----------------------------------------------------------------------------
// Citizen - Create Complaint
// -----------------------------------------------------------------------------
exports.createComplaint = async (req, res) => {
  try {
    let photo_url = null;

    // ✅ Upload image to Cloudinary if provided
    if (req.file) {
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: "complaints",
        resource_type: "image",
      });
      photo_url = uploadResponse.secure_url;
    }

    // ✅ Validate & parse location
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

    if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Location must include coordinates [longitude, latitude]",
      });
    }

    // ✅ Save complaint to DB
    const complaint = new Complaint({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || "medium",
      photo_url,
      location,
      admin_notes: req.body.admin_notes || "",
      created_by: req.user.id,
    });

    await complaint.save();
    await complaint.populate("created_by", "name email role");

    // ✅ Notify Admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Complaint Submitted',
        message: `A new complaint "${complaint.title}" has been submitted by ${req.user.name}.`,
        link: `/complaints/${complaint._id}`,
      });
    }

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

// -----------------------------------------------------------------------------
// Admin - Get All Complaints (with pagination & filters)
// -----------------------------------------------------------------------------
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
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    if (volunteer.role !== 'volunteer') {
      return res.status(400).json({
        success: false,
        message: `User must have volunteer role, but found '${volunteer.role}'`,
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assigned_to = volunteer_id;
    complaint.status = 'assigned';
    await complaint.save();

    // ✅ Notify volunteer
    await Notification.create({
      user: volunteer_id,
      title: 'Complaint Assigned',
      message: `You have been assigned complaint "${complaint.title}".`,
      link: `/complaints/${complaint._id}`,
    });

    // ✅ Notify citizen who created it
    await Notification.create({
      user: complaint.created_by,
      title: 'Complaint Update',
      message: `Your complaint "${complaint.title}" has been assigned to a volunteer.`,
      link: `/complaints/${complaint._id}`,
    });

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
// Volunteer - Get My Assigned Complaints
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

    const allowedStatuses = ['active', 'assigned', 'under_review', 'responded', 'closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // ✅ Volunteers can update only their assigned complaints
    if (req.user.role === 'volunteer' && complaint.assigned_to?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update complaints assigned to you',
      });
    }

    complaint.status = status;
    if (admin_notes) complaint.admin_notes = admin_notes;
    if (status === 'closed' && !complaint.resolved_at) {
      complaint.resolved_at = new Date();
    }

    await complaint.save();

    await complaint.populate([
      { path: 'created_by', select: 'name email role' },
      { path: 'assigned_to', select: 'name email role' },
    ]);

    // ✅ Send notifications
    await Notification.create({
      user: complaint.created_by,
      title: 'Complaint Updated',
      message: `Your complaint "${complaint.title}" is now marked as ${status}.`,
      link: `/complaints/${complaint._id}`,
    });

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
    const { status, category, page = 1, limit = 10, sort = '-createdAt' } = req.query;

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

// -----------------------------------------------------------------------------
// Sentiment submission and aggregation (Yes/No/Maybe)
// -----------------------------------------------------------------------------
const ComplaintVote = require('../SchemaModels/complaintVotes');
const cache = require('../utils/cache');

// Submit sentiment for a complaint/petition
exports.submitSentiment = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.id;
    const { sentiment } = req.body;

    const allowed = ['Yes', 'No', 'Maybe'];
    if (!allowed.includes(sentiment)) {
      return res.status(400).json({ success: false, message: `Invalid sentiment. Allowed: ${allowed.join(', ')}` });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const vote = new ComplaintVote({ complaint_id: complaintId, user_id: userId, sentiment });
    await vote.save();

    // Invalidate cached results for this complaint
    try { cache.del(`petitionResults:${complaintId}`); } catch (e) { /* noop */ }

    res.status(201).json({ success: true, message: 'Sentiment submitted successfully' });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already submitted sentiment for this petition' });
    }
    res.status(500).json({ success: false, message: 'Failed to submit sentiment', error: error.message });
  }
};

// Get aggregated sentiment results for a complaint/petition
exports.getSentimentResults = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const cacheKey = `petitionResults:${complaintId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    // Aggregate sentiments
    const mongoose = require('mongoose');
    const results = await ComplaintVote.aggregate([
      { $match: { complaint_id: new mongoose.Types.ObjectId(complaintId) } },
      { $group: { _id: '$sentiment', count: { $sum: 1 } } }
    ]);

    const formatted = {};
    let total = 0;
    results.forEach(r => { formatted[r._id] = r.count; total += r.count; });

    // Ensure keys for graphs
    const options = ['Yes', 'No', 'Maybe'];
    options.forEach(opt => { if (!formatted[opt]) formatted[opt] = 0; });

    const percentages = {};
    options.forEach(opt => {
      percentages[opt] = total ? parseFloat(((formatted[opt] / total) * 100).toFixed(2)) : 0;
    });

    const response = { complaintId, results: formatted, total, percentages };
    cache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sentiment results', error: error.message });
  }
};