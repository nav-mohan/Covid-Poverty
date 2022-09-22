var url_IncomeCasesData = "IncomeCases.json"


var margin = {top:30, bottom:30, left:10, right:50}
var viewboxwidth = 500;
var viewboxheight = 400
var width = viewboxwidth - margin.left - margin.right;
var height = viewboxheight - margin.top - margin.bottom;


// Setup graph for Cases per Neighbourhood

var svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", "0 0 "+ viewboxwidth +" "+ viewboxheight)
    .append("g")
    .attr("transform", "translate(" + 40+ "," + 20 + ")"); 

var tooltip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, 0])
    .html(function(d) { return "<b>"+d.properties.AREA_NAME+"</b>" + "<br/>" + "Population (2016) : "+ d.properties.Population + "<br/>" + "Total Cases : " + d.properties.Cases + "<br/>" + "Cases per 10,000 : "+ Math.round(d.properties.perCapita*100) });

svg.call(tooltip);

svg.append("text")             
    .attr("class","axis-title")
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                         (height + margin.top) + ")")
    .style("text-anchor", "middle")
    .text("Average Neighbourhood Income in 2016 ($CAD)");

  svg.append("text")
    .attr("class","axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", -34)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Cases per 10,000");

// Import Dataset
d3.queue()
    .defer(d3.json,url_IncomeCasesData)
    .await(plotScatter)

// Plot Maps 
function plotScatter (error, data){

    var incomeCases = data.features;
    const max_income = d3.max(incomeCases.map(function(e){return e.properties.AVG_INC}))
    const max_cases = d3.max(incomeCases.map(function(e){return e.properties.Cases}))
    const max_cases_percapita = d3.max(incomeCases.map(function(e){return 10000*(e.properties.Cases/e.properties.Population)}))

    var x = d3.scaleLinear()
        .domain([0, max_income])
        .range([ 0, width ]);
    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

  // Add Y axis
    var y = d3.scaleLinear()
        // .domain([0, max_cases])
        .domain([0, max_cases_percapita])
        .range([ height, 0]);
  
    svg.append("g")
        .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(incomeCases)
    .enter()
    .append("circle")
    .attr('id',(d)=>{return('scatter-'+d.properties.AREA_NAME.replace(/[\W]/g,'-'))})
    .attr("cx", function (d) { return x(d.properties.AVG_INC); } )
    .attr("cy", function (d) { return y(10000*(d.properties.Cases/d.properties.Population)); } )
    .attr("r", 4)
    .style("fill", "#69b3a2")
    .attr("zIndex", 10)
    .style("stroke","white")
    .style("stroke-width",1)
    .style("opacity",0.5)
    .on('mouseover',mouseOverScatter)
    .on('mouseout',mouseOutScatter)

  
}


function mouseOverScatter(d){
    d3.select(this)
    .style('fill','#5858FA')
    .style("opacity",0.8)

    tooltip.show(d,this)
    
    d3.select("#boundary-"+d.properties.AREA_NAME.replace(/[\W]/g,'-'))
        .style('fill','#5858FA')
}
function mouseOutScatter(d){
    d3.select(this)
    .style('fill','#69b3a2')
    .style("opacity",0.5)

    tooltip.hide(d,this);

    d3.select("#boundary-"+d.properties.AREA_NAME.replace(/[\W]/g,'-'))
        .style("fill", "#69b3a2")

}

var boundaryLayer = svg.append("g").classed("boundary-layer",true);

// Import Dataset
d3.queue()
    .defer(d3.json,url_IncomeCasesData)
    .await(plotMaps)

// Establish Map Porjection
var projMerc = d3.geoMercator()
    .center([-79.35, 43.73])
    .translate([0.7*width,0.3*height])
    .scale(30000);

var path = d3.geoPath().projection(projMerc);

// Plot Maps 
function plotMaps (error, data){
    var incomeCases = data.features;

    boundaryLayer.selectAll("path")
        .data(incomeCases)
        .enter().append("path")
        .attr("d",path)
        .attr('id',(d)=>{return('boundary-'+d.properties.AREA_NAME.replace(/[\W]/g,'-'))})
        .style("fill", "#69b3a2")
        .style('stroke','white')
        .style('stroke-width',0.5)
        .on('mouseover',mouseOverMap)
        .on('mouseout', mouseOutMap)
};

function mouseOverMap(d){
    d3.select(this)
    .style('fill','#5858FA')

    d3.select("#scatter-"+d.properties.AREA_NAME.replace(/[\W]/g,'-'))
        .style('fill','#5858FA')
}
function mouseOutMap(d){
    d3.select(this)
    .style("fill", "#69b3a2")
    
    d3.select("#scatter-"+d.properties.AREA_NAME.replace(/[\W]/g,'-'))
        .style("fill", "#69b3a2")

}