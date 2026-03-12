import Onboarding from '../models/Onboarding.js';

export const createOnboarding = async (req, res) => {
  try {
    const { employeeName, position } = req.body;

    if (!employeeName || !position) {
      return res.status(400).json({
        success: false,
        message: 'employeeName and position are required'
      });
    }

    const onboarding = await Onboarding.create({
      ...req.body,
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      onboarding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOnboarding = async (req, res) => {
  try {
    const items = await Onboarding.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      onboarding: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding record not found'
      });
    }

    res.status(200).json({
      success: true,
      onboarding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndDelete(req.params.id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding record deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
