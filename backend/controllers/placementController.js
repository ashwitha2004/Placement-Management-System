import PlacementResult from '../models/PlacementResult.js';
import Student from '../models/Student.js';

export const createPlacementResult = async (req, res) => {
  try {
    const {
      studentUserId,
      companyName,
      roleTitle,
      location,
      ctc,
      bond,
      offerType,
      status,
      resultDate,
      joiningDate,
      recruiterName,
      recruiterEmail,
      recruiterPhone,
      rounds,
      eligibility,
      notes
    } = req.body;

    if (!studentUserId || !companyName || !roleTitle) {
      return res.status(400).json({
        success: false,
        message: 'studentUserId, companyName, and roleTitle are required'
      });
    }

    const studentProfile = await Student.findOne({ user: studentUserId });

    const placement = await PlacementResult.create({
      studentUser: studentUserId,
      student: studentProfile?._id,
      companyName,
      roleTitle,
      location,
      ctc,
      bond,
      offerType,
      status,
      resultDate,
      joiningDate,
      recruiterName,
      recruiterEmail,
      recruiterPhone,
      rounds,
      eligibility,
      notes,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      placement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPlacements = async (req, res) => {
  try {
    const { studentUserId } = req.query;
    const userRole = req.user?.role;
    let query = {};

    // Visibility logic for placements:
    // - Students can see all placements (public data)
    // - HR/Admin/Staff can see all placements
    // - If studentUserId is provided, filter by that student
    if (studentUserId) {
      query.studentUser = studentUserId;
    }

    const placements = await PlacementResult.find(query)
      .populate('studentUser', 'name email role')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: placements.length,
      placements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePlacementResult = async (req, res) => {
  try {
    const placement = await PlacementResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement result not found'
      });
    }

    res.status(200).json({
      success: true,
      placement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deletePlacementResult = async (req, res) => {
  try {
    const placement = await PlacementResult.findByIdAndDelete(req.params.id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement result not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Placement result deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
