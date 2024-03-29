var url_IncomeCasesData = "IncomeCases.json"


var margin = {top:10, bottom:10, left:10, right:10}
var viewboxwidth = 500;
var viewboxheight = 400
var width = viewboxwidth - margin.left - margin.right;
var height = viewboxheight - margin.top - margin.bottom;


// Setup graph for Cases per Neighbourhood

var svg1 = d3.select("#chart-1")
    .append("svg")
    .attr("viewBox", "0 0 "+ viewboxwidth +" "+ viewboxheight)
    .append("g")
    .attr("transform", "translate(" + 40+ "," + 0 + ")"); 

var g1 = svg1.append("g")
var boundaryLayer1 = g1.append("g").classed("boundary-layer",true);

var boundaryColor1 = d3.scaleLinear()
    .domain([0,20])
    .clamp(true)
    .range(["#fff","#409A99"]);


var colorBar1 = g1.append("g");
var defs1 = colorBar1.append("defs");

var linearGradient1 = defs1.append("linearGradient")
    .attr("id","linear-gradient-1")
    .attr("x1","0%")
    .attr("y1","0%")
    .attr("x2","100%")
    .attr("y2","0%")

linearGradient1.append("stop")
    .attr("offset","0%")
    .attr("stop-color","#fff")
linearGradient1.append("stop")
    .attr("offset","100%")
    .attr("stop-color","#409A99")

var barWidth1 = 200
var barHeight1 = 12;
var barX1 = 0;
var barY1 = 70

colorBar1.append("rect")
    .attr("width",barWidth1)
    .attr("height",barHeight1)
    .attr("x",barX1)
    .attr("y",barY1)
    .attr('stroke',"#aaa")
    .attr("stroke-width",0.5)
    .style("fill","url(#linear-gradient-1)");

// make responsive arrow on colorbar to indicate number of cases in neighbourhood upon hovering on neighbourhood 
var barIndicator1 = g1.append("text")
    .text("\u25BC")
    .attr("x",200)
    .attr("y",barY1)
    .attr("class","bartext")
var barText1 = g1.append("text")
    .text("")
    .attr("x",200)
    .attr("y",barY1-15)
    .attr("class","bartext")
var hoverScale1 = d3.scaleLinear()
    .domain([0,20])
    .clamp(true)
    .range([barX1,barX1+barWidth1])

var cases_tooltip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, 0])
    .html(function(d) { return "<b>"+d.properties.AREA_NAME+"</b>" + "<br/>" + "Population (2016) : "+ d.properties.Population + "<br/>" + "Total Cases : " + d.properties.Cases + "<br/>" + "Cases per 10,000 : "+ Math.round(d.properties.perCapita*100) });
svg1.call(cases_tooltip);

svg1.append("text")
    .attr("class","title")
    .attr("x",-10)
    .attr("y",30)
    .text("COVID-19 Cases per 10,000")

// Setup graph for Average Income

var svg2 = d3.select("#chart-2")
    .append("svg")
    .attr("viewBox", "0 0 "+ viewboxwidth +" "+ viewboxheight)
    .append("g")
    .attr("transform", "translate(" + 40+ "," + 0 + ")"); 

var g2 = svg2.append("g")
var boundaryLayer2 = g2.append("g").classed("boundary-layer",true);

var colorBar2 = g2.append("g");
var defs2 = colorBar2.append("defs");

var linearGradient2 = defs2.append("linearGradient")
    .attr("id","linear-gradient-2")
    .attr("x1","0%")
    .attr("y1","0%")
    .attr("x2","100%")
    .attr("y2","0%")

linearGradient2.append("stop")
    .attr("offset","0%")
    .attr("stop-color","#fff")
linearGradient2.append("stop")
    .attr("offset","100%")
    .attr("stop-color","#0B61AB")

var barWidth2 = 200
var barHeight2 = 12;
var barX2 = 0;
var barY2 = 70

colorBar2.append("rect")
    .attr("width",barWidth2)
    .attr("height",barHeight2)
    .attr("x",barX2)
    .attr("y",barY2)
    .attr('stroke',"#aaa")
    .attr("stroke-width",0.5)
    .style("fill","url(#linear-gradient-2)");

// make responsive arrow on colorbar to indicate average income of neighbourhood upon hovering on neighbourhood 
var barIndicator2 = g2.append("text")
    .text("\u25BC")
    .attr("x",200)
    .attr("y",barY2)
    .attr("class","bartext")
var barText2 = g2.append("text")
    .text("")
    .attr("x",200)
    .attr("y",barY2-15)
    .attr("class","bartext")
var hoverScale2 = d3.scaleLinear()
    .domain([0,20])
    .clamp(true)
    .range([barX2,barX2+barWidth2])

var income_tooltip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, 0])
    .html(function(d) { return "<b>"+d.properties.AREA_NAME+"</b>" + "<br/>" + "Average Income: " + "\$ " + d.properties.AVG_INC + "<br/>" + "Cases per 10,000 : "+ Math.round(d.properties.perCapita*100)  });;
svg2.call(income_tooltip);	    

var boundaryColor2 = d3.scaleLinear()
    .domain([0,20])
    .clamp(true)
    .range(["#fff","#0B61AB"]);

svg2.append("text")
    .attr("class","title")
    .attr("x",-10)
    .attr("y",30)
    .text("Average Income of Neighbourhood")


// Import Dataset
d3.queue()
    .defer(d3.json,url_IncomeCasesData)
    .await(plotMaps)

// Establish Map Porjection
var projMerc = d3.geoMercator()
    .center([-79.35, 43.73])
    .translate([width/2,height/2])
    .scale(50000);

var path = d3.geoPath().projection(projMerc);

// Plot Maps 
function plotMaps (error, data){

    console.log(data.features)

    var incomeCases = data.features;

    boundaryColor1.domain([d3.min(incomeCases,logCases),d3.max(incomeCases,logCases)])
    hoverScale1.domain([d3.min(incomeCases,caseCount),d3.max(incomeCases,caseCount)])
    console.log(hoverScale1.domain())

    boundaryColor2.domain([d3.min(incomeCases,logIncome),d3.max(incomeCases,logIncome)])
    hoverScale2.domain([d3.min(incomeCases,income),d3.max(incomeCases,income)])

    boundaryLayer1.selectAll("path")
        .data(incomeCases)
        .enter().append("path")
        .attr("d",path)
        .style("fill",fillCases)
        .on("mouseover",mouseOver1)
        .on("mouseout",mouseOut1)
        .on("click",mouseOver1)

    boundaryLayer2.selectAll("path")
        .data(incomeCases)
        .enter().append("path")
        .attr("d",path)
        .style("fill",fillIncome)
        .on("mouseover",mouseOver2)
        .on("mouseout",mouseOut2)
        .on("click",mouseOver2)
};


function mouseOver1(d){
    cases_tooltip.show(d,this)
    d3.select(this).style("fill","orange")
    barIndicator1.attr("x",hoverScale1(d.properties.perCapita)-8)
    barText1.attr("x",hoverScale1(d.properties.perCapita)-8)
    barText1.text(Math.round(d.properties.perCapita*100))

    barIndicator2.attr("x",hoverScale2(d.properties.AVG_INC)-8)
    barText2.attr("x",hoverScale2(d.properties.AVG_INC)-8)
    barText2.text("\$ " + d.properties.AVG_INC)
}

function mouseOut1(d){
    cases_tooltip.hide(d,this)
    d3.select(this).style("fill",fillCases)
}

function mouseOver2(d){
    income_tooltip.show(d,this)
    d3.select(this).style("fill","orange")
    barIndicator1.attr("x",hoverScale1(d.properties.perCapita)-8)
    barText1.attr("x",hoverScale1(d.properties.perCapita)-8)
    barText1.text(Math.round(d.properties.perCapita*100))

    barIndicator2.attr("x",hoverScale2(d.properties.AVG_INC)-8)
    barText2.attr("x",hoverScale2(d.properties.AVG_INC)-8)
    barText2.text("\$ " + d.properties.AVG_INC)
}

function mouseOut2(d){
    income_tooltip.hide(d,this)
    d3.select(this).style("fill",fillIncome)
}

function income(d){
return d.properties.AVG_INC;
}

function caseCount(d){
return d.properties.perCapita;
}

function logCases(d){
return d.properties.log_perCapita;
}
function logIncome(d){
return d.properties.log_AVG_INC;
}

function fillCases(d){
return boundaryColor1(logCases(d))
}
function fillIncome(d){
return boundaryColor2(logIncome(d))
}
