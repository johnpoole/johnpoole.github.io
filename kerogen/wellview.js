  var wellCrossfilter;
  var xDimension, yDimension, zDimension;
  var origin = [500, 375],
    scale = 5,
    key = function(d) {
      return d.id;
    },
    startAngleX = 2.356194490192345,
    startAngleY = 0.7034435724342363; //startAngleX = -Math.PI/4, startAngleY = Math.PI/4;
  var wellIDFocus = "None";
  var ZScale = d3.scaleLinear().range([0, 100]);
  var XScale = d3.scaleLinear().range([0, 100]);
  var YScale = d3.scaleLinear().range([0, 100]);
  var svg = d3.select('svg').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');

  var colorList = ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'];
  var reverse = colorList.reverse();
  var color = d3.scaleQuantize().range(reverse);

  var zCategory = "hi",
    xCategory = "oi",
    yCategory = "s2s3",
    vCategory = "toc";

  var mx, my, mouseX, mouseY;

  var grid3d = d3._3d()
    .shape('GRID', 10)
    .origin(origin)
    .rotateY(startAngleY)
    .rotateX(startAngleX)
    .scale(scale);

  var point3d = d3._3d()
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

  var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY(startAngleY)
    .rotateX(startAngleX)
    .scale(scale);

  function processData(data, tt) {

    /* ----------- GRID ----------- */

    var xGrid = svg.selectAll('path.grid').data(data[0], key);

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

    /* ----------- POINTS ----------- */

    var points = svg.selectAll('circle').data(data[1], key);

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

    /* ----------- y-Scale ----------- */

    var yScale = svg.selectAll('path.yScale').data(data[2]);

    yScale
      .enter()
      .append('path')
      .attr('class', '_3d yScale')
      .merge(yScale)
      .attr('stroke', 'black')
      .attr('stroke-width', .5)
      .attr('d', yScale3d.draw);

    yScale.exit().remove();

    /* ----------- y-Scale Text ----------- */

    var yText = svg.selectAll('text.yText').data(data[2][0]);

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

    /* ----------- x-Scale Text ----------- */

    var xText = svg.selectAll('text.xText').data(data[3][0]);

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

    /* ----------- z-Scale Text ----------- */

    var zText = svg.selectAll('text.zText').data(data[4][0]);

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

    d3.selectAll('._3d').sort(d3._3d().sort);

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

  function posPointX(d) {
    if (d.projected.x)
      return d.projected.x;
    return "";
  }

  function posPointY(d) {
    return d.projected.y;
  }
  //HI vs OI vs S2dS3, color TOC

  function init() {
    var cnt = 0;
    xGrid = [], scatter = [], yLine = [], xLine = [], zLine = [];
    var ZExtent = d3.extent(wells, function(d) {
      return parseFloat(d[zCategory]);
    });
    var XExtent = d3.extent(wells, function(d) {
      return parseFloat(d[xCategory]);
    });
    var YExtent = d3.extent(wells, function(d) {
      return parseFloat(d[yCategory]);
    });
    var VExtent = d3.extent(wells, function(d) {
      return parseFloat(d[vCategory]);
    });

    color.domain(VExtent);
    ZScale.domain(ZExtent).nice();
    XScale.domain(XExtent).nice();
    //TODO: check for s2s3 here, and switch to log scale if so
    if (yCategory == "s2s3") {
      console.log("switch to log scale");
      YScale = d3.scaleLog().range([0, 100]);
      YScale.domain(YExtent);
    } else {
      YScale = d3.scaleLinear().range([0, 100]);
      YScale.domain(YExtent).nice();
    }

    wells.forEach(function(d) {
      scatter.push({
        x: XScale(parseFloat(d[xCategory])),
        y: YScale(parseFloat(d[yCategory])),
        z: ZScale(parseFloat(d[zCategory])),
        id: 'point_' + cnt++,
        value: d[vCategory],
        wellID: d.wellID
      });
    })
    for (var z = 0; z < 100; z += 10) { //z-range
      for (var x = 0; x < 100; x += 10) { //x-range
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

    var data = [
      grid3d(xGrid),
      point3d(scatter),
      yScale3d([yLine]),
      yScale3d([xLine]),
      yScale3d([zLine])
    ];

    processData(data, 1);
  }
  var wells;
  var allWells;
  d3.csv("data.csv", function(data) {
    allWells = data;
    wellCrossfilter = crossfilter(allWells);

    d3.select("#color").selectAll("option").data(allWells.columns).enter().append("option").text(function(d) {
      return d;
    })
    d3.select("#xaxis").selectAll("option").data(allWells.columns).enter().append("option").text(function(d) {
      return d;
    })
    d3.select("#yaxis").selectAll("option").data(allWells.columns).enter().append("option").text(function(d) {
      return d;
    })
    d3.select("#zaxis").selectAll("option").data(allWells.columns).enter().append("option").text(function(d) {
      return d;
    })

    var wellIDs = d3.map(allWells, function(d) {
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
    var beta = (d3.event.x - mx + mouseX) * Math.PI / 230 * (-1);
    var alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);
    var data = [
      grid3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(xGrid),
      point3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(scatter),
      yScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([yLine]),
      yScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([xLine]),
      yScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([zLine])
    ];
    processData(data, 0);
  }

  function dragEnd() {
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
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
  var slider = document.getElementById("myRange");

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    setScale(this.value / 2);
    //setOriginX( this.value*5);
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

    console.log(allWells.length);
    if (typeof xDimension !== 'undefined') {
      xDimension.dispose();
      yDimension.dispose();
      zDimension.dispose();
    }
    // Various formatters.
    const formatNumber = d3.format(',d');

    var ZExtent = d3.extent(allWells, function(d) {
      return parseFloat(d[zCategory]);
    });
    var XExtent = d3.extent(allWells, function(d) {
      return parseFloat(d[xCategory]);
    });
    var YExtent = d3.extent(allWells, function(d) {
      return parseFloat(d[yCategory]);
    });
    var VExtent = d3.extent(allWells, function(d) {
      return parseFloat(d[vCategory]);
    });

    const all = wellCrossfilter.groupAll();

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

    var charts = [

      barChart()
      .title(xCategory)
      .dimension(xDimension)
      .group(xGroup)
      .x(d3.scaleLinear()
        .domain(d3.extent(allWells, function(d) {
          return parseFloat(d[xCategory]);
        }))
        .rangeRound([0, 250])),

      barChart()
      .title(zCategory)
      .dimension(zDimension)
      .group(zGroup)
      .x(d3.scaleLinear()
        .domain(d3.extent(allWells, function(d) {
          return parseFloat(d[zCategory]);
        }))
        .rangeRound([0, 250])),

      barChart()
      .title(yCategory)
      .dimension(yDimension)
      .group(yGroup)
      .x(d3.scaleLinear()
        .domain(d3.extent(allWells, function(d) {
          return parseFloat(d[yCategory]);
        }))
        .rangeRound([0, 250])),
    ];

    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    const chart = d3.selectAll('.chart')
      .data(charts);

    // Render the total.
    d3.selectAll('#total')
      .text(formatNumber(wellCrossfilter.size()));

    renderAll();

    // Renders the specified chart or list.
    function render(method) {
      d3.select(this).call(method);
    }

    // Whenever the brush moves, re-rendering everything.
    function renderAll() {
      chart.each(render);
      //  list.each(render);
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

    function barChart() {
      if (!barChart.id) barChart.id = 0;

      let margin = {
        top: 10,
        right: 13,
        bottom: 20,
        left: 10
      };
      let x;
      let y = d3.scaleLinear().range([50, 0]);
      const id = barChart.id++;
      const axis = d3.axisBottom();
      var brush = d3.brushX();
      let brushDirty;
      let dimension;
      let group;
      let round;
      let gBrush;
      let title;

      function chart(div) {
        const width = x.range()[1];
        const height = y.range()[0];

        brush.extent([
          [0, 0],
          [width, height]
        ]);

        y.domain([0, group.top(1)[0].value]); //highest count?
        div.each(function() {
          const div = d3.select(this);
          let g = div.select('g');

          // Create the skeletal chart.//check for a new category
          var currentTitle = div.select('.title').select('b').text();

          if (g.empty() || currentTitle != title) {

            div.select('.title').select('b').text(title);
            div.select('.title').append('a')
              .attr('href', `javascript:reset(${id})`)
              .attr('class', 'reset')
              .text('reset')
              .style('display', 'none');
            div.select('svg').remove();
            g = div.append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', `translate(${margin.left},${margin.top})`);

            g.append('clipPath')
              .attr('id', `clip-${id}`)
              .append('rect')
              .attr('width', width)
              .attr('height', height);

            g.selectAll('.bar')
              .data(['background', 'foreground'])
              .enter().append('path')
              .attr('class', d => `${d} bar`)
              .datum(group.all());

            g.selectAll('.foreground.bar')
              .attr('clip-path', `url(#clip-${id})`);

            g.append('g')
              .attr('class', 'axis')
              .attr('transform', `translate(0,${height})`)
              .call(axis);

            // Initialize the brush component with pretty resize handles.
            //?? remove the brush here?
            //  g.selectAll('.brush').remove();
            gBrush = g.append('g')
              .attr('class', 'brush')
              .call(brush);

            gBrush.selectAll('.handle--custom')
              .data([{
                type: 'w'
              }, {
                type: 'e'
              }])
              .enter().append('path')
              .attr('class', 'brush-handle')
              .attr('cursor', 'ew-resize')
              .attr('d', resizePath)
              .style('display', 'none');
          }

          // Only redraw the brush if set externally.
          if (brushDirty !== false) {
            const filterVal = brushDirty;
            brushDirty = false;

            div.select('.title a').style('display', d3.brushSelection(div) ? null : 'none');

            if (!filterVal) {
              g.call(brush);

              g.selectAll(`#clip-${id} rect`)
                .attr('x', 0)
                .attr('width', width);

              g.selectAll('.brush-handle').style('display', 'none');
            } else {
              const range = filterVal.map(x);
              brush.move(gBrush, range);
            }
          }

          g.selectAll('.bar').attr('d', barPath);
        });

        function barPath(groups) { //groups is the list of values and their count for each set of bars
          const path = [];
          let i = -1;
          const n = groups.length;
          let d;
          while (++i < n) {
            d = groups[i];
            path.push('M', x(d.key), ',', height, 'V', y(d.value), 'h9V', height);
          }
          return path.join('');
        }

        function resizePath(d) {
          const e = +(d.type === 'e');
          const x = e ? 1 : -1;
          const y = height / 3;
          return `M${0.5 * x},${y}A6,6 0 0 ${e} ${6.5 * x},${y + 6}V${2 * y - 6}A6,6 0 0 ${e} ${0.5 * x},${2 * y}ZM${2.5 * x},${y + 8}V${2 * y - 8}M${4.5 * x},${y + 8}V${2 * y - 8}`;
        }
      }

      brush.on('start.chart', function() {
        const div = d3.select(this.parentNode.parentNode.parentNode);
        div.select('.title a').style('display', null);
      });

      brush.on('brush.chart', function() {
        const g = d3.select(this.parentNode);
        const brushRange = d3.event.selection || d3.brushSelection(this); // attempt to read brush range
        const xRange = x && x.range(); // attempt to read range from x scale
        let activeRange = brushRange || xRange; // default to x range if no brush range available
        const hasRange = activeRange &&
          activeRange.length === 2 &&
          !isNaN(activeRange[0]) &&
          !isNaN(activeRange[1]);

        if (!hasRange) return; // quit early if we don't have a valid range

        // calculate current brush extents using x scale
        let extents = activeRange.map(x.invert);

        // if rounding fn supplied, then snap to rounded extents
        // and move brush rect to reflect rounded range bounds if it was set by user interaction
        if (round) {
          extents = extents.map(round);
          activeRange = extents.map(x);

          if (
            d3.event.sourceEvent &&
            d3.event.sourceEvent.type === 'mousemove'
          ) {
            d3.select(this).call(brush.move, activeRange);
          }
        }

        // move brush handles to start and end of range
        g.selectAll('.brush-handle')
          .style('display', null)
          .attr('transform', (d, i) => `translate(${activeRange[i]}, 0)`);

        // resize sliding window to reflect updated range
        g.select(`#clip-${id} rect`)
          .attr('x', activeRange[0])
          .attr('width', activeRange[1] - activeRange[0]);

        // filter the active dimension to the range extents
        dimension.filterRange(extents);

        // re-render the other charts accordingly
        renderAll();
      });

      brush.on('end.chart', function() {
        // reset corresponding filter if the brush selection was cleared
        // (e.g. user "clicked off" the active range)
        if (!d3.brushSelection(this)) {
          reset(id);
        }
      });

      chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
      };

      chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        return chart;
      };

      chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
      };

      chart.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
      };

      chart.title = function(_) {
        if (!arguments.length) return title;
        title = _;
        return chart;
      };

      chart.filter = _ => {
        if (!_) dimension.filterAll();
        brushDirty = _;
        return chart;
      };

      chart.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return chart;
      };

      chart.round = function(_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
      };

      chart.gBrush = () => gBrush;

      return chart;
    }
  }

  function groupSize(d, extent) {
    var binsize = (Math.floor(extent[1] - extent[0]) * 100) / 10000.0;
    var ret = Math.floor(d / binsize);
    ret *= binsize
    return ret;
  }

  function exportData() {
    let rows = [];
    var row = [];
    Object.keys(wells[0]).forEach(function(d) {
      row.push(d);
    });
    rows.push(row)


    wells.forEach(function(all) {
      row = [];
      Object.values(all).forEach(function(d) {
        row.push(d);
      })
      rows.push(row)
      //    console.log( all)
    })
    exportToCsv('export.csv', rows);
  }

  function exportToCsv(filename, rows) {
    var processRow = function(row) {
      var finalVal = '';
      for (var j = 0; j < row.length; j++) {
        var innerValue = row[j] === null ? '' : row[j].toString();
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        };
        var result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
          result = '"' + result + '"';
        if (j > 0)
          finalVal += ',';
        finalVal += result;
      }
      return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
      csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], {
      type: 'text/csv;charset=utf-8;'
    });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
