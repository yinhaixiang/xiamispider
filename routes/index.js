var express = require('express');
var async = require('async');
var router = express.Router();
var spider = require('../spider/spider');
var spider2 = require('../spider/spider2');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'});
});

router.all('/xml', function (req, res) {
  var xiamiListLink = req.query['XiamiListLink'];
  if(xiamiListLink.indexOf('lib-song') > 0) {
    console.log('download lib-song...');
    spider.getList(xiamiListLink, function(file) {
      return res.send(file);
    });
  } else {
    console.log('download collect...');
    spider2.getList(xiamiListLink, function(file) {
      return res.send(file);
    });
  }




});

module.exports = router;
