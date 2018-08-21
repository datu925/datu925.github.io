const DIV = 2;

function interpolate(data) {
    var newData = []
    var dist;
    for (let i = 0; i < data.length - 1; i++) {
        dist = (data[i + 1].value - data[i].value) / DIV
        for (let j = 0; j < DIV; j++) {
            newData.push({percentile: data[i].percentile + 0.1 * (10 / DIV) * j, value: data[i].value + j * dist})
        }
    }
    newData.push({
            percentile: data[data.length - 1].percentile, value: data[data.length - 1].value
        })
    return newData;
}

function readData(filename) {
    return d3.csv(filename, 
    d => ({percentile: +d.Percentile, value: +d.Value}))
    .then(function(data) {
        return interpolate(data);
    })
    .catch(function(error) {
        console.warn(error);
    });
}

Promise.all([readData("spending_data.csv"),
            readData("income_data.csv")]).then(values => {
                let [spending, income] = values;
                buildChart(spending, income);
            })

function buildTicks(intervals) {
    var vals = [];
    var text = [];
    for (let i = 1; i < intervals; i++) {
        vals.push(98 * i * DIV / intervals);
        text.push(100 * i / intervals);
    }
    return {values: vals, text: text}
}

function buildChart(spending, income) {
    
    var threshold = null
    var calc = []
    var max = 0;

    for (let s_index = 0; s_index < Object.keys(spending).length; s_index++) {
        var arr = []
        for (let i_index = 0; i_index < Object.keys(income).length; i_index++) {
            var yrs_to_ret = calculate_years_to_retirement(income[i_index].value, spending[s_index].value)
            if (threshold && yrs_to_ret >= threshold) {
                yrs_to_ret = threshold;
            }
            arr.push(yrs_to_ret)
            if (!isNaN(yrs_to_ret) && yrs_to_ret > max) {
                max = yrs_to_ret;
            }
        }
        calc.push(arr)
    }

    var earlyLimit = 37.5 / max;
    var middleLimit = 42.5 / max;
    var lateLimit = 47.5 / max;

    var colorscale = [[0, 'rgb(0,255,0)'],
                        [earlyLimit, 'rgb(0,120,0'],
                        [middleLimit, 'rgb(0,0,255)'], 
                        [lateLimit, 'rgb(220,0,0)'], 
                        [1, 'rgb(255,0,0)']]

    var text = calc.map((row, i) => row.map((item, j) => {
        return `
        Spending %ile: ${(i + 2) / DIV}<br>
        Income %ile: ${(j + 2) / DIV}<br>
        Spending $: ${spending[i].value}<br>
        Income $: ${income[j].value}<br>
        Yrs to Retirement: ${item ? item.toFixed(1) : "infinite"}
        ` 
        }))

    var data = [
        {
        z: calc,
        type: 'heatmap',
        zauto: false,
        colorscale: colorscale,
        hoverinfo: "text",
        text: text
        }
    ];

    var xTicks = buildTicks(4);
    var yTicks = buildTicks(10);

    var layout = {
        title: "Years to Retirement<br> by Spending and Income Rates",
        xaxis: {
            title: `Income Percentile<br><a href="methodology.html">Methodology</a>`,
            tickvals: xTicks.values,
            ticktext: xTicks.text,
        },
        yaxis: {
            title: "Spending Percentile",
            tickvals: yTicks.values,
            ticktext: yTicks.text,
        }
    }

    Plotly.newPlot('chart', data, layout);

    $("#limits").on("submit", function(event) {
        event.preventDefault();
        var data = $(this).serializeArray();
        var limit_data = {};
        
        for (var index = 0; index < data.length; index++) {
            var element = data[index];
            limit_data[element.name] = element.value / max;
        }
    
        var colorscale = [[[0, 'rgb(0,255,0)'],
                            [limit_data["earlyLimit"], 'rgb(0,120,0'],
                            [limit_data["middleLimit"], 'rgb(0,0,255)'], 
                            [limit_data["lateLimit"], 'rgb(220,0,0)'], 
                            [1, 'rgb(255,0,0)']]]
    
        var update = {
            "colorscale": colorscale
        }
            
        Plotly.restyle('chart', update, 0);
    });

}



function calculate_years_to_retirement(income, spending) {
    // IFERROR(LOG(1-((1/$B$2)*$A6*-1*$B$1)/(E$5-$A6))/LOG(1+$B$1),"")
    var investment_rate = 0.07;
    var withdrawal_rule = 0.04;
    if (spending >= income) {
        return null
    }
    return Math.log(1-((1/withdrawal_rule) * spending * -1 * investment_rate)/(income - spending))/Math.log(1+investment_rate)
}