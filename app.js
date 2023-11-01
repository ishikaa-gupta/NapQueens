const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3001; 
const mongoURI = 'mongodb://localhost:27017/mydata'; 

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const { body, validationResult } = require('express-validator');

const Post = mongoose.model('Post', {
  title: String,
  content: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  category_id: String,
});

app.use(bodyParser.json());

const validatePost = [
  body('title').isString().isLength({ min: 5 }),
  body('content').isString().isLength({ min: 10 }),
  body('category_id').isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/posts', validatePost, async (req, res) => {

  const { title, content, category_id } = req.body;

  const newPost = new Post({
    title,
    content,
    category_id,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create a new blog post' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


module.exports = app;