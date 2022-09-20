var url_IncomeCasesData = "IncomeCases.json"


var margin = {top:10, bottom:10, left:10, right:10}
var viewboxwidth = 500;
var viewboxheight = 400
var width = viewboxwidth - margin.left - margin.right;
var height = viewboxheight - margin.top - margin.bottom;


// Setup graph for Cases per Neighbourhood

var svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", "0 0 "+ viewboxwidth +" "+ viewboxheight)
    .append("g")
    .attr("transform", "translate(" + 40+ "," + 0 + ")"); 

var tooltip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, 0])
    .html(function(d) { return "<b>"+d.properties.AREA_NAME+"</b>" + "<br/>" + "Population (2016) : "+ d.properties.Population + "<br/>" + "Total Cases : " + d.properties.Cases + "<br/>" + "Cases per 10,000 : "+ Math.round(d.properties.perCapita*100) });

svg.call(tooltip);

svg.append("text")
    .attr("class","title")
    .attr("x",width-330)
    .attr("y",30)
    .text("Corellation between cases and income");

// Import Dataset
d3.queue()
    .defer(d3.json,url_IncomeCasesData)
    .await(plotScatter)

// Plot Maps 
function plotScatter (error, data){

    var incomeCases = data.features;
    const max_income = d3.max(incomeCases.map(function(e){return e.properties.AVG_INC}))
    const max_cases = d3.max(incomeCases.map(function(e){return e.properties.Cases}))

    var x = d3.scaleLinear()
        .domain([0, max_income])
        .range([ 0, width ]);
    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

  // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, max_cases])
        .range([ height, 0]);
  
    svg.append("g")
        .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(incomeCases)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.properties.AVG_INC); } )
      .attr("cy", function (d) { return y(d.properties.Cases); } )
      .attr("r", 1.5)
      .style("fill", "#69b3a2")
      .on('mouseover',function(d){console.log(d)})
}
