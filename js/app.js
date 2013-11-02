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
 * @fileoverview Image upload app.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


var awsAccountId = '459880441775';
var roleArn = 'test-gapi';
var bucketName = 'ydn-db-sample-image-store-s3';


AWS.config.region = 'ap-southeast-1';


var fileChooser = document.getElementById('file-chooser');
var button = document.getElementById('upload-button');
var results = document.getElementById('results');
button.addEventListener('click', function() {
  var file = fileChooser.files[0];
  if (file) {
    var user_id = 'id'; // document.getElementById('user-name').getAttribute('value');
    var objKey = user_id + '/' + file.name;
    results.innerHTML = 'uploadint to ' + objKey;
    //Object key will be facebook-USERID#/FILE_NAME

    var bucket = new AWS.S3({params: {Bucket: bucketName, region: 'ap-southeast-1'}});
    var params = {Key: objKey, ContentType: file.type, Body: file, ACL: 'public-read'};
    bucket.putObject(params, function(err, data) {
      if (err) {
        console.log(err);
        results.innerHTML = 'ERROR: ' + err;
      } else {
        var imageTag = "<img src='" + 'https://s3.amazonaws.com/' +
            bucketName + '/' + objKey + "'></img><br/>";
        results.innerHTML += imageTag;
      }
    });
  } else {
    results.innerHTML = 'Nothing to upload.';
  }
}, false);


function runUploadApp(token) {
  console.log(token);
  AWS.config.credentials = new AWS.WebIdentityCredentials({
    RoleArn: 'arn:aws:iam::' + awsAccountId + ':role/' + roleArn,
    WebIdentityToken: token.id_token
  });
  button.style.display = '';
}

