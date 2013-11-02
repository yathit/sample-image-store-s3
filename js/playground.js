/**
 * Licensed under the AWS Customer Agreement (the "License"). 
 * You may not use this file except in compliance with the License. 
 * A copy of the License is located at http://aws.amazon.com/agreement/
 */

  /**
   * The following code is for AssumeRoleWithWebIdentity.
   */
  $(function () {
    $('#assume_role').click(function() {
        var idToken,
            ajaxData = {},
            URL = 'https://sts.amazonaws.com/';

      // For Facebook and Amazon we need to add the provider ID. Not for google
      if(providerName != 'google') {
        ajaxData['ProviderId'] = validateInput($('.provider-id').val());
      }
      // ajaxData contains all of the parameters needed to make a call to AssumeRoleWithWebIdentity
      ajaxData['DurationSeconds'] = 900; // Optional, defaults to 3600s (1 hour)
      ajaxData['Action'] = 'AssumeRoleWithWebIdentity';
      ajaxData['Version']= '2011-06-15';
      // The following three values are taken from the fields you set in Step Two. 
      ajaxData['RoleSessionName'] = validateInput($('.role-session-name').val());
      ajaxData['RoleArn'] = validateInput($('.role-arn').val());
      ajaxData['WebIdentityToken'] = validateInput(decodeURIComponent($('.web-identity-token').val()));

      // IE<10 uses XDomainRequest for CORS. All other browsers use XMLHttpRequest.
      if (!($('html').hasClass('not-ie'))) {
        xhr = new XDomainRequest();
        var ieURL = URL + '?';
        $.each(ajaxData, function(key, value) {
          ieURL = ieURL + key + '=' + value + '&';
        });
        ieURL = ieURL.slice(0,-1);
        xhr.open('GET', ieURL);
        xhr.onload = function() {
          assumeRoleSuccess(xhr.responseText);
        }
        xhr.onerror = function() {
          assumeRoleError('There was an error with the call to AssumeRoleWithWebIdentity. You will not be able to see the error response on Internet Explorer ' +
              '9 or earlier. If you wish to see the error message, please switch to another browser.');
        }
        xhr.send();
      } else {
        // Make the ajax call that actually assumes a role.
        $.ajax({
          cache: false,
          data: ajaxData,
          url: URL,
          type: 'GET',
          success: function(data) {
            // Specify a success function that will handle the results from calling AssumeRoleWithWebIdentity
            assumeRoleSuccess(data);
          },
          error: function(errorMessage) {
            assumeRoleError(errorMessage);
          }
        });
        // This function is for display purposes only.
      }
      setAssumeRoleHeader(URL,ajaxData);
    });
  });

  /**
   * The following code is for calling GetObject and ListBucket to an S3 bucket.
   * See sigv4.js for details on callS3WithREST
   */
  $('#get-aws-resource').click(function() {
    var action = validateInput($('.select-action').val()),
        url = 'https://web-identity-federation-playground.s3.amazonaws.com/',
        urlPath = '',
        resource = '/web-identity-federation-playground/',
        headers,
        requestText,
        params = {'time':(new Date()).getTime()};
    switch(action) {
      case 'GetObject':
        urlPath = urlPath + 'user_fun/user_doc.txt';
        headers = SigV4.callS3WithREST(
          url + urlPath,
          'GET',
          params,
          {},
          resource + urlPath,
          validateInput($('.access-key-id').val()),
          validateInput($('.session-token').val()),
          validateInput($('.secret-access-key').val()),
          function(data) {
            updateHeaders(3, 'Response', data);
            displayHeader(3);
          },
          function(errorMessage) {
            updateHeaders(3, 'Response', vkbeautify.xml(errorMessage.responseText,2));
            displayHeader(3,true);
          }
        );
        break;
      case 'ListBucket':  
        params['prefix'] = 'user_fun/';
        headers = SigV4.callS3WithREST(
          url + urlPath,
          'GET',
          params,
          {},
          resource,
          validateInput($('.access-key-id').val()),
          validateInput($('.session-token').val()),
          validateInput($('.secret-access-key').val()),
          function(data) {
            var xmlText = convertXMLToString(data);
            updateHeaders(3, 'Response', vkbeautify.xml(xmlText,2));
            displayHeader(3,true);
          },
          function(errorMessage) {
            updateHeaders(3, 'Response', vkbeautify.xml(errorMessage.responseText,2));
            displayHeader(3,true);
          }
        );
        break;
      }
      requestText = generateGetRequest(url, urlPath, headers, params);
      updateHeaders(3, 'Request', requestText);
      displayHeader(3,true);
  });

  // initiate the dropdowns
  $('.selectpicker').selectpicker();

  /* Listeners for all three steps
   */
  $('#collapseOne').collapse({toggle:false}); // Initialize the accordion tabs
  $('#collapseTwo').collapse({toggle:false});
  $('#collapseThree').collapse({toggle:false});
  // Add listeners to the accordion headers
  $('#stepOneHeader').click(function(e) {
    e.preventDefault();
    showStep(1);
  });
  $('#stepTwoHeader').click(function(e) {
    e.preventDefault();
    showStep(2);
  });
  $('#stepThreeHeader').click(function(e) {
    e.preventDefault();
    showStep(3);
  });
  // Attach the tooltip hover listener to each info icon
  $('[rel=tooltip]').tooltip({'placement':'right'});
  // Clear button logic
  $('#clearBtn').tooltip({'trigger':'hover', 'placement':'bottom'});
  $('#clearBtn').click(function () {
    //Logout of Facebook
    var response = FB.getAuthResponse();
    if (response != null) {
      FB.logout();
    }
    //Logout of google. NOTE: this also redirects the page
    disconnectGoogleUser();
  });
  // Next step button listeners
  $('#proceedStepTwo').click(function() {
    showStep(2);
  });
  $('#proceedStepThree').click(function() {
    showStep(3);
  });
  /* Step One Event Listeners
   */
  $('#amazonTabLink').click(function () {
    $('#amazonTab').tab('show');
    providerName = 'amazon';
    displayHeader(1);
  });
  $('#googleTabLink').click(function () {
    $('#googleTab').tab('show');
    providerName = 'google';
    displayHeader(1);
  });
  $('#facebookTabLink').click(function () {
    $('#facebookTab').tab('show');
    providerName = 'facebook';
    displayHeader(1);
  });
  $('#facebookBtn').click(function() {
    loginButtonClicked = 2;
    if (fbResponse.status === 'connected')
      FBLogin(fbResponse);
    else
      FB.login(function(){}, {auth_type : 'reauthenticate'});
  });
  $(document).on('FBSDKLoaded', function() {
    FB.getLoginStatus(function(response) {
      fbResponse = response;
    FB.Event.subscribe('auth.authResponseChange', function(response) {
      if (loginButtonClicked != 2)
        return;
      fbResponse = response;
      if (fbResponse.status === 'connected') {
        FBLogin(fbResponse);
      } else {
        FB.login(function(response) {}, {auth_type:'reauthenticate'});
      }
    });
  });
  $('#amazonBtn').click(function() {
    options = { scope : 'profile' };
    amazon.Login.authorize(options, 'https://web-identity-federation-playground.s3.amazonaws.com/index.html');
    return false;
  });
  // Google attempts to call the googleSinginCallback on every page load, so we must add a listener to 
  // wait for the user to click the login button
  $('#googleBtn').click(function() {
    loginButtonClicked = 1;
  });

  /* Step 3 Event Listeners
   */
  $('#policy_popup').click(function (){
    $('#policy_popup').popover();
  });
  $(document).on('amazonload', handleAmazonLogin());
});
/** @private */
var loginButtonClicked = 0,
    providerID = '',
    providerName,
    stepOneHeaders = {},
    stepTwoHeaders = {},
    stepThreeHeaders = {}, 
    tokenExpiration,
    tokenTimerId,
    credTimerId,
    credExpiration,
    currentStep = 1,
    fbResponse;
initializeHeaders(); // Initialize stepOneHeaders, ..., to empty strings
/**
 * Function called after the user logs in with an Identity Provider
 * @param {string} providerArn Contains the Amazon Resource Name of the IP
 * @param {string} idToken The identity token provided by the IP
 * @param {number} tokenTime The time left until the token expires
 * @private
 */
function userLoggedIn(providerArn, idToken, tokenTime) {
  var roleArn = 'arn:aws:iam::877950674958:role/' + providerArn,
      trustPolicy,
      appId;
  // For Facebook and Amazon we need to add the provider ID. Not for Google
  if (providerArn == 'WebIdFed_Facebook') {
    providerID = 'graph.facebook.com';
    providerName = 'facebook';
    appId = '"graph.facebook.com:appId": "FacebookAppIdHere"';
    $('#provider-detail').html('<img src="/img/FB-f-Logo__blue_29.png">');
  }
  else if (providerArn == "WebIdFed_Amazon") {
    providerID = "www.amazon.com";
    providerName = 'amazon';
    appId = '"www.amazon.com:appId": "amzn1.application.AmazonAccountIdHere"';
    $('#provider-detail').html('<img src="/img/btnLWA_gold_32x32.png">');
  }
  else {
    providerID = 'accounts.google.com';
    providerName = 'google';
    appId = '"accounts.google.com:aud":"GoogleAppIdHere.apps.googleusercontent.com"';
    $('.provider-id').attr('placeholder', 'Empty for Google');
    $('#provider-detail').html('<img src="/img/gplus-32.png">');
  }

  tokenExpiration = (new Date()).getTime() + tokenTime*1000; //convert tokenTime to ms
  if (tokenTimerId != null)
    killTokenTimer();
  if (credTimerId != null)
    killCredentialTimer();
  startTokenTimer();
  $('.role-arn').val(roleArn);  
  $('.role-session-name').val('web-identity-federation');
  $('.web-identity-token').val(idToken);
  if(providerName != 'google')
    $('.provider-id').val(providerID);
  $('#proceedStepTwo').removeAttr('disabled'); //remove the disabled attribute

  // Set the trust policy
  trustPolicy = '{"Version": "2012-10-17","Statement": [{"Sid": "","Effect": "Allow","Principal": {"Federated": "' + providerID + '"' + 
        '},"Action": "sts:AssumeRoleWithWebIdentity","Condition": {"StringEquals": {' + appId + '}}}]}';
  $('#trust-policy').text(vkbeautify.json(trustPolicy,2));
  prettyPrint();
}
/**
 * Function called when the user clicks on the Facebook Login button
 * @param {Object} response Contains the authorization response from Facebook
 * @private
 */
function FBLogin(response) {
  var responseText = '';
  userLoggedIn('WebIdFed_Facebook', response.authResponse.accessToken, response.authResponse.expiresIn);
  $.each(response.authResponse, function(key, value) {
    if (key === 'accessToken') {
        responseText = responseText + '<span class=\'text-success\'><b>' + key + ':</b> ' + value + '</span><br>';
        return true;
    }
    responseText = responseText + '<b>' + key + '</b>: ' + value + '<br>';
  });
  updateHeaders(1, 'Response', responseText);
  displayHeader(1);
}
/**
 * The callback invoked when a user finishes signing in with Google
 * @param {Object} authResult Contains the authorization object that Google returns after login
 * @private
 */
function googleSigninCallback(authResult) {
  var responseText = '';
  if (authResult['id_token'] && loginButtonClicked === 1) {
    authResult['g-oauth-window'] = null;
    $.each(authResult, function(key, element) {
      if (key === 'id_token') {
        responseText = responseText + '<span class="text-success"><b>' + key + ':</b> "' + element + '"</span><br>';
        return true;
      }
      responseText = responseText + '<b>' + key + ':</b> "' + element + '"<br>';
    });
    userLoggedIn('WebIdFed_Google', authResult['id_token'], authResult['expires_in']);
    updateHeaders(1, 'Request', '');
    updateHeaders(1, 'Response', responseText);
    displayHeader(1);
  } else if (authResult['error'] && loginButtonClicked === 1) {  }
}
/**
 * Set the value of the request/response headers
 * @param {number} step The step number to update the headers for (1-3)
 * @param {string} headerName Either 'Request' or 'Response'
 * @param {string} content The html of the request/response to be set
 * @private
 */
function updateHeaders(step, headerName, content) {
  switch(step) {
    case 1:
      stepOneHeaders[headerName][providerName] = content;
      break;
    case 2:
      stepTwoHeaders[headerName][providerName] = content;
      break;
    case 3:
      stepThreeHeaders[headerName][providerName] = content;
      break;
  }
}
/**
 * Shows the request/respoonse headers for the given step
 * @param {number} step The step number (1-3)
 * @private
 */
function displayHeader(step, prettyPrintBool) {
  switch(step) {
    case 1:
      $('#request-pre').html(stepOneHeaders['Request'][providerName]);
      $('#response-pre').html(stepOneHeaders['Response'][providerName]);
      break;
    case 2:
      $('#request-pre').html('');
      $('#response-pre').html('');
      $('#request-pre').text(stepTwoHeaders['Request'][providerName]);
      $('#response-pre').text(stepTwoHeaders['Response'][providerName]);
      break;
    case 3:
      $('#request-pre').html('');
      $('#request-pre').text(stepThreeHeaders['Request'][providerName]);
      $('#response-pre').text(stepThreeHeaders['Response'][providerName]);
      break;
  }
  if (prettyPrintBool) {
    $('#response-pre').removeClass('prettyprinted');
    prettyPrint();
  }
}
/** 
 * Takes in the access token to revoke and makes an ajax call to Google.
 * @param {Object} accessToken Contains the access token that Google provided on login.
 * @private
 */
function disconnectGoogleUser(accessToken) {
  var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' +
      accessToken + '&time=' + (new Date()).getTime();
  $.ajax({
    type: 'GET',
    url: revokeUrl,
    contentType: 'application/json',
    dataType: 'jsonp',
    success: function(nullResponse) {
      window.location.href = 'https://web-identity-federation-playground.s3.amazonaws.com/index.html';
    }
  });
}
/**
 * Display the step given by stepNum
 * @param {number} stepNum Takes the value 1,2, or 3 for the step to be displayed
 */
function showStep(stepNum) {
  if (currentStep === stepNum) {
    return;
  }
  $('#stepOneHeader').removeAttr('active', '');
  $('#stepTwoHeader').removeAttr('active', '');
  $('#stepThreeHeader').removeAttr('active', '');
  $('#collapseThree').css('overflow', 'hidden');
  currentStep = stepNum;
  switch (stepNum) {
    case 1:
      $('#collapseTwo').collapse('hide');
      $('#collapseThree').collapse('hide');
      $('#collapseOne').collapse('show');
      $('#stepOneHeader').attr('active', 'true');
      displayHeader(1);
      break;
    case 2:
      $('#collapseOne').collapse('hide');
      $('#collapseThree').collapse('hide');
      $('#collapseTwo').collapse('show');
      $('#stepTwoHeader').attr('active', 'true');
      displayHeader(2,true);
      break;
    case 3:
      // Set the overflow to visible. This is necessary for the dropdowns to be visible.
      $('#collapseOne').collapse('hide');
      $('#collapseTwo').collapse('hide');
      $('#collapseThree').collapse('show');
      $('#stepThreeHeader').attr('active', 'true');
      $('#collapseThree').css('overflow', 'visible');
      displayHeader(3,true);
      break;
  }
}
/**
 * Create a new header with each of the parameters set to ''.
 * @constructor
 * @private
 */
function Header() {
  this.Request = {'amazon':'', 'facebook':'', 'google':''};
  this.Response = {'amazon':'', 'facebook':'', 'google':''};
}
/** 
 * Initialize each of the headers to the empty string.
 * @private
 */
function initializeHeaders() {
  stepOneHeaders = new Header();
  stepTwoHeaders = new Header();
  stepThreeHeaders = new Header();
}
/**
 * Initiate the credential timer
 * @private
 */
function startCredentialTimer() {
  var time = (new Date()).getTime(),
      timeLeft = credExpiration - time;
  if (timeLeft < 0) {
    $('#ARWWI-timer').text('Your credentials have expired.');
    return;
  }
  $('#ARWWI-timer').text('Your credentials will expire in ' + Math.round(timeLeft/1000) + ' seconds');
  credTimerId = window.setTimeout(startCredentialTimer, 1000);
}
/**
 * Cancels the credential timer, called when the timer is renewed.
 * @private
 */
function killCredentialTimer() {
  window.clearTimeout(credTimerId);
}
/**
 * Start the timer for the number of seconds left on the access token.
 * @private
 */
function startTokenTimer() {
  var time = (new Date()).getTime(), // current time
      timeLeft = tokenExpiration - time;
  if (timeLeft < 0) {
    $('#token-timer').text('Your token has expired.');
    return;
  }
  $('#token-timer').text(Math.round(timeLeft/1000) + ' seconds until token expires.');
  tokenTimerId = window.setTimeout(startTokenTimer, 1000);
}
/**
 * Kill the current token timer
 * @private
 */
function killTokenTimer() {
  window.clearTimeout(tokenTimerId);
  $('#ARWWI-timer').text('');
}
/**
 * Strips user input of any characters that could be used for XSS
 * @param {string} input The input string to be evaluated
 * @private
 */
function validateInput(input) {
  if (input === undefined || input === null)
    return;
  return input.replace(/[^-|\/_:%+\sa-zA-Z0-9\.]+/g,"");
}
/**
 * Generate a string that looks like a GET request
 * @param {string} host The hostname of the URL to hit
 * @param {string} urlPath The path after the hostname of the URL to hit
 * @param {Object} headers Contains some of the headers sent in the GET request
 * @param {Object} params Contains all of the query string parameters
 * @private
 */
function generateGetRequest(host, urlPath, headers, params) {
  var request_str = '';

  if (headers != undefined && headers['Host'] === undefined) 
    headers['Host'] = host;
  if (urlPath === '')
    request_str = 'GET / HTTP/1.1\n';
  else
    request_str = 'GET ' + urlPath + ' HTTP/1.1\n';
  $.each(headers, function(key, value) {
    request_str = request_str + key + ': ' + value + '\n';
  });
  request_str = request_str + 'URL: ' + host + urlPath + '?';
  $.each(params, function(key, value) {
    request_str = request_str + key + '=' + value + '&';
  });
  request_str = request_str.slice(0,-1);
  return request_str;
}

/**
 * Called when a user log in via amazon
 * @private
 */
function handleAmazonLogin() {
  var args = window.location.search.split('&'),
        argsLength = args.length,
        timer,
        keyValue,
        keys,
        responseText = 'https://' + window.location.host + window.location.pathname + '?',
        paramDict = {};
    if (argsLength < 4)
      return;
    for (var i = 0; i < argsLength; i++) {
      keyValue = args[i].split('=');
      paramDict[keyValue[0]] = keyValue[1];
      if (keyValue[0] === 'access_token') {
        responseText = responseText + "<span class=\"text-success\">" + validateInput(keyValue[0]) + "=" + validateInput(keyValue[1]) + "</span><br>&";
        continue;
      }
      responseText = responseText + validateInput(keyValue[0]) + '=' + validateInput(keyValue[1]) + '\n&';
    }
    responseText = responseText.slice(0,-1);
    if (paramDict['access_token'] != null) {
      userLoggedIn('WebIdFed_Amazon', validateInput(paramDict['access_token']), validateInput(paramDict['expires_in']));
      updateHeaders(1, 'Response', responseText);
      displayHeader(1);
    }
  var args = window.location.search.split('&'),
      argsLength = args.length,
      timer,
      keyValue,
      keys,
      responseText = 'https://' + window.location.host + window.location.pathname + '?',
      paramDict = {},
      expiration,
      token,
      cur_time = Math.round(((new Date()).getTime())/1000); // current time in seconds
  if (argsLength < 4)
    return;
  for (var i = 0; i < argsLength; i++) {
    keyValue = args[i].split('=');
    paramDict[keyValue[0]] = keyValue[1];
    if (keyValue[0] === 'access_token') {
      responseText = responseText + "<span class=\"text-success\">" + validateInput(keyValue[0]) + "=" + validateInput(keyValue[1]) + "</span><br>&";
      continue;
    }
    responseText = responseText + validateInput(keyValue[0]) + '=' + validateInput(keyValue[1]) + '\n&';
  }
  responseText = responseText.slice(0,-1);
  expiration = parseInt(localStorage.getItem('amazonExpiration'));
  token = localStorage.getItem('amazonToken');
  if (token === paramDict['access_token']) {
    expiration = expiration - cur_time;
  } else {
    expiration = parseInt(validateInput(paramDict['expires_in']));
    localStorage.setItem('amazonExpiration', cur_time + expiration);
    localStorage.setItem('amazonToken', paramDict['access_token']);
  }
  if (paramDict['access_token'] != null) {
    userLoggedIn('WebIdFed_Amazon', validateInput(paramDict['access_token']), expiration);
    updateHeaders(1, 'Response', responseText);
    displayHeader(1);
  }
 }
 /**
 * Called when AssumeRoleWithWebIdentity is called to set the Request header
 * @param {string} URL Contains the endpoint for the ajax call in the assume_role listener
 * @param {Object} ajaxData All of the parameters necessary to call AssumeRoleWithWebIdentity
 * @private
 */
function setAssumeRoleHeader(URL, ajaxData) {
  var requestText,
      requestHeader = {};
  requestHeader['Host'] = 'sts.amazonaws.com';
  requestHeader['Content-Type'] = 'application/json; charset=utf-8';
  requestText = generateGetRequest(URL, '', requestHeader, ajaxData);
  updateHeaders(2, 'Request', requestText);
}
function convertXMLToString(data) {
  var dataString = '';
  if (typeof data === 'string') {
    return data;
  }
  else if (typeof data === 'object') {
    if (window.XMLSerializer) {
      dataString = (new XMLSerializer()).serializeToString(data);
    }
    else {
      dataString = data.xml;
    }
  }
  return dataString;
}
/**
 * Parses the XML response for the temporary credentials, sets the Access Policy field, updates the 
 * Response header.
 * @param {Object} data The XML response from a successful call to AssumeRoleWithWebIdentity
 * @private
 */
function assumeRoleSuccess(data) {
  var responseText = convertXMLToString(data),
      $jqDoc = $(data),
      $accessKeyId = $jqDoc.find('AccessKeyId'),
      requestPre = $('#request-pre'),
      time = $jqDoc.find('Expiration').text()
  //Internet Explorer 8 parses the date differently
  if (window.ActiveXObject) {
    time = time.replace(/\-/g, '/');
    time = time.replace(/[TZ]/, ' ')
  }
  credExpiration = Date.parse(time);
  if (credTimerId != null)
    killCredentialTimer();
  startCredentialTimer();
  updateHeaders(2, 'Response', vkbeautify.xml(responseText,2));
  displayHeader(2,true);
  // Set the fields on Step 3
  $('.access-key-id').val($accessKeyId.text());
  $('.secret-access-key').val($jqDoc.find('SecretAccessKey').text());
  $('.session-token').val($jqDoc.find('SessionToken').text());
  $('#proceedStepThree').removeAttr('disabled');
  $('#assumed-role').text(vkbeautify.json('{"Version": "2012-10-17","Statement": [{' + 
      '"Action": ["s3:GetObject"],"Sid": "Stmt1374684569000","Resource": [' + 
      '"arn:aws:s3:::web-identity-federation-playground/*"],"Effect": "Allow"},' + 
      '{"Action": ["s3:ListBucket"],"Sid": "Stmt1374684915000","Resource": [' + 
      '"arn:aws:s3:::web-identity-federation-playground"],"Effect": "Allow"}]}',2));
}
/**
 * Handles the event when a call to AssumeRoleWithWebIdentity fails.
 * @param {Object} errorMessage The response from an incorrect call to AssumeRoleWithWebIdentity
 * @private
 */
function assumeRoleError(errorMessage) {
  if (typeof errorMessage === 'string') {
    updateHeaders(2, 'Response', errorMessage);
    displayHeader(2, false);
  } else {
    var responseText = convertXMLToString(errorMessage.responseText); 
    updateHeaders(2, 'Response', vkbeautify.xml(responseText,2));
    displayHeader(2,true);
  }
}
