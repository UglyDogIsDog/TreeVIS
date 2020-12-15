RadarChart.defaultConfig.color = function () { };
RadarChart.defaultConfig.radius = 3;
RadarChart.defaultConfig.w = width_tree;
RadarChart.defaultConfig.h = width_tree;

function formRadarData(node) {
    console.log(dataTree)
    let heightArr = dataHeight.map(height => -height)
    console.log(heightArr)
    let heightSorted = heightArr.slice().sort(function (a, b) { return a - b })

    let subcategoryCntArr = dataTree.map(node => (node.children ? node.children.length : (node._children ? node._children.length : 0)))
    let subcategoryCntSorted = subcategoryCntArr.slice().sort(function (a, b) { return a - b })

    let sizeArr = dataTree.map(node => node.size)
    let sizeSorted = sizeArr.slice().sort(function (a, b) { return a - b })

    let totalSizeArr = dataTree.map(node => node.total_size)
    let totalSizeSorted = totalSizeArr.slice().sort(function (a, b) { return a - b })

    let similarCategoriesCntArr = dataTree.map(node => node.similar_categories)
    let similarCategoriesCntSorted = similarCategoriesCntArr.slice().sort(function (a, b) { return a - b })

    let similarCntArr = dataTree.map(node => node.similar_number)
    let similarCntSorted = similarCntArr.slice().sort(function (a, b) { return a - b })

    return {
        realName: node.name,
        className: node.name.replace(/\s/g, '').replace(/[&,#;]/g, ''),
        axes: [
            { axis: "Height", value: heightSorted.indexOf(-(node.depth)) },
            { axis: "Subcategory Cnt", value: subcategoryCntSorted.indexOf(node.children ? node.children.length : (node._children ? node._children.length : 0)) },
            { axis: "Size", value: sizeSorted.indexOf(node.size) },
            { axis: "Total Size", value: totalSizeSorted.indexOf(node.total_size) },
            { axis: "Similar Categories Cnt", value: similarCategoriesCntSorted.indexOf(node.similar_categories) },
            { axis: "Similar Cnt", value: similarCntSorted.indexOf(node.similar_number) },
        ]
    }
}


function getData(dataNodes) {
    return dataNodes.map(function (d) {
        return {
            realName: d.realName,
            className: d.className,
            axes: d.axes.map(function (axis, i) {
                //return { axis: axis.axis, value: Math.round(100 * axis.value / Math.max(1, Math.max(...(dataNodes.map(d => d.axes[i].value))))) };
                return { axis: axis.axis, value: axis.value }
            })
        };
    });
}

function getEmptyNode() {
    return [{
        className: "blank",
        axes: [
            { axis: "Height", value: 0 },
            { axis: "Subcategory Cnt", value: 0 },
            { axis: "Size", value: 0 },
            { axis: "Total Size", value: 0 },
            { axis: "Similar Categories Cnt", value: 0 },
            { axis: "Similar Cnt", value: 0 },
        ]
    }]
}

let chart = RadarChart.chart();
let svg_radar = d3.select('#radar')
    .attr("width", width_tree + margin_tree.left + margin_tree.right)
    .attr("height", height_tree + margin_tree.top + margin_tree.bottom)
    .append('g')
    .attr("transform", "translate(" + margin_tree.left + "," + margin_tree.top + ")")
    .classed('single', 1)
    .datum(getData(getEmptyNode()))
    .call(chart);
let colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]

function render_radar(data) {
    svg_radar.remove()


    var sheet = window.document.styleSheets[0];
    for (let i = 0; i < data.length; i++) {
        sheet.insertRule('.area.' + data[i].className + ', .' + data[i].className + ' .circle { fill: ' + colors[i] + '; stroke:none; }', sheet.cssRules.length);


    }


    svg_radar = d3.select('#radar')
        .attr("width", width_tree + margin_tree.left + margin_tree.right)
        .attr("height", height_tree + margin_tree.top + margin_tree.bottom)
        .append('g')
        .attr("transform", "translate(" + margin_tree.left + "," + margin_tree.top + ")")
        .classed('single', 1)
        .datum(getData(data))
        .call(chart)

    for (let i = 0; i < data.length; i++) {
        svg_radar.append("circle")
            .attr("transform", "translate(" + (80 + (i % 4) * 200) + "," + (width_tree + 30 * (1 + parseInt(i / 4))) + ")")
            .attr("r", 6)
            .style("fill", colors[i])
            .style("fill-opacity", 0.7)
            .on('click', function (d) {
                dataRadar.splice(i, 1);
                render_radar(dataRadar)
            })
            .style("cursor", "pointer")

        svg_radar.append("text")
            .attr("transform", "translate(" + (100 + (i % 4) * 200) + "," + (width_tree + 30 * (1 + parseInt(i / 4))) + ")")
            .text(data[i].realName)
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")
    }

}

