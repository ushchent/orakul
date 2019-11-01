var route_prefixes = {
	"local": "http://localhost:5000/",
    "heroku": "https://obscure-brushlands-18914.herokuapp.com/"
}
var input_id_map = {
	"vzyskatel": "vzyskatel_output",
	"dolzhnik": "dolzhnik_output"
}
var input_id_reversed = {
	"vzyskatel_output": "vzyskatel",
	"dolzhnik_output": "dolzhnik"
}
var result_map = {
	0: "Откажут в вынесении судебного приказа",
	1: "Вынесут определение о судебном приказе"
};
var sel_id = id => document.getElementById(id);
var handle_result_output = result_set => {
	var target = sel_id("verdict");
	var verdict_string = result_map[result_set["verdict"]] +
		" с вероятностью " + result_set["proba"] + "%.";
	target.innerText = verdict_string;
}

var wake_up = () => {
	fetch(route_prefixes["heroku"] + "wakeup", {
		method: "POST"
	})
	.then(response => console.log("Wake up: ", response.status))
}

var calculate_risk = () => {
	var vid = sel_id("vzyskatel");
	var did = sel_id("dolzhnik");
	var vunp, dunp;
	vid.dataset.hasOwnProperty("unp") ? vunp = vid.dataset.unp : null;
	did.dataset.hasOwnProperty("unp") ? dunp = did.dataset.unp : null;
	var result_set = {"vunp": vunp, "dunp": dunp };
	console.log("Result set: ", result_set);
	if (!result_set.vunp && !result_set.dunp) {
		return;
	} else {
		sel_id("calculate").textContent = "Считаем...";
		fetch(route_prefixes["heroku"] + "predict", {
			method: "POST",
			credentials: "omit",
			body: JSON.stringify(result_set),
			cache: "no-cache",
			headers: new Headers({
				"content-type": "application/json",
				//"Access-Control-Allow-Origin": "*",
				//"Access-Control-Allow-Credentials": "true"
			})
		})
		.then(response => { 
				if (response.status !== 200) {
					console.log("Wrong status.");
				} else {
					response.json().then(data => handle_result_output(data));
					sel_id("calculate").textContent = "Оценить";
				}	
			})
	}
}
var handle_list_item_click = (list_item) => {
	var title = list_item.target.textContent;
	var unp = list_item.target.dataset.unp;
	var current_output_id = list_item.target.parentNode.parentNode.id;
	var input_field = sel_id(input_id_reversed[current_output_id]);
	input_field.value = title;
	input_field.setAttribute("data-unp", unp);
	sel_id(current_output_id).childNodes[0].remove();
}
var handle_output = (response, output_id) => {
	var output_div = sel_id(input_id_map[output_id]);
	if (output_div.childNodes.length > 0) {
		output_div.childNodes.forEach(c => c.remove());
	}
	if (response.length > 0) {
		var target_div = sel_id(input_id_map[output_id]);
		var ul = target_div.appendChild(document.createElement("ul"));
		response.forEach(e => {
			var title = document.createTextNode(e["t"]);
			var list_item = document.createElement("li");
			list_item.appendChild(title);
			list_item.setAttribute("data-unp", e["u"]);
			list_item.addEventListener("click", handle_list_item_click, false);
			ul.appendChild(list_item);
		})	
	}
}
var handle_input = (value, id) => {
	if (value.length > 4) {
		var title = {"title": value.replace("-", " ")};
		fetch(route_prefixes["heroku"] + "title", {
			method: "POST",
			credentials: "omit",
			body: JSON.stringify(title),
			cache: "no-cache",
			headers: new Headers({
				"content-type": "application/json",
				//"Access-Control-Allow-Origin": "*",
				//"Access-Control-Allow-Credentials": "true"
			})
		})
		.then(response => { 
			if (response.status !== 200) {
				console.log("Wrong status.");
			} else {
				response.json().then(data => { handle_output(data, id); } )
			}	
		})
	}
}

// Будим сервер при первой загрузке страницы
wake_up();
