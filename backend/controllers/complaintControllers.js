
const Complaint = require('../SchemaModels/complaints');
const User = require('../SchemaModels/user');

exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      photo_url,
      location,
      priority,
      admin_notes
    } = req.body;

    // Create complaint with authenticated user as creator (Citizen)
    const complaint = new Complaint({
      title,
      description,
      category,
      photo_url,
      location,
      priority,
      admin_notes,
      created_by: req.user.id,
      status: 'received'
    });

    await complaint.save();
    await complaint.populate('created_by', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message
    });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      assigned_to,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assigned_to) filter.assigned_to = assigned_to;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with filters, pagination, and sorting
    const complaints = await Complaint.find(filter)
      .populate('created_by', 'name email role')
      .populate('assigned_to', 'name email role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination metadata
    const totalComplaints = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComplaints / parseInt(limit)),
        totalComplaints,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};


exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteer_id } = req.body;

    // Validate volunteer exists and has correct role
    const volunteer = await User.findById(volunteer_id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Check if user has appropriate role (must be volunteer)
    if (volunteer.role !== 'volunteer') {
      return res.status(400).json({
        success: false,
        message: 'User must have volunteer role',
        error: `User role is '${volunteer.role}'`
      });
    }

    // Find and update complaint
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.assigned_to = volunteer_id;
    complaint.status = 'in_review';
    await complaint.save();

    // Populate references
    await complaint.populate([
      { path: 'created_by', select: 'name email role' },
      { path: 'assigned_to', select: 'name email role' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint',
      error: error.message
    });
  }
};

exports.getMyAssignedComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build filter - only complaints assigned to logged-in volunteer
    const filter = { assigned_to: req.user.id };

    if (status) filter.status = status;
    if (category) filter.category = category;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
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
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned complaints',
      error: error.message
    });
  }
};


exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    // Validate status
    const allowedStatuses = ['received', 'in_review', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    // Find complaint
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if volunteer is assigned (unless user is admin)
    if (req.user.role === 'volunteer') {
      if (!complaint.assigned_to || complaint.assigned_to.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update complaints assigned to you',
          error: 'Not authorized to update this complaint'
        });
      }
    }

    // Update status
    complaint.status = status;
    if (admin_notes) complaint.admin_notes = admin_notes;

    // Set resolved_at timestamp if status is resolved
    if (status === 'resolved' && !complaint.resolved_at) {
      complaint.resolved_at = new Date();
    }

    await complaint.save();

    await complaint.populate([
      { path: 'created_by', select: 'name email role' },
      { path: 'assigned_to', select: 'name email role' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message
    });
  }
};
