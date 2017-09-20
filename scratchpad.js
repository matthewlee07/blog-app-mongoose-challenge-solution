'use strict';
const mongoose = require('mongoose');
const {DATABASE_URL, PORT} = require('./config');

const {BlogPost} = require('./models');

BlogPost.create({
  author: {
    firstName: 'Matt',
    lastName: 'Giri'
  },
  content: 'Anything',
  title: 'Test'
}).then(result => console.log(result));

mongoose.connect(DATABASE_URL);