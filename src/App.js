import { useEffect, useState } from 'react'
import './App.css';

import Chart from 'chart.js/auto'

function App() {
  const [imgUrl, setImgUrl] = useState('')
  const [showingImage, setShowingImage] = useState(false)
  let myChart;
  

  useEffect(() => {

    let labels = []
    let i = -1.2;
    while (i <= 1.2) {
      labels.push(i)
      i = i + 0.025
    }

    (async function() {
      var ctx = document.getElementById("myChart");
      var data = {
        labels: labels,
        datasets: [
          {
            label: "f(x) = sin(x)",
            function: function(x) {
              return Math.sin(x)
            },
            borderColor: "rgba(75, 192, 192, 1)",
            data: [],
            fill: false
          },
          {
            label: "f(x) = cos(x)",
            function: function(x) {
              return Math.cos(x)
            },
            borderColor: "rgba(255, 206, 86, 1)",
            data: [],
            fill: false
          },
          {
            label: "f(x) = sqrt(1 - x * x)",
            function: function(x) {
              return Math.sqrt(1 - parseFloat(x).toPrecision(4) * parseFloat(x).toPrecision(4))
            },
            borderColor: "red",
            data: [],
            fill: false
          },
          {
            label: "f(x) = sqrt(1 + x * x)",
            function: function(x) {
              return - Math.sqrt(1 - parseFloat(x).toPrecision(4) * parseFloat(x).toPrecision(4))
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
      
      myChart = new Chart(ctx, {
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

      setTimeout(() => {
        var url=myChart.toBase64Image();
        setImgUrl(url)
      }, 1000)

    })();

    return () => {
      myChart.destroy();
    }
  }, [])

  return (
    <>
      { showingImage ? (
        <img alt="generated" src={imgUrl}/>
      ) : (
        <div style={{
          width: 1000,
          height: 1000,
        }} id="chart-wrapper" >
        <canvas id="myChart"></canvas>
        </div>
      )}
      <button onClick={() => setShowingImage(!showingImage)}>Toggle</button> 
    </>
  );
}

export default App;
