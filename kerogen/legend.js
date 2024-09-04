const Legend = {

    render: function (vCategory, vColor) {
        var legendsvg = d3.select(".mainsvg");
        legendsvg.select(".legendLinear").remove();

        legendsvg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(20,20)");

        var legendLinear = d3.legendColor()
            .shapeWidth(30)
            .cells(10)
            .orient('vertical')
            .title(vCategory)
            .scale(color);

        legendsvg.select(".legendLinear")
            .call(legendLinear);
    }
};