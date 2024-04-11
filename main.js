
var payouts = [];
var nodes = [];
var links = [];
d3.csv("purse.csv", function (error, purse) {

    d3.json("leaderboard.json", function (error, scores) {
        var players = scores.Players;
        
        payouts = calcPayouts(purse, players);
        players.forEach(function (p) {
            p.purse = payouts[p.position];
            nodes.push({
                id: p.Name,
                group: 3,
                label: p.Name,
                money: p.purse,
                golfer: true
            })
        });
        d3.csv("Masters2024.csv", function (error, data) {
            if (error)
                throw error;

				const chordData = [];


            data.forEach(function (d) {
				const chordRow = [];
                var entry = {
                    id: d.name,
                    picks: [],
                    group: 10,
                    label: d.name
                };
                for (i = 1; i <= 8; i++) {
                    let searchString = d["pick" + i].trim();
                    let player = players.find(item => item.Name === searchString) || null;

                    if (player)
                        entry.picks.push(player);
                }
                entry.picks.forEach(function (pick) {
                    if (pick) {
                        var label = pick.Name
                        links.push({
                            source: d.Name,
                            "target": pick.Name,
                            "value": 3,
                            "label": label
                        });
						chordData.push({count: pick.purse ? pick.purse : 1, node: pick.Name, root: entry.id});
                    }
                });
                entry.money = estimateMoney(entry.picks);

                nodes.push(entry);
            });
            var header = ["name", "money*"];
            tabulate(nodes, header);
			 
			
			chords(chordData);
        });
    });
});

function estimateMoney(picks) {
    var total = 0;
    picks.forEach(function (p) {
        if (p)
            total += purse(p);
    })
    return total;
}

function purse(player) {
    if (player.status === "cut")
        return 0;

    if (player.Rank >= 50)
        return 0;

    var amount = payouts[player.Rank];
    if (!amount)
        return 0;
    return amount;
}

function calcPayouts(purse, players) {
    const payouts = [];
    const ranks = players.reduce((acc, player) => {
        const rank = +player.Rank;
        acc[rank] = (acc[rank] || 0) + 1;
        return acc;
    }, {});

    let shared = 0;
    for (let i = 1; i < 50; i++) {
        if (ranks[i]) {
            shared = 0;
            for (let j = 0; j < ranks[i] && i + j < 50; j++) {
                shared += parseInt(purse[i + j - 1].amount, 10);
            }
            payouts[i] = shared / ranks[i];
        }
    }
    return payouts;
}

function tabulate(data, columns) {
    const table = d3.select('table').attr("class", "table table-striped table-bordered ");
    const thead = table.append('thead');
    const tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(column => column);

    // create a row for each object in the data
    const rows = tbody.selectAll('tr')
        .data(
            data.filter(d => !d.golfer)
                .sort((a, b) => a.golfer ? 1 : b.money - a.money)
        )
        .enter()
        .append('tr');

    // create a cell in each row for each column
    rows.selectAll('td')
        .data(d => {
            const ret = [d.id, parseInt(d.money, 10)];
            d.picks.sort((a, b) => a.position - b.position)
                .forEach(p => ret.push(textDisplay(p)));
            return ret;
        })
        .enter()
        .append('td')
        .html(d => d);

    return table;
}


function textDisplay(player) {
    var label = player.Name;
    if (player.Rank)
        label += "(" + player.Rank + ")";
    else
        label = "<strike>" + label + "</strike>";
    var html = label;
    return html;
}


function chords(mdata){
	//d3.csv('data.csv', function(error, data) {
            var mpr = chordMpr(mdata);
            mpr
                .addValuesToMap('root')
                .addValuesToMap('node')
                .setFilter(function(row, a, b) {
                    return (row.root === a.name && row.node === b.name)
                })
                .setAccessor(function(recs, a, b) {
                    if (!recs[0]) return 0;
                    return +recs[0].count;
                });
            drawChords(mpr.getMatrix(), mpr.getMap());
      //  });

        function drawChords(matrix, mmap) {

            var w = 980,
                h = 800,
                r1 = h / 2,
                r0 = r1 - 110;

            var chord = d3.chord()
                .padAngle(0.05)
                .sortSubgroups(d3.descending)
                .sortChords(d3.descending);

            var arc = d3.arc()
                .innerRadius(r0)
                .outerRadius(r0 + 20);

            var ribbon = d3.ribbon()
                .radius(r0);

            var svg = d3.select("body").append("svg:svg")
                .attr("width", w)
                .attr("height", h)
                .append("svg:g")
                .attr("id", "circle")
                .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
                .datum(chord(matrix));

            svg.append("circle")
                .attr("r", r0 + 20);

            var mapReader = chordRdr(matrix, mmap);


            var g = svg.selectAll("g.group")
                .data(function(chords) {
                    return chords.groups;
                })
                .enter().append("svg:g")
                .attr("class", "group")

            g.append("svg:path")
                .style("stroke", "grey")
                .style("fill", function(d) {
                    return mapReader(d).gdata;
                })
                .attr("d", arc);

            g.append("svg:text")
                .each(function(d) {
                    d.angle = (d.startAngle + d.endAngle) / 2;
                })
                .attr("dy", ".35em")
                .style("font-family", "helvetica, arial, sans-serif")
                .style("font-size", "9px")
                .attr("text-anchor", function(d) {
                    return d.angle > Math.PI ? "end" : null;
                })
                .attr("transform", function(d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                        "translate(" + (r0 + 20 + mapReader(d).gname.length * 3) + ")" +
                        (d.angle > Math.PI ? "rotate(180)" : "");
                })
                .text(function(d) {
                    return mapReader(d).gname;
                });

            var colors = d3.scaleOrdinal(d3.schemeCategory20c);

            var chordPaths = svg.selectAll("path.chord")
                .data(function(chords) {
                    return chords;
                })
                .enter().append("svg:path")
                .attr("class", "chord")
                .style("stroke", "grey")
                .style("fill", function(d, i) {
                    return colors(i)
                })
                .attr("d", ribbon.radius(r0))

        }
}