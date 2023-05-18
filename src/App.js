import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import MathField from './components/MathField';
import './App.css';

import Chart from 'chart.js/auto'

const GRID_ORIGIN_AXIS_COLOR = 'rgba(0,0,0)'
const GRID_COLOR = 'rgba(0, 0, 0, 0.1)'

const { ComputeEngine } = window.ComputeEngine 

function App() {
  const [equation, setEquation] = useState('');
  const [equation2, setEquation2] = useState('');
  const [range, setRange] = useState(4)
  const bottom = -range;
  const [step, setStep] = useState(0.5)
  const myChartRef = useRef();
  const ce = useMemo(() => {return new ComputeEngine();}, [])

  const handleChangeMathInput = useCallback(( isFirstEquation, e) => {
      if (isFirstEquation) {
        setEquation(e.target.value);
      } else {
        setEquation2(e.target.value)
      }
    },
    []
  );

  
  const generateGraph = useCallback((labelList, resultList, resultList2) => {

    (async function() {
      var ctx = document.getElementById("myChart");
      var data = {
        labels: labelList,
        datasets: [
          {
            label: "Function 1",
            function: function(index) {
              try {
                return resultList[index]
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
          {
            label: "Function 2",
            function: function(index) {
              try {
                return resultList2[index]
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
        ]
      }
      const functionPlugin = {
        id: 'functionPlugin',
        beforeInit: function(chart) {
          var data = chart.config.data;
           for (var i = 0; i < data.datasets.length; i++) {
            for (var j = 0; j < data.labels.length; j++) {
              var fct = data.datasets[i].function,
                y = fct(j);
               data.datasets[i].data.push(y);
            }
          }
          console.log(data.datasets);
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
              x: {
                grid: {
                  color: (context: any) => {
                    if (context.tick.value  === range*2) {
                      return GRID_ORIGIN_AXIS_COLOR;
                    }               
                    return GRID_COLOR   
                  }
                }
              },
              y: {
                grid: {
                  color: (context: any) => {
                    if (context.tick.value  === 0) {
                      return GRID_ORIGIN_AXIS_COLOR;
                    }               
                    return GRID_COLOR;   
                  }
                }
              },
            }
          }
        });     
    })();
  }, [range])

  const getLabelList = useCallback(() => {
    let list = []
    let i = bottom
    while (i <= range) {
      list.push(i)
      i = i + step
    }
    return list
  },[bottom, step, range])

  useEffect(() => {    
    console.log("enterrrr");
    let resultList = [];
    let resultList2 = [];
    const labelList = getLabelList();
     try {
      let expr = ce.parse(equation);
      resultList = labelList.map(value => {
        ce.set({x : value});
        return expr.N().valueOf()
      })
      expr = ce.parse(equation2);
      resultList2 = labelList.map(value => {
        ce.set({x : value});
        return expr.N().valueOf()
      })
     } catch (error) {
      console.error(error)
    }    
      if (myChartRef?.current){
        myChartRef?.current?.destroy();
      }
      generateGraph(labelList, resultList, resultList2);
    
  }, [ce, equation, equation2, generateGraph, getLabelList])

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
        <div>
           <h3> Range: <input type="number" onChange={(e) => setRange(e.target.value)} value={range} /> </h3>
          <h3> Step: <input type="number" onChange={(e) => setStep(e.target.value)} value={step} /> </h3>
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
