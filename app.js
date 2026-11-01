const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

const dbPath = path.join(__dirname, 'bookStore.db');
let db = null;

// Function to initialize SQLite DB connection and start Express server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Ensure the book table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Root route
app.get('/', (request, response) => {
  response.status(200).send('Welcome to BDF Lab 2 - Book Store API');
});

// API 1: Retrieve all books
// GET /books/
app.get('/books/', async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT
        *
      FROM
        book
      ORDER BY
        id;
    `;
    const booksArray = await db.all(getBooksQuery);
    response.status(200).json(booksArray);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// API 2: Retrieve a particular book using its ID
// GET /books/:bookId/
app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const parsedId = parseInt(bookId, 10);

    if (isNaN(parsedId)) {
      return response.status(400).json({ error: 'Invalid Book ID. ID must be an integer.' });
    }

    const getBookQuery = `
      SELECT
        *
      FROM
        book
      WHERE
        id = ?;
    `;
    const book = await db.get(getBookQuery, [parsedId]);

    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }

    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// API 3: Add a new book
// POST /books/
app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: 'Missing required book details: title, author, price, and pages are required.'
      });
    }

    const addBookQuery = `
      INSERT INTO
        book (title, author, price, pages)
      VALUES
        (?, ?, ?, ?);
    `;
    const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);
    const bookId = dbResponse.lastID;

    response.status(201).json({
      message: 'Book Added Successfully',
      bookId: bookId
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// API 4: Update an existing book
// PUT /books/:bookId/
app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const parsedId = parseInt(bookId, 10);

    if (isNaN(parsedId)) {
      return response.status(400).json({ error: 'Invalid Book ID. ID must be an integer.' });
    }

    // Check if book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [parsedId]);

    if (!existingBook) {
      return response.status(404).json({ error: 'Book not found' });
    }

    const { title, author, price, pages } = request.body;

    const updatedTitle = title !== undefined ? title : existingBook.title;
    const updatedAuthor = author !== undefined ? author : existingBook.author;
    const updatedPrice = price !== undefined ? price : existingBook.price;
    const updatedPages = pages !== undefined ? pages : existingBook.pages;

    const updateBookQuery = `
      UPDATE
        book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE
        id = ?;
    `;
    await db.run(updateBookQuery, [
      updatedTitle,
      updatedAuthor,
      updatedPrice,
      updatedPages,
      parsedId
    ]);

    response.status(200).json({
      message: 'Book Details Updated Successfully'
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// API 5: Delete a book
// DELETE /books/:bookId/
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const parsedId = parseInt(bookId, 10);

    if (isNaN(parsedId)) {
      return response.status(400).json({ error: 'Invalid Book ID. ID must be an integer.' });
    }

    // Check if book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [parsedId]);

    if (!existingBook) {
      return response.status(404).json({ error: 'Book not found' });
    }

    const deleteBookQuery = `
      DELETE FROM
        book
      WHERE
        id = ?;
    `;
    await db.run(deleteBookQuery, [parsedId]);

    response.status(200).json({
      message: 'Book Deleted Successfully'
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Fallback for undefined routes
app.use((request, response) => {
  response.status(404).json({ error: 'Endpoint Not Found' });
});

module.exports = app;
