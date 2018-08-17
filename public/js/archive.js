let download_date = "";

function create_charts() {

    let history_chart = new Chart(document.getElementById("history_chart"), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                label: "Solar Power",
                borderColor: "#ffcc00",
                fill: false,
                yAxisID: 'A'
            }, {
                data: [],
                label: "Utility Power",
                borderColor: "#3366ff",
                fill: false,
                yAxisID: 'A',
                hidden: true
            }, {
                data: [],
                label: "AC2 Power",
                borderColor: "#ff3300",
                fill: false,
                yAxisID: 'A',
                hidden: true
            }, {
                data: [],
                label: "Battery Power",
                borderColor: "#33cc33",
                fill: false,
                yAxisID: 'A',
                hidden: true
            }, {
                data: [],
                label: "Battery SOC",
                borderColor: "#ef2fac",
                fill: false,
                yAxisID: 'B',
                hidden: true
            }, {
                data: [],
                label: "Battery Max Temp",
                borderColor: "#6600cc",
                fill: false,
                yAxisID: 'B',
                hidden: true
            }, {
                data: [],
                label: "Battery Min Temp",
                borderColor: "#ff33cc",
                fill: false,
                yAxisID: 'B',
                hidden: true
            }, {
                data: [],
                label: "AC1 Frequency",
                borderColor: "#000000",
                fill: false,
                yAxisID: 'B',
                hidden: true
            }
            ],
            spanGaps: false
        },
        options:
            {
                title: {
                    display: false,
                    text:
                        'history test'
                },
                elements: {
                    line: {
                        tension: 0
                    },
                    point: {
                        radius: 0,
                        hitRadius: 7,
                        hoverRadius: 7

                    }
                },
                scales: {
                    xAxes: [
                        {
                            type: 'time',
                            time: {
                                displayFormats: {
                                    second: 'h:mm:ss a'
                                }
                            }
                        }
                    ],
                    yAxes: [
                        {
                            id: 'A',
                            position: 'left'
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            // ticks: {
                            //     max: 50,
                            //     min: 0
                            // }
                        },
                    ]
                },
                pan: {
                    enabled: true,
                    mode: "x",
                    rangeMin: {
                        x: null
                    },
                    rangeMax: {
                        x: null
                    }
                },
                zoom: {
                    enabled: true,
                    drag: false,
                    mode: "x",
                    // limits: {
                    //     max: 10,
                    //     min: 0.5
                    // }
                }
            },
        plugins: [{
            beforeUpdate: function (chart, options) {
                filterData(chart);
            },
            afterUpdate: function (chart, options) {
                // console.log('after update!!');
                // console.log(chart.data.datasets)
                // console.log(chart.data.labels)
            }
        }]
    });

    google.charts.load('current', {'packages': ['sankey']});
    // google.charts.setOnLoadCallback(drawSankeyChart);

    return {'history_chart': history_chart}

}

function update_charts(chart_obj, data_obj) {
    if (chart_obj.hasOwnProperty('history_chart')) {
        console.log('updating charts');
        chart_obj.history_chart.data.labels = data_obj.time;
        chart_obj.history_chart.data.datasets[0].data = data_obj.dcp;
        chart_obj.history_chart.data.datasets[1].data = data_obj.utility_p;
        chart_obj.history_chart.data.datasets[2].data = data_obj.ac2p;
        chart_obj.history_chart.data.datasets[3].data = data_obj.btp;
        chart_obj.history_chart.data.datasets[4].data = data_obj.btsoc;
        chart_obj.history_chart.data.datasets[5].data = data_obj.bt_module1_max_temp;
        chart_obj.history_chart.data.datasets[6].data = data_obj.bt_module1_min_temp;
        chart_obj.history_chart.data.datasets[7].data = data_obj.ac1_freq;


        // Now update the chart
        document.getElementById('preloader').style.display = 'none';

        document.getElementById('chart_tabs').style.visibility = 'visible';
        document.getElementById('history_chart_tab').style.visibility = 'visible';
        document.getElementById('sankey_tab').style.visibility = 'visible';
        document.getElementById('download_tab').style.visibility = 'visible';
        document.getElementById('reset_zoom_button_div').style.visibility = 'visible';

        chart_obj.history_chart.data.origDatasetsData = undefined;
        chart_obj.history_chart.data.origDatasetsLabels = undefined;
        chart_obj.history_chart.resetZoom();
        chart_obj.history_chart.update();
        // drawSankeyChart(data_obj, reduce_factor)
    }
}

function drawSankeyChart(data_obj, reduce_factor) {
    // drawSankeyChart will be a function that draws a Sankey Diagram from all of the available history data
    console.log(data_obj);

    let temp_array = data_obj.dcp;
    let dcpt = 0;
    console.log('start');
    temp_array.forEach(function (value) {
        dcpt += value * (2 / 3600)
    });
    dcpt *= (reduce_factor + 1);
    console.log('dcpt ' + dcpt);

    temp_array = data_obj.utility_p;
    let utility_p_t = 0;
    temp_array.forEach(function (value) {
        utility_p_t += value * (2 / 3600)
    });
    utility_p_t *= (reduce_factor + 1);
    console.log('utility_p ' + utility_p_t);

    temp_array = data_obj.btp;
    let btp_t = 0;
    temp_array.forEach(function (value) {
        btp_t += value * (2 / 3600)
    });
    btp_t *= (reduce_factor + 1);
    console.log('btp_t ' + btp_t);

    temp_array = data_obj.ac2p;
    let ac2p_t = 0;
    temp_array.forEach(function (value) {
        ac2p_t += value * (2 / 3600)
    });
    ac2p_t *= (reduce_factor + 1);
    console.log('ac2p_t ' + ac2p_t);


    let data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');
    data.addRows([
        ['A', 'X', 5],
        ['A', 'Y', 7],
        ['A', 'Z', 6],
    ]);
    data.addRows([
        ['B', 'X', 2],
        ['B', 'Y', 9],
    ]);

    // Sets chart options.
    let options = {
        // width: 300
    };

    // Instantiates and draws our chart, passing in some options.
    let sankeyChart = new google.visualization.Sankey(document.getElementById('sankey_basic'));
    sankeyChart.draw(data, options);
}

async function date_chosen(selected_date, chart_obj, db, user) {
    // This function is called once the user has chosen a date from the datepicker
    // We want to hide all of our charts and reveal our preloader
    document.getElementById('preloader').style.display = 'block';
    document.getElementById('chart_tabs').style.visibility = 'hidden';
    document.getElementById('history_chart_tab').style.visibility = 'hidden';
    document.getElementById('sankey_tab').style.visibility = 'hidden';
    document.getElementById('download_tab').style.visibility = 'hidden';
    document.getElementById('reset_zoom_button_div').style.visibility = 'hidden';

    // document.getElementById('data_request_button_div').style.display = 'block';


    // Define the object that will hold all of our charting information
    let data_obj = {
        'utility_p': [],
        'utility_c': [],
        'dcp': [],
        'btp': [],
        'ac2p': [],
        'time': []
    };

    // New code.
    let idToken = await firebase.auth().currentUser.getIdToken(true);

    selected_date = selected_date.date.yyyymmdd();
    download_date = selected_date;
    let history_key_ref = db.ref("users/" + user.uid + "/history_keys");
    history_key_ref.orderByKey().once("value", function (snapshot) {
        console.log(selected_date);
        let history_keys = snapshot.val();

        // Check if the date we want exists in history_keys - just in case
        if (history_keys.hasOwnProperty(selected_date.toString())) {
            let url = "/delta_dashboard/archive_request";
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onload = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    data_obj = JSON.parse(xhr.response)['data_obj'];

                    // Convert all of the time values into moment objects (depending on the format)
                    if (data_obj['time'][0].length < 10) {
                        data_obj['time'].forEach(function (value, key, time_array) {
                            time_array[key] = moment(time_array[key], "HH:mm:ss")
                        });
                    }
                    else {
                        data_obj['time'].forEach(function (value, key, time_array) {
                            time_array[key] = moment(time_array[key], "YYYY-MM-DD HH:mm:ss.SSSSSS")
                        });
                    }

                    update_charts(chart_obj, data_obj)
                }
            };

            data = JSON.stringify({"idToken": idToken, 'date': selected_date});

            xhr.send(data);
            console.log('sent!')
        }
    })

}

function start_archive_page(user) {
    // Define firebase database object
    let db = firebase.database();

    // Initialize our charts
    let chart_obj = create_charts();

    // let charging_history_ref = db.ref("users/" + user.uid + "/charging_history/");
    // charging_history_ref.orderByKey().once("value", function(snapshot){
    //     console.log(snapshot.val());
    //     console.log('done!');
    // });

    // Grab a list of the available dates we have data for
    let history_ref = db.ref("users/" + user.uid + "/history_keys/");
    history_ref.orderByKey().once("value", function (snapshot) {
        let startDate = Object.keys(snapshot.val())[0];
        let available_dates = Object.keys(snapshot.val());

        // Now make our page visible
        document.getElementById('master_row').style.visibility = 'initial';

        // Activate our date picker
        let datepicker_elem = document.querySelector('.datepicker');
        let datepicker_instance = M.Datepicker.init(datepicker_elem,
            {
                autoClose: true,
                format: 'mmm dd, yyyy',
                onClose: function () {
                    date_chosen(datepicker_instance, chart_obj, db, user)
                },

                onSelect: function (test) {
                },
                minDate: new Date(startDate),

                disableDayFn: function (day) {
                    // This function disables the dates that were not in our list of available dates
                    let current_date_check = day.yyyymmdd();
                    return !available_dates.includes(current_date_check)
                }
            });

        // Activate the tabs
        let tabs_elem = document.querySelector('.tabs');
        let tabs_instance = M.Tabs.init(tabs_elem);

        $('#reset_zoom_button').click(function () {
            chart_obj.history_chart.resetZoom()
        })
        // Listen to see if the data request button has been sent
        $('#data_request_button').on('click', function () {
            $(this).removeClass("waves-effect waves-light").addClass('disabled');
        });
    })

}

function request_data(clicked_id) {
    // request_data sends a request to the backend to compile a csv file with all of the day's data

    console.log(download_date);
    console.log(clicked_id);

    $('#data_request_button').removeClass("waves-effect waves-light").addClass('disabled');
    // $('#all_data_request_button').removeClass("waves-effect waves-light").addClass('disabled');


    // Check the uid of the user pressing the button
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
        let xhr = new XMLHttpRequest();

        let url = "/delta_dashboard/download_data";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.responseType = 'blob';

        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                M.toast({html: 'Successfully retrieved data'});

                $('#data_request_button').removeClass('disabled').addClass('waves-effect waves-light');
                // $('#all_data_request_button').removeClass('disabled').addClass('waves-effect waves-light');

                let a = document.createElement('a');
                a.href = window.URL.createObjectURL(xhr.response);
                if (clicked_id === 'data_request_button') {
                    a.download = download_date + '.csv';
                }
                else if (clicked_id === 'all_data_request_button') {
                    a.download = 'data.zip';
                }
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                console.log('downloading')
            }
        };

        let data = null;
        // Depending on what button was pressed, we have to request different information
        if (clicked_id === 'data_request_button') {
            M.toast({html: 'Data request sent. Please wait...'});
            // Package our payload including the idToken and the date
            data = JSON.stringify({"idToken": idToken, 'date': download_date});
        }
        else if (clicked_id === 'all_data_request_button') {
            M.toast({html: 'Data request sent. This might take a while, please be patient...'});

            data = JSON.stringify({"idToken": idToken, 'date': 'all'});
        }

        xhr.send(data);
        console.log('sent!')
    });
}

function checkIfLoggedIn() {

    document.getElementById('master_row').style.visibility = 'hidden';

    document.getElementById('preloader').style.display = 'none';

    document.getElementById('chart_tabs').style.visibility = 'hidden';
    document.getElementById('history_chart_tab').style.visibility = 'hidden';
    document.getElementById('sankey_tab').style.visibility = 'hidden';
    document.getElementById('download_tab').style.visibility = 'hidden';
    document.getElementById('reset_zoom_button_div').style.visibility = 'hidden';

    // document.getElementById('data_request_button_div').style.display = 'none';

    // Check if we are logged in
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Start our code for the page
            start_archive_page(user);
            console.log('yay')

        }

        else {
            //... or go to login
            window.location.replace("/delta_dashboard/login")
        }
    });

}

function signOut() {
    firebase.auth().signOut().then(function () {
        console.log("Signout Successful")
        // window.location.reload()
    }).catch(function (error) {
        console.log("error", error)
    })
}


checkIfLoggedIn();

Date.prototype.yyyymmdd = function () {
    let mm = this.getMonth() + 1; // getMonth() is zero-based
    let dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('-');
};

function filterData(chart) {
    // Datasets is the array of data arrays that we currently have in the chart object
    let datasets = chart.data.datasets;

    // First check if we have a dataset that has some stuff in it
    if (datasets[0].data.length !== 0) {
        // Now check if our backup original dataset is not defined.
        if (!chart.data.origDatasetsData) {
            // If it is not defined, then we need to define it by pushing our data sets (datasets) into it
            chart.data.origDatasetsData = [];
            chart.data.origDatasetsLabels = [];
            for (let i in datasets) {
                if (datasets.hasOwnProperty(i)) {
                    chart.data.origDatasetsData.push(datasets[i].data);
                }
            }
            // We also need to push our original labels into this backup array
            chart.data.origDatasetsLabels = chart.data.labels
        }
    }

    // Define our original datasets and labels as a separate variable
    let originalDatasetsData = chart.data.origDatasetsData;
    let originalDatasetsLabels = chart.data.origDatasetsLabels;

    // console.log('Original data:');
    // console.log(originalDatasetsData);
    // console.log('Original labels:');
    // console.log(originalDatasetsLabels);

    // Go into the chart options and find the min and max time of the x axis
    let chartOptions = chart.options.scales.xAxes[0];
    let startX = chartOptions.time.min;
    let endX = chartOptions.time.max;
    if (startX && typeof startX === 'object')
        startX = startX._d.getTime();
    if (endX && typeof endX === 'object')
        endX = endX._d.getTime();

    // console.log('start and end are:');
    // console.log(startX);
    // console.log(endX);

    let startIndex = 0;
    let endIndex = 0;
    if (startX !== undefined || originalDatasetsData !== undefined) {
        let converted_labels = [];

        // Now loop through all of the arrays in our datasets array of arrays
        for (let i = 0; i < datasets.length; i++) {
            // Define a loop variable for our original data
            let originalData = originalDatasetsData[i];

            // Convert our moment objects to Unix ms for comparison
            converted_labels = [];
            for (let a = 0; a < originalDatasetsLabels.length; a++) {
                converted_labels.push(originalDatasetsLabels[a].valueOf())
            }

            if (!originalData.length)
                continue;

            let firstElement = {
                index: 0,
                time: null
            };
            let lastElement = {
                index: originalData.length - 1,
                time: null
            };

            // Now run our algorithm to find the start and end index that our graph is currently showing
            for (let j = 0; j < originalData.length; j++) {
                let time = converted_labels[j];

                if (time >= startX && (firstElement.time === null || time < firstElement.time)) {
                    firstElement.index = j;
                    firstElement.time = time;
                }
                if (time <= endX && (lastElement.time === null || time > lastElement.time)) {
                    lastElement.index = j;
                    lastElement.time = time;
                }
            }
            // Define them in the following variables
            startIndex = firstElement.index <= lastElement.index ? firstElement.index : lastElement.index;
            endIndex = firstElement.index >= lastElement.index ? firstElement.index : lastElement.index;

            // console.log(startIndex)
            // console.log(endIndex)

            // Now that we have our start and end index, we can cut our data set using those indices and compress the rest
            datasets[i].data = reduce(originalData.slice(startIndex, endIndex + 1), 1000, 'data');
        }
        chart.data.labels = reduce(converted_labels.slice(startIndex, endIndex + 1), 1000, 'labels');
    }

}

function reduce(data, maxCount, data_type) {

    // If we have less data than the max count then we can just not touch the data
    if (data.length <= maxCount)
        return data;

    let blockSize = data.length / maxCount;
    let reduced = [];

    // Now run through the cut data and for each chunk, we take the average and push it back into 'reduced'
    for (let i = 0; i < data.length;) {
        let chunk = data.slice(i, (i += blockSize) + 1);
        reduced.push(average(chunk, data_type));
    }
    return reduced;
}

function average(chunk, data_type) {

    // Sum up the chunk that we have and divide by the chunk length - taking the average of the chunk
    let sum = 0;
    if (data_type === "data") {
        for (let i = 0; i < chunk.length; i++) {
            sum += chunk[i];
        }
        return sum / chunk.length

    }
    // But if we have time labels as our data input then we have to round the value to the nearliest Unix MS
    else if (data_type === "labels") {
        for (let i = 0; i < chunk.length; i++) {
            sum += chunk[i];
        }

        return moment(Math.round(sum / chunk.length))
    }
}