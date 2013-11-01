
var clientId = '968361937576-hka195tuontd5vmeuhuntv15lgcpn08v.apps.googleusercontent.com';

var apiKey = 'AIzaSyCJiBR1-tmt0Pp2yhBo8P7g6FqY2q_S7F8';

var scopes = ['https://www.googleapis.com/auth/plus.login', 'email'];

function handleClientLoad() {
  // Step 2: Reference the API key
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
}

function checkAuth() {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthClick(event) {
  // Step 3: get authorization to use private data
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  return false;
}

function handleAuthResult(authResult) {
  var login_link = document.getElementById('user-login');
  if (authResult && !authResult.error) {
    login_link.textContent = 'logout';
    login_link.onclick = function() {
      gapi.auth.signOut();
    };
    login_link.style.display = 'none';
    login_link.href = '#logout';
    this.makeApiCall();
  } else {
    login_link.style.display = '';
    login_link.href = '#';
    login_link.onclick = handleAuthClick;
    login_link.textContent = 'login';
  }
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
  gapi.client.request({
    'path': 'oauth2/v3/userinfo',
    'callback': function(data) {
      console.log(data);
      var ele_name = document.getElementById('user-name');
      ele_name.textContent = data['email']; // .replace(/@.+/, '');
      ele_name.setAttribute('value', data['sub']);
      ele_name.style.display = '';
      runUploadApp(gapi.auth.getToken());
    }
  });
}


// Load the GAPI SDK asynchronously
(function(d, id){
  var js, fjs = d.getElementsByTagName('script')[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement('script'); js.id = id;
  js.src = "https://apis.google.com/js/client:plusone.js?onload=handleClientLoad";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'gapi-jssdk'));