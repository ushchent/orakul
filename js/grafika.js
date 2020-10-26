const margins = { top: 10, right: 30, bottom: 30, left: 50 };
const height = 200 - margins.top - margins.bottom;
const width = 700 - margins.left - margins.right;

const x_scale = d3.scaleTime().range([margins.left, width]);
const y_scale = d3.scaleLinear().range([height, margins.bottom]);
const x_axis = d3.axisBottom(x_scale).ticks(7);
const y_axis = d3.axisLeft(y_scale).ticks(4);

const zoomed = () => {
			const x_rescaled = d3.event.transform.rescaleX(x_scale);
			d3.select(".line_chart").attr("d", line(x_rescaled));
			d3.select(".xAxis").call(x_axis.scale(x_rescaled));
		}

const zoom = d3.zoom()
			.extent([[margins.left, 0], [width - margins.right, height]])
			.scaleExtent([1, 32])
			.translateExtent([[margins.left, margins.top],
			[width - margins.right, margins.bottom]])
			.on("zoom", zoomed);

const line = x_scale => d3.line()
			.x(d => x_scale(new Date(d[0])) )
			.y(d => y_scale(+d[1]))
			.curve(d3.curveMonotoneX);

const redraw_chart = data => {
	// Поступает Object.entries(data.line["region_id"])
	// Вида [["2020-12-31", 23], ...] 
	console.log("data: ", data);
		x_scale.domain(d3.extent(data.map(d => new Date(d[0]))));
		y_scale.domain([0, d3.max(data, d => +d[1])]);

		d3.select(".x.axis")
			.call(x_axis);

		d3.select(".y.axis")
			.call(y_axis);
			
		var line_chart = d3.select(".line_chart")		
			.select("path")
			.datum(data);
			
		line_chart.attr("d", line(x_scale));
}

d3.json("data/data.json")
// Инициализация элементов графика. Отрисовка ч/з redraw_chart.
	.then(function(data) { console.log(data);
		const selector = d3.select("#grafika")
			.append("select");

		selector.selectAll("option")
			.data(Object.entries(data.options))
			.enter()
			.append("option")
			.attr("value", d => d[0])
			.text(d => d[1]);

		selector.on("change",  function() {
			let value = d3.select(this).node().value;
			console.log(value);
		});
		const svg = d3.select("#grafika")
					.append("svg")
					.attr("width", width + margins.left + margins.right)
					.attr("height", height + margins.top + margins.bottom);
		svg.append("g")
			.attr("transform",
				`translate( 0, ${height + margins.top} )`)
			.attr("class", "x axis")
		svg.append("g")
			.attr("transform",
				`translate( ${margins.left}, ${margins.top} )`)
			.attr("class", "y axis")
		svg.append("g")
			.attr("class", "line_chart")
			.attr("transform", "translate(0,0)")
			.append("path");

		redraw_chart(Object.entries(data.line["170"]));
		})
