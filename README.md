# BDF Lab 2: SQLite Database and CRUD Routes

## Student Details
- **Student Name:** Aditya Amancha
- **Registration Number:** 252U1R5005
- **Section:** AI & DE-2A

---

## Project Overview
This project is an Express.js and SQLite backend application developed for Backend Development Fundamentals (BDF) Lab 2. It implements a complete RESTful API supporting all five CRUD (Create, Read, Update, Delete) operations on a `book` entity stored in a persistent SQLite database (`bookStore.db`).

The application strictly utilizes:
- Asynchronous programming with `async/await`
- Parameterized SQL queries with `?` placeholders to safeguard against SQL injection
- Comprehensive HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`)
- Robust error handling for invalid input, non-existent records, and database exceptions
- Clean and modular code architecture suitable for evaluation and viva explanations

---

## Technologies Used
- **Runtime:** Node.js (v22+)
- **Framework:** Express.js (`^5.3.0`)
- **Database:** SQLite (`sqlite3` driver `^6.0.1` and `sqlite` wrapper `^5.1.1`)
- **Development Tool:** Nodemon (`^3.1.14`) for live server reloading

---

## Project Folder Structure

```
bdf-lab2/
├── app.js            # Main Express application, DB initialization, and 5 CRUD routes
├── bookStore.db      # SQLite database file containing the 'book' table
├── setupDb.js        # Database setup and sample data initialization script
├── test-apis.js      # Automated test runner verifying all 5 endpoints and edge cases
├── package.json      # Project dependencies and npm scripts
├── .gitignore        # Ignores node_modules, env files, and OS artifacts
└── README.md         # Comprehensive project documentation and API manual
```

---

## Database Schema & Initial Data

### Table: `book`
| Column Name | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for each book |
| `title` | TEXT | NOT NULL | Title of the book |
| `author` | TEXT | NOT NULL | Author of the book |
| `price` | INTEGER | NOT NULL | Price of the book in INR |
| `pages` | INTEGER | NOT NULL | Total page count |

### Preloaded Sample Records (10 Books)
1. *The Alchemist* by Paulo Coelho (Price: 350, Pages: 208)
2. *Atomic Habits* by James Clear (Price: 540, Pages: 320)
3. *To Kill a Mockingbird* by Harper Lee (Price: 420, Pages: 281)
4. *1984* by George Orwell (Price: 300, Pages: 328)
5. *The Great Gatsby* by F. Scott Fitzgerald (Price: 280, Pages: 180)
6. *Clean Code* by Robert C. Martin (Price: 850, Pages: 464)
7. *The Pragmatic Programmer* by Andrew Hunt (Price: 920, Pages: 352)
8. *Harry Potter and the Sorcerer's Stone* by J.K. Rowling (Price: 499, Pages: 309)
9. *Deep Work* by Cal Newport (Price: 450, Pages: 304)
10. *Zero to One* by Peter Thiel (Price: 399, Pages: 224)

---

## Installation & Setup

1. **Navigate to the project folder:**
   ```bash
   cd "C:\Users\ADITYA\OneDrive\Documents\labs backend\bdf-lab2"
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Re-initialize Database with Sample Data:**
   *(Note: `bookStore.db` is already pre-configured with 10 books)*
   ```bash
   npm run setup-db
   ```

---

## Running the Server

### Option 1: Development Mode with Nodemon (Recommended)
This automatically restarts the server whenever changes are saved:
```bash
npm run dev
```

### Option 2: Production Mode with Node
```bash
npm start
```

Upon successful startup, the console displays:
```
Server Running at http://localhost:3000/
```

---

## API Endpoints Summary

| HTTP Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` | Welcome and Health Check | `200 OK` |
| `GET` | `/books/` | Retrieve all books | `200 OK`, `500 Server Error` |
| `GET` | `/books/:bookId/` | Retrieve a specific book by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/books/` | Add a new book | `201 Created`, `400 Bad Request`, `500 Server Error` |
| `PUT` | `/books/:bookId/` | Update an existing book by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/books/:bookId/` | Delete a book by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

## Example Requests and Responses

### 1. GET `/books/` (Retrieve all books)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books/`
- **Status:** `200 OK`
- **Response:**
  ```json
  [
    {
      "id": 1,
      "title": "The Alchemist",
      "author": "Paulo Coelho",
      "price": 350,
      "pages": 208
    },
    {
      "id": 2,
      "title": "Atomic Habits",
      "author": "James Clear",
      "price": 540,
      "pages": 320
    }
  ]
  ```

---

### 2. GET `/books/:bookId/` (Retrieve single book)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books/1/`
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "id": 1,
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "price": 350,
    "pages": 208
  }
  ```

- **Error Case - Non-existent ID:** `GET /books/999/`
  - **Status:** `404 Not Found`
  - **Response:**
    ```json
    {
      "error": "Book not found"
    }
    ```

- **Error Case - Invalid ID Format:** `GET /books/abc/`
  - **Status:** `400 Bad Request`
  - **Response:**
    ```json
    {
      "error": "Invalid Book ID. ID must be an integer."
    }
    ```

---

### 3. POST `/books/` (Add new book)
- **Method:** `POST`
- **URL:** `http://localhost:3000/books/`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Node.js in Action",
    "author": "Alex Young",
    "price": 550,
    "pages": 432
  }
  ```
- **Status:** `201 Created`
- **Response:**
  ```json
  {
    "message": "Book Added Successfully",
    "bookId": 11
  }
  ```

---

### 4. PUT `/books/:bookId/` (Update book)
- **Method:** `PUT`
- **URL:** `http://localhost:3000/books/11/`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Node.js in Action (Second Edition)",
    "author": "Alex Young & Bradley Meck",
    "price": 620,
    "pages": 450
  }
  ```
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "message": "Book Details Updated Successfully"
  }
  ```

---

### 5. DELETE `/books/:bookId/` (Delete book)
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/books/11/`
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "message": "Book Deleted Successfully"
  }
  ```

---

## Testing Instructions

### Automated Testing
An automated test runner is included in the project. It starts the server, executes 14 separate test cases across all five CRUD endpoints and error conditions, verifies SQLite database persistence, and gracefully terminates the test server.

Run the test suite with:
```bash
npm test
```

### Manual Testing with Postman
1. Start the server using `npm run dev`.
2. Open Postman and create a new collection named `BDF Lab 2`.
3. Create individual requests for:
   - `GET http://localhost:3000/books/`
   - `GET http://localhost:3000/books/1/`
   - `POST http://localhost:3000/books/` (Body > raw > JSON)
   - `PUT http://localhost:3000/books/1/` (Body > raw > JSON)
   - `DELETE http://localhost:3000/books/10/`
4. Verify the status code (e.g., `200 OK`, `201 Created`) and the JSON response for each request.

---

## Problems Faced and Solutions
*Placeholder section for lab record documentation:*
- **Challenge:** [Enter any problem encountered here, e.g., handling asynchronous database initialization before starting the Express server]
- **Solution:** [Enter the resolution here, e.g., wrapped `db.open()` and `app.listen()` inside an async `initializeDBAndServer()` function]
