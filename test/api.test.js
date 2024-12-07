const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app'); // Update path as necessary

describe('POST /api/upload', () => {
  it('uploads a file and returns a CID', async () => {
    const testFilePath = path.join(__dirname, 'testFile.txt');
    
    // Create a test file
    fs.writeFileSync(testFilePath, 'This is a test file.');

    // Perform the API call
    const response = await request(app)
      .post('/api/upload')
      .attach('file', testFilePath) // Attach file with the key 'file'
      .expect(200);

    // Validate response
    expect(response.body).toHaveProperty('cid'); // Expect 'cid' in the response

    // Clean up the test file
    fs.unlinkSync(testFilePath);
  });

  it('returns 400 when no file is uploaded', async () => {
    const response = await request(app)
      .post('/api/upload')
      .expect(400);

    // Validate response
    expect(response.body).toEqual({ error: 'No file provided' });
  });
});
