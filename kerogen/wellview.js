let wellCrossfilter;
let xDimension, yDimension, zDimension;
let charts = [];
let origin = getParameter('origin', [500, 375]),
  scale = getParameter('scale', 5),
  key = function(d) {
    return d.id;
  },
  startAngleX = getParameter('startAngleX', 2.356194490192345),
  startAngleY = getParameter('startAngleY', 0.7034435724342363);
let wellIDFocus = "None";
let ZScale = d3.scaleLinear().range([0, 100]);
let XScale = d3.scaleLinear().range([0, 100]);
let YScale = d3.scaleLinear().range([0, 100]);
let svg = d3.select('svg');
svg.selectAll('*').remove();
svg = svg.call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');

let colorList = ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'];
const reverse = [...colorList].reverse();
let color = d3.scaleQuantize().range(reverse);

let zCategory = "hi",
  xCategory = "oi",
  yCategory = "s2s3",
  vCategory = "toc";

let mx, my, mouseX, mouseY;

let grid3d = d3._3d()
  .shape('GRID', 10)
  .origin(origin)
  .rotateY(startAngleY)
  .rotateX(startAngleX)
  .scale(scale);

let point3d = d3._3d()
  .x(function(d) {
    return d.x;
  })
  .y(function(d) {
    return d.y;
  })
  .z(function(d) {
    return d.z;
  })
  .origin(origin)
  .rotateY(startAngleY)
  .rotateX(startAngleX)
  .scale(scale);

let yScale3d = d3._3d()
  .shape('LINE_STRIP')
  .origin(origin)
  .rotateY(startAngleY)
  .rotateX(startAngleX)
  .scale(scale);

function processData(data, tt) {
  let xGrid = svg.selectAll('path.grid').data(data[0], key);

  xGrid
    .enter()
    .append('path')
    .attr('class', '_3d grid')
    .merge(xGrid)
    .attr('stroke', 'black')
    .attr('stroke-width', 0.3)
    .attr('fill', function(d) {
      return d.ccw ? '#717171' : 'lightgrey';
    })
    .attr('fill-opacity', 0.9)
    .attr('d', grid3d.draw);

  xGrid.exit().remove();

  let points = svg.selectAll('circle').data(data[1], key);

  points
    .enter()
    .append('circle')
    .attr('class', '_3d')
    .attr('opacity', 0)
    .attr('cx', posPointX)
    .attr('cy', posPointY)
    .merge(points)
    .transition().duration(tt)
    .attr('r', function(d) {
      if (d.wellID == wellIDFocus) {
        return 6;
      }
      return 3;
    })
    .attr('stroke', function(d) {
      return d3.color(color(d.value)).darker(3);
    })
    .attr('fill', function(d) {
      return color(d.value);
    })
    .attr('opacity', 1)
    .attr('cx', posPointX)
    .attr('cy', posPointY);

  points.exit().remove();

  let yScale = svg.selectAll('path.yScale').data(data[2]);

  yScale
    .enter()
    .append('path')
    .attr('class', '_3d yScale')
    .merge(yScale)
    .attr('stroke', 'black')
    .attr('stroke-width', .5)
    .attr('d', yScale3d.draw);

  yScale.exit().remove();

  let yText = svg.selectAll('text.yText').data(data[2][0]);

  yText
    .enter()
    .append('text')
    .attr('class', '_3d yText')
    .attr('dx', '.3em')
    .merge(yText)
    .each(function(d) {
      d.centroid = {
        x: d.rotated.x,
        y: d.rotated.y,
        z: d.rotated.z
      };
    })
    .attr('x', function(d) {
      return d.projected.x;
    })
    .attr('y', function(d) {
      return d.projected.y;
    })
    .attr('stroke', function(d, i) {
      if (i == (yText.size() + 1) / 2)
        return 'black'
      return '';
    })
    .text(function(d, i) {
      if (i == (yText.size() + 1) / 2) return "[" + yCategory + "]";
      return YScale.invert(d[1]).toFixed(2);
    });

  yText.exit().remove();

  let xText = svg.selectAll('text.xText').data(data[3][0]);

  xText
    .enter()
    .append('text')
    .attr('class', '_3d xText')
    .attr('dx', '.3em')
    .merge(xText)
    .each(function(d) {
      d.centroid = {
        x: d.rotated.x,
        y: d.rotated.y,
        z: d.rotated.z
      };
    })
    .attr('x', function(d) {
      return d.projected.x;
    })
    .attr('y', function(d) {
      return d.projected.y;
    })
    .attr('stroke', function(d, i) {
      if (i == xText.size() / 2)
        return 'black'
      return '';
    })
    .text(function(d, i) {
      if (i == 0) return "";
      if (i == xText.size() / 2) return "[" + xCategory + "]";
      return Math.round(XScale.invert(d[0]) * 100) / 100;
    });

  xText.exit().remove();

  let zText = svg.selectAll('text.zText').data(data[4][0]);

  zText
    .enter()
    .append('text')
    .attr('class', '_3d zText')
    .attr('dx', '.3em')
    .merge(zText)
    .each(function(d) {
      d.centroid = {
        x: d.rotated.x,
        y: d.rotated.y,
        z: d.rotated.z
      };
    })
    .attr('x', function(d) {
      return d.projected.x;
    })
    .attr('y', function(d) {
      return d.projected.y;
    })
    .attr('stroke', function(d, i) {
      if (i == zText.size() / 2)
        return 'black'
      return '';
    })
    .text(function(d, i) {
      if (i == 0) return "";
      if (i == zText.size() / 2) return "[" + zCategory + "]";
      return Math.round(ZScale.invert(d[2]) * 100) / 100;
    });

  zText.exit().remove();

  d3.selectAll('._3d').sort((a, b) => a.centroid.z - b.centroid.z);

  Legend.render(vCategory, reverse);
}

function posPointX(d) {
  if (d.projected.x)
    return d.projected.x;
  return "";
}

function posPointY(d) {
  return d.projected.y;
}

function getParameter(param, defaultValue) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(param) ? JSON.parse(urlParams.get(param)) : defaultValue;
}

function init() {
  let cnt = 0;
  let xGrid = [], scatter = [], yLine = [], xLine = [], zLine = [];
window.xGrid = xGrid; window.scatter = scatter; window.yLine = yLine; window.xLine = xLine; window.zLine = zLine;
  let ZExtent = d3.extent(wells, function(d) {
    return parseFloat(d[zCategory]);
  });
  let XExtent = d3.extent(wells, function(d) {
    return parseFloat(d[xCategory]);
  });
  let YExtent = d3.extent(wells, function(d) {
    return parseFloat(d[yCategory]);
  });
  let VExtent = d3.extent(wells, function(d) {
    return parseFloat(d[vCategory]);
  });

  color.domain(VExtent);
  ZScale.domain(ZExtent).nice();
  XScale.domain(XExtent).nice();

  if (yCategory == "s2s3") {
    console.log("switch to log scale");
    YScale = d3.scaleLog().range([0, 100]);
    YScale.domain(YExtent);
  } else {
    YScale = d3.scaleLinear().range([0, 100]);
    YScale.domain(YExtent).nice();
  }

  for (const d of wells) {
    scatter.push({
      x: XScale(parseFloat(d[xCategory])),
      y: YScale(parseFloat(d[yCategory])),
      z: ZScale(parseFloat(d[zCategory])),
      id: 'point_' + cnt++,
      value: d[vCategory],
      wellID: d.wellID
    });
  }
  for (let z = 0; z < 100; z += 10) {
    for (let x = 0; x < 100; x += 10) {
      xGrid.push([x, -10, z]);
    }
  }

  d3.range(-10, 100, 10).forEach(
    function(d) {
      yLine.push([0, d, 0]);
    });

  d3.range(0, 100, 10).forEach(
    function(d) {
      xLine.push([d, 0, 0]);
    });
  d3.range(0, 100, 10).forEach(
    function(d) {
      zLine.push([0, 0, d]);
    });

  let data = [
    grid3d(window.xGrid),
    point3d(window.scatter),
    yScale3d([window.yLine]),
    yScale3d([window.xLine]),
    yScale3d([window.zLine])
  ];

  processData(data, 1);
}

let wells;
let allWells;
d3.csv("data.csv").then(function(data) {
  allWells = data;
  wellCrossfilter = crossfilter(allWells);

  d3.selectAll('#color, #xaxis, #yaxis, #zaxis').selectAll('option').data(allWells.columns).enter().append('option').text(function(d) {
    return d;
  })

  let wellIDs = d3.map(allWells, function(d) {
    return d.wellID
  }).keys();
  wellIDs.splice(0, 0, "None");
  d3.select("#well").selectAll("option").data(wellIDs).enter().append("option").text(function(d) {
    return d;
  })
  buildCrossFilters();
  init();
});

function dragStart() {
  mx = d3.event.x;
  my = d3.event.y;
}

function dragged() {
  mouseX = mouseX || 0;
  mouseY = mouseY || 0;
  const { beta, alpha } = calculateRotation(d3.event.x, d3.event.y);
  let data = [
    grid3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(xGrid),
    point3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(scatter),
    yScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([yLine]),
    yScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([xLine]),
    yScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([zLine])
  ];
  processData(data, 0);
}

function calculateRotation(x, y) {
  const beta = (x - mx + mouseX) * Math.PI / 230 * (-1);
  const alpha = (y - my + mouseY) * Math.PI / 230 * (-1);
  return { beta, alpha };
}

function dragEnd() {
  const { beta, alpha } = calculateRotation(d3.event.x - mx, d3.event.y - my);
  mouseX += beta;
  mouseY += alpha;
}

d3.selectAll('#color').on('change', updateV);

function updateV() {
  vCategory = this.value;
  init();
}

d3.selectAll('#xaxis').on('change', updateX);

function updateX() {
  xCategory = this.value;
  buildCrossFilters();
  init();
}

d3.selectAll('#yaxis').on('change', updateY);

function updateY() {
  yCategory = this.value;
  buildCrossFilters();
  init();
}

d3.selectAll('#zaxis').on('change', updateZ);

function updateZ() {
  zCategory = this.value;
  buildCrossFilters();
  init();
}

d3.selectAll('#well').on('change', updateWellFocus);

function updateWellFocus() {
  wellIDFocus = this.value;
  init();
}

let slider = document.getElementById("myRange");

slider.oninput = function() {
  setScale(this.value / 2);
  init();
}

document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 37:
      setOriginX(--origin[0]);
      break;
    case 38:
      setOriginY(--origin[1]);
      break;
    case 39:
      setOriginX(++origin[0]);
      break;
    case 40:
      setOriginY(++origin[1]);
      break;
  }
};

function setScale(scale) {
  grid3d.scale(scale);
  point3d.scale(scale);
  yScale3d.scale(scale);
}

function setOriginX(originX) {
  origin[0] = originX;
  grid3d.origin(origin);
  point3d.origin(origin);
  yScale3d.origin(origin);
  init();
}

function setOriginY(originY) {
  origin[1] = originY;
  grid3d.origin(origin);
  point3d.origin(origin);
  yScale3d.origin(origin);
  init();
}

function buildCrossFilters() {
  if (xDimension) {
    xDimension.dispose();
    yDimension.dispose();
    zDimension.dispose();
}

xDimension = null;
yDimension = null;
zDimension = null;
  const formatNumber = d3.format(',d');

  let ZExtent = d3.extent(allWells, function(d) {
    return parseFloat(d[zCategory]);
  });
  let XExtent = d3.extent(allWells, function(d) {
    return parseFloat(d[xCategory]);
  });
  let YExtent = d3.extent(allWells, function(d) {
    return parseFloat(d[yCategory]);
  });
  let VExtent = d3.extent(allWells, function(d) {
    return parseFloat(d[vCategory]);
  });

  const all = wellCrossfilter.groupAll();

  if (!xDimension) {
    xDimension = wellCrossfilter.dimension(d => parseFloat(d[xCategory]));
    yDimension = wellCrossfilter.dimension(d => parseFloat(d[yCategory]));
    zDimension = wellCrossfilter.dimension(d => parseFloat(d[zCategory]));
  }

  xDimension = wellCrossfilter.dimension(d => parseFloat(d[xCategory]));
  const xGroup = xDimension.group(function(d) {
    return groupSize(d, XExtent);
  });

  zDimension = wellCrossfilter.dimension(d => parseFloat(d[zCategory]));
  const zGroup = zDimension.group(function(d) {
    return groupSize(d, ZExtent);
  });

  yDimension = wellCrossfilter.dimension(d => parseFloat(d[yCategory]));
  const yGroup = yDimension.group(function(d) {
    return groupSize(d, YExtent);
  });

   charts = [
    barChart()
    .title(xCategory)
    .dimension(xDimension)
    .group(xGroup)
    .x(d3.scaleLinear()
      .domain(d3.extent(allWells, function(d) {
        return parseFloat(d[xCategory]);
      }))
      .rangeRound([0, 250])).bind( this),

    barChart()
    .title(zCategory)
    .dimension(zDimension)
    .group(zGroup)
    .x(d3.scaleLinear()
      .domain(d3.extent(allWells, function(d) {
        return parseFloat(d[zCategory]);
      }))
      .rangeRound([0, 250]))
      .bind(this),

    barChart()
    .title(yCategory)
    .dimension(yDimension)
    .group(yGroup)
    .x(d3.scaleLinear()
      .domain(d3.extent(allWells, function(d) {
        return parseFloat(d[yCategory]);
      }))
      .rangeRound([0, 250])).bind(this),
  ];

  const chart = d3.selectAll('.chart')
    .data(charts);

  d3.selectAll('#total')
    .text(formatNumber(wellCrossfilter.size()));

  renderAll();

  function render(method) {
    d3.select(this).call(method);
  }

  function renderAll() {
    chart.each(render);
    d3.select('#active').text(formatNumber(all.value()));
    wells = xDimension.top(Infinity);
    init();
  }

  window.filter = filters => {
    filters.forEach((d, i) => {
      charts[i].filter(d);
    });
    renderAll();
  };

  window.reset = i => {
    charts[i].filter(null);
    renderAll();
  };
  window.renderAll = function() {
    renderAll();
  };


}

function groupSize(d, extent) {
  let binsize = (Math.floor(extent[1] - extent[0]) * 100) / 10000.0;
  let ret = Math.floor(d / binsize);
  ret *= binsize
  return ret;
}

function exportData(){
  Exporter.exportData(wells);
}