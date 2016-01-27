'use strict';
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var XMLWriter = require('xml-writer');
var fs = require('fs');

var headers = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  //'Cookie': 'ahtena_is_show=true; _unsign_token=7543f6ce04e4c8b82c4a9f6a940a4cd0; member_auth=0WrMHI4f6jw1gvPERYlkIXZJ4eLQSWKGwo0FjbR%2FtwF3JYkPZ9eom6uYQg1L2SGXkTtKReM; user=9063114%22Sean%22images%2Favatar_new%2F181%2F9063114_1419598323_1.jpg%222%225929%22%3Ca+href%3D%27%2Fwebsitehelp%23help9_3%27+%3Esi%3C%2Fa%3E%220%225%228635%2245803bb2e9%221453559788; _xiamitoken=b3414445764b2cb7af55b66e7e2521f6; CNZZDATA921634=cnzz_eid%3D383564818-1453559340-%26ntime%3D1453559340; CNZZDATA2629111=cnzz_eid%3D73791827-1453556039-%26ntime%3D1453556039; isg=6567E5F9B42851294E98D1A0D9B80976; l=Ampqw3FskH18sI0CF66QDugmOt4MgO42',
  'Host': 'www.xiami.com',
  'Pragma': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
};

exports.getList = function (link, cb) {
  var songlist = [];
  var dataUrls = [];

  request.get({url: link, headers: headers}, function (err, res, body) {
    var $ = cheerio.load(body, {decodeEntities: false});
    var collectionName = $('.info_collect_main h2').text();
    var pattern = /(www.xiami.com\/collect\/)(\d+)(\?.+)/;
    var result = link.match(pattern);
    for (let i = 1; i < 100; i++) {
      var dataUrl = 'http://www.xiami.com/collect/ajax-get-list?id=' + result[2];
      dataUrl += '&p=' + i;
      dataUrls.push(dataUrl);
    }

    async.eachSeries(dataUrls, function (url, cb) {
      request.get({url: url, headers: headers}, function (err, res, body) {
        if (err) throw err;
        var result = JSON.parse(body);
        if (result && result['result'] && result['result']['data']) {
          var data = result['result']['data'];
          if (data.length > 0) {
            for (var songInfo of
            data
          )
            {
              var songName = songInfo['name'];
              var artistName = songInfo['artist_name'];
              songlist.push(artistName + ' - ' + songName + '.mp3');
            }
          } else {
            return cb('over');
          }
        }
        cb();
      });

    }, function () {
      console.log('ok...');
      var xw = new XMLWriter();
      xw.startDocument();
      xw.startElement('List').writeAttribute('ListName', collectionName);
      for (var song of
      songlist
      )
      {
        xw.startElement('File');
        xw.writeElement('FileName', song);
        xw.endElement();
      }
      xw.endElement();
      xw.endDocument();
      var result = xw.toString();
      cb(result);
    });


  });
};

