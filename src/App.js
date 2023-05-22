import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import MathField from "./components/MathField";
import "./App.css";

import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

const GRID_ORIGIN_AXIS_COLOR = "rgba(0,0,0)";
const GRID_COLOR = "rgba(0, 0, 0, 0.1)";

const { ComputeEngine } = window.ComputeEngine;
Chart.register(zoomPlugin);

function thickenArray(arr, count) {
  const result = [];
  const len = arr.length;

  for (let i = 0; i < len - 1; i++) {
    const currentNum = arr[i];
    const nextNum = arr[i + 1];
    const interval = (nextNum - currentNum) / (count + 1);

    result.push(currentNum);

    for (let j = 1; j <= count; j++) {
      const newValue = currentNum + j * interval;
      result.push(newValue);
    }
  }

  result.push(arr[len - 1]);
  return result;
}

function App() {
  const [labelList, setLabelList] = useState([]);
  const [equation, setEquation] = useState("");
  const [equation2, setEquation2] = useState("");
  const myChartRef = useRef();
  const ce = useMemo(() => {
    return new ComputeEngine();
  }, []);

  const handleChangeMathInput = useCallback((isFirstEquation, e) => {
    if (isFirstEquation) {
      setEquation(e.target.value);
    } else {
      setEquation2(e.target.value);
    }
  }, []);
  console.log({ labelList });
  const generateGraph = useCallback((resultList, resultList2) => {
    var ctx = document.getElementById("myChart");
    var data = {
      datasets: [
        {
          label: "Function 1",
          borderColor: "blue",
          data: resultList,
          fill: false,
        },
        {
          label: "Function 2",
          borderColor: "red",
          data: resultList2,
          fill: false,
        },
      ],
    };
    if (!myChartRef.current) {
      myChartRef.current = new Chart(ctx, {
        type: "scatter",
        data: data,
        options: {
          showLine: true,
          cubicInterpolationMode: "monotone",
          // aspectRatio: 1,
          scales: {
            x: {
              grid: {
                color: (context: any) => {
                  if (context.tick.label == 0) {
                    return GRID_ORIGIN_AXIS_COLOR;
                  }
                  return GRID_COLOR;
                },
              },
              type: "linear",
              ticks: {
                maxTicksLimit: 20, // Maximum number of ticks on the x-axis
              },
              min: -100,
              max: 100,
            },
            y: {
              ticks: {
                maxTicksLimit: 20, // Maximum number of ticks on the x-axis
              },
              min: -100,
              max: 100,

              grid: {
                color: (context: any) => {
                  if (context.tick.value == 0) {
                    return GRID_ORIGIN_AXIS_COLOR;
                  }
                  return GRID_COLOR;
                },
              },
            },
          },
          plugins: {
            zoom: {
              limits: {
                x: { min: -300, max: 300, minRange: 3 },
                y: { min: -300, max: 300, minRange: 3 },
              },
              pan: {
                enabled: true,
                mode: "xy",
                onPan: ({ chart, points }) => {
                  const xScale = chart.scales["x"];

                  const labelList = xScale.ticks.map((tick) =>
                    Number(tick.label)
                  );
                  setLabelList(labelList);

                  // Get current pan values
                  var currentPanX = -chart.chartArea.left;
                  var currentPanY = -chart.chartArea.top;
                  console.log({
                    // chart,
                    // currentPanX, currentPanY
                    // ,points
                    xScale,
                  });
                },
              },
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true,
                },
                // pan: {
                //   enabled: true,
                //   mode: "xy",
                // },
                mode: "xy",
                onZoomStart: ({ chart, event }) => {
                  console.log(event);
                },
                onZoomComplete: ({ chart }) => {
                  const xScale = chart.scales["x"];
                  const labelList = xScale.ticks.map((tick) =>
                    Number(tick.label)
                  );
                  setLabelList(labelList);
                  console.log({ chart });
                  console.log({
                    currentZoom: chart.getZoomLevel(),
                  });
                  // chart.zoom(chart.getZoomLevel()+0.4, 'none')
                },
              },
            },
          },
        },
      });
      console.log(myChartRef.current);
      const xScale = myChartRef.current.scales["x"];
      const labelList = xScale.ticks.map((tick) => Number(tick.label));
      setLabelList(labelList);
    } else {
      myChartRef.current.data.datasets[0].data = resultList;
      myChartRef.current.data.datasets[1].data = resultList2;
      myChartRef.current.update();
    }
  }, []);

  useEffect(() => {
    let resultList = [];
    let resultList2 = [];

    let expr = ce.parse(equation);
    const newLabelList = thickenArray(labelList, 2);
    resultList = newLabelList.map((value) => {
      ce.set({ x: value });
      return expr.N().valueOf();
    });
    resultList = resultList.map((item, index) => ({
      x: newLabelList[index],
      y: item,
    }));

    expr = ce.parse(equation2);
    resultList2 = newLabelList.map((value) => {
      ce.set({ x: value });
      return expr.N().valueOf();
    });
    resultList2 = resultList2.map((item, index) => ({
      x: newLabelList[index],
      y: item,
    }));

    generateGraph(resultList, resultList2);
  }, [ce, equation, equation2, generateGraph, labelList]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
        <div>
          <span style={{ marginRight: 8 }}>Input graph 1 equation:</span>
          <MathField
            equation={equation}
            onMathInput={(e) => handleChangeMathInput(true, e)}
          />
        </div>
        <div style={{ marginLeft: 64 }}>
          <span style={{ marginRight: 8 }}>Input graph 2 equation:</span>

          <MathField
            equation={equation2}
            onMathInput={(e) => handleChangeMathInput(false, e)}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* <h3>
          {" "}
          <span style={{ marginRight: 8 }}>Start X coordinate:</span>
          <input
            type="number"
            onChange={(e) => {
              if (isNaN(e.target.value)) {
                return;
              }
              setBottom(Number(e.target.value));
            }}
            value={bottom}
          />{" "}
        </h3>
        <h3>
          <span style={{ marginLeft: 8, marginRight: 8 }}>
            Start Y coordinate:
          </span>
          <input
            type="number"
            onChange={(e) => {
              if (isNaN(e.target.value)) {
                return;
              }
              setTop(Number(e.target.value));
            }}
            value={top}
          />{" "}
        </h3>

        <h3>
          <span style={{ marginLeft: 8 }}>Step:</span>
          <input
            type="number"
            onChange={(e) => {
              const newStep = Number(e.target.value);
              if (newStep > 0) {
                setStep(Number(e.target.value));
              }
            }}
            value={step}
          />{" "}
        </h3> */}
      </div>
      <div
        style={{
          width: 1000,
          height: 1000,
          margin: "0 auto",
        }}
        id="chart-wrapper"
      >
        <canvas id="myChart"></canvas>
      </div>
    </>
  );
}

export default App;
