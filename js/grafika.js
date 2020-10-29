const margins = { top: 10, right: 30, bottom: 30, left: 50 };
const height = 250 - margins.top - margins.bottom;
const width = 800 - margins.left - margins.right;

const x_scale = d3.scaleTime().range([margins.left, width / 1.3]);
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

const redraw_line_chart = data => {
	// Поступает Object.entries(data.line["region_id"])
	// Вида [["2020-12-31", 23], ...] 
		x_scale.domain(d3.extent(data.map(d => new Date(d[0]))));
		y_scale.domain([0, d3.max(data, d => +d[1])]);

		d3.select(".x.axis")
			.call(x_axis);

		d3.select(".y.axis")
			.call(y_axis);
			
		var line_chart = d3.select(".line_chart")		
			.select("path")
			.datum(data);
			
		line_chart.transition()
			.duration(1000)
			.attr("d", line(x_scale));
}

const redraw_pie_chart = data => {
	// Пирожковая диаграмма
	const verdict_map = {0: "Отказано", 1: "Вынесен приказ"};
	console.log("pie_data: ", data);
	    const color = d3.scaleOrdinal()
                    .domain(Object.keys(data)) 
                    .range(["white", "black"]);

        const pie = d3.pie()(data.map(e => e[1]));
	console.log("pie: ", pie);

        const arc_generator = d3.arc()
                            .innerRadius(0)
                            .outerRadius(80)
                            .startAngle(d => d.startAngle)
                            .endAngle(d => d.endAngle);

		const pie_area = d3.select(".pie");
	
        const arcs = pie_area.selectAll("path")
			
			arcs.data(pie)
			.enter()
            .append("path")
            .attr("fill", function(d, i) { return color(i); })
           // .attr("stroke", "white")
            //.attr("stroke-width", 2)
            .attr("title", function(d) { return d.data; });
		
		arcs.transition()
			.duration(1000)
			.attr("d", arc_generator)
            .attr("fill", function(d, i) { return color(i); })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("title", function(d) { return d.data; });


		//arcs.enter()
        //    .append("path")
		//	.attr("class", "arc")		
        //    .attr("fill", function(d, i) { return color(i); })
        //    .attr("stroke", "white")
        //    .attr("stroke-width", 2)
        //    .attr("title", function(d) { return d.data; });
       
        var legend = d3.select(".pie_legend");

        const legend_circles = legend.selectAll("circle")
            .data(Object.keys(data))
			.enter()
            .append("circle")

        legend_circles.attr("cx", 125)
            .attr("cy", function(d, i) { return i * 20; })
            .attr("r", 5)
			.attr("stroke", "black")
            .attr("fill", function(d, i) { return color(i); });

		legend_circles.exit().remove();

        const legend_labels = legend.selectAll("text")
            .data(Object.keys(data))
        	.enter()
            .append("text")
	
        legend_labels.text(d => verdict_map[d] )
            .attr("x", 135)
            .attr("y",function(d, i) { return (i * 20) + 4; });	

		legend_labels.exit().remove();
}

d3.json("data/data.json")
// Инициализация элементов графика. Отрисовка ч/з redraw_chart.
	.then(function(data) { console.log(data);
		const selector = d3.select("#grafika")
			.append("div")
			.attr("class", "selector")
			.append("select");

		selector.selectAll("option")
			.data(Object.entries(data.options))
			.enter()
			.append("option")
			.attr("value", d => d[0])
			.text(d => d[1]);

		selector.on("change",  function() {
			let value = d3.select(this).node().value;
			redraw_line_chart(Object.entries(data.line[value]));
			redraw_pie_chart(Object.entries(data.pie[value]));
			console.log(value);
		});
		const svg = d3.select("#grafika")
					.append("div")
					.attr("class", "chart")
					.append("svg")
					.attr("width", width + margins.left * 2 + margins.right * 2)
					.attr("height", height + margins.top + margins.bottom);
		svg.append("g")
			.attr("transform",
				`translate( 0, ${height + margins.top} )`)
			.attr("class", "x axis");
		svg.append("g")
			.attr("transform", `translate(${margins.left}, ${margins.top})`)
			.attr("class", "y axis");
		svg.append("g")
			.attr("class", "line_chart")
			.attr("transform", "translate(0,0)")
			.append("path");
		
		svg.append("g")
			.attr("class", "pie_chart")
			//.attr("width", "300")
			//.attr("height", "300")
			.attr("transform", "translate(540,0)");
		svg.select(".pie_chart")
			.append("g")
			.attr("class", "pie")
			//.attr("width", "300")
			//.attr("height", "300")
			.attr("transform", "translate(125, 125)")
			.selectAll("path")
			.data(Object.entries(data.pie[Object.entries(data.options)[0][0]]))
			.enter()
			.append("path")

		svg.select(".pie_chart")
			.append("g")
			.attr("class", "pie_legend")
			.attr("transform", "translate(100, 60)");
		
		redraw_line_chart(Object.entries(data.line[Object.entries(data.options)[0][0]]));
		redraw_pie_chart(Object.entries(data.pie[Object.entries(data.options)[0][0]]));
})
	
