const express = require('express');
const router = express.Router();
const Petition = require('../SchemaModels/petition');
const { Parser } = require('json2csv'); // npm i json2csv

router.get('/engagement', async (req, res) => {
  try {
    // Aggregate petitions per month, status, etc.
    const report = await Petition.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/export', async (req, res) => {
  try {
    const petitions = await Petition.find({});
    const fields = ['title', 'category', 'location', 'status', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(petitions);

    res.header('Content-Type', 'text/csv');
    res.attachment('petitions_report.csv');
    return res.send(csv);
    // For PDF: Use pdfkit or similar npm module for custom export
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
