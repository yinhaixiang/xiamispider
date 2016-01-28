'use strict';
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var XMLWriter = require('xml-writer');
var xmlBeautifier = require('xml-beautifier');
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
  var urls = [];
  var tempArr = link.split('?');
  var baseUrl = tempArr[0] + '/page/';

  for (let i = 1; i < 10000; i++) {
    var url = baseUrl + i;
    urls.push(url);
  }

  async.eachSeries(urls, function (url, cb) {
    request.get({url: url, headers: headers}, function (err, res, body) {
      var $ = cheerio.load(body, {decodeEntities: false});
      var songListSoup = $('table.track_list').find('tr');
      if (songListSoup.length > 0) {
        console.log('has songs:', url);
        for (let i = 0; i < songListSoup.length; i++) {
          var songInfo = $(songListSoup[i]).find('td.song_name a');
          var songName = $(songInfo[0]).text();
          var artistName = '';
          for (let i = 1; i < songInfo.length; i++) {
            if ($(songInfo[i]).hasClass('artist_name')) {
              artistName = $(songInfo[i]).text();
              break;
            }
          }
          songlist.push(artistName + ' - ' + songName + '.mp3');
        }
      } else {
        return cb('over');
      }
      cb();
    });

  }, function () {
    console.log('ok...');
    var xw = new XMLWriter();
    xw.startDocument();
    xw.startElement('List').writeAttribute('ListName', '虾米红心');
    for (var song of songlist) {
      xw.startElement('File');
      xw.writeElement('FileName', song);
      xw.endElement();
    }
    xw.endElement();
    xw.endDocument();
    var result = xw.toString();
    result = xmlBeautifier(result);
    cb(result);
  });
};

