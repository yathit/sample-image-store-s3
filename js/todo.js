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
 * @fileoverview YDN-DB sample app for todo list.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


var schema = {
  version: 1,
  stores:[{
    name:'todo',
    keyPath:"timeStamp"
  }]
};


/**
 * Create and initialize the database. Depending on platform, this will
 * create IndexedDB or WebSql or even localStorage storage mechanism.
 * @type {ydn.db.Storage}
 */
var db = new ydn.db.Storage('todo-app', schema);

var deleteTodo = function (id) {
  db.remove('todo', id).fail(function(e) {
    throw e;
  });

  getAllTodoItems();
};

var getAllTodoItems = function () {
  var todos = document.getElementById("todoItems");
  todos.innerHTML = "";

  var df = db.values('todo');

  df.done(function (items) {
    var n = items.length;
    for (var i = 0; i < n; i++) {
      renderTodo(items[i]);
    }
  });

  df.fail(function (e) {
    throw e;
  })
};

var renderTodo = function (row) {
  var todos = document.getElementById("todoItems");
  var li = document.createElement("li");
  var a = document.createElement("a");
  var t = document.createTextNode(row.text);

  a.addEventListener("click", function () {
    deleteTodo(row.timeStamp);
  }, false);

  a.textContent = " [Delete]";
  li.appendChild(t);
  li.appendChild(a);
  todos.appendChild(li)
};

var addTodo = function () {
  var todo = document.getElementById("todo");

  var data = {
    "text":todo.value,
    "timeStamp":new Date().getTime()
  };
  db.put('todo', data).fail(function(e) {
    throw e;
  });

  todo.value = "";

  getAllTodoItems();
};

function init() {
  getAllTodoItems();
}

db.onReady(function(e) {
  // db will call when it ready
  if (e) {
    // db opening fail.
    throw e;
  }
  init();
});


