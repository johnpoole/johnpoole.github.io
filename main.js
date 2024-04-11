
var payouts = [];
var nodes = [];
var links = [];
d3.csv("purse.csv", function (error, purse) {

    d3.json("leaderboard.json", function (error, scores) {
        var players = scores.Players;
        players.forEach(function (p) {
            p.Player = p.Name;
        });
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



            data.forEach(function (d) {
                var entry = {
                    id: d.name,
                    picks: [],
                    group: 10,
                    label: d.name
                };
                for (i = 1; i <= 8; i++) {
                    let searchString = d["pick" + i].trim();
                    let player = players.find(item => item.Player === searchString) || null;

                    if (player)
                        entry.picks.push(player);
                }
                entry.picks.forEach(function (pick) {
                    if (pick) {
                        var label = pick.Player
                        links.push({
                            source: d.Name,
                            "target": pick.Player,
                            "value": 3,
                            "label": label
                        });
                    }
                });
                entry.money = estimateMoney(entry.picks);

                nodes.push(entry);
            });
            var header = ["name", "money"];
            tabulate(nodes, header);

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

    if (player.position >= 50)
        return 0;

    var amount = payouts[player.position];
    if (!amount)
        return 0;
    return amount;
}

function calcPayouts(purse, players) {
    const payouts = [];
    const ranks = players.reduce((acc, player) => {
        const rank = +player.pos;
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
    var label = player.Player;
    if (player.position)
        label += "(" + player.position + ")";
    else
        label = "<strike>" + label + "</strike>";
    var html = label;
    return html;
}


