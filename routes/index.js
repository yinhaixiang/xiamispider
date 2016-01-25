var express = require('express');
var async = require('async');
var router = express.Router();
var xiami = require('../xiami/xiami');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'});
});

router.all('/xml', function (req, res) {
  console.log('download...');
  var xiamiListLink = req.query['XiamiListLink'];

  xiami.getList(xiamiListLink, function(file) {
    return res.send(file);
  });


});

module.exports = router;
