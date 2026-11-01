const { spawn } = require('child_process');
const path = require('path');

const baseUrl = 'http://localhost:3000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- STARTING SERVER FOR TESTING ---');
  const serverProcess = spawn('node', ['app.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    // console.log(`[Server stdout] ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server stderr] ${data}`);
  });

  // Give server 2 seconds to connect to DB and start listening
  await sleep(2000);

  let passedCount = 0;
  let failedCount = 0;

  async function testCase(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failedCount++;
    }
  }

  try {
    // Test 1: GET /
    await testCase('Root route GET /', async () => {
      const res = await fetch(`${baseUrl}/`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const text = await res.text();
      if (!text.includes('Welcome')) throw new Error(`Unexpected body: ${text}`);
    });

    // Test 2: GET /books/ (Retrieve all books)
    await testCase('API 1: GET /books/ - Retrieve all books', async () => {
      const res = await fetch(`${baseUrl}/books/`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const books = await res.json();
      if (!Array.isArray(books)) throw new Error('Response is not an array');
      if (books.length < 10) throw new Error(`Expected at least 10 books, got ${books.length}`);
      console.log(`       Retrieved ${books.length} books. First book: "${books[0].title}" by ${books[0].author}`);
    });

    // Test 3: GET /books/:bookId/ (Retrieve existing book)
    await testCase('API 2: GET /books/1/ - Retrieve book with ID 1', async () => {
      const res = await fetch(`${baseUrl}/books/1/`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const book = await res.json();
      if (book.id !== 1) throw new Error(`Expected id 1, got ${book.id}`);
      if (book.title !== 'The Alchemist') throw new Error(`Expected 'The Alchemist', got '${book.title}'`);
      console.log(`       Found: "${book.title}", Price: ${book.price}, Pages: ${book.pages}`);
    });

    // Test 4: GET /books/999/ (Non-existent book ID - 404)
    await testCase('API 2: GET /books/999/ - Handle missing record (404)', async () => {
      const res = await fetch(`${baseUrl}/books/999/`);
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
      const data = await res.json();
      if (!data.error) throw new Error('Expected error message in response');
      console.log(`       Received 404 as expected: "${data.error}"`);
    });

    // Test 5: GET /books/invalid/ (Invalid ID - 400)
    await testCase('API 2: GET /books/abc/ - Handle invalid ID format (400)', async () => {
      const res = await fetch(`${baseUrl}/books/abc/`);
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const data = await res.json();
      if (!data.error) throw new Error('Expected error message in response');
      console.log(`       Received 400 as expected: "${data.error}"`);
    });

    // Test 6: POST /books/ (Add a new book)
    let newBookId = null;
    await testCase('API 3: POST /books/ - Add new book', async () => {
      const newBook = {
        title: 'Node.js in Action',
        author: 'Alex Young',
        price: 550,
        pages: 432
      };
      const res = await fetch(`${baseUrl}/books/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const data = await res.json();
      if (!data.bookId) throw new Error('Missing bookId in response');
      newBookId = data.bookId;
      console.log(`       Created book with ID: ${newBookId}, message: "${data.message}"`);
    });

    // Test 7: Verify newly added book with GET
    await testCase(`Verify POST via GET /books/${newBookId}/`, async () => {
      const res = await fetch(`${baseUrl}/books/${newBookId}/`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const book = await res.json();
      if (book.title !== 'Node.js in Action') throw new Error(`Mismatch title: ${book.title}`);
      console.log(`       Verified added book in DB: "${book.title}" by ${book.author}`);
    });

    // Test 8: POST /books/ with missing fields (400 validation error)
    await testCase('API 3: POST /books/ - Handle missing fields (400)', async () => {
      const res = await fetch(`${baseUrl}/books/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Incomplete Book' })
      });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const data = await res.json();
      console.log(`       Received 400 as expected: "${data.error}"`);
    });

    // Test 9: PUT /books/:bookId/ (Update existing book)
    await testCase(`API 4: PUT /books/${newBookId}/ - Update book details`, async () => {
      const updatedData = {
        title: 'Node.js in Action (Second Edition)',
        author: 'Alex Young & Bradley Meck',
        price: 620,
        pages: 450
      };
      const res = await fetch(`${baseUrl}/books/${newBookId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      console.log(`       Updated: "${data.message}"`);
    });

    // Test 10: Verify updated book with GET
    await testCase(`Verify PUT via GET /books/${newBookId}/`, async () => {
      const res = await fetch(`${baseUrl}/books/${newBookId}/`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const book = await res.json();
      if (book.title !== 'Node.js in Action (Second Edition)') throw new Error(`Title not updated`);
      if (book.price !== 620) throw new Error(`Price not updated`);
      console.log(`       Verified updated values: "${book.title}", Price: ${book.price}`);
    });

    // Test 11: PUT /books/999/ (Update non-existent book - 404)
    await testCase('API 4: PUT /books/999/ - Handle update on missing record (404)', async () => {
      const res = await fetch(`${baseUrl}/books/999/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Non Existent' })
      });
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
      const data = await res.json();
      console.log(`       Received 404 as expected: "${data.error}"`);
    });

    // Test 12: DELETE /books/:bookId/ (Delete existing book)
    await testCase(`API 5: DELETE /books/${newBookId}/ - Delete book`, async () => {
      const res = await fetch(`${baseUrl}/books/${newBookId}/`, {
        method: 'DELETE'
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      console.log(`       Deleted: "${data.message}"`);
    });

    // Test 13: Verify deleted book is gone with GET
    await testCase(`Verify DELETE via GET /books/${newBookId}/ (404 expected)`, async () => {
      const res = await fetch(`${baseUrl}/books/${newBookId}/`);
      if (res.status !== 404) throw new Error(`Expected 404 after delete, got ${res.status}`);
      console.log(`       Confirmed book ID ${newBookId} no longer exists in database.`);
    });

    // Test 14: DELETE /books/999/ (Delete non-existent book - 404)
    await testCase('API 5: DELETE /books/999/ - Handle delete on missing record (404)', async () => {
      const res = await fetch(`${baseUrl}/books/999/`, {
        method: 'DELETE'
      });
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
      const data = await res.json();
      console.log(`       Received 404 as expected: "${data.error}"`);
    });

  } finally {
    console.log('\n--- STOPPING SERVER ---');
    serverProcess.kill();
    console.log(`--- TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED ---`);
  }
}

runTests();
