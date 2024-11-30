const margin = { top: 40, right: 30, bottom: 60, left: 50 }, // Adjusted margins for better spacing
      width = 300 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

const attributes = ['pts', 'reb', 'ast', 'gp'];
const titles = ["Average Points per Game", "Average Rebounds per Game", "Average Assists per Game", "Games Played"];
const yLabels = ["Average Points per Game", "Average Rebounds per Game", "Average Assists per Game", "Games Played"];

d3.csv("NBA_Players_2010.csv").then(data => {
  // Preprocess the data
  data.forEach(d => {
    d.pts = +d.pts;
    d.reb = +d.reb;
    d.ast = +d.ast;
    d.gp = +d.gp;
  });

  const teams = Array.from(new Set(data.map(d => d.team_abbreviation))).sort();
  const teamSelect = d3.select("#teamSelect");
  const playerSelect = d3.select("#playerSelect");

  // Populate the team dropdown
  teams.forEach(team => {
    teamSelect.append("option").text(team).attr("value", team);
  });

  // Update player dropdown when a team is selected
  function updatePlayerDropdown(selectedTeam) {
    const players = Array.from(new Set(data.filter(d => d.team_abbreviation === selectedTeam).map(d => d.player_name))).sort();
    playerSelect.selectAll("option").remove();
    players.forEach(player => {
      playerSelect.append("option").text(player).attr("value", player);
    });
    if (players.length > 0) {
      updateCharts(players[0]); // Load charts for the first player
    }
  }

  // Update the charts when a player is selected
  function updateCharts(playerName) {
    const playerData = data.filter(d => d.player_name === playerName);
    d3.select("#charts").selectAll("*").remove(); // Clear existing charts

    attributes.forEach((attr, i) => {
      const chartDiv = d3.select("#charts").append("div").attr("class", "chart");

      // Add chart title above the chart
      chartDiv.append("h3")
        .attr("class", "chart-title")
        .style("text-align", "center")
        .style("margin-bottom", "10px") // Adds spacing between title and chart
        .style("font-size", "16px")
        .text(titles[i]);

      const svg = chartDiv.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define scales
      const x = d3.scalePoint()
        .domain(playerData.map(d => d.season))
        .range([0, width])
        .padding(0.5);

      const y = d3.scaleLinear()
        .domain([0, d3.max(playerData, d => d[attr])]).nice()
        .range([height, 0]);

      // Add x-axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
        .selectAll("text")
        .style("text-anchor", "end") // Rotate labels
        .attr("transform", "rotate(-30)") // Angle the labels
        .style("font-size", "10px");

      // Add y-axis
      svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickSize(-width))
        .selectAll("line")
        .style("stroke", "#e0e0e0");

      // Add line chart
      const line = d3.line()
        .x(d => x(d.season))
        .y(d => y(d[attr]));

      svg.append("path")
        .datum(playerData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Add data points
      svg.selectAll("circle")
        .data(playerData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.season))
        .attr("cy", d => y(d[attr]))
        .attr("r", 4)
        .attr("fill", "steelblue");

      // Add x-axis label
      svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Season");

      // Add y-axis label
      svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(yLabels[i]);
    });
  }

  // Initial load
  updatePlayerDropdown(teams[0]); // Load players for the first team
  teamSelect.on("change", function() {
    updatePlayerDropdown(this.value);
  });
  playerSelect.on("change", function() {
    updateCharts(this.value);
  });
});
