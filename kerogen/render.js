export function renderAll() {
    const chart = d3.selectAll('.chart');
    chart.each(render);

    d3.select('#total').text(d3.format(',d')(wellCrossfilter.size()));
    d3.select('#active').text(d3.format(',d')(wellCrossfilter.groupAll().value()));

    function render(method) {
        d3.select(this).call(method);
    }
}
