let date;

let chart_properties = {
    'utility_p': {
        length: 60
    },
    'dcp': {
        length: 60
    },
    'btp': {
        length: 60
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function generate_date() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    date = yyyy + '-' + mm + '-' + dd;
}

function get_current_date() {
    // This function is the same as generate_date but instead returns a date string

    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    return yyyy + '-' + mm + '-' + dd;
}

function create_charts(data_obj, needed_charts) {

    if (needed_charts === "ev_charging_chart") {
        return new Chart(document.getElementById("ev_charging_chart"), {
            type: 'line',
            data: data_obj,
            // {
            //     datasets: [{
            //         // data: [
            //         //     // {x: moment("2017-07-08T06:15:02-0600"), y: 23.375},
            //         //     // {x: moment("2017-07-08T06:20:02-0600"),y: 23.312},
            //         //     // {x: moment("2017-07-08T06:25:02-0600"),y: 23.312},
            //         //     // {x: moment("2017-07-08T06:30:02-0600"),y: 23.25}
            //         //   ],
            //         data: data_obj,
            //         label: "Solar Power",
            //         borderColor: "#ffc107",
            //         fill: false
            //     }, ]
            // },
            options: {
                title: {
                    display: false,
                    text: 'EV Charging'
                },
                elements: {
                    line: {
                        tension: 0
                    },
                    point: {
                        radius: 0,
                        hitRadius: 5,
                        hoverRadius: 5
                    }
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

                    ]
                },
                maintainAspectRatio: false,
                responsive: true
            },
            plugins: [{
                beforeUpdate: function (chart, options) {
                    // Todo: turn filter data back on
                    // filterData(chart);
                },
                // afterUpdate: function (chart, options) {
                //     console.log('after update!!');
                //     console.log(chart.data.datasets)
                // }
            }]
        });

    } else if (needed_charts === "live_charts") {
        let utility_chart = new Chart(document.getElementById("utility_chart"), {
            type: 'line',
            data: {
                labels: [data_obj.time],
                datasets: [{
                    data: data_obj.utility_p,
                    label: "Grid Power (W)",
                    borderColor: "#3e95cd",
                    fill: false,
                    yAxisID: 'A'
                }, {
                    data: data_obj.utility_c,
                    label: "Grid Current (A)",
                    borderColor: "#00897b",
                    fill: false,
                    yAxisID: 'B'
                }]
            },
            options: {
                title: {
                    display: false,
                    text: 'Grid Export/Import'
                },
                elements: {
                    line: {
                        tension: 0.3
                    }
                },
                scales: {
                    xAxes: [{
                        // ticks: {
                        //     callback: function (tickValue, index, ticks) {
                        //         return moment(tickValue, 'hhmmss').format('HH:mm:ss')
                        //     }
                        // }
                        type: 'time',
                        time: {
                            displayFormats: {
                                second: 'h:mm:ss a'
                                // minute: 'h:mm a'
                            }
                        }
                    }],
                    yAxes: [{
                            id: 'A',
                            position: 'left'
                        },
                        {
                            id: 'B',
                            position: 'right'
                        },
                    ]
                }
            }
        });

        let dcp = new Chart(document.getElementById("dcp"), {
            type: 'line',
            data: {
                labels: [data_obj.time],
                datasets: [{
                    data: data_obj.dcp,
                    label: "Solar Power (W)",
                    borderColor: "#ffc107",
                    fill: false
                }]
            },
            options: {
                title: {
                    display: false,
                    text: 'Solar Power'
                },
                elements: {
                    line: {
                        tension: 0.3
                    }
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            displayFormats: {
                                second: 'h:mm:ss a'
                                // minute: 'h:mm a'
                            }
                        }
                    }]
                }
            }
        });

        let btp_chart = new Chart(document.getElementById("btp_chart"), {
            type: 'line',
            data: {
                labels: [data_obj.time],
                datasets: [{
                    label: "Battery Power (W)",
                    data: data_obj.btp,
                    borderColor: "#4caf50",
                    fill: false,
                    yAxisID: 'A'
                }, {
                    label: "Battery Temperature (C)",
                    data: data_obj.bt_module_temp,
                    borderColor: "#6600cc",
                    fill: false,
                    yAxisID: 'B'
                }]
            },
            options: {
                title: {
                    display: false,
                    text: 'Battery Power'
                },
                elements: {
                    line: {
                        tension: 0.3
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
                                max: 50,
                                min: 0
                            }
                        },
                    ]
                }
            }
        });

        return {
            'utility_chart': utility_chart,
            'dcp': dcp,
            'btp_chart': btp_chart
        }
    } else if (needed_charts === "analytics_bar_charts") {

        // This code generates our colour array. Important point is that the last element is green
        let colour_array = [];
        for (let i = 0; i < data_obj['solar_data'].length; i++) {
            if (i === data_obj['solar_data'].length - 1) {
                colour_array.push('#36b41e')
            } else {
                colour_array.push('#ffc107')
            }
        }

        let solar_history_bar = new Chart(document.getElementById("solar_history_bar"), {
            type: 'bar',
            data: {
                labels: data_obj['labels'],
                datasets: [{
                    type: 'line',
                    data: data_obj['solar_data'],
                    borderColor: "#ff1e19",
                    backgroundColor: '#ff1e19',
                    fill: false
                }, {
                    data: data_obj['solar_data'],
                    label: "Solar Power",
                    borderColor: "#ffc107",
                    // backgroundColor: '#ffc107',
                    backgroundColor: colour_array,
                    fill: false
                }, ]
            },
            options: {
                title: {
                    display: false,
                    text: 'Solar Generation History'
                },
                legend: {
                    display: false,

                },
                elements: {
                    line: {
                        tension: 0.3
                    }
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        ticks: {
                            display: true,
                            fontColor: '#ffffff',
                            source: 'auto',
                        },
                        gridLines: {
                            color: '#a19ca1'
                        },
                        distribution: 'series',
                        time: {
                            displayFormats: {
                                day: 'MMM D'
                            }
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Solar Generated (kWh)',
                            fontColor: '#ffffff'
                        },
                        ticks: {
                            fontColor: "#ffffff"
                        },
                        gridLines: {
                            color: '#a19ca1'
                        }
                    }]
                },
                tooltips: {
                    enabled: true,
                    callbacks: {
                        label: function (tooltipItems, data) {
                            return tooltipItems.yLabel + ' kWh'
                        }
                    }
                },
                maintainAspectRatio: false,
                responsive: true
            }
        });

        return {
            'solar_history_bar_chart': solar_history_bar,
        }

    } else if (needed_charts === "last_ev_charge_line_chart") {
        return new Chart(document.getElementById("last_ev_charge_session_line"), {
            type: 'line',
            data: {
                labels: data_obj.time,
                datasets: [{
                    data: data_obj.dcp,
                    label: "Solar",
                    borderColor: "#ffcc00",
                    fill: false,
                    yAxisID: 'A'
                }, {
                    data: data_obj.utility_p,
                    label: "Grid",
                    borderColor: "#6f95ff",
                    fill: false,
                    yAxisID: 'A',
                    hidden: false
                }, {
                    data: data_obj.ac2p,
                    label: "EV Charger",
                    borderColor: "#ff3300",
                    fill: false,
                    yAxisID: 'A',
                    hidden: false
                }, {
                    data: data_obj.btp,
                    label: "Battery",
                    borderColor: "#33cc33",
                    fill: false,
                    yAxisID: 'A',
                    hidden: false
                }],
                spanGaps: false
            },
            options: {
                maintainAspectRatio: false,
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
                    }
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'series',
                        time: {
                            displayFormats: {
                                second: 'h:mm:ss a'
                            },
                        },
                        gridLines: {
                            color: '#a19ca1'
                        },
                        ticks: {
                            display: true,
                            fontColor: '#ffffff',
                            source: 'auto'
                        },
                    }],
                    yAxes: [{
                        id: 'A',
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: 'Power (kW)',
                            fontColor: '#ffffff'
                        },
                        ticks: {
                            fontColor: "#ffffff"
                        },
                        gridLines: {
                            color: '#a19ca1'
                        },
                    }]
                },
                tooltips: {
                    enabled: true,
                    callbacks: {
                        label: function (tooltipItems, data) {
                            return tooltipItems.yLabel + ' kWh'
                        }
                    }
                },
                legend: {
                    labels: {
                        fontColor: '#ffffff'
                    }
                }

            },
        })
    } else if (needed_charts === "charger_status_pie") {

        return new Chart(document.getElementById('charger_status_pie'), {
            type: 'doughnut',
            data: data_obj,
            options: {
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    labels: {
                        fontColor: '#ffffff'
                    }
                }
            }
        });
    } else if (needed_charts === "daily_charging_breakdown_bar") {
        console.log(data_obj)
        let solar_history_bar = new Chart(document.getElementById("daily_charging_breakdown_bar"), {
            type: 'bar',
            data: data_obj,
            // {
            //     labels: [moment().subtract(3, 'days').startOf('day'), moment().subtract(2, 'days').startOf('day'), moment().subtract(1, 'days').startOf('day'), moment().startOf('day')],
            //     datasets: [{
            //         type: 'bar',
            //         label: "sup 1",
            //         data: [5, 10, 20, 30],
            //         borderColor: "#ffc107",
            //         // backgroundColor: '#ffc107',
            //         backgroundColor: 'black',
            //         fill: false
            //     }, {
            //         type: 'bar',
            //         label: "sup 2",
            //         data: [25, 15, 15, 15],
            //         borderColor: "#ffc107",
            //         // backgroundColor: '#ffc107',
            //         backgroundColor: 'green',
            //         fill: false
            //     }, {
            //         type: 'bar',
            //         label: "sup 3",
            //         data: [54, 15, 30, 40],
            //         borderColor: "#ffc107",
            //         // backgroundColor: '#ffc107',
            //         backgroundColor: 'blue',
            //         fill: false
            //     }, ]
            // },
            options: {
                legend: {
                    display: false,
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        ticks: {
                            display: true,
                            fontColor: '#ffffff',
                            source: 'auto',
                        },
                        gridLines: {
                            color: '#a19ca1',
                            display: false
                        },
                        distribution: 'series',
                        time: {
                            displayFormats: {
                                day: 'MMM D'
                            }
                        },
                        stacked: true

                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Energy Consumed (kWh)',
                            fontColor: '#ffffff'
                        },
                        ticks: {
                            fontColor: "#ffffff"
                        },
                        gridLines: {
                            color: '#a19ca1',
                            display: false
                        },
                        stacked: true
                    }]
                },
                tooltips: {
                    enabled: true,
                    callbacks: {
                        label: function (tooltipItems, data) {
                            console.log(tooltipItems)
                            return `${data.datasets[tooltipItems.datasetIndex].label} : ${tooltipItems.yLabel} kWh`
                        }
                    }
                },
                maintainAspectRatio: false,
                responsive: true
            }
        });
    }
}

function update_charts(chart_obj, data_obj) {
    if (chart_obj.hasOwnProperty('utility_chart')) {
        chart_obj.utility_chart.data.labels = data_obj.time;
        chart_obj.utility_chart.data.datasets[0].data = data_obj.utility_p;
        chart_obj.utility_chart.data.datasets[1].data = data_obj.utility_c;
        if (data_obj.utility_p.length > 35) {
            chart_obj.utility_chart.options.elements.point.radius = 0;
            chart_obj.utility_chart.options.elements.point.hitRadius = 7;
            chart_obj.utility_chart.options.elements.point.hoverRadius = 7;
        }
        chart_obj.utility_chart.update()
    }

    if (chart_obj.hasOwnProperty('dcp')) {
        chart_obj.dcp.data.labels = data_obj.time;
        chart_obj.dcp.data.datasets[0].data = data_obj.dcp;
        if (data_obj.dcp.length > 35) {
            chart_obj.dcp.options.elements.point.radius = 0;
            chart_obj.dcp.options.elements.point.hitRadius = 7;
            chart_obj.dcp.options.elements.point.hoverRadius = 7;
        }
        chart_obj.dcp.update()
    }

    if (chart_obj.hasOwnProperty('btp_chart')) {
        chart_obj.btp_chart.data.labels = data_obj.time;
        chart_obj.btp_chart.data.datasets[0].data = data_obj.btp;
        chart_obj.btp_chart.data.datasets[1].data = data_obj.bt_module_temp;

        if (data_obj.btp.length > 35) {
            chart_obj.btp_chart.options.elements.point.radius = 0;
            chart_obj.btp_chart.options.elements.point.hitRadius = 7;
            chart_obj.btp_chart.options.elements.point.hoverRadius = 7;
        }

        chart_obj.btp_chart.update()
    }

    if (chart_obj.hasOwnProperty('ev_charging_chart')) {
        // data_obj.evc_charging[0] = time, [1-3] are my data
        length = data_obj.evc_charging[0].length;

        // Replace the data field in the chart object with the new data
        chart_obj.ev_charging_chart.data.labels = data_obj.evc_charging[0];
        for (let i = 0; i < 6; i++) {
            chart_obj.ev_charging_chart.data.datasets[i].data = data_obj.evc_charging[i + 1]
        }
        // chart_obj.ev_charging_chart.data.datasets[4].data = data_obj.evc_charging[5]

        // // If we have a lot of data then we can turn off data points to optimize performance
        // if (data_obj.evc_charging[0].length > 150) {
        //     chart_obj.ev_charging_chart.options.elements.point.radius = 0;
        //     chart_obj.ev_charging_chart.options.elements.point.hitRadius = 7;
        //     chart_obj.ev_charging_chart.options.elements.point.hoverRadius = 7;
        // }
        //
        // else {
        //     chart_obj.ev_charging_chart.options.elements.point.radius = 3;
        //     chart_obj.ev_charging_chart.options.elements.point.hitRadius = 1;
        //     chart_obj.ev_charging_chart.options.elements.point.hoverRadius = 4;
        // }

        // Now update the chart
        chart_obj.ev_charging_chart.update();
    }

    if (chart_obj.hasOwnProperty('solar_history_bar_chart_today_update')) {
        // We need to update the last bar of the solar history bar chart

        // let labels = chart_obj.solar_history_bar_chart.data.labels;

        // console.log(chart_obj.solar_history_bar_chart.data.labels.length);
        let data_array = chart_obj['solar_history_bar_chart_today_update'].data.datasets[1].data
        // Todo: we have to keep a track on this, to see if we need to update labels
        // chart_obj.solar_history_bar_chart.data.labels = data_obj.labels;
        data_array[data_array.length - 1] = data_obj['data'];

        chart_obj['solar_history_bar_chart_today_update'].update()

    }

    if (chart_obj.hasOwnProperty('solar_history_bar_chart')) {
        chart_obj.solar_history_bar_chart.data.labels = data_obj.labels;
        chart_obj.solar_history_bar_chart.data.datasets[0].data = data_obj.solar_data;
        chart_obj.solar_history_bar_chart.data.datasets[1].data = data_obj.solar_data;

        chart_obj.solar_history_bar_chart.update()
    }

    if (chart_obj.hasOwnProperty('charging_history_bar_chart')) {
        chart_obj.charging_history_bar_chart.data.labels = data_obj.labels;
        chart_obj.charging_history_bar_chart.data.datasets[0].data = data_obj.charging_data;
        chart_obj.charging_history_bar_chart.data.datasets[1].data = data_obj.charging_data;

        chart_obj.charging_history_bar_chart.update()
    }

    if (chart_obj.hasOwnProperty('last_ev_charge_line_chart')) {
        chart_obj.last_ev_charge_line_chart.data.labels = data_obj.time;
        chart_obj.last_ev_charge_line_chart.data.datasets[0].data = data_obj.dcp;
        chart_obj.last_ev_charge_line_chart.data.datasets[1].data = data_obj.utility_p;
        chart_obj.last_ev_charge_line_chart.data.datasets[2].data = data_obj.ac2p;
        chart_obj.last_ev_charge_line_chart.data.datasets[3].data = data_obj.btp;

        chart_obj.last_ev_charge_line_chart.update()
    }
}

async function start_charging_session_listeners(user, db, initial_charging_data_obj,
    charging_chart_obj, isCharging_parent_node) {
    console.log('Starting listeners function');

    // charger_list is a list of all of the charger IDs that are registered to the system
    let charger_list = Object.keys(isCharging_parent_node);

    // charging_status_object keeps track of which chargers are charging/not charging
    // Todo: might not need this
    let charging_status_object = {};

    // Loop through all of our registered chargers
    for (let index in charger_list) {
        // Define their chargerID
        let chargerID = charger_list[index];

        // Start a listener for the charging status of each of the IDs
        db.ref(`users/${user.uid}/evc_inputs/charging/${chargerID}`).on('value', async function (snapshot) {

            // charging_value is true for charging, false for not charging
            let charging_value = snapshot.val();

            // If the new value of charging is true
            if (charging_value === true) {
                // and the charger ID exists in our data set - then do nothing
                if (chargerID_exists_in_dataset(chargerID, charging_chart_obj)) {
                    console.log('It exists!')
                }
                // If the chargerID does not exist in our data set then we need to create an object for it
                else {
                    console.log('Dataset does not exist yet, need to create the structure');
                    charging_chart_obj.data.datasets.push({
                        data: [],
                        label: chargerID,
                        borderColor: "#52ffbf",
                        fill: false
                    });
                    charging_chart_obj.update()
                }

                // Now that we have sorted out the chart data structure, we start a charge session listener
                // Get the latest charging time for this chargerID
                let latest_charging_time = await db.ref(`users/${user.uid}/charging_history_keys/${chargerID}/${get_current_date()}`)
                    .orderByKey().limitToLast(1).once("value");
                latest_charging_time = Object.keys(latest_charging_time.val());

                console.log(`Our latest charging time is: ${latest_charging_time}`);
                console.log(charging_chart_obj.data.datasets);

                // Start a charge session listener for this charger ID
                let charge_session_ref = db.ref(`users/${user.uid}/charging_history/${chargerID}/${get_current_date()} ${latest_charging_time}`);
                charge_session_ref.limitToLast(1).on("child_added", async function (snapshot) {
                    // Todo: keep in mind that we will have duplicate value. Track if we need to fix this or not
                    let new_data = snapshot.val();
                    console.log('We got new data coming in:');
                    console.log(new_data);

                    // Todo: might need to match timestamps.
                    let new_inverter_data = await db.ref(`users/${user.uid}/history/${date}`).limitToLast(1).once("value");
                    new_inverter_data = new_inverter_data.val();
                    console.log(new_inverter_data);
                    // todo: format inverter history data so that we can use this method

                    append_new_data_to_charging_chart(chargerID, charging_chart_obj, new_data)
                });
                charging_status_object[chargerID] = {
                    charging: true,
                    listener_ref: charge_session_ref
                };

            }
            // If the new value of charging is false
            else if (charging_value === false) {
                // Then we need to remove the chargerID from the data set completely
                charging_chart_obj = delete_chargerID_from_dataset(chargerID, charging_chart_obj);

                if (charging_status_object.hasOwnProperty(chargerID)) {
                    charging_status_object[chargerID].listener_ref.off();
                    delete charging_status_object[chargerID];
                }
            }
            // console.log(charging_status_object);

            // Analyze our charging status object and update our ev charging heading and height
            adjust_ev_charging_title_and_height(charging_status_object)

        })
    }
    return true
}

async function grab_initial_charging_data(user, db, isCharging_parent_node) {

    adjust_ev_charging_title_and_height({});

    // charging_data_obj will be the object that defines our initial datasets
    let charging_data_obj = {
        datasets: []
    };

    let earliest_timestamp = null;

    // Loop through all of the chargerIDs that are registered
    for (let chargerID in isCharging_parent_node) {
        // Double check if the chargerID exists and chargerID is currently charging
        if (isCharging_parent_node.hasOwnProperty(chargerID) && isCharging_parent_node[chargerID] === true) {

            // Get the latest charging time for this chargerID
            let latest_charging_time = await db.ref(`users/${user.uid}/charging_history_keys/${chargerID}/${date}`)
                .orderByKey().limitToLast(1).once("value");
            latest_charging_time = Object.keys(latest_charging_time.val());

            // Now that we have the latest charging time, we need to get data from the charge session
            let latest_charge_session_obj = await db.ref(`users/${user.uid}/charging_history/${chargerID}/${date} ${latest_charging_time}`)
                .orderByKey().once("value");
            latest_charge_session_obj = latest_charge_session_obj.val();

            // Now push the data into a temporary array and then into the datasets structure
            let temp_data_array = [];
            for (let key in latest_charge_session_obj) {
                if (latest_charge_session_obj.hasOwnProperty(key)) {
                    temp_data_array.push({
                        x: moment(latest_charge_session_obj[key]['Time'], 'YYYY-MM-DD hh:mm:ss'),
                        y: latest_charge_session_obj[key]['Power_Import']
                    })
                }
            }
            charging_data_obj.datasets.push({
                data: temp_data_array,
                label: chargerID,
                // Todo: make a color array to reference
                borderColor: "#ff92d2",
                fill: false
            });

            // Todo: this needs to be tested with multiple charge points
            // If our earliest timestamp is not yet defined, then we know that this is the earliest so far
            if (earliest_timestamp === null) {
                earliest_timestamp = temp_data_array[0].x
            }
            // If our earliest timestamp has not yet been defined, we need to compare it
            else if (temp_data_array[0]['Time'].isBefore(earliest_timestamp)) {
                earliest_timestamp = temp_data_array[0].x
            }
        }
    }

    // // If earliest timestamp is null then there is no initial charging sessions. So we can skip the code
    // if (earliest_timestamp !== null) {
    //     // Now that we have the earliest timestamp, we can format it in a way to grab inverter history data
    //     earliest_timestamp = earliest_timestamp.format("HHmmss");
    //
    //     // Todo: add indexing to improve performance
    //     let earliest_inverter_payload = await db.ref(`users/${user.uid}/history/${date}`)
    //         .orderByChild('time')
    //         .startAt(earliest_timestamp)
    //         .once('value');
    //     earliest_inverter_payload = earliest_inverter_payload.val();
    //     console.log(earliest_inverter_payload);
    //
    //     // Define a temporary data object that includes arrays for all of our inverter data
    //     let temp_data_obj = {
    //         'Solar Power': [],
    //         'Battery Power': [],
    //         'Grid Power': []
    //     };
    //
    //     // Loop through all of our inverter history and push the data into the arrays in temp_data_obj
    //     for (let key in earliest_inverter_payload) {
    //         if (earliest_inverter_payload.hasOwnProperty(key)) {
    //             let time_obj = moment(`${date} ${earliest_inverter_payload[key]['time']}`, 'YYYY-MM-DD hhmmss');
    //             temp_data_obj['Solar Power'].push({
    //                 x: time_obj,
    //                 y: (earliest_inverter_payload[key]['dc1p'] + earliest_inverter_payload[key]['dc2p']) / 1000
    //             });
    //             temp_data_obj['Battery Power'].push({
    //                 x: time_obj,
    //                 y: earliest_inverter_payload[key]['btp'] / 1000
    //             });
    //             temp_data_obj['Grid Power'].push({
    //                 x: time_obj,
    //                 y: earliest_inverter_payload[key]['utility_p'] / 1000
    //             })
    //         }
    //     }
    //
    //     // Now loop through our temp_data_obj and push the arrays into the charging data object
    //     for (let description in temp_data_obj) {
    //         if (temp_data_obj.hasOwnProperty(description)) {
    //             charging_data_obj.datasets.push({
    //                 data: temp_data_obj[description],
    //                 label: description,
    //                 // Todo: make a color array to reference
    //                 borderColor: "#fff020",
    //                 fill: false
    //             });
    //         }
    //     }
    //
    // }
    console.log('Finished grabbing initial data');
    return charging_data_obj

}

function adjust_ev_charging_title_and_height(charging_status_object) {
    let chargers_active = Object.keys(charging_status_object).length;
    if (chargers_active === 0) {
        // Before we do anything, set the heading to no active charging sessions
        document.getElementById('ev_charging_chart_title').innerText = 'EV Charging - No Active Charging Sessions';
        // Set the height of the graph to 0
        document.getElementById('ev_charging_chart_div').style.height = '0px';
    } else if (chargers_active === 1) {
        // Before we do anything, set the heading to no active charging sessions
        document.getElementById('ev_charging_chart_title').innerText = `EV Charging - There is ${chargers_active} Active Charging Session`;
        // Set the height of the graph to 0
        document.getElementById('ev_charging_chart_div').style.height = '250px';
    } else {
        // Before we do anything, set the heading to no active charging sessions
        document.getElementById('ev_charging_chart_title').innerText = `EV Charging - There are ${chargers_active} Active Charging Sessions`;
        // Set the height of the graph to 0
        document.getElementById('ev_charging_chart_div').style.height = '250px';
    }
}

function chargerID_exists_in_dataset(chargerID, charging_chart_obj, ) {
    // This function checks whether or not our chargerID exists in the chart's data object

    let dataset_exists = false;
    // Loop through our datasets to see if there exists a dataset
    for (let index in charging_chart_obj.data.datasets) {

        // Check if index exists in our datasets object
        if (charging_chart_obj.data.datasets.hasOwnProperty(index)) {

            // If chargerID = label, then there is already a data object
            if (chargerID === charging_chart_obj.data.datasets[index]['label']) {
                dataset_exists = true
            }
        }
    }
    return dataset_exists
}

function delete_chargerID_from_dataset(chargerID, charging_chart_obj) {
    // This function takes in a chargerID and deletes the data object from the charging chart
    for (let index in charging_chart_obj.data.datasets) {
        if (charging_chart_obj.data.datasets.hasOwnProperty(index)) {

            // Match the chargerID with the label
            if (chargerID === charging_chart_obj.data.datasets[index]['label']) {
                //... delete the series object and update the chart
                charging_chart_obj.data.datasets.splice(index, 1);
                charging_chart_obj.update();
                console.log(`Deleted ${chargerID}!`);
                break
            }

        }
    }
    return charging_chart_obj
}

function append_new_data_to_charging_chart(chargerID, charging_chart_obj, new_data) {
    // This function takes in some new data and appends it to our charging chart's data

    for (let index in charging_chart_obj.data.datasets) {

        // Check if index exists in our datasets object
        if (charging_chart_obj.data.datasets.hasOwnProperty(index)) {

            // If chargerID = label, then we have found the corresponding data object to modify
            if (chargerID === charging_chart_obj.data.datasets[index]['label']) {
                // Append the data into the charging chart
                charging_chart_obj.data.datasets[index].data.push({
                    x: moment(new_data['Time'], 'YYYY-MM-DD hh:mm:ss'),
                    y: new_data['Power_Import']
                });
                break
            }
        }
    }
    charging_chart_obj.update();
    console.log('Updated the chart!');
    console.log(charging_chart_obj.data.datasets)
}

function update_weather() {
    // This function gets the weather at the location of the system and updates the card

    let weather_card = document.getElementById('weather_card');
    $.getJSON("http://api.openweathermap.org/data/2.5/weather?q=Melbourne,au&APPID=4b7ee1f96bfd687f2fff4f7cdf1cd11c&units=metric", function (json) {
        weather_card.innerHTML = `${json.main.temp}&deg;C`
    });

    // Re-run 30 minutes later
    setTimeout(update_weather, 1800000)
}

function calculate_number_of_online_chargers(charger_status_obj) {

    let offline_chargers = 0;
    let online_chargers = 0;
    for (let key in charger_status_obj) {
        if (charger_status_obj.hasOwnProperty(key)) {
            if (charger_status_obj[key]) {
                online_chargers = online_chargers + 1
            } else {
                offline_chargers = offline_chargers + 1
            }
        }
    }
    return {
        datasets: [{
            data: [online_chargers, offline_chargers],
            backgroundColor: ['#0e9826', '#ff0e18']
        }],
        labels: [
            'Online',
            'Offline'
        ]
    }
}

function update_charger_status(user, db) {
    let data_obj = {
        datasets: [{
            data: [0, 0]
        }],
        labels: [
            'Online',
            'Offline'
        ]
    };
    let charger_status_pie = create_charts(data_obj, 'charger_status_pie');
    // Start a listener for the ev chargers that are registered on the system
    db.ref(`users/${user.uid}/ev_chargers`).on("value", async function (snapshot) {
        let ev_chargers = Object.keys(snapshot.val());
        console.log(ev_chargers);

        // Define an object for the status of all of our chargers
        let charger_status_obj = [];

        for (let index in ev_chargers) {
            let chargerID = ev_chargers[index];
            charger_status_obj[chargerID] = await db.ref(`users/${user.uid}/evc_inputs/${chargerID}/alive`).once("value");
            charger_status_obj[chargerID] = charger_status_obj[chargerID].val();
        }
        console.log(charger_status_obj);

        data_obj = calculate_number_of_online_chargers(charger_status_obj);
        charger_status_pie.data = data_obj;
        charger_status_pie.update();

        for (let index in ev_chargers) {
            let chargerID = ev_chargers[index];

            // Start a listener for the alive status of the charger
            db.ref(`users/${user.uid}/evc_inputs/${chargerID}/alive`).on("value", function (snapshot) {
                let temp_status = snapshot.val();

                // Check if our status has changed (to filter our first run)
                if (temp_status !== charger_status_obj[chargerID]) {
                    console.log('hello');
                    charger_status_obj[chargerID] = snapshot.val();
                    data_obj = calculate_number_of_online_chargers(charger_status_obj);
                    charger_status_pie.data = data_obj;
                    charger_status_pie.update();
                }
            })
        }
    })

}

function update_last_charging_session_table(chargerID, last_charge_session_obj) {
    // This function takes in the data from the latest charging session and then appends it to a table

    let output_html = "";

    output_html += `<tr><td><b>Charger ID</b></td><td>${chargerID}</td></tr>`;
    output_html += `<tr><td><b>Energy</b></td><td>${last_charge_session_obj['energy'].toFixed(2)} kWh</td></tr>`;
    output_html += `<tr><td><b>Started</b></td><td>${last_charge_session_obj['started']}</td></tr>`;

    let total_seconds = last_charge_session_obj['duration_seconds'];
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
    output_html += `<tr><td><b>Duration</b></td><td>${final_duration_string}</td></tr>`;


    document.getElementById('last_charging_table').innerHTML = output_html
}

function update_last_charging_session(user, db) {
    // Listen for any changes in ev_chargers registered
    db.ref(`users/${user.uid}/ev_chargers`).on("value", async function (snapshot) {
        let ev_chargers = Object.keys(snapshot.val());

        // Define latest_date as the date that is the newest
        let latest_date = moment('2000-01-01', 'YYYY-MM-DD');
        let latest_chargerID = "";

        // Loop through all of the ev chargers that are registered
        for (let index in ev_chargers) {

            // Define the charger ID
            let chargerID = ev_chargers[index];

            // Get the latest date in our analytics node
            let temp_date = await db.ref(`users/${user.uid}/charging_history_keys/${chargerID}`).orderByKey().limitToLast(1).once("value");
            temp_date = temp_date.val();

            // If the retrieved date is valid
            if (temp_date !== null) {
                temp_date = Object.keys(temp_date)[0];

                // Get the latest time for that date
                let temp_time = await db.ref(`users/${user.uid}/charging_history_keys/${chargerID}/${temp_date}`).orderByKey().limitToLast(1).once("value");
                temp_time = Object.keys(temp_time.val())[0];

                // Then we convert the date to a moment object to compare
                temp_date = moment(temp_date + ' ' + temp_time, "YYYY-MM-DD HHmm");

                // Check if our date is the latest one so far
                if (temp_date.isAfter(latest_date)) {
                    // If it is then we record the date and the chargerID
                    latest_date = temp_date;
                    latest_chargerID = chargerID
                }
            }
        }
        // console.log(`${latest_chargerID} wins!`);
        // console.log(latest_date.format('YYYY-MM-DD HHmm'));

        // Now that we have the latest chargerID and date of charging session, we can grab the analytics
        let charging_analytics_obj = await db.ref(`users/${user.uid}/analytics/charging_history_analytics/${latest_chargerID}/${latest_date.format('YYYY-MM-DD')}/${latest_date.format('HHmm')}`)
            .orderByKey().once("value");

        // Store all of the analytics in an object and add the start date/time into the object too
        charging_analytics_obj = charging_analytics_obj.val();
        charging_analytics_obj['started'] = latest_date.format('DD/MM/YYYY HH:mm');

        // Update the table
        update_last_charging_session_table(latest_chargerID, charging_analytics_obj);


        // Now that our table is updated, we loop through our ev chargers again
        for (let index in ev_chargers) {
            let chargerID = ev_chargers[index];

            // Start a child removed listener to listen for any new completed charging sessions
            db.ref(`users/${user.uid}/charging_history/${chargerID}`).on("child_removed", async function (snapshot) {
                // console.log(snapshot.key);
                // console.log(chargerID);

                // If there is a child removed, then we know this charge session just finished
                let latest_date_time = snapshot.key;

                // Need to take the key of this and get the analytics
                let charging_analytics_obj = await db.ref(`users/${user.uid}/analytics/charging_history_analytics/${
                    chargerID}/${latest_date_time.split(' ')[0]}/${latest_date_time.split(' ')[1]}`)
                    .orderByKey().once("value");

                // Put the analytics in an object and add the start date/time of the charging session
                charging_analytics_obj = charging_analytics_obj.val();
                charging_analytics_obj['started'] = latest_date_time.format('DD/MM/YYYY HH:mm');

                // Update the table
                update_last_charging_session_table(chargerID, charging_analytics_obj)
            });
        }

    });

}

function append_new_data_to_daily_charging_breakdown(data_obj, chargerID, new_data) {
    // This function takes a single value and appends it to the end of the data array for the chargerID

    for (let index in data_obj.datasets) {
        if (data_obj.datasets.hasOwnProperty(index)) {
            if (chargerID === data_obj.datasets[index]['label']) {
                data_obj.datasets[index].data.push(new_data)
            }
        }
    }
    return data_obj
}

async function condition_analytics_values_for_daily_charger_breakdown(charger_analytics_values, ev_chargers) {

    // This function should take all the analytics values and condition them for chartJS stacked bar chart
    console.log(charger_analytics_values)
    // Initialize our conditioned analytics values object
    let conditioned_charger_analytics_object = {
        labels: [],
        datasets: []
    }

    for (index in ev_chargers) {
        let chargerID = ev_chargers[index]

        conditioned_charger_analytics_object.datasets.push({
            type: 'bar',
            label: chargerID,
            data: [],
            // Todo: need a colour array here
            backgroundColor: 'blue',
            fill: false
        })
    }

    for (date in charger_analytics_values) {
        console.log('starting!')
        if (charger_analytics_values.hasOwnProperty(date)) {
            // Convert the dates to moment objects and append them to our labels
            conditioned_charger_analytics_object.labels.push(moment(date, 'YYYY-MM-DD'))

            // Now we have to go through all of the chargerIDs and find the total energy from each charge point for the day
            for (chargerID in charger_analytics_values[date]) {
                let temp_charge_energy = 0;

                // If this chargerID has data for this particular date
                if (charger_analytics_values[date][chargerID] !== null) {
                    // Then we loop through the charge sessions for that day for that charger ID and add up the energy
                    for (charge_session_time in charger_analytics_values[date][chargerID]) {
                        temp_charge_energy = temp_charge_energy + charger_analytics_values[date][chargerID][charge_session_time].energy.toFixed(2)
                    }
                }

                // Once we finished this loop, we append the total energy in our conditioned analytics obj
                conditioned_charger_analytics_object = append_new_data_to_daily_charging_breakdown(conditioned_charger_analytics_object, chargerID, temp_charge_energy)
            }
        }
    }
    return conditioned_charger_analytics_object
}

async function grab_charger_analytics_values(user, db, ev_chargers, num_days) {
    // This function serves update_daily_charger_breakdown and grabs all of the analytics values for the for the past num_days days

    let charger_analytics_values = {};

    for (let i = num_days; i >= 0; i--) {
        let day = moment().subtract(i, 'days').format('YYYY-MM-DD');
        console.log(i)
        console.log(day);
        charger_analytics_values[day] = {}

        // Loop through all of the ev chargers
        for (let index in ev_chargers) {
            let chargerID = "";
            if (ev_chargers.hasOwnProperty(index)) {
                chargerID = ev_chargers[index]
                // console.log(chargerID);

                let temp_data = await db.ref(`users/${user.uid}/analytics/charging_history_analytics/${chargerID}/${day}`).once("value");
                // console.log(temp_data.val())
                charger_analytics_values[day][chargerID] = temp_data.val()
            }

        }
    }
    return charger_analytics_values
}

function update_daily_charger_breakdown(user, db) {
    let i;

    let charger_analytics_values;
    let ev_chargers = [];
    let charging_ref = db.ref("users/" + user.uid + "/evc_inputs/charging/");
    charging_ref.once("value", function (snapshot) {
            ev_chargers = Object.keys(snapshot.val())
        })
        .then(function () {
            console.log(ev_chargers);
            grab_charger_analytics_values(user, db, ev_chargers, 15)
                .then(function (charger_analytics_values) {
                    condition_analytics_values_for_daily_charger_breakdown(charger_analytics_values, ev_chargers)
                        .then(function (final_analytics_values) {


                            console.log('done!')
                            create_charts(final_analytics_values, 'daily_charging_breakdown_bar')
                        })
                })

        });


}

function start_master_listener(user) {

    let db = firebase.database();
    let data_obj = {
        'utility_p': [],
        'utility_c': [],
        'ac2p': [],
        'ac2v': [],
        'ac2c': [],
        'dcp': [],
        'dc1v': [],
        'dc1c': [],
        'dc1p': [],
        'dc2v': [],
        'dc2c': [],
        'dc2p': [],
        'btp': [],
        'btv': [],
        'btc': [],
        'btsoc': [],
        'bt_module_temp': [],
        'time': []
    };

    let charging_table_data_obj = {
        'ac2p': 0,
        'ac2v': 0,
        'ac2c': 0
    };

    // Define the first row of sliders
    let first_row_slider_options = {
        height: 150,
        interval: 10000
    };
    let media_elem = document.getElementById('solar_slider');
    M.Slider.init(media_elem, first_row_slider_options);
    let media_elem1 = document.getElementById('utility_slider');
    M.Slider.init(media_elem1, first_row_slider_options);
    let media_elem2 = document.getElementById('bt_slider');
    M.Slider.init(media_elem2, first_row_slider_options);

    // Define the second row of sliders
    let second_row_slider_options = {
        height: 275,
        interval: 30000
    };
    let media_elem3 = document.getElementById('solar_history_slider');
    M.Slider.init(media_elem3, second_row_slider_options);
    let media_elem4 = document.getElementById('charger_info_slider');
    M.Slider.init(media_elem4, second_row_slider_options);
    let media_elem5 = document.getElementById('charging_analytics_slider');
    M.Slider.init(media_elem5, second_row_slider_options);


    // Now we have to initialize our title pushpin. This will make the title stick at the top while scrolling
    $('.title_pushpin').pushpin({
        // The navbar is 64px high
        top: 64,
        // Stick at the stop of the page
        offset: 0,
        onPositionChange: function (state) {
            // Grab our title_pushpin class (the class of our title)
            // let title_pushpin = document.querySelector('.title_pushpin');
            let title = $("#title");

            // If the title is at the top, revert to big, black font with white background
            if (state === "pin-top") {
                title.addClass("title_unpinned").removeClass("title_pinned")
            }

            // If title is pinned, make the text smaller, white and have a blue background
            else {
                title.addClass("title_pinned").removeClass("title_unpinned")
            }
        }
    });

    // Get the weather forecast for the location of the solar charger
    update_weather();
    // Start updating our pie chart that shows charger online/offline status
    update_charger_status(user, db);
    // Start listening for the latest charging session and push that to our table
    update_last_charging_session(user, db);
    // Start
    update_daily_charger_breakdown(user, db);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// EV CHARGING GRAPH ////////////////////////////////////////////////////////////////
    // Charging_ref is the Firebase reference to the parent of all charging stautses
    let charging_ref = db.ref("users/" + user.uid + "/evc_inputs/charging/");

    // isCharging_parent_node is an object whose KEYS are all of the registered chargers
    let isCharging_parent_node = null;

    // charging_chart_obj is the object of the ev charging chart
    let charging_chart_obj = null;

    charging_ref.once('value', async function (snapshot) {
        isCharging_parent_node = snapshot.val();
        let charging_data_obj = await grab_initial_charging_data(user, db, isCharging_parent_node)
        charging_chart_obj = create_charts(charging_data_obj, 'ev_charging_chart');
        let success = await start_charging_session_listeners(user, db, charging_data_obj, charging_chart_obj, isCharging_parent_node)
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////// ANALYTICS BAR CHARTS /////////////////////////////////////////////////////
    // Now we must update our history row of charts
    // First grab the last 20 dates for our inverter history analytics with this we can figure out the solar history and charging history
    let solar_history_data = [];
    let analytics_dates = [];
    let analytics_charts_obj = null;

    let charging_history_data = [];

    let inverter_history_analytics_ref = db.ref(`users/${user.uid}/analytics/inverter_history_analytics`);
    inverter_history_analytics_ref.limitToLast(20).on("value", async function (snapshot) {
        // Clear all of our data and label variables
        solar_history_data = [];
        analytics_dates = [];
        charging_history_data = [];

        let snapshot_obj = snapshot.val();
        // Loop through index of snapshot_obj and convert all of the keys (YYYY-MM-DD) to MomentJS objects and push into array
        for (let index in Object.keys(snapshot_obj)) {
            analytics_dates.push(moment(Object.keys(snapshot_obj)[index], 'YYYY-MM-DD'));
        }
        // Now loop through all of the data in snapshot_obj and push all the data to solar_history_data
        for (let date in snapshot_obj) {
            if (snapshot_obj.hasOwnProperty(date)) {
                solar_history_data.push(snapshot_obj[date]['dctp']);
                charging_history_data.push(snapshot_obj[date]['ac2tp'])
            }
        }

        // First grab today's analytics for solar and push it into the array.
        let analytics_ref = db.ref("users/" + user.uid + "/analytics/dcp_t");
        let current_solar = await analytics_ref.once("value");
        current_solar = current_solar.val();
        analytics_dates.push(moment());
        solar_history_data.push(current_solar.toFixed(2));

        // If we do not have a bar chart object, then we should create it
        if (analytics_charts_obj === null) {
            analytics_charts_obj = create_charts({
                'labels': analytics_dates,
                'solar_data': solar_history_data,
                'charging_data': charging_history_data,

            }, 'analytics_bar_charts')
        }
        // If we already have an object, then we should update the bar charts
        else {
            update_charts({
                'solar_history_bar_chart': analytics_charts_obj['solar_history_bar_chart'],
                'charging_history_bar_chart': analytics_charts_obj['charging_history_bar_chart']
            }, {
                'labels': analytics_dates,
                'solar_data': solar_history_data,
                'charging_data': charging_history_data,
            })
        }


    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Todo: move this into a new function

    // // Now let's get the last charging session
    // let last_charge_session_data_obj;
    // let last_ev_charge_line_chart;
    // let latest_date_string;
    // let url = "/delta_dashboard/last_charge_session_request";
    // let xhr = new XMLHttpRequest();
    // xhr.open("POST", url, true);
    // xhr.setRequestHeader("Content-Type", "application/json");
    // xhr.onload = function () {
    //     if (xhr.readyState === 4 && xhr.status === 200) {
    //         last_charge_session_data_obj = JSON.parse(xhr.response)['data_obj'];
    //
    //         // Convert all of the time values into moment objects (depending on the format)
    //         last_charge_session_data_obj['time'].forEach(function (value, key, time_array) {
    //             time_array[key] = moment(time_array[key])
    //         });
    //
    //         // Modify the card title with the date and time of the last charging session
    //         latest_date_string = JSON.parse(xhr.response)['date_string'];
    //         document.getElementById('last_ev_charging_session_title').innerHTML = `Last EV Charging Session: ${latest_date_string}`;
    //         last_ev_charge_line_chart = create_charts(last_charge_session_data_obj, 'last_ev_charge_line_chart');
    //     }
    // };
    //
    // let last_charging_session_request_payload = JSON.stringify({
    //     'latest_date': 'first_grab',
    //     'uid': user.uid
    // });
    // xhr.send(last_charging_session_request_payload);
    //
    // // After we have gotten
    // setInterval(function () {
    //     // let last_charge_session_data_obj;
    //     // let last_ev_charge_line_chart;
    //     let url = "/delta_dashboard/last_charge_session_request";
    //     let xhr = new XMLHttpRequest();
    //     xhr.open("POST", url, true);
    //     xhr.setRequestHeader("Content-Type", "application/json");
    //     xhr.onload = function () {
    //         if (xhr.readyState === 4 && xhr.status === 200) {
    //             if (JSON.parse(xhr.response)['new_data']) {
    //                 last_charge_session_data_obj = JSON.parse(xhr.response)['data_obj'];
    //
    //                 // Convert all of the time values into moment objects (depending on the format)
    //                 last_charge_session_data_obj['time'].forEach(function (value, key, time_array) {
    //                     time_array[key] = moment(time_array[key])
    //                 });
    //
    //                 // Modify the card title with the date and time of the last charging session
    //                 document.getElementById('last_ev_charging_session_title').innerHTML = `Last EV Charging Session: ${JSON.parse(xhr.response)['date_string']}`
    //                 update_charts({
    //                     'last_ev_charge_line_chart': last_ev_charge_line_chart
    //                 }, last_charge_session_data_obj);
    //             }
    //
    //             // If there is no new data
    //             else {
    //                 console.log('no new data')
    //             }
    //         }
    //     };
    //
    //     let data = JSON.stringify({
    //         'latest_date': latest_date_string,
    //         'uid': user.uid
    //     });
    //
    //     xhr.send(data);
    // }, 60000);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// LIVE INVERTER AND BATTERY GRAPHS ///////////////////////////////////////////////////
    // Now grab all of the historical values for today
    let history_ref = db.ref("users/" + user.uid + "/history/" + date);
    history_ref.orderByKey().limitToLast(70).once("value", function (snapshot) {
        let data = snapshot.val();

        // Grab the whole history Todo: we aren't grabbing all of the values in data_obj so keep that in mind!!
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                data_obj.utility_p.push(data[key]['utility_p']);
                data_obj.utility_c.push(data[key]['utility_c']);
                data_obj.ac2p.push(data[key]['ac2p']);
                data_obj.dcp.push(data[key]['dc1p'] + data[key]['dc2p']);
                data_obj.dc1v.push(data[key].dc1v);
                data_obj.dc1c.push(data[key].dc1c);
                data_obj.dc1p.push(data[key].dc1p);
                data_obj.dc2v.push(data[key].dc2v);
                data_obj.dc2c.push(data[key].dc2c);
                data_obj.dc2p.push(data[key].dc2p);
                data_obj.btp.push(data[key]['btp']);
                data_obj.btv.push(data[key].btv);
                data_obj.btc.push(data[key].btc);
                data_obj.btsoc.push(data[key].btsoc);
                data_obj.bt_module_temp.push(data[key].bt_module1_temp_max);

                data_obj.time.push(data[key]['time']);
            }
        }
        // Cut it so that we only have the amount we want
        data_obj.utility_p = data_obj.utility_p.slice(chart_properties['utility_p']['length'] * -1);
        data_obj.utility_c = data_obj.utility_c.slice(chart_properties['utility_p']['length'] * -1);
        data_obj.ac2p = data_obj.ac2p.slice(chart_properties['utility_p']['length'] * -1);
        data_obj.dcp = data_obj.dcp.slice(chart_properties['dcp']['length'] * -1);
        data_obj.dc1v = data_obj.dc1v.slice(chart_properties['dcp']['length'] * -1);
        data_obj.dc1c = data_obj.dc1c.slice(chart_properties['dcp']['length'] * -1);
        data_obj.dc1p = data_obj.dc1p.slice(chart_properties['dcp']['length'] * -1);
        data_obj.dc2v = data_obj.dc2v.slice(chart_properties['dcp']['length'] * -1);
        data_obj.dc2c = data_obj.dc2c.slice(chart_properties['dcp']['length'] * -1);
        data_obj.dc2p = data_obj.dc2p.slice(chart_properties['dcp']['length'] * -1);
        data_obj.btp = data_obj.btp.slice(chart_properties['btp']['length'] * -1);
        data_obj.btv = data_obj.btv.slice(chart_properties['btp']['length'] * -1);
        data_obj.btc = data_obj.btc.slice(chart_properties['btp']['length'] * -1);
        data_obj.btsoc = data_obj.btsoc.slice(chart_properties['btp']['length'] * -1);
        data_obj.bt_module_temp = data_obj.bt_module_temp.slice(chart_properties['btp']['length'] * -1);

        data_obj.time = data_obj.time.slice(chart_properties['dcp']['length'] * -1);

        data_obj.time.forEach(function (value, key, time_array) {
            time_array[key] = moment(time_array[key], 'hhmmss');
        });

    }).then(function () {
        document.getElementById("master_row").style.visibility = 'initial';
        document.getElementById("loading_id").style.visibility = 'hidden';

        $("#master_row").addClass("load");

        // Now create the charts
        let chart_obj = create_charts(data_obj, 'live_charts');

        // Start listening to any NEW ADDITIONS and only grab the newest addition - THEN push to chart/tables
        history_ref.orderByKey().limitToLast(1).on("child_added", async function (snapshot) {
            // new_data is the newest secondly data that has come in
            let new_data = snapshot.val();
            let new_time = moment(new_data.time, 'hhmmss');

            // If there is no data, then we just add to array
            if (data_obj.time.length === 0) {
                data_obj.utility_p.push(new_data.utility_p);
                data_obj.utility_c.push(new_data.utility_c);
                data_obj.ac2p.push(new_data.ac2p);
                data_obj.ac2v.push(new_data.ac2v);
                data_obj.ac2c.push(new_data.ac2c);
                data_obj.dcp.push(new_data.dctp);
                data_obj.dc1v.push(new_data.dc1v);
                data_obj.dc1c.push(new_data.dc1c);
                data_obj.dc1p.push(new_data.dc1p);
                data_obj.dc2v.push(new_data.dc2v);
                data_obj.dc2c.push(new_data.dc2c);
                data_obj.dc2p.push(new_data.dc2p);
                data_obj.btp.push(new_data.btp);
                data_obj.btv.push(new_data.btv);
                data_obj.btc.push(new_data.btc);
                data_obj.btsoc.push(new_data.btsoc);
                data_obj.bt_module_temp.push(new_data.bt_module1_temp_max);

                data_obj.time.push(moment(new_data.time, 'hhmmss'));
            }

            // Check if the incoming data is more up to date than our most up to date value
            if (data_obj.time[data_obj.time.length - 1].isBefore(new_time)) {
                // Shift the data over if we are past our time threshold
                if (data_obj.utility_p.length >= chart_properties.utility_p.length) {
                    data_obj.utility_p.shift();
                    data_obj.utility_p.push(new_data.utility_p);
                    data_obj.utility_c.shift();
                    data_obj.utility_c.push(new_data.utility_c);
                    data_obj.ac2p.shift();
                    data_obj.ac2p.push(new_data.ac2p);
                    data_obj.ac2v.shift();
                    data_obj.ac2v.push(new_data.ac2v);
                    data_obj.ac2c.shift();
                    data_obj.ac2c.push(new_data.ac2c);
                    data_obj.dcp.shift();
                    data_obj.dcp.push(new_data.dctp);
                    data_obj.dc1v.shift();
                    data_obj.dc1v.push(new_data.dc1v);
                    data_obj.dc1c.shift();
                    data_obj.dc1c.push(new_data.dc1c);
                    data_obj.dc1p.shift();
                    data_obj.dc1p.push(new_data.dc1p);
                    data_obj.dc2v.shift();
                    data_obj.dc2v.push(new_data.dc2v);
                    data_obj.dc2c.shift();
                    data_obj.dc2c.push(new_data.dc2c);
                    data_obj.dc2p.shift();
                    data_obj.dc2p.push(new_data.dc2p);
                    data_obj.btp.shift();
                    data_obj.btp.push(new_data.btp);
                    data_obj.btv.shift();
                    data_obj.btv.push(new_data.btv);
                    data_obj.btc.shift();
                    data_obj.btc.push(new_data.btc);
                    data_obj.btsoc.shift();
                    data_obj.btsoc.push(new_data.btsoc);
                    data_obj.bt_module_temp.shift();
                    data_obj.bt_module_temp.push(new_data.bt_module1_temp_max);

                    data_obj.time.shift();
                    data_obj.time.push(moment(new_data.time, 'hhmmss'));

                } else {
                    data_obj.utility_p.push(new_data.utility_p);
                    data_obj.utility_c.push(new_data.utility_c);
                    data_obj.ac2p.push(new_data.ac2p);
                    data_obj.ac2v.push(new_data.ac2v);
                    data_obj.ac2c.push(new_data.ac2c);
                    data_obj.dcp.push(new_data.dctp);
                    data_obj.dc1v.push(new_data.dc1v);
                    data_obj.dc1c.push(new_data.dc1c);
                    data_obj.dc1p.push(new_data.dc1p);
                    data_obj.dc2v.push(new_data.dc2v);
                    data_obj.dc2c.push(new_data.dc2c);
                    data_obj.dc2p.push(new_data.dc2p);
                    data_obj.btp.push(new_data.btp);
                    data_obj.btv.push(new_data.btv);
                    data_obj.btc.push(new_data.btc);
                    data_obj.btsoc.push(new_data.btsoc);
                    data_obj.bt_module_temp.push(new_data.bt_module1_temp_max);
                    data_obj.time.push(moment(new_data.time, 'hhmmss'))
                }

            }

            // Push all the new data into our charts
            update_charts(chart_obj, data_obj);
            update_live_data_tables(data_obj, 'general table');
        });

        // Todo: reenable for analytics
        // Define our analytics listener and print info to all our top cards and update the last bar of our bar chart
        let analytics_ref = db.ref("users/" + user.uid + "/analytics/");
        analytics_ref.on("value", function (snapshot) {
            let payload = snapshot.val();

            document.getElementById("dctp_card").innerText = payload['dcp_t'].toFixed(2) + "kWh";

            update_charts({
                'solar_history_bar_chart_today_update': analytics_charts_obj['solar_history_bar_chart']
            }, {
                label: moment(),
                data: payload['dcp_t'].toFixed(2)
            });

            document.getElementById("utility_p_export_card").innerText = payload['utility_p_export_t'].toFixed(2) + "kWh";
            document.getElementById("utility_p_import_card").innerText = -1 * payload['utility_p_import_t'].toFixed(2) + "kWh";
            document.getElementById("bt_consumed_card").innerText = payload['btp_consumed_t'].toFixed(2) + "kWh";
            document.getElementById("bt_charged_card").innerText = -1 * (payload['btp_charged_t'].toFixed(2)) + "kWh";

        });

    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}


function signOut() {
    firebase.auth().signOut().then(function () {
        console.log("Signout Successful")
        // window.location.reload()
    }).catch(function (error) {
        console.log("error", error)
    })
}


function checkIfLoggedIn() {

    // Make all of the charts go away until we have data
    document.getElementById("master_row").style.visibility = 'hidden';

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // This will update our global date variable
            generate_date();

            // Start the main js script
            start_master_listener(user);
        } else {
            window.location.replace("/delta_dashboard/login")
        }
    });

}

function update_live_data_tables(data_obj, purpose) {

    if (purpose === "evc_table") {

        let evc_output = "";

        evc_output += "<tr><td>" + "AC2 Power" + "</td><td>" + data_obj.ac2p + "W" + "</td>";
        evc_output += "<tr><td>" + "AC2 Voltage" + "</td><td>" + data_obj.ac2v + "V" + "</td>";
        evc_output += "<tr><td>" + "AC2 Current" + "</td><td>" + data_obj.ac2c + "A" + "</td>";

        document.getElementById("evc_table_body").innerHTML = evc_output;
    } else {

        let ac1_output = "";
        let dcp_output = "";
        let btp_output = "";
        ac1_output += "<tr><td>" + "Utility AC Current" + "</td><td>" + data_obj.utility_c[data_obj.utility_c.length - 1] + "A" + "</td>";
        ac1_output += "<tr><td>" + "Utility AC Power" + "</td><td>" + data_obj.utility_p[data_obj.utility_p.length - 1] + "W" + "</td>";
        document.getElementById("utility_reveal_table").innerHTML = ac1_output;

        dcp_output += "<tr><td>" + "DC Total Power" + "</td><td>" + data_obj.dcp[data_obj.dcp.length - 1] + "W" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Voltage" + "</td><td>" + data_obj.dc1v[data_obj.dc1v.length - 1] + "V" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Current" + "</td><td>" + data_obj.dc1c[data_obj.dc1c.length - 1] + "A" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Power" + "</td><td>" + data_obj.dc1p[data_obj.dc1p.length - 1] + "W" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Voltage" + "</td><td>" + data_obj.dc2v[data_obj.dc2v.length - 1] + "V" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Current" + "</td><td>" + data_obj.dc2c[data_obj.dc2c.length - 1] + "A" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Power" + "</td><td>" + data_obj.dc2p[data_obj.dc2p.length - 1] + "W" + "</td>";

        // dcp_output += "<tr><td>" + "AC2 Power" + "</td><td>" + data_obj.ac2p[data_obj.ac2p.length - 1] + "W" + "</td>";
        document.getElementById("dcp_reveal_table").innerHTML = dcp_output;

        btp_output += "<tr><td>" + "Battery Power" + "</td><td>" + data_obj.btp[data_obj.btp.length - 1] + "W" + "</td>";
        btp_output += "<tr><td>" + "Battery Voltage" + "</td><td>" + data_obj.btv[data_obj.btv.length - 1] + "V" + "</td>";
        btp_output += "<tr><td>" + "Battery Current" + "</td><td>" + data_obj.btc[data_obj.btc.length - 1] + "A" + "</td>";
        btp_output += "<tr><td>" + "Battery SOC" + "</td><td>" + data_obj.btsoc[data_obj.btsoc.length - 1] + "%" + "</td>";
        btp_output += "<tr><td>" + "Battery Temperature" + "</td><td>" + data_obj.bt_module_temp[data_obj.bt_module_temp.length - 1] + "C" + "</td>";
        document.getElementById("btp_reveal_table").innerHTML = btp_output;
        document.getElementById('btsoc_card').innerText = data_obj.btsoc[data_obj.btsoc.length - 1] + '%';

    }

}

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

    // Go into the chart options and find the min and max time of the x axis
    let chartOptions = chart.options.scales.xAxes[0];
    let startX = chartOptions.time.min;
    let endX = chartOptions.time.max;
    if (startX && typeof startX === 'object')
        startX = startX._d.getTime();
    if (endX && typeof endX === 'object')
        endX = endX._d.getTime();

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

checkIfLoggedIn();