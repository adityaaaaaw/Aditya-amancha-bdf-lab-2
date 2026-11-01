const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'bookStore.db');

const initialBooks = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 540, pages: 320 },
  { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 420, pages: 281 },
  { id: 4, title: '1984', author: 'George Orwell', price: 300, pages: 328 },
  { id: 5, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 280, pages: 180 },
  { id: 6, title: 'Clean Code', author: 'Robert C. Martin', price: 850, pages: 464 },
  { id: 7, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 920, pages: 352 },
  { id: 8, title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling', price: 499, pages: 309 },
  { id: 9, title: 'Deep Work', author: 'Cal Newport', price: 450, pages: 304 },
  { id: 10, title: 'Zero to One', author: 'Peter Thiel', price: 399, pages: 224 }
];

const initializeDatabase = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database at:', dbPath);

    // Create book table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    // Check existing count
    const countRow = await db.get('SELECT COUNT(*) AS count FROM book;');
    if (countRow.count === 0) {
      console.log('Inserting 10 sample books...');
      for (const book of initialBooks) {
        await db.run(
          `INSERT INTO book (id, title, author, price, pages) VALUES (?, ?, ?, ?, ?);`,
          [book.id, book.title, book.author, book.price, book.pages]
        );
      }
      console.log('Successfully inserted 10 sample book records.');
    } else {
      console.log(`Database already contains ${countRow.count} books.`);
    }

    await db.close();
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  }
};

initializeDatabase();
