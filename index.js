var semester_list = ["first|First", "second|Second", "third|Third", "fourth|Fourth",
                     "fifth|Fifth", "sixth|Sixth", "seventh|Seventh", "eighth|Eighth"];

var root_endpoint = "https://dctm-teachers-portal-fdf44.firebaseio.com/";

var removeloading;

var department;
var user_id;

firebase.auth().onAuthStateChanged(function (user) {
  document.getElementById("signout_btn").addEventListener("click", function () {
    firebase.auth().signOut().then(function () {
      console.log("logged out");
      window.location = "logout.php";
    }, function (error) {
      console.error('Sign Out Error', error);
    });
  });
});



function init_mainpage(time) {
  //loading timer
  if (time == null) {
    time = 1500;
  }
  var html = document.getElementsByTagName('html')[0];
  removeLoading = function () {
    setTimeout(function () {
      html.className = html.className.replace(/loading/, '');
    }, time);
  };

  //initial data fetching
  //uid here
  var query = window.location.search;
  if (query.substring(0, 1) == '?') {
    query = query.substring(1);
  }
  user_id = unescape(query);

  //department here
  var deptt_endpoint = root_endpoint + "user/" + user_id + ".json";
  var request = new XMLHttpRequest();
  request.open('GET', deptt_endpoint);
  request.responseType = 'json';
  request.send();
  request.onload = function () {
    var response = request.response;
    department = response.department.toLowerCase();
    document.getElementById("dbname").value = department ;
  }
}

function populate_semester() {
  init_mainpage(null);
  removeLoading();
  var semester_scehme_endpoint = root_endpoint + "semester_scheme.json",
    request = new XMLHttpRequest();
  request.open('GET', semester_scehme_endpoint);
  request.responseType = 'json';
  request.send();
  request.onload = function () {
    var response = request.response,
      ul = document.getElementById("nav-options");

    if (response == 0)
      var i = response + 1;
    else
      var i = response - 1;

    for (; i <= semester_list.length; i += 2) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      var pair = semester_list[i].split("|");
      a.appendChild(document.createTextNode(pair[1]));
      li.appendChild(a);
      li.setAttribute("id", pair[0]);
      li.setAttribute('style', "cursor : pointer;");
      li.onclick = function () {
        //         document.getElementById("form").style.visibility = 'hidden';
        document.getElementById("nav-subjects").innerHTML = "";
        populate_subject(this.getAttribute("id"));

      };
      ul.appendChild(li);
    }
  }
}

var subject_array = new Map();

function populate_subject(semester) {
  document.getElementById("tbname").value = semester.toLowerCase() ;
  var subject_code_endpoint = root_endpoint + department + "/" + semester + ".json";
  var request = new XMLHttpRequest();

  request.responseType = 'json';
  request.open('GET', subject_code_endpoint);
  request.send();
  request.onload = function () {
    var sub_response = request.response;
    for (var iterator in sub_response) {
      var subject_details_endpoint = root_endpoint + "course_details/" + sub_response[iterator] + ".json";

      var request1 = new XMLHttpRequest();
      request1.open('GET', subject_details_endpoint);
      request1.responseType = 'json';
      request1.send();
      request1.onload = function () {

        var subject_details_response = this.response;

        var subject_object = new Object();
        subject_object.name = subject_details_response.name;
        subject_object.teacher = subject_details_response.teacher;
        subject_object.key = subject_details_response.key;
        subject_array.set(subject_object.name, subject_object);
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.appendChild(document.createTextNode(subject_object.name));
        li.appendChild(a);
        li.onclick = function () {
          showform(this.children[0].innerText);
        }
        li.setAttribute("id", subject_object.key);
        li.setAttribute('style', "cursor : pointer;");
        document.getElementById("nav-subjects").appendChild(li);
      };
    }
  };
}

function showform(subject_key) {
  document.getElementById("form").style.visibility = 'visible';
  document.getElementById("subject-teacher").innerText = subject_array.get(subject_key).teacher;
  document.getElementById("subject-department").innerText = department.toUpperCase();
  document.getElementById("subject_key").value = subject_array.get(subject_key).key ;
}
