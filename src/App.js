import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import MathField from "./components/MathField";
import "./App.css";

import Chart from "chart.js/auto";

const GRID_ORIGIN_AXIS_COLOR = "rgba(0,0,0)";
const GRID_COLOR = "rgba(0, 0, 0, 0.1)";

const { ComputeEngine } = window.ComputeEngine;

const functionPlugin = {
  id: "functionPlugin",
  beforeInit: function (chart) {
    var data = chart.config.data;
    for (var i = 0; i < data.datasets.length; i++) {
      for (var j = 0; j < data.labels.length; j++) {
        var fct = data.datasets[i].function,
          y = fct(j);
        data.datasets[i].data.push(y);
      }
    }
  },
};

function App() {
  const chartRegisteredRef = useRef(false);
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

  const generateGraph = useCallback((labelList, resultList, resultList2) => {
    var ctx = document.getElementById("myChart");
    var data = {
      labels: labelList,
      datasets: [
        {
          label: "Function 1",
          function: function (index) {
            try {
              return resultList[index];
            } catch (error) {
              console.log(error);
              return 0;
            }
          },
          borderColor: "blue",
          data: [],
          fill: false,
        },
        {
          label: "Function 2",
          function: function (index) {
            try {
              return resultList2[index];
            } catch (error) {
              console.log(error);
              return 0;
            }
          },
          borderColor: "red",
          data: [],
          fill: false,
        },
      ],
    };

    if (!chartRegisteredRef.current) {
      Chart.register(functionPlugin);
      console.log("enter chart register");
      chartRegisteredRef.current = true;
    }

    myChartRef.current = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
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
          },
          y: {
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
      },
    });
  }, []);

  const getLabelList = useCallback(() => {
    let list = [];
    let i = bottom;
    while (i <= top) {
      list.push(i);
      i = i + step;
    }
    return list;
  }, [bottom, step, top]);

  useEffect(() => {
    let resultList = [];
    let resultList2 = [];
    const labelList = getLabelList();

    let expr = ce.parse(equation);
    resultList = labelList.map((value) => {
      ce.set({ x: value });
      return expr.N().valueOf();
    });
    expr = ce.parse(equation2);
    resultList2 = labelList.map((value) => {
      ce.set({ x: value });
      return expr.N().valueOf();
    });

    if (myChartRef?.current) {
      myChartRef?.current.reset();

      myChartRef?.current?.destroy();
    }
    generateGraph(labelList, resultList, resultList2);
  }, [ce, equation, equation2, generateGraph, getLabelList]);

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
        <h3>
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
        </h3>
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
