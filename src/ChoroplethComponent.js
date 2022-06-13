import * as d3 from "d3";
import { useState, useEffect } from "react";

import Papa from "papaparse";

function ChoroplethMap() {
  const [mapData, setMapData] = useState([]);
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    getLocalJSONData();
    getLocalCSVData();
  }, []);

  let width = 1000,
    height = 600;

  let svg = d3.select("svg").attr("viewBox", "0 0 " + width + " " + height);

  const getLocalJSONData = () => {
    Promise.all([require("./sgmap.json"), ,]).then((data) => {
      setMapData(data);
    });
  };

  const getLocalCSVData = () => {
    Papa.parse(
      "https://chi-loong.github.io/CSC3007/assignments/population2021.csv",
      {
        download: true,
        complete: function (results) {
          // console.log("Finished:", results.data);

          setCsvData(results.data);
        },
      }
    );
  };

  var projection = d3
    .geoMercator()
    .center([103.851959, 1.29027])
    .fitExtent(
      [
        [20, 20],
        [980, 580],
      ],
      mapData[0]
    );

  if (mapData.length === 0) {
  } else {
    let geopath = d3.geoPath().projection(projection);

    svg.selectAll("*").remove();

    const test = mapData[0].features;

    if (csvData.length !== 0) {
      test.forEach((i) => {
        let popData = csvData.filter(function (data) {
          return (
            (String(data[0]).toUpperCase() === i.properties["Subzone Name"]) &
            (String(data[1]).toUpperCase() ===
              i.properties["Planning Area Name"])
          );
        });

        // console.log(popData);
        if (popData.length > 0) {
          i.properties.Population = popData[0][2];
        } else {
          i.properties.Population = "-";
        }
      });

      svg
        .append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(mapData[0].features)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", "white")
        .attr("stroke", "#0570b0")

        .style("fill", function (d) {
          switch (true) {
            case parseInt(d.properties["Population"]) >= 40000:
              return "#034e7b";
            case parseInt(d.properties["Population"]) >= 30000:
              return "#0570b0";
            case parseInt(d.properties["Population"]) >= 20000:
              return "#3690c0";
            case parseInt(d.properties["Population"]) >= 10000:
              return "#74a9cf";
            case parseInt(d.properties["Population"]) >= 5000:
              return "#a6bddb";
            case parseInt(d.properties["Population"]) >= 1000:
              return "#d0d1e6";
            case parseInt(d.properties["Population"]) >= 10:
              return "#f1eef6";
          }
        })

        .on("mouseover", function (d, i) {
          d3.select(this).attr("stroke", "#e31a1c").attr("stroke-width", "3");

          d3.select("#tooltip")
            .style("opacity", 1)
            .style("color", "white")
            .style("text-align", "left")
            .html(
              "<b>SUBZONE NAME: </b>" +
                i.properties["Subzone Name"] +
                "<br/><b>POPULATION: </b>" +
                i.properties["Population"]
            );
        })
        .on("mouseout", function (d, i) {
          d3.select(this).attr("stroke", "#0570b0").attr("stroke-width", "1");

          d3.select("#tooltip").style("opacity", 0).text(d);
        });
    }
  }

  return (
    <div className="App">
      <br />
      <p
        style={{
          position: "absolute",
          color: "white",
          fontSize: "22px",
          textAlign: "left",
          paddingLeft: "50px",
          marginTop: "10px",
        }}
      >
        <b>Singapore Population Density Map</b>
        <br />
        <span style={{ fontSize: "16px" }}>
          Hover over the subzone to view the population data
          <br /> <br />
          <div id="tooltip" />
        </span>
      </p>
      <div class="my-legend">
        <div class="legend-title">Singapore Population Density (1000s)</div>
        <div class="legend-scale">
          <ul class="legend-labels">
            <li>
              <span style={{ background: "#f1eef6" }}></span>
              {"<1"}
            </li>
            <li>
              <span style={{ background: "#d0d1e6" }}></span>
              {"1-5"}
            </li>
            <li>
              <span style={{ background: "#a6bddb" }}></span>
              {"5-10"}
            </li>
            <li>
              <span style={{ background: "#74a9cf" }}></span>
              {"10-20"}
            </li>
            <li>
              <span style={{ background: "#3690c0" }}></span>
              {"20-30"}
            </li>
            <li>
              <span style={{ background: "#0570b0" }}></span>
              {"30-40"}
            </li>
            <li>
              <span style={{ background: "#034e7b" }}></span>
              {">40"}
            </li>
          </ul>
        </div>
        <div class="legend-source"></div>
      </div>
      <br /> <br />
      <svg></svg>
    </div>
  );
}

export default ChoroplethMap;
