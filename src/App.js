import { useEffect, useState, useRef, useCallback } from 'react'
import MathField from './components/MathField';
import { create, all } from 'mathjs'
import './App.css';

import Chart from 'chart.js/auto'

const config = { }
const math = create(all, config)

function App() {
  // const [imgUrl, setImgUrl] = useState('')
  const [showingGraph, setShowingGraph] = useState(false)
  const [equation, setEquation] = useState('x^3 + x^2 +1');
  let myChartRef = useRef();
  let expr
  try {
    expr = math.compile(equation)
  } catch (error) {
    console.error(error)
  }

  const handleChangeMathInput = useCallback((e) => {
      setEquation(e.target.value);
    },
    []
  );
  
  const generateGraph = () => {

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
          // {
          //   label: "f(x) = sqrt(1 - x * x)",
          //   function: function(x) {
          //     return Math.sqrt(1 - parseFloat(x).toPrecision(4) * parseFloat(x).toPrecision(4))
          //   },
          //   borderColor: "red",
          //   data: [],
          //   fill: false
          // },
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
            label: "f(x) = x^2 + x",
            function: function(x) {
              return expr.evaluate({x});
            },
            borderColor: "blue",
            data: [],
            fill: false
          },
        ]
      };

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

      // setTimeout(() => {
      //   var url=myChartRef.current.toBase64Image();
      //   setImgUrl(url)
      // }, 1000)
      setTimeout(() => {
        setShowingGraph(!showingGraph)
      }, 1000)
    })();
  }

  useEffect(() => {

    return () => {
      myChartRef?.current?.destroy();
    }
  }, [])

  return (
    <>
      { !showingGraph ? (
        // <img alt="generated" src={imgUrl}/>
        <div> 
          <MathField
            equation={equation}
            onMathInput={handleChangeMathInput}
          />
        </div>
      ) : null}
      <button onClick={generateGraph}>Generate</button> 
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
