export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Force-Directed Lattice

This demonstrates [*forceLink*.iterations](https://github.com/d3/d3-force#link_iterations), which strengthens [d3-force](https://github.com/d3/d3-force)’s link constraint by applying the constraint multiple times per simulation step.`
)});
  main.variable(observer("viewof replay")).define("viewof replay", ["html"], function(html){return(
html`<button>Replay`
)});
  main.variable(observer("replay")).define("replay", ["Generators", "viewof replay"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["replay","data","d3","invalidation","DOM","width","height","drag"], function(replay,data,d3,invalidation,DOM,width,height,drag)
{
  replay;

  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-30))
      .force("link", d3.forceLink(links).strength(1).distance(20).iterations(10))
      .on("tick", ticked);

  invalidation.then(() => simulation.stop());

  const context = DOM.context2d(width, height);

  function ticked() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
    context.beginPath();
    for (const d of links) {
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
    }
    context.strokeStyle = "#aaa";
    context.stroke();
    context.beginPath();
    for (const d of nodes) {
      context.moveTo(d.x + 3, d.y);
      context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
    }
    context.fill();
    context.strokeStyle = "#fff";
    context.stroke();
    context.restore();
  }

  return d3.select(context.canvas)
      .call(drag(simulation)
      .subject(({x, y}) => simulation.find(x - width / 2, y - height / 2)))
    .node();
}
);
  main.variable(observer("drag")).define("drag", ["d3"], function(d3){return(
simulation => {
  
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}
)});
  main.variable(observer("data")).define("data", function()
{
  const n = 20;
  const nodes = Array.from({length: n * n}, (_, i) => ({index: i}));
  const links = [];
  for (let y = 0; y < n; ++y) {
    for (let x = 0; x < n; ++x) {
      if (y > 0) links.push({source: (y - 1) * n + x, target: y * n + x});
      if (x > 0) links.push({source: y * n + (x - 1), target: y * n + x});
    }
  }
  return {nodes, links};
}
);
  main.variable(observer("height")).define("height", ["width"], function(width){return(
width
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
