'use strict';
const express = require('express');
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');
const faker = require('faker');

const should = chai.should();
const {BlogPost} = require('../models');
const {runServer, app, closeServer} = require('../server');
// const {DATABASE_URL} = require('../config');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogPostData() {
  console.info('seeding blog post data');
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push({
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      title: faker.lorem.sentence(),
      content: faker.lorem.text()
    });
  }
  // this will return a promise
  return BlogPost.insertMany(seedData);
}

function tearDownDb(){
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blog Post API testing', function(){
  before(function(){
    return runServer(TEST_DATABASE_URL, 8888);
  });

  beforeEach(function(){
    return seedBlogPostData();
  });
  
  afterEach(function(){
    return tearDownDb();
  });

  after(function(){
    return closeServer();
  });

  describe('GET endpoint', function(){
    it('should return all blog post data', function(){
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res){
          res = _res;
          res.should.have.status(200);
          //console.log(res.body);
          res.body.should.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count){
          //console.log(res.body);
         // console.log(count);
          // res.body.should.have.length.of(count);
          // res.body.length.should.equal(count);
          res.body.should.have.lengthOf(count);
        });
    });
    it('should return posts with right fileds', function(){
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res){
          res.should.have.status(200);        
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function(post) {
            post.should.be.a('object');
            post.should.include.keys(
              'title', 'author', 'content');
          });
          resPost = res.body[0];
          return BlogPost.findById(resPost.id);
        })
        .then(function(post){
          console.log('logging respost author', resPost.author);
          console.log('logging post author', post.author);
          resPost.author.should.equal(post.author.firstName+' '+post.author.lastName);
          resPost.content.should.equal(post.content);
          resPost.title.should.equal(post.title);
        });
    });
  });
  
  // describe('POST endpoint', function(){
  //   it('should insert new blog post data', function(){

  //   });
  // });
  // describe('PUT endpoint', function(){
  //   it('should update new blog post data', function(){

  //   });
  // });
  // describe('DELETE endpoint', function(){
  //   it('should delete specific data', function(){

  //   });
  // });


});