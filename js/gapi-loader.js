(function(id_login_link, id_name, runApp) {

  // Edit the following three constants as necessary.
  var clientId = '968361937576-hka195tuontd5vmeuhuntv15lgcpn08v.apps.googleusercontent.com';
  var apiKey = 'AIzaSyCJiBR1-tmt0Pp2yhBo8P7g6FqY2q_S7F8';
  var scopes = ['email'];

  var nonce = Math.random().toFixed(6).substr(2);

  window.handleClientLoad = function() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
  };

  function checkAuth() {
    gapi.auth.authorize(
        {response_type: 'token id_token', client_id: clientId, scope: scopes, immediate: true, state: nonce},
        handleAuthResult);
  }

  function handleAuthClick(event) {
    // Step 3: get authorization to use private data
    gapi.auth.authorize(
        {response_type: 'token id_token', client_id: clientId, scope: scopes, immediate: false, state: nonce},
        handleAuthResult);
    return false;
  }

  function handleAuthResult(authResult) {
    var login_link = document.getElementById(id_login_link);
    if (authResult && !authResult.error) {
      if (authResult.state != nonce) {
        throw Error('Invalid state ' + nonce + ' vs ' + authResult.state);
      }
      if (authResult.client_id != clientId) {
        throw Error('Invalid audience ' + clientId + ' vs ' + authResult.client_id);
      }
      login_link.textContent = 'logout';
      login_link.onclick = function() {
        console.log('logging out');
        gapi.auth.signOut(); // doesn't work on gapi client.
      };
      login_link.href = '#logout';
      login_link.style.display = 'none';
      makeApiCall(authResult);
    } else {
      login_link.style.display = '';
      login_link.href = '#';
      login_link.onclick = handleAuthClick;
      login_link.textContent = 'login';
      runApp(null);
    }
  }

  // Load the API and make an API call.  Display the results on the screen.
  function makeApiCall(authResult) {
    gapi.client.request({
      'path': 'oauth2/v3/userinfo',
      'callback': function(data) {
        var ele_name = document.getElementById(id_name);
        ele_name.textContent = data['email']; // .replace(/@.+/, '');
        ele_name.setAttribute('value', data['sub']);
        ele_name.style.display = '';
        runApp(authResult);
      }
    });
  }


  // Load the GAPI SDK asynchronously
  if (!document.getElementById('gapi-jssdk')) {
    var js = document.createElement('script');
    js.id = 'gapi-jssdk';
    js.src = 'https://apis.google.com/js/client.js?onload=handleClientLoad';
    var fjs = document.getElementsByTagName('script')[0];
    fjs.parentNode.insertBefore(js, fjs);
  }
}('google-login', 'user-name', runUploadApp));
