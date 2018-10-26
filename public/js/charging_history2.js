let globals = {};

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

// function update_charts(purpose, data_obj) {
//     // This function updates our charging archive charts
//
//     console.log(globals.charging_line_chart.data);
//     if (purpose === 'line_chart') {
//         globals.charging_line_chart.data.labels = [1, 2, 3];
//         globals.charging_line_chart.data.datasets[0].data = [1, 4, 9];
//
//         // globals.charging_line_chart.data.datasets[0].data = data_obj.datasets[0].data;
//         // globals.charging_line_chart.resetZoom();
//         console.log(globals.charging_line_chart.data)
//
//         globals.charging_line_chart.update();
//         console.log('updated!')
//         console.log(globals.charging_line_chart.data)
//
//     }
//
//     // if (chart_obj.hasOwnProperty('charging_history_sankey')) {
//     //     drawSankeyChart(sankey_data_obj, chart_obj.charging_history_sankey)
//     // }
// }

function update_cards(overview_data_obj) {
    console.log(overview_data_obj);
    document.getElementById('ac2p_card').innerText = overview_data_obj.ac2p.toFixed(2) + 'Wh';
    document.getElementById('dctp_card').innerText = overview_data_obj.dcp.toFixed(2) + 'Wh';
    document.getElementById('utility_p_import_card').innerText = -1 * overview_data_obj.utility_p_import.toFixed(2) + 'Wh';
    document.getElementById('utility_p_export_card').innerText = overview_data_obj.utility_p_export.toFixed(2) + 'Wh';
    document.getElementById('bt_consumed_card').innerText = overview_data_obj.btp_discharge.toFixed(2) + 'Wh';
    document.getElementById('bt_charged_card').innerText = -1 * overview_data_obj.btp_charge.toFixed(2) + 'Wh';

}

function download_charging_session_data(chargerID, start_time, start_date) {
    // This function is called when the user wants to download a charging session's data
    $('#data_request_button').removeClass("waves-effect waves-light").addClass('disabled');

    // Check the uid of the user pressing the button
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
        let xhr = new XMLHttpRequest();
        let url = "/delta_dashboard/download_charge_session2";
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
                a.download = `${chargerID} - ${start_date} ${start_time}.csv`;

                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                console.log('downloading')
            }
        };

        xhr.send(JSON.stringify({
            'chargerID': chargerID,
            'date': start_date,
            'time': start_time,
            'idToken': idToken
        }));
        console.log('sent!')
    })
}

function create_charts2(purpose, data_obj) {
    // Create a line chart

    if (purpose === 'line_chart') {
        return new Chart(document.getElementById("charging_graph"), {
            type: 'line',
            data:
            data_obj,
            // {
            //     labels: [1, 2, 3, 4, 5],
            //     datasets: [{
            //         data: [1, 4, 9, 16, 49],
            //         label: "Solar Power",
            //         borderColor: "#ffcc00",
            //         fill: false,
            //         yAxisID: 'A'
            //     },],
            //     spanGaps: false
            // },
            options: {
                // maintainAspectRatio: false,
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
                        radius: 0,
                        hitRadius: 5,
                        hoverRadius: 5
                    },

                },
                hover: {
                    animationDuration: 0
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
                // afterUpdate: function (chart, options) {
                //     console.log('after update!!');
                //     console.log(chart.data.datasets)
                // }
            }]

        });
    }
}

function condition_data_for_chart(raw_data) {

    // First we need to create a temporary time array (since the data has all the same timestamps)
    let temp_time_array = [];
    for (let index in raw_data.datasets[0].data) {
        if (raw_data.datasets[0].data.hasOwnProperty(index)) {
            temp_time_array.push(moment(raw_data.datasets[0].data[index].x, 'YYYY-MM-DD hh:mm:ss'));
        }
    }

    // First loop through all of the entries in datasets
    for (let data_index in raw_data.datasets) {
        if (raw_data.datasets.hasOwnProperty(data_index)) {

            // Now loop through all of the data entries in each dataset
            for (let index in raw_data.datasets[data_index].data) {
                if (raw_data.datasets[data_index].data.hasOwnProperty(index)) {
                    raw_data.datasets[data_index].data[index].x = temp_time_array[index]
                }
            }
        }
    }
    return raw_data
}

function openModal(chargerID, start_time, start_date, duration_string, charge_energy) {
    let formatted_start_time = moment(start_time, "hhmm").format('h:mm A');

    if (globals.hasOwnProperty('charging_line_chart')) {
        globals.charging_line_chart.destroy();
        console.log('poof!')
    }

    $("#charge_sessions_row").append(`
                    <div id="charging_history_modal" class="modal">
                        <div class="modal-content">
                            <h4>${chargerID} - ${formatted_start_time}</h4>
                            <div id="modal_body">
                                <canvas id="charging_graph"></canvas>
                            </div>
                            <div style="text-align: center">
                                <a class="waves-effect waves-green btn" id="data_request_button" onclick="download_charging_session_data('${chargerID}', '${start_time}', '${start_date}')">DOWNLOAD DATA</a>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
                        </div>
                    </div>
                    `);

    let elem = document.querySelectorAll('.modal')[1];
    let instance = M.Modal.init(elem, {});

    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
        let url = "/delta_dashboard/charging_history_request2";
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let raw_charging_data = JSON.parse(xhr.response);
                // let final_data_object = condition_data_for_chart(raw_charging_data['data_obj']);

                // Todo: look at this
                for (let index in raw_charging_data['data_obj'].labels){
                    raw_charging_data['data_obj'].labels[index] = moment(raw_charging_data['data_obj'].labels[index])
                }
                globals['charging_line_chart'] = create_charts2('line_chart', raw_charging_data['data_obj']);
            }
        };

        xhr.send(JSON.stringify({
            'chargerID': chargerID,
            'start_date': start_date,
            'start_time': start_time,
            'idToken': idToken
        }));

    });
    instance.open();


}

async function get_ev_charger_list(user, db) {
    let ev_chargers = await db.ref(`users/${user.uid}/ev_chargers`).once("value");
    return Object.keys(ev_chargers.val())
}

function convert_seconds_into_words(duration_seconds) {
    // This function takes in an amount of seconds and converts it into real words eg. 2hrs 5min
    let total_seconds = duration_seconds;
    let hours = Math.floor(total_seconds / 3600);
    total_seconds %= 3600;
    let minutes = Math.floor(total_seconds / 60);
    let seconds = total_seconds % 60;

    let final_duration_string = "";

    if (hours > 0) {
        if (hours === 1) {
            final_duration_string = `${hours}hr `
        } else {
            final_duration_string = `${hours}hrs `
        }
    }
    if (minutes > 0) {
        final_duration_string += `${minutes}min `;
    }
    if (seconds > 0) {
        final_duration_string += `${seconds}sec`
    }

    return final_duration_string
}

async function create_charge_session_cards(user, db, selected_date, ev_chargers) {

    let charge_session_row = $("#charge_sessions_row");
    charge_session_row.empty();
    for (let index in ev_chargers) {
        if (ev_chargers.hasOwnProperty(index)) {
            let chargerID = ev_chargers[index];
            // Now we have the selected date, we have to bring up all of the charging sessions that occurred on that date
            let temp_charging_analytics = await db.ref(`users/${user.uid}/analytics/charging_history_analytics/${chargerID}/${selected_date}`).once("value");


            temp_charging_analytics = temp_charging_analytics.val();
            // If this charger has charging sessions on this day, then there will be an object returned
            if (temp_charging_analytics !== null) {
                // Need to loop through all of the charging sessions now
                for (let charging_time in temp_charging_analytics) {
                    if (temp_charging_analytics.hasOwnProperty(charging_time)) {

                        let duration_string = convert_seconds_into_words(temp_charging_analytics[charging_time]['duration_seconds']);
                        let formatted_start_time = moment(charging_time, "hhmm").format('h:mm A');

                        charge_session_row.append(`
                            <div class="col s12 m6 l4">
                                <div class="card blue-grey darken-1 hoverable">
                                    <div class="card-content white-text">
                                        <span class="card-title center-align">${formatted_start_time}</span>
                                        <table class="">
                                            <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th>Value</th>
                                            </tr>
                                            </thead>
                    
                                            <tbody id="dcp_reveal_table">
                                            <tr>
                                                <td>Charger ID</td>
                                                <td>${chargerID}</td>
                                            </tr>
                                            <tr>
                                                <td>Charge Duration</td>
                                                <td>${duration_string}</td>
                                            </tr>
                                            <tr>
                                                <td>Charge Energy</td>
                                                <td>${temp_charging_analytics[charging_time]['energy'].toFixed(2)} kWh</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <a class="right-align">
                                            <!--<a class="waves-effect waves-light btn modal-trigger" href="#charging_history_modal">More Info</a>-->
                                            <a class="waves-effect waves-light btn" onclick="openModal('${chargerID}', '${charging_time}', '${selected_date}', '${duration_string}', '${temp_charging_analytics[charging_time]['energy'].toFixed(2)}')">More Info</a>

                                        </div>
                                    </div>
                                </div>
                            `)
                    }
                }
            }
        }
    }
}

function date_chosen(selected_date, user, db) {
    selected_date = selected_date.date.yyyymmdd();
    console.log(selected_date);

    // First get a list of ev_chargers
    get_ev_charger_list(user, db)
        .then(function (ev_chargers) {
            create_charge_session_cards(user, db, selected_date, ev_chargers)
                .then(function () {
                })
        })
}

async function get_valid_charging_dates(user, db) {
    let valid_dates = [];

    let charging_history_keys_obj = await db.ref(`users/${user.uid}/analytics/charging_history_analytics`).once("value");
    charging_history_keys_obj = charging_history_keys_obj.val();

    let earliest_date = moment('2050-01-01', 'YYYY-MM-DD');
    for (let chargerID in charging_history_keys_obj) {

        if (charging_history_keys_obj.hasOwnProperty(chargerID)) {

            // temp_dates is the list of dates available for this chargerID
            let temp_dates = Object.keys(charging_history_keys_obj[chargerID]);

            // Loop through all of the charging dates within this chargerID
            for (let index in temp_dates) {
                if (temp_dates.hasOwnProperty(index)) {

                    // First convert the current temp_date into UTC
                    let temp_date_utc = moment(temp_dates[index], 'YYYY-MM-DD').valueOf();

                    // Compare it: if the current value is lower, then it is earlier so replace the earliest_date value
                    if (moment(temp_dates[index], 'YYYY-MM-DD').isBefore(moment(earliest_date, 'YYYY-MM-DD'))) {
                        earliest_date = temp_dates[index]
                    }

                    // If the current date is not in our valid dates, then we add it in
                    if (!valid_dates.includes(temp_dates[index])) {
                        valid_dates.push(temp_dates[index]);
                    }
                }
            }
        }
    }
    return {
        "valid_dates": valid_dates,
        "earliest_date": earliest_date
    }
}

function start_charging_history_page(user) {
    let db = firebase.database();

    // // Initialize our charts
    // let chart_obj = await create_charts();

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

    let elems = document.querySelectorAll('.modal');
    let instance = M.Modal.init(elems);

    let analytics_obj = {};

    ////////////////////////////////////////////////////////////////////////////////////
    // db.ref(`users/${user.uid}/history/2018-10-08`)
    //     .orderByChild('time')
    //     .startAt('011516')
    //     .endAt('131807')
    //     .once('value')
    //     .then(function (snapshot) {
    //         console.log(snapshot.val());
    //     });
    ////////////////////////////////////////////////////////////////////////////////////

    // First we grab our valid charging dates
    get_valid_charging_dates(user, db).then(function (valid_charging_dates_payload) {
        let valid_dates = valid_charging_dates_payload['valid_dates'];
        let earliest_date = valid_charging_dates_payload['earliest_date'];

        // Activate our date picker
        let datepicker_elem = document.querySelector('.datepicker');
        let datepicker_instance = M.Datepicker.init(datepicker_elem, {
            autoClose: true,
            format: 'mmm dd, yyyy',
            onClose: function () {
                date_chosen(datepicker_instance, user, db)
            },
            minDate: new Date(earliest_date),

            disableDayFn: function (day) {
                // This function disables the dates that were not in our list of available dates
                let current_date_check = day.yyyymmdd();
                // console.log(`${current_date_check} ${!valid_dates.includes(current_date_check)}`)
                return !valid_dates.includes(current_date_check)
            }
        });
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('master_row').style.visibility = 'visible';

    })

}

function checkIfLoggedIn() {
    // When we first load the page, hide the tabs and none the preloader

    document.getElementById('master_row').style.visibility = 'hidden';
    document.getElementById('preloader').style.display = 'inline';

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

// function filterData(chart) {
//     var maxRenderedPointsX = 300;
//     var datasets = chart.data.datasets;
//     if (!chart.data.origDatasetsData) {
//         chart.data.origDatasetsData = [];
//         for (var i in datasets) {
//             chart.data.origDatasetsData.push(datasets[i].data);
//         }
//     }
//     var originalDatasetsData = chart.data.origDatasetsData;
//     var chartOptions = chart.options.scales.xAxes[0];
//     var startX = chartOptions.time.min;
//     var endX = chartOptions.time.max;
//
//     if (startX && typeof startX === 'object')
//         startX = startX._d.getTime();
//     if (endX && typeof endX === 'object')
//         endX = endX._d.getTime();
//
//     for (var i = 0; i < originalDatasetsData.length; i++) {
//         var originalData = originalDatasetsData[i];
//
//         if (!originalData.length)
//             continue;
//
//         var firstElement = {index: 0, time: null};
//         var lastElement = {index: originalData.length - 1, time: null};
//
//         for (var j = 0; j < originalData.length; j++) {
//             var time = originalData[j].x;
//             if (time >= startX && (firstElement.time === null || time < firstElement.time)) {
//                 firstElement.index = j;
//                 firstElement.time = time;
//             }
//             if (time <= endX && (lastElement.time === null || time > lastElement.time)) {
//                 lastElement.index = j;
//                 lastElement.time = time;
//             }
//         }
//         var startIndex = firstElement.index <= lastElement.index ? firstElement.index : lastElement.index;
//         var endIndex = firstElement.index >= lastElement.index ? firstElement.index : lastElement.index;
//         datasets[i].data = reduce(originalData.slice(startIndex, endIndex + 1), maxRenderedPointsX);
//     }
// }
//
// // returns a reduced version of the data array, averaging x and y values
// function reduce(data, maxCount) {
//     if (data.length <= maxCount)
//         return data;
//     var blockSize = data.length / maxCount;
//     var reduced = [];
//     for (var i = 0; i < data.length;) {
//         var chunk = data.slice(i, (i += blockSize) + 1);
//         reduced.push(average(chunk));
//     }
//     console.log(reduced)
//     return reduced;
// }
//
// function average(chunk) {
//     var x = 0;
//     var y = 0;
//     for (var i = 0; i < chunk.length; i++) {
//         x += chunk[i].x;
//         y += chunk[i].y;
//     }
//     return {x: Math.round(x / chunk.length), y: y / chunk.length};
// }

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
            sum += Number(chunk[i]);
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