const mongoose = require('mongoose');
require('dotenv').config();
const { aggregatePollResults } = require('./utils/aggregationService');
const Poll = require('./SchemaModels/polls');
const Vote = require('./SchemaModels/votes');

// Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test function
async function testPollResults() {
  try {
    // Create a test poll
    const testPoll = new Poll({
      title: 'Test Poll',
      options: ['Yes', 'No', 'Maybe'],
      created_by: new mongoose.Types.ObjectId(),
      target_location: 'Test Location'
    });
    
    await testPoll.save();
    console.log('Test poll created:', testPoll._id);
    
    // Create test votes
    const votes = [
      { poll_id: testPoll._id, user_id: new mongoose.Types.ObjectId(), selected_option: 'Yes' },
      { poll_id: testPoll._id, user_id: new mongoose.Types.ObjectId(), selected_option: 'Yes' },
      { poll_id: testPoll._id, user_id: new mongoose.Types.ObjectId(), selected_option: 'No' },
      { poll_id: testPoll._id, user_id: new mongoose.Types.ObjectId(), selected_option: 'Maybe' },
      { poll_id: testPoll._id, user_id: new mongoose.Types.ObjectId(), selected_option: 'Yes' }
    ];
    
    await Vote.insertMany(votes);
    console.log('Test votes created');
    
    // Get aggregated results
    const results = await aggregatePollResults(testPoll._id, false);
    console.log('Aggregated results:', JSON.stringify(results, null, 2));
    
    // Test caching
    console.log('Testing cache...');
    const cachedResults = await aggregatePollResults(testPoll._id, true);
    console.log('Cached results:', JSON.stringify(cachedResults, null, 2));
    
    // Clean up
    await Vote.deleteMany({ poll_id: testPoll._id });
    await Poll.findByIdAndDelete(testPoll._id);
    console.log('Test data cleaned up');
    
    return results;
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the test
testPollResults()
  .then(results => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });