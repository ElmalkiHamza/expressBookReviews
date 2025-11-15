const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  return !users.find(user => user.username === username)
}

const authenticatedUser = (username, password) => { //returns boolean
  const user = users.find(user => user.username === username)

  if (!user || user.password !== password) {
    return false
  } else {
    return true
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const {username, password} = req.body
  
  if (!username || !password) {
    return res.status(400).json({message: "Username or password is missing"}) 
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({message: "Username or password is incorrect"})
  }

  const token = jwt.sign({username}, "my_secret_key", {expiresIn: "30m"})
  req.session.jwt = token

  return res.status(200).json({ message: `Welcome, ${username}` });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
 
  const book = books[isbn]
  if (!book) {
    return res.status(404).json({message: `Book with ISBN '${isbn}' is not found`})
  }

  const comment = req.body.review
  if (!comment) {
    return res.status(400).json({message: "The review is missing"})
  }

  const username = req.user.username
  book.reviews[username] = comment

  return res.status(200).json({message: `Review by ${username} added successfuly to the book ${isbn}`})
});

// Delete a book by ISBN
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const book = books[isbn]
  if (!book) {
    return res.status(404).json({message: `Book with ISBN '${isbn}' is not found`})
  }

  const username = req.user.username
  if (!book.reviews[username]) {
    return res.status(404).json({message: `${username} has not posted a review on the book whose ISBN is ${isbn}`})
  }

  delete book.reviews[username]
  return res.status(200).json({message: "Book review is deleted successfuly"})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
