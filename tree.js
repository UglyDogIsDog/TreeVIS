var bound_tree = document.getElementById("container_tree").getBoundingClientRect();
var margin_tree = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
},
    width_tree = bound_tree.width - margin_tree.left - margin_tree.right, height_tree = bound_tree.height - margin_tree.top - margin_tree.bottom;

var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree().size([height_tree, width_tree]);
var diagonal = d3.svg.diagonal()
    .projection(function (d) { return [d.y, d.x]; });

var scale = 1.0;

var zoom = d3.behavior.zoom()
    .scale(scale)
    .scaleExtent([1, 5])
    .on("zoom", zoomed);

var svg = d3.select("#tree")
    .attr("width", width_tree + margin_tree.left + margin_tree.right)
    .attr("height", height_tree + margin_tree.top + margin_tree.bottom)
    .call(zoom)
    .append("g")
    .attr("transform", "translate(" + margin_tree.left + "," + margin_tree.top + ")scale(1,1)");

function zoomed() {
    var translateX = d3.event.translate[0];
    var translateY = d3.event.translate[1];
    var xScale = d3.event.scale;
    svg.attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + xScale + ")");
}


function getDataTreeArr(node, height) {
    dataTree.push(node)
    dataHeight.push(height)
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            getDataTreeArr(node.children[i], height + 1)
        }
    }
    if (node._children) {
        for (let i = 0; i < node._children.length; i++) {
            getDataTreeArr(node._children[i], height + 1)
        }
    }
}



function update(source, minCnt = 0, similar_map = {}, selected_id = null) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse()
    var links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) { d.y = d.depth * 280; });

    dataTree = []
    dataHeight = []
    getDataTreeArr(root, 0)

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", function (d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d, minCnt);
        })
        .on("mouseover", function (d) {
            update(root, minCnt, d.similar_map, d.id)
        })
        .on("mouseout", function (d) {
            update(root, minCnt)
        })
        .on('contextmenu', function (d) {
            dataRadar.push(formRadarData(d))
            render_radar(dataRadar)
        });

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function (d) {
            if (d.id === selected_id || similar_map[d.id]) {
                return "red"
            }
            return d._children ? "lightsteelblue" : "#fff";
        })
        .style("fill-opacity", function (d) {
            if (similar_map[d.id]) {
                if (similar_map[d.id] < 10) {
                    return 0.3
                }
                else if (similar_map[d.id] < 30) {
                    return 0.6
                }
            }
        })

    nodeEnter.append("text")
        .attr("x", function (d) { return d.children || d._children ? -13 : 13; })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
        .text(function (d) { return d.name; })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 5)
        .style("fill", function (d) {
            if (d.id === selected_id || similar_map[d.id]) {
                return "red"
            }
            return d._children ? "lightsteelblue" : "#fff";
        })
        .style("fill-opacity", function (d) {
            if (similar_map[d.id]) {
                if (similar_map[d.id] < 10) {
                    return 0.3
                }
                else if (similar_map[d.id] < 30) {
                    return 0.6
                }
            }
        })

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function (d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

function collapse(d) {
    if (d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
    }
}

$(document).on('contextmenu', function (e) {
    e.preventDefault();
});