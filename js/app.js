// Copyright 2013 YDN Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Image upload app with AWS S3 backend.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


var awsAccountId = '459880441775';
var roleArn = 'test-gapi';
var bucketName = 'ydn-db-sample-image-store-s3';
var dbName = 'sample-image-store-s3';

var schema = {
  version: 2,
  stores: [{
    name: 'photo-meta',
    keyPath: 'Key',
    Sync: {
      format: 's3-meta',
      Options: {
        bucket: bucketName
      }
    }
  }, {
    name: 'photo',
    fixed: true,
    Sync: {
      metaStoreName: 'photo-meta',
      format: 's3',
      Options: {
        bucket: bucketName
      }
    }
  }]
};
var db = new ydn.db.Storage(dbName, schema);

AWS.config.region = 'ap-southeast-1';
var bucket;
var user_id;

var file_chooser = document.getElementById('file-chooser');
var btn_upload = document.getElementById('upload-button');
var results = document.getElementById('results');
var div_listing = document.getElementById('listing');
btn_upload.addEventListener('click', function() {
  var file = file_chooser.files[0];
  if (file) {
    var objKey = file.name;
    results.innerHTML = 'uploading to ' + objKey;
    var params = {Key: objKey, ContentType: file.type, Body: file, ACL: 'public-read'};
    var req = db.put('photo', file, objKey);
    req.then(function(data) {
      var imageTag = "<img src='" + '//' + bucketName + '.s3.amazonaws.com/' +
          objKey + "'></img><br/>";
      results.innerHTML += imageTag;
    }, function(err) {
      console.log(err);
      results.innerHTML = 'ERROR: ' + err;
    });
  } else {
    results.innerHTML = 'Nothing to upload.';
  }
}, false);

var btn_list = document.getElementById('list');
btn_list.onclick = function(e) {
  db.values('photo-meta').then(function(keys) {
    console.log(keys);
    var tx = [{
      tag: 'li',
      html: '${Key}'
    }];
    var html = json2html.transform(keys, tx);
    div_listing.innerHTML = '<ul>' + html + '</ul>';
  }, function(err) {
    throw err;
  });
};

function runUploadApp(token) {
  // console.log(token);
  if (!token) {
    return;
  }
  AWS.config.credentials = new AWS.WebIdentityCredentials({
    RoleArn: 'arn:aws:iam::' + awsAccountId + ':role/' + roleArn,
    WebIdentityToken: token.id_token
  });
  user_id = document.getElementById('user-name').getAttribute('value');
  document.getElementById('s3-toolbar').style.display = '';
}

