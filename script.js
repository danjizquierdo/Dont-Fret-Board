// Set basic data
var dataset = [28, 40, 56, 50, 75, 90, 120, 120, 100];
var fretWidth = 500, chartHeight = 300, strPadding = 5;
var strWidth = (fretWidth / dataset.length);
var svg = d3.select(‘svg’)
.attr(“width”, fretWidth)
.attr(“height”, strHeight);
var fret = svg.selectAll(“rect”)
.data(dataset)
.enter()
.append(“rect”)
.attr(“y”, function(d) {
return fretHeight — d
})
.attr(“height”, function(d) {
return d;
})
.attr(“width”, strWidth — strPadding)
.attr(“fill”, ‘#F2BF23’)
.attr(“transform”, function (d, i) {
var translate = [strWidth * i, 0];
return “translate(“+ translate +”)”;
});