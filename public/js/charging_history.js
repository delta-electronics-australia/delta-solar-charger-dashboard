function drawSankeyChart(sankey_data_obj, charging_history_sankey) {
    // drawSankeyChart will be a function that draws a Sankey Diagram from all of the available history data
    console.log('im in drawsankey');
    console.log(sankey_data_obj);

    let data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');

    for (let i = 0; i < 3; i++) {
        data.addRows(sankey_data_obj[i][0])
    }

    // Sets chart options.
    let options = {
        title: 'kWh Breakdown of the Charging Session',
        width: 800,
        height: 500
    };

    charging_history_sankey.draw(data, options);

}

async function create_charts() {
    // This function creates a line graph and sankey diagram

    // Create a line chart
    let charging_history_chart = new Chart(document.getElementById("charging_history_chart"), {
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
                hidden: false
            }, {
                data: [],
                label: "AC2 Power",
                borderColor: "#ff3300",
                fill: false,
                yAxisID: 'A',
                hidden: false
            }, {
                data: [],
                label: "Battery Power",
                borderColor: "#33cc33",
                fill: false,
                yAxisID: 'A',
                hidden: false
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
            }],
            spanGaps: false
        },
        options: {
            responsive: true,
            title: {
                display: false,
                text: 'history test'
            },
            elements: {
                line: {
                    tension: 0
                },
                point: {
                    radius: 2

                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            second: 'h:mm:ss a'
                        }
                    }
                }],
                yAxes: [{
                    id: 'A',
                    position: 'left'
                },
                    {
                        id: 'B',
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            max: 100,
                            min: 0
                        }
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
                console.log('after update!!');
                console.log(chart.data.datasets)
            }
        }]

    });

    // Create a Sankey diagram
    google.charts.load('current', {
        'packages': ['sankey']
    });
    await google.charts.setOnLoadCallback();

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
        title: 'kWh Breakdown of the Charging Session',
        width: 800,
        height: 500
    };
    // Instantiates and draws our chart, passing in some options.
    let charging_history_sankey = new google.visualization.Sankey(document.getElementById('sankey_basic'));
    charging_history_sankey.draw(data, options);

    return {
        'charging_history_chart': charging_history_chart,
        'charging_history_sankey': charging_history_sankey
    }

}

function update_charts(chart_obj, data_obj, sankey_data_obj) {

    if (chart_obj.hasOwnProperty('charging_history_chart')) {
        console.log('updating charts');
        chart_obj.charging_history_chart.data.labels = data_obj.time;
        chart_obj.charging_history_chart.data.datasets[0].data = data_obj.dcp;
        chart_obj.charging_history_chart.data.datasets[1].data = data_obj.utility_p;
        chart_obj.charging_history_chart.data.datasets[2].data = data_obj.ac2p;
        chart_obj.charging_history_chart.data.datasets[3].data = data_obj.btp;
        chart_obj.charging_history_chart.data.datasets[4].data = data_obj.btsoc;
        chart_obj.charging_history_chart.data.datasets[5].data = data_obj.bt_module1_max_temp;
        chart_obj.charging_history_chart.data.datasets[6].data = data_obj.bt_module1_min_temp;

        // If we have a lot of data then we can turn off data points to optimize performance
        if (data_obj.time.length > 200) {
            chart_obj.charging_history_chart.options.elements.point.radius = 0;
            chart_obj.charging_history_chart.options.elements.point.hitRadius = 7;
            chart_obj.charging_history_chart.options.elements.point.hoverRadius = 7;
        } else {
            chart_obj.charging_history_chart.options.elements.point.radius = 3;
            chart_obj.charging_history_chart.options.elements.point.hitRadius = 1;
            chart_obj.charging_history_chart.options.elements.point.hoverRadius = 4;
        }

        chart_obj.charging_history_chart.data.origDatasetsData = undefined;
        chart_obj.charging_history_chart.data.origDatasetsLabels = undefined;
        chart_obj.charging_history_chart.resetZoom();
        chart_obj.charging_history_chart.update();


    }

    if (chart_obj.hasOwnProperty('charging_history_sankey')) {
        drawSankeyChart(sankey_data_obj, chart_obj.charging_history_sankey)
    }
}

function update_cards(overview_data_obj) {
    console.log(overview_data_obj);
    document.getElementById('ac2p_card').innerText = overview_data_obj.ac2p.toFixed(2) + 'Wh';
    document.getElementById('dctp_card').innerText = overview_data_obj.dcp.toFixed(2) + 'Wh';
    document.getElementById('utility_p_import_card').innerText = -1 * overview_data_obj.utility_p_import.toFixed(2) + 'Wh';
    document.getElementById('utility_p_export_card').innerText = overview_data_obj.utility_p_export.toFixed(2) + 'Wh';
    document.getElementById('bt_consumed_card').innerText = overview_data_obj.btp_discharge.toFixed(2) + 'Wh';
    document.getElementById('bt_charged_card').innerText = -1 * overview_data_obj.btp_charge.toFixed(2) + 'Wh';

}

async function start_charging_history_page(user) {
    let db = firebase.database();

    // Initialize our charts
    let chart_obj = await create_charts();

    let media_options = {
        height: 150,
        interval: 30000
    };
    let media_elem = document.querySelector('.slider');
    M.Slider.init(media_elem, media_options);
    let media_elem1 = document.getElementById('grid_slider');
    M.Slider.init(media_elem1, media_options);
    let media_elem2 = document.getElementById('bt_slider');
    M.Slider.init(media_elem2, media_options);
    let media_elem3 = document.getElementById('dctp_slider');
    M.Slider.init(media_elem3, media_options);

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

    // Point to our charging history keys
    let charging_history_key_ref = db.ref(`users/${user.uid}/charging_history_keys/`);
    charging_history_key_ref.orderByKey().once("value", async function (snapshot) {
        if (snapshot.val() !== null) {
            let charging_session_keys = Object.keys(snapshot.val());

            ///////////////////////////////////////////////////////////////////////////////////////////
            // Now that we have loaded our charging history keys, we can now show the master_row
            document.getElementById('master_row').style.visibility = 'visible';
            ///////////////////////////////////////////////////////////////////////////////////////////

            // Need to check if we are currently charging:
            // let _isCharging = false;
            let charging_ref = db.ref("users/" + user.uid + "/evc_inputs/charging/");
            let _isCharging = await charging_ref.once('value');
            _isCharging = _isCharging.val();

            // Convert yyyy-mm-ddThhmm to yyyy-mm-dd hh:mm, append to our drop down list
            let options = "";
            let display_value = "";
            $.each(charging_session_keys, function (i, val) {
                display_value = (val.slice(0, 13) + ":" + val.slice(13)).replace("T", " ");

                if (_isCharging && val === charging_session_keys[charging_session_keys.length - 1]) {
                    console.log('We have reached the one that should be disabled...');
                    console.log(val);
                    console.log(options + "<option value='" + val + "' ' + disabled'>" + display_value + "</option>")
                }

                options = options + "<option value='" + val + "'>" + display_value + "</option>";
            });

            let start_charging_session = $('#select_charging_session');
            start_charging_session.append(options);

            let selected_charging_session = "";
            start_charging_session.on('change', function () {
                selected_charging_session = $(this).val();

                /////////////////////////////////////////////////////////////////////////////////////
                // When the user selects the charge session date, hide all of the graphs and inline preloader
                document.getElementById('reset_zoom_button_div').style.visibility = 'hidden';
                document.getElementById('charging_history_tabs').style.visibility = 'hidden';
                document.getElementById('charging_history_overview_tab').style.visibility = 'hidden';
                document.getElementById('charging_history_chart_tab').style.visibility = 'hidden';
                document.getElementById('charging_history_sankey_tab').style.visibility = 'hidden';

                document.getElementById('preloader').style.display = 'inline';
                /////////////////////////////////////////////////////////////////////////////////////

                let url = "/delta_dashboard/charging_history_request";
                let xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader("Content-Type", "application/json");

                xhr.onload = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {

                        // Now that data has come in, initialize and display our tabs
                        let tabs_elem = document.querySelector('.tabs');
                        let tabs_instance = M.Tabs.init(tabs_elem);

                        data_obj = JSON.parse(xhr.response)['data_obj'];
                        let sankey_data_obj = JSON.parse(xhr.response)['sankey_data_obj'];
                        let overview_data_obj = JSON.parse(xhr.response)['overview_data_obj'];
                        // Convert all of the time values into moment objects (depending on the format)
                        if (data_obj['time'][0].length < 10) {
                            data_obj['time'].forEach(function (value, key, time_array) {
                                time_array[key] = moment(time_array[key], "HH:mm:ss")
                            });
                        } else {
                            data_obj['time'].forEach(function (value, key, time_array) {
                                time_array[key] = moment(time_array[key], "YYYY-MM-DD HH:mm:ss.SSSSSS")
                            });
                        }
                        //////////////////////////////////////////////////////////////////////////////////
                        document.getElementById('preloader').style.display = 'none';

                        document.getElementById('charging_history_tabs').style.visibility = 'visible';
                        document.getElementById('charging_history_overview_tab').style.visibility = 'visible';
                        document.getElementById('charging_history_chart_tab').style.visibility = 'visible';
                        document.getElementById('charging_history_sankey_tab').style.visibility = 'visible';
                        document.getElementById('reset_zoom_button_div').style.visibility = 'visible';
                        //////////////////////////////////////////////////////////////////////////////////
                        update_charts(chart_obj, data_obj, sankey_data_obj);
                        update_cards(overview_data_obj);

                    }
                };

                data = JSON.stringify({
                    "idToken": idToken,
                    'date': selected_charging_session
                });

                xhr.send(data);
                console.log('sent!')
            })
        }

        // Initialize our drop down menu
        let elems = document.querySelectorAll('select');
        let instances = M.FormSelect.init(elems);

        $('#reset_zoom_button').click(function () {
            chart_obj.charging_history_chart.resetZoom()
        })
    })
}

function checkIfLoggedIn() {
    // When we first load the page, hide the tabs and none the preloader

    document.getElementById('master_row').style.visibility = 'hidden';

    document.getElementById('charging_history_tabs').style.visibility = 'hidden';
    document.getElementById('charging_history_overview_tab').style.visibility = 'hidden';
    document.getElementById('charging_history_chart_tab').style.visibility = 'hidden';
    document.getElementById('charging_history_sankey_tab').style.visibility = 'hidden';
    document.getElementById('reset_zoom_button_div').style.visibility = 'hidden';

    document.getElementById('preloader').style.display = 'none';

    // Check if we are logged in
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Start our code for the page
            start_charging_history_page(user);
        } else {
            //... or go to login
            window.location.replace("/delta_dashboard/login")
        }
    });

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