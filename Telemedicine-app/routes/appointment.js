const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
// Book Appointment
router.post('/', async (req, res) => {
  const { patient, doctor, date, time } = req.body;
  try {
    const appointment = new Appointment({ patient, doctor, date, time });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Get Appointments (for Doctor/Patient)
router.get('/:userId', async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ patient: req.params.userId }, { doctor: req.params.userId }]
    }).populate('patient doctor');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;