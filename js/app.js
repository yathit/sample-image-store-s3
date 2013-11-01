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


var appId = '225178760975988';
var roleArn = 's3-web-user';
var bucketName = 'ydn-db-sample-image-store-s3'
var fbUserId;

var bucket = new AWS.S3({params: {Bucket: bucketName}});

var fileChooser = document.getElementById('file-chooser');
var button = document.getElementById('upload-button');
var results = document.getElementById('results');
button.addEventListener('click', function() {
  var file = fileChooser.files[0];
  if (file) {
    results.innerHTML = '';

    //Object key will be facebook-USERID#/FILE_NAME
    var objKey = 'facebook-' + fbUserId + '/' + file.name;
    var params = {Key: objKey, ContentType: file.type, Body: file, ACL: 'public-read'};
    bucket.putObject(params, function (err, data) {
      if (err) {
        results.innerHTML = 'ERROR: ' + err;
      } else {
        var imageTag = "<img src='" + "https://s3.amazonaws.com/" +
            bucketName + "/" + objKey + "'></img><br/>";
        results.innerHTML += imageTag;
      }
    });
  } else {
    results.innerHTML = 'Nothing to upload.';
  }
}, false);

/*!
 * Login to your application using Facebook.
 * Uses the Facebook SDK for JavaScript available here:
 * https://developers.facebook.com/docs/javascript/gettingstarted/
 */
window.fbAsyncInit = function() {
  FB.init({ appId: appId });
  FB.login(function(response) {
    bucket.config.credentials = new AWS.WebIdentityCredentials({
      ProviderId: 'graph.facebook.com',
      RoleArn: roleArn,
      WebIdentityToken: response.authResponse.accessToken
    });
    fbUserId = response.authResponse.userID;
    button.style.display = 'block';
  });
};

// Load the Facebook SDK asynchronously
(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));