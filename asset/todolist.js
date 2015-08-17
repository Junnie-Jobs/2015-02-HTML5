/*
* week 4, 5
* onlie offline 이벤트 추가하기
* history 객체 관리하기
   filters 의 a 태그가 클릭되면, 
   다른 a 태그는 클래스 지우고, 선택된 a 태그에만 selected 클래스를 넣는다.
   투두 리스트에 해당 클래스를 넣는다. 

   뒤로가기 눌렸을 때 이벤트 catch해서 해당 page보여주고, push state.
*   
*/
var TODO = {
	init: function() {
		this.get(); //여기에 있으면 반응속도가 너무 느린 것 같다... 한번에 투두가 확 보였으면 좋겠다...
		$("#new-todo").on("keydown", this.add.bind(this));
		var todoList = $("#todo-list");
		todoList.on("click", "input", this.complete);
		todoList.on("click", "button", this.startDeleteAnimation);
		todoList.on("animationend", "li", this.remove);
		$("#filters").on("click", "a", this.changeStateFilter);
	},

	changeStateFilter : function (ev) {
		ev.preventDefault();
		console.log($(ev.currentTarget).attr("href"));
	},

	get: function() {
		TODOSync.get(function (json) {
			$.each(json, function(i, item) {
				var completed =  item.completed===1? true : false;
			    var todoList = this.makeTodoList({key: item.id, title: item.todo, completed: completed}); // "id", "todo", "completed"는 api 상수니까 나중에 따로 뺴서 정리하자
			    $(todoList).prependTo("#todo-list");
			}.bind(this));
		}.bind(this));
	},	

	add : function (ev) {
		var ENTER_KEYCODE = 13;
		if(ev.keyCode === ENTER_KEYCODE) {
			var sTodo = ev.target.value;
			
			TODOSync.add(sTodo, function(json) {
				var todoList = this.makeTodoList({key: json.insertId, title: sTodo});
				$("#todo-list").append(todoList);
				$("#new-todo").val("");
			}.bind(this));
		}
	},

	makeTodoList : function (oTodo) {
		var source = $("#todo-template").html();
		var template = Handlebars.compile(source);
		var context = { completed:oTodo.completed, todoKey: oTodo.key, todoTitle: oTodo.title };
		return template(context);
	},

	complete : function (ev) {
		var input = ev.currentTarget;
		var li = input.parentNode;
		var oParam = {
			todoKey: li.dataset.todoKey,
			complete: input.checked? 1 : 0
		}
		TODOSync.complete(oParam, function(){
			if(oParam.complete === 1) {
				li.className = "completed";
			}else {
				li.className = "";
			}
		});
	},

	startDeleteAnimation : function (ev) {
		var button = ev.currentTarget;
		var li = button.parentNode.parentNode;
		var oParam = {
			todoKey: li.dataset.todoKey
		};
		TODOSync.remove(oParam, function() {
			li.className = "deleting";
		});
	},

	remove : function (ev) {
		var li = ev.currentTarget;
		if(li.className === "deleting"){
			li.parentNode.removeChild(li);
		}
	}	
};

$(document).ready(function () {
	TODO.init();
	TODOSync.init();
});
