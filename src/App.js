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
  const chartRegisteredRef = useRef(false);
  const [labelList, setLabelList] = useState([]);
  const [equation, setEquation] = useState("");
  const [equation2, setEquation2] = useState("");
  const [bottom, setBottom] = useState(-4);
  const [top, setTop] = useState(4);
  const [step, setStep] = useState(0.5);
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

  const generateGraph = useCallback(
    (resultList, resultList2) => {
      var ctx = document.getElementById("myChart");
      var data = {
        // labels: labelList,
        datasets: [
          {
            label: "Function 1",

            borderColor: "blue",
            data: resultList,
            fill: false,
          },
          // {
          //   label: "Function 2",

          //   borderColor: "red",
          //   data: [],
          //   fill: false,
          // },
        ],
      };
      if (!myChartRef.current) {
        myChartRef.current = new Chart(ctx, {
          type: "scatter",
          data: data,
          options: {
            showLine: true,
            cubicInterpolationMode: "monotone",
            aspectRatio: 1,
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
                min: -500,
                max: 500,
              },
              y: {
                min: -500,
                max: 500,
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
                  x: { min: -500, max: 500 },
                  y: { min: -500, max: 500 },
                },
                pan: {
                  enabled: true,
                  mode: "xy",
                  onPan: ({ chart }) => {
                    const xScale = chart.scales["x"];

                    const labelList = xScale.ticks.map((tick) =>
                      Number(tick.label)
                    );
                    setLabelList(labelList);
                  },
                },
                zoom: {
                  wheel: {
                    enabled: true,
                  },
                  pinch: {
                    enabled: true,
                  },
                  pan: {
                    enabled: true,
                    mode: "xy",
                  },
                  // drag: {
                  //   enabled: true,
                  // },
                  mode: "xy",
                  onZoomComplete: ({ chart }) => {
                    const xScale = chart.scales["x"];

                    const labelList = xScale.ticks.map((tick) =>
                      Number(tick.label)
                    );
                    setLabelList(labelList);
                  },
                },
              },
            },
          },
        });

        const xScale = myChartRef.current.scales["x"];
        const labelList = xScale.ticks.map((tick) => Number(tick.label));
        setLabelList(labelList);
      } else {
        myChartRef.current.data.datasets[0].data = resultList;
        myChartRef.current.update();
      }
    },
    [ce, equation]
  );

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
    resultList2 = labelList.map((value) => {
      ce.set({ x: value });
      return expr.N().valueOf();
    });

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
        {/* <div style={{ marginLeft: 64 }}>
          <span style={{ marginRight: 8 }}>Input graph 2 equation:</span>

          <MathField
            equation={equation2}
            onMathInput={(e) => handleChangeMathInput(false, e)}
          />
        </div> */}
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
