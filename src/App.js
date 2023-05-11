import { useEffect, useState, useRef, useCallback } from 'react'
import MathField from './components/MathField';
import { create, all } from 'mathjs'
import './App.css';

import Chart from 'chart.js/auto'

const config = { }
const math = create(all, config)

function App() {
  const [equation, setEquation] = useState('');
  const [equation2, setEquation2] = useState('');
  const myChartRef = useRef();

  const handleChangeMathInput = useCallback(( isFirstEquation, e) => {
      if (isFirstEquation) {
        setEquation(e.target.value);
      } else {
        setEquation2(e.target.value)
      }
    },
    []
  );

  const checkIfExpressionIsValid = useCallback((expr) => {
    try {
      expr.evaluate({x: 0});
      expr.evaluate({x: -1});
      expr.evaluate({x: 1});
    }
    catch (error) {
      console.log(error)
      return false;
    }
    return true;
  }, [])
  
  const generateGraph = useCallback((expr, expr2) => {

    let labels = []
    let i = -4;
    while (i <= 4) {
      labels.push(i)
      i = i + 0.5
    }

    (async function() {
      var ctx = document.getElementById("myChart");
      var data = {
        labels: labels,
        datasets: [
          // {
          //   label: "f(x) = sin(x)",
          //   function: function(x) {
          //     return Math.sin(x)
          //   },
          //   borderColor: "rgba(75, 192, 192, 1)",
          //   data: [],
          //   fill: false
          // },
          // {
          //   label: "f(x) = cos(x)",
          //   function: function(x) {
          //     return Math.cos(x)
          //   },
          //   borderColor: "rgba(255, 206, 86, 1)",
          //   data: [],
          //   fill: false
          // },
          // {
          //   label: "f(x) = 2",
          //   function: function(x) {
          //     return x = 0.5
          //   },
          //   borderColor: "rgba(255, 206, 86, 1)",
          //   data: [],
          //   fill: false
          // },
          {
            label: "Function 2",
            function: function(x) {
              try {
                return expr2.evaluate({x});
              }
              catch (error) {
                console.log(error)
                return 0;
              }
            },
            borderColor: "red",
            data: [],
            fill: false
          },
          // {
          //   label: "f(x) = sqrt(1 + x * x)",
          //   function: function(x) {
          //     return - Math.sqrt(1 - parseFloat(x).toPrecision(4) * parseFloat(x).toPrecision(4))
          //   },
          //   borderColor: "blue",
          //   data: [],
          //   fill: false
          // },
          {
            label: "Function 1",
            function: function(x) {
              try {
                return expr.evaluate({x});
              }
              catch (error) {
                console.log(error)
                return 0;
              }
            },
            borderColor: "blue",
            data: [],
            fill: false
          },
        ]
      }
      const functionPlugin = {
        id: 'functionPlugin',
        beforeInit: function(chart) {
          var data = chart.config.data;
          for (var i = 0; i < data.datasets.length; i++) {
            for (var j = 0; j < data.labels.length; j++) {
              var fct = data.datasets[i].function,
                x = data.labels[j],
                y = fct(x);
              data.datasets[i].data.push(y);
            }
          }
        }
      }
      
      Chart.register(functionPlugin); 

        myChartRef.current = new Chart(ctx, {
          type: 'line',
          data: data,
          options: {
            cubicInterpolationMode: 'monotone',
            aspectRatio: 1,
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
        });
    })();
  }, [])

  useEffect(() => {
    let expr = null;
    let expr2 = null;
    try {
      expr = math.compile(equation)
      expr2 = math.compile(equation2)
    } catch (error) {
      console.error(error)
    }
    const isValid = checkIfExpressionIsValid(expr) || checkIfExpressionIsValid(expr2)
    if (isValid) {
      myChartRef?.current?.destroy();
      generateGraph(expr, expr2);
    }
  }, [checkIfExpressionIsValid, equation, equation2, generateGraph])

  return (
    <>
        <div> 
          <MathField
            equation={equation}
            onMathInput={(e) => handleChangeMathInput(true, e)}
          />
        </div>
        <div> 
          <MathField
            equation={equation2}
            onMathInput={(e) => handleChangeMathInput(false, e)}
          />
        </div>
      <div style={{
          width: 1000,
          height: 1000,
        }} id="chart-wrapper" >
        <canvas id="myChart"></canvas>
      </div>
    </>
  );
}

export default App;
