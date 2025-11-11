/*const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Petition = require('../SchemaModels/petition');
const Complaint = require('../SchemaModels/complaints');

// -----------------------------------------------------------------------------
// Combined Engagement Report (JSON)
// -----------------------------------------------------------------------------
router.get('/engagement', async (req, res) => {
  try {
    const petitionStats = await Petition.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } }
    ]);
    const complaintStats = await Complaint.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      petitions: petitionStats,
      complaints: complaintStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
});

// -----------------------------------------------------------------------------
// Export Report as CSV
// -----------------------------------------------------------------------------
router.get('/export/csv', async (req, res) => {
  try {
    const petitions = await Petition.find().select('title category location status createdAt');
    const complaints = await Complaint.find().select('title category location status createdAt');

    const fields = ['type', 'title', 'category', 'status', 'location', 'createdAt'];
    const combined = [
      ...petitions.map(p => ({ type: 'Petition', ...p.toObject() })),
      ...complaints.map(c => ({ type: 'Complaint', ...c.toObject() }))
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(combined);

    res.header('Content-Type', 'text/csv');
    res.attachment('civic_engagement_report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'CSV export failed', error: error.message });
  }
});

// -----------------------------------------------------------------------------
// Export Report as PDF
// -----------------------------------------------------------------------------
router.get('/export/pdf', async (req, res) => {
  try {
    const petitions = await Petition.find().select('title category location status createdAt');
    const complaints = await Complaint.find().select('title category location status createdAt');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="civic_engagement_report.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('Civic Engagement Report', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(14).text('📜 Petitions', { underline: true });
    petitions.forEach(p => {
      doc.fontSize(12).text(`• ${p.title} (${p.status}) — ${p.category} — ${p.location}`);
    });

    doc.moveDown(1);
    doc.fontSize(14).text('🧾 Complaints', { underline: true });
    complaints.forEach(c => {
      doc.fontSize(12).text(`• ${c.title} (${c.status}) — ${c.category} — ${c.location?.city || 'N/A'}`);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'PDF export failed', error: error.message });
  }
});

module.exports = router;
*/
const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Poll = require('../SchemaModels/polls'); // ✅ use Poll model instead of Petition
const Complaint = require('../SchemaModels/complaints');

// -----------------------------------------------------------------------------
// 📊 Combined Engagement Report (JSON)
// -----------------------------------------------------------------------------
router.get('/engagement', async (req, res) => {
  try {
    // ✅ Group polls by status (e.g., 'active', 'closed')
    const pollStats = await Poll.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } },
    ]);

    // ✅ Group complaints by status
    const complaintStats = await Complaint.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      polls: pollStats,
      complaints: complaintStats,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to generate report', error: error.message });
  }
});

// -----------------------------------------------------------------------------
// 📄 Export Report as CSV
// -----------------------------------------------------------------------------
router.get('/export/csv', async (req, res) => {
  try {
    const polls = await Poll.find().select('title category status createdAt');
    const complaints = await Complaint.find().select('title category location status createdAt');

    const fields = ['type', 'title', 'category', 'status', 'location', 'createdAt'];
    const combined = [
      ...polls.map((p) => ({ type: 'Poll', location: 'N/A', ...p.toObject() })),
      ...complaints.map((c) => ({ type: 'Complaint', ...c.toObject() })),
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(combined);

    res.header('Content-Type', 'text/csv');
    res.attachment('civic_engagement_report.csv');
    res.send(csv);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'CSV export failed', error: error.message });
  }
});

// -----------------------------------------------------------------------------
// 🧾 Export Report as PDF
// -----------------------------------------------------------------------------
router.get('/export/pdf', async (req, res) => {
  try {
    const polls = await Poll.find().select('title category status createdAt');
    const complaints = await Complaint.find().select('title category location status createdAt');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="civic_engagement_report.pdf"'
    );
    doc.pipe(res);

    doc.fontSize(20).text('Civic Engagement Report', { align: 'center' });
    doc.moveDown(1.5);

    // ✅ Polls Section
    doc.fontSize(14).text('📊 Polls', { underline: true });
    polls.forEach((p) => {
      doc
        .fontSize(12)
        .text(`• ${p.title} (${p.status}) — ${p.category || 'Uncategorized'}`);
    });

    doc.moveDown(1);

    // ✅ Complaints Section
    doc.fontSize(14).text('🧾 Complaints', { underline: true });
    complaints.forEach((c) => {
      doc
        .fontSize(12)
        .text(`• ${c.title} (${c.status}) — ${c.category} — ${c.location?.city || 'N/A'}`);
    });

    doc.end();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'PDF export failed', error: error.message });
  }
});

module.exports = router;
