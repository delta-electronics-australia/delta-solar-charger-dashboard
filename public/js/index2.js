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
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: 'Power (kW)',
                            fontColor: '#000000'
                        },
                    }, {
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
                maintainAspectRatio: false,
                responsive: true,
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
                },]
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
                            unit: 'day'
                            // displayFormats: {
                            //     day: 'MMM D'
                            // }
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Solar Generated (kWh)',
                            fontColor: '#ffffff'
                        },
                        ticks: {
                            fontColor: "#ffffff",
                        },
                        gridLines: {
                            color: '#a19ca1'
                        }
                    }]
                },
                tooltips: {
                    enabled: true,
                    callbacks: {
                        title: function (tooltipItems, data) {
                            let split_string = tooltipItems[0]['xLabel'].split(' ');
                            return `${split_string[0]} ${split_string[1]} ${split_string[2]}`
                        },
                        label: function (tooltipItems, data) {
                            return 'Solar Generated: ' + tooltipItems.yLabel + ' kWh'
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
        // console.log(data_obj);
        let daily_charging_breakdown_bar = new Chart(document.getElementById("daily_charging_breakdown_bar"), {
            type: 'bar',
            data: data_obj,
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
                            units: 'day'
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
        let data_array = chart_obj['solar_history_bar_chart_today_update'].data.datasets[1].data;
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
}

async function get_latest_charging_time(uid, db, chargerID) {
    // This function takes in a chargerID and finds the latest charging time for that given chargerID

    // Get the latest charging date for this chargerID
    let latest_charging_date = await db.ref(`users/${uid}/charging_history_keys/${chargerID}`)
        .orderByKey().limitToLast(1).once("value");
    latest_charging_date = Object.keys(latest_charging_date.val())[0];

    // Once we have the latest date, we can use it to find the latest time
    let latest_charging_time = await db.ref(`users/${uid}/charging_history_keys/${chargerID}/${latest_charging_date}`)
        .orderByKey().limitToLast(1).once("value");

    return {
        'date': latest_charging_date,
        'time': Object.keys(latest_charging_time.val())[0]
    };
}

async function start_charging_session_listeners(uid, db, initial_charging_data_obj,
                                                charging_chart_obj, isCharging_parent_node) {
    // This function will start listeners to detect changes in EV charging sessions

    console.log('Starting listeners function');

    let inverter_data_keys = {
        "Solar_Power": null,
        "Battery_Power": null,
        "Battery_SOC": null,
        "Battery_Temperature": null,
        "Grid_Power": null
    };

    // charger_list is a list of all of the charger IDs that are registered to the system
    let charger_list = Object.keys(isCharging_parent_node);

    // charging_status_object keeps track of which chargers are charging/not charging
    let charging_status_object = {};

    // Loop through all of our registered chargers
    for (let index in charger_list) {
        // Define their chargerID
        let chargerID = charger_list[index];

        // Start a listener for the charging status of each of the IDs
        db.ref(`users/${uid}/evc_inputs/charging/${chargerID}`).on('value', async function (snapshot) {

            // charging_value is true for charging, false for not charging
            let charging_value = snapshot.val();

            // If the new value of charging is true
            if (charging_value === true) {
                // We first have to merge this new chargerID into the dataset
                charging_chart_obj = merge_chargerID_into_dataset(chargerID, charging_chart_obj);

                // Make sure there are inverter data entries in the dataset
                charging_chart_obj = merge_inverter_info_into_dataset(inverter_data_keys, charging_chart_obj);

                // // and the charger ID exists in our data set - then do nothing
                // if (chargerID_exists_in_dataset(chargerID, charging_chart_obj)) {
                //     console.log('It exists!')
                // }
                // // If the chargerID does not exist in our data set then we need to create an object for it
                // else {
                //     console.log('Dataset does not exist yet, need to create the structure');
                //     charging_chart_obj.data.datasets.push({
                //         data: [],
                //         label: chargerID,
                //         borderColor: "#ff3300",
                //         fill: false
                //     });

                charging_chart_obj.update();

                // Get the latest charging timestamp of this charger ID
                let latest_charging_values = await get_latest_charging_time(uid, db, chargerID);
                let latest_charging_date = latest_charging_values['date'];
                let latest_charging_time = latest_charging_values['time'];

                console.log(`Our latest charging time is: ${latest_charging_date} ${latest_charging_time} for chargerID: ${chargerID}`);
                console.log(charging_chart_obj.data.datasets);

                // Start a charge session listener for this charger ID's latest charging session
                let charge_session_ref = db.ref(`users/${uid}/charging_history/${chargerID}/${latest_charging_date} ${latest_charging_time}`);
                charge_session_ref.limitToLast(1).on("child_added", async function (snapshot) {
                    let new_data = snapshot.val();
                    // console.log('We got new data coming in:');
                    // console.log(new_data);

                    append_new_data_to_charging_chart(chargerID, charging_chart_obj, new_data)
                });
                charging_status_object[chargerID] = {
                    charging: true,
                    listener_ref: charge_session_ref
                };
            }

            // If the new value of charging is false
            else if (charging_value === false) {

                if (charging_status_object.hasOwnProperty(chargerID)) {
                    console.log(`${chargerID} has stopped charging. Our charging status object is: ${charging_status_object}`);

                    // Turn off the listener for that charging session
                    charging_status_object[chargerID].listener_ref.off();

                    // Delete this chargerID from the charging_status_object
                    delete charging_status_object[chargerID];

                    // Then we need to remove the chargerID from the data set completely
                    charging_chart_obj = delete_chargerID_from_dataset(chargerID, charging_chart_obj, charging_status_object, inverter_data_keys);

                    // We should also update our daily charger breakdown
                    update_daily_charger_breakdown(uid, db)

                }
            }
            // Analyze our charging status object and update our ev charging heading and height
            adjust_ev_charging_title_and_height(charging_status_object)


        })
    }
    return true
}

async function grab_initial_charging_data(uid, db, isCharging_parent_node) {
    // This function grabs all data from existing charging sessions as well as inverter/BT info

    adjust_ev_charging_title_and_height({});

    // charging_data_obj will be the object that defines our initial datasets
    let charging_data_obj = {
        datasets: []
    };

    // earliest_timestamp is the timestamp of the longest current charging session
    let earliest_timestamp;
    // This will store the raw Firebase charging_history node of the longest current charging session
    let earliest_charge_session_obj;

    // Loop through all of the chargerIDs that are registered
    for (let chargerID in isCharging_parent_node) {

        // Double check if the chargerID exists and chargerID is currently charging
        if (isCharging_parent_node.hasOwnProperty(chargerID) && isCharging_parent_node[chargerID] === true) {

            // Get the latest charging time
            let latest_charging_values = await get_latest_charging_time(uid, db, chargerID);
            let latest_charging_time = latest_charging_values['time'];
            let latest_charging_date = latest_charging_values['date'];

            // Now that we have the latest charging time, we need to get data from the charge session
            let latest_charge_session_obj = await db.ref(`users/${uid}/charging_history/${chargerID}/${latest_charging_date} ${latest_charging_time}`)
                .orderByKey().once("value");
            latest_charge_session_obj = latest_charge_session_obj.val();

            // Now push the data into a temporary array and then into the datasets structure
            let temp_data_array = [];
            for (let key in latest_charge_session_obj) {
                if (latest_charge_session_obj.hasOwnProperty(key)) {
                    temp_data_array.push({
                        // x: moment(latest_charge_session_obj[key]['Time'], 'YYYY-MM-DD hh:mm:ss'),
                        x: moment(latest_charge_session_obj[key]['Time'], 'YYYY-MM-DD hh:mm:ss'),
                        y: latest_charge_session_obj[key]['Power_Import']
                    })
                }
            }
            charging_data_obj.datasets.push({
                data: temp_data_array,
                label: chargerID,
                borderColor: randomColor({luminosity: 'dark'}),
                yAxisID: 'A',
                fill: false
            });

            // If our earliest timestamp is not yet defined, then we know that this is the earliest so far
            if (earliest_timestamp === undefined) {
                earliest_timestamp = temp_data_array[0].x;
                earliest_charge_session_obj = latest_charge_session_obj
            }
            // If our earliest timestamp has been defined, we need to compare it
            else if (temp_data_array[0].x.isBefore(earliest_timestamp)) {
                earliest_timestamp = temp_data_array[0].x;
                earliest_charge_session_obj = latest_charge_session_obj
            }
        }
    }

    // If the earliest charge session object IS defined, then we know that we need to take the inverter values from this object
    // If earliest charge session is NOT defined then we know there are no current charging sessions - so just skip this section
    if (earliest_charge_session_obj !== undefined) {

        // Define our object that will hold all of the arrays of data
        let temp_data_object = {
            "Solar_Power": [],
            "Battery_Power": [],
            "Battery_SOC": [],
            "Battery_Temperature": [],
            "Grid_Power": []
        };

        // Now we loop through all of the entries in our earliest charge session object
        for (let key in earliest_charge_session_obj) {
            if (earliest_charge_session_obj.hasOwnProperty(key)) {

                // Now loop through all of the keys in our temp_data_object (solar, battery, grid power etc...)
                for (let data_key in temp_data_object) {
                    if (temp_data_object.hasOwnProperty(data_key)) {
                        // Now for each solar, battery grid... push data into the corresponding array
                        temp_data_object[data_key].push({
                            x: moment(earliest_charge_session_obj[key]['Time'], 'YYYY-MM-DD hh:mm:ss'),
                            y: earliest_charge_session_obj[key][data_key]
                        })
                    }
                }
            }
        }

        // Define the variable colour_object that shows the colour of our inverter/BT data
        let colour_object = {
            'Solar_Power': "#ffcc00",
            "Battery_Power": "#33cc33",
            "Battery_SOC": "#ef2fac",
            "Battery_Temperature": "#6600cc",
            "Grid_Power": "#3366ff"
        };

        // Now that all of our arrays are finalised, we have to push him into the final charging_data_obj
        // Loop through all of our data keys (Solar_Power, Battery_Power etc...)
        for (let data_key in temp_data_object) {
            if (temp_data_object.hasOwnProperty(data_key)) {
                // For each of the keys, our data will be temp_data_object[data_key], label will just be the key without _
                // and the borderColor should be colour_array[data_key]
                // Keep in mind that battery SOC and temperature has to be on yAxisID: B
                if (data_key === "Battery_SOC" || data_key === "Battery_Temperature") {
                    charging_data_obj.datasets.push({
                        data: temp_data_object[data_key],
                        label: data_key.replace(/_/g, ' '),
                        borderColor: colour_object[data_key],
                        yAxisID: 'B',
                        fill: false,
                        hidden: true
                    });
                } else {
                    charging_data_obj.datasets.push({
                        data: temp_data_object[data_key],
                        label: data_key.replace(/_/g, ' '),
                        borderColor: colour_object[data_key],
                        yAxisID: 'A',
                        fill: false
                    });
                }
            }
        }
    }

    console.log('Finished grabbing initial charging data');
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

function chargerID_exists_in_dataset(chargerID, charging_chart_obj,) {
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

function merge_inverter_info_into_dataset(inverter_data_keys, charging_chart_obj) {
    // Define our colour object which allows easy access to the colours each field is meant to be
    let colour_object = {
        'Solar_Power': "#ffcc00",
        "Battery_Power": "#33cc33",
        "Battery_SOC": "#ef2fac",
        "Battery_Temperature": "#6600cc",
        "Grid_Power": "#3366ff"
    };

    let entry_exists = false;
    // Loop through all of our dataset entries
    for (let [index, data_entry] of charging_chart_obj.data.datasets.entries()) {
        if (data_entry.label === 'Solar Power') {
            // If Solar_Power exists, then we assume the rest are there too
            entry_exists = true
        }
    }

    // But if there is no Solar_Power, we assume the rest of the inverter info is also not there
    if (!entry_exists) {
        // Loop through all of the keys in our temp_data_object
        for (let data_key in inverter_data_keys) {
            if (inverter_data_keys.hasOwnProperty(data_key)) {

                // For each of the keys, our data will be the object[data_key], label will just be the key without _
                // and the borderColor should be colour_array[data_key]
                // Battery SOC and temp need to be on the right hand axis
                if (data_key === "Battery_SOC" || data_key === "Battery_Temperature") {
                    charging_chart_obj.data.datasets.push({
                        data: [],
                        label: data_key.replace(/_/g, ' '),
                        borderColor: colour_object[data_key],
                        yAxisID: 'B',
                        fill: false
                    });
                } else {
                    charging_chart_obj.data.datasets.push({
                        data: [],
                        label: data_key.replace(/_/g, ' '),
                        borderColor: colour_object[data_key],
                        yAxisID: 'A',
                        fill: false
                    });
                }
            }
        }
    }

    return charging_chart_obj
}

function merge_chargerID_into_dataset(chargerID, charging_chart_obj) {
    // This function checks whether or not our chargerID exists in the chart's data object

    // Loop through our datasets to see if there exists a dataset
    for (let index in charging_chart_obj.data.datasets) {

        // Check if index exists in our datasets object
        if (charging_chart_obj.data.datasets.hasOwnProperty(index)) {

            // If chargerID = label, then there is already a data object
            if (chargerID === charging_chart_obj.data.datasets[index]['label']) {
                return charging_chart_obj
            }
        }
    }

    // If we looped through the whole dataset without returning then we need to add an entry
    console.log('Dataset does not exist yet, need to create the structure');
    charging_chart_obj.data.datasets.push({
        data: [],
        label: chargerID,
        borderColor: randomColor({luminosity: 'dark'}),
        // borderColor: "#ff3300",
        fill: false
    });

    return charging_chart_obj
}

function delete_chargerID_from_dataset(chargerID, charging_chart_obj, charging_status_object, inverter_data_keys) {
    // This function runs once a charger ID has stopped charging. It will delete this charger ID's charge session
    // from the charging chart object

    // First get the list of all chargers in our charging status object
    // Keep a note that this charger list is AFTER the charger ID that has stopped charging has been removed from it
    let charger_list = Object.keys(charging_status_object);

    // If there is still a charging session left
    if (charger_list.length > 0) {
        let earliest_charger_moment_object = moment();
        let earliest_chargerID;

        // Loop through all of the datasets in the charging chart object
        for (let [index, data_entry] of charging_chart_obj.data.datasets.entries()) {

            // If the label of this dataset entry is a charger in our charging status object
            if (charger_list.includes(data_entry.label)) {

                // Check if this charger's first timestamp is before the earliest one so far
                if (data_entry.data[0].x.isBefore(earliest_charger_moment_object)) {

                    // If it is, the earliest gets replaced
                    earliest_charger_moment_object = data_entry.data[0].x;
                    earliest_chargerID = data_entry.label;
                }
            }
        }

        let delete_index;

        // Loop through all of the dataset entries if the charging chart object
        for (let [index, data_entry] of charging_chart_obj.data.datasets.entries()) {

            // If we found solar power
            if (data_entry.label === "Solar Power") {

                // Loop through all of the data within the Solar Power dataset
                for (let [data_index, data] of data_entry['data'].entries()) {

                    // If the current timestamp is AFTER OR THE SAME as the earliest charger moment object
                    if (data.x.isAfter(earliest_charger_moment_object) || data.x.format('HH:mm:ss') === earliest_charger_moment_object.format('HH:mm:ss')) {

                        // We note this index and stop looping over this data array
                        delete_index = data_index;
                        break
                    }
                }
                // Stop looping over datasets
                break
            }
        }
        // Finally, loop through our charging chart object again
        for (let [index, data_entry] of charging_chart_obj.data.datasets.entries()) {

            // If the label corresponds to a key in our inverter data keys - then the dataset is inverter/BT info
            // The labels don't have underscores in them, so we need to add them in
            if (inverter_data_keys.hasOwnProperty(data_entry.label.replace(' ', '_'))) {

                // We need to go into the data and delete all values in the array up to delete_index
                charging_chart_obj.data.datasets[index].data = charging_chart_obj.data.datasets[index].data.slice(delete_index)
            }
        }

        // Then we just need to delete its own data
        for (let [index, data_entry] of charging_chart_obj.data.datasets.entries()) {

            // Match the chargerID with the label
            if (chargerID === data_entry['label']) {

                //... delete the series object and update the chart
                charging_chart_obj.data.datasets.splice(index, 1);

                console.log(`Deleted ${chargerID}!`);
                break
            }
        }
    }

    // If this charging session is the last one, then we can just delete everything
    else {
        console.log('There are no more charging sessions left, deleting everything...');

        charging_chart_obj.data.datasets.length = 0

        // for (let [index, value] of charging_chart_obj.data.datasets.entries()) {
        //     // Delete the first
        //     charging_chart_obj.data.datasets.splice(0, 1);
        // }
    }

    charging_chart_obj.update();
    return charging_chart_obj
}

function append_new_data_to_charging_chart(chargerID, charging_chart_obj, new_data) {
    // This function takes in charge session data and appends it to our charging chart's data

    let temp_data_object = {
        "Solar_Power": null,
        "Battery_Power": null,
        "Battery_SOC": null,
        "Battery_Temperature": null,
        "Grid_Power": null
    };
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

            }

            // Now append all of the inverter/BT info to the chart object
            else if (charging_chart_obj.data.datasets[index]['label'] === "Solar Power") {
                // Append the data into the charging chart
                charging_chart_obj.data.datasets[index].data.push({
                    x: moment(new_data['Time'], 'YYYY-MM-DD hh:mm:ss'),
                    y: new_data['Solar_Power']
                });
            } else if (charging_chart_obj.data.datasets[index]['label'] === "Battery Power") {
                // Append the data into the charging chart
                charging_chart_obj.data.datasets[index].data.push({
                    x: moment(new_data['Time'], 'YYYY-MM-DD hh:mm:ss'),
                    y: new_data['Battery_Power']
                });
            } else if (charging_chart_obj.data.datasets[index]['label'] === "Battery SOC") {
                // Append the data into the charging chart
                charging_chart_obj.data.datasets[index].data.push({
                    x: moment(new_data['Time'], 'YYYY-MM-DD hh:mm:ss'),
                    y: new_data['Battery_SOC']
                });
            } else if (charging_chart_obj.data.datasets[index]['label'] === "Battery Temperature") {
                // Append the data into the charging chart
                charging_chart_obj.data.datasets[index].data.push({
                    x: moment(new_data['Time'], 'YYYY-MM-DD hh:mm:ss'),
                    y: new_data['Battery_Temperature']
                });
            } else if (charging_chart_obj.data.datasets[index]['label'] === "Grid Power") {
                // Append the data into the charging chart
                charging_chart_obj.data.datasets[index].data.push({
                    x: moment(new_data['Time'], 'YYYY-MM-DD hh:mm:ss'),
                    y: new_data['Grid_Power']
                });
            }
        }
    }

    charging_chart_obj.update();
}

function update_weather(uid, db) {
    // This function gets the weather at the location of the system and updates the card

    db.ref(`users/${uid}/system_location`).once("value").then(function (snapshot) {
        let system_location_object = snapshot.val();
        let weather_url;

        let weather_card = document.getElementById('weather_card');
        // If there is no location, then we go with the stock
        if (system_location_object === null) {
            // weather_url = "http://api.openweathermap.org/data/2.5/weather?q=Melbourne,au&APPID=4b7ee1f96bfd687f2fff4f7cdf1cd11c&units=metric"
            weather_card.innerHTML = `Please set system location in the settings`
        }
        // If there is a location, we use that for our weather update
        else {
            weather_url = `http://api.openweathermap.org/data/2.5/weather?lat=${system_location_object.lat}&lon=${system_location_object.lng}&APPID=4b7ee1f96bfd687f2fff4f7cdf1cd11c&units=metric`

            $.getJSON(weather_url, function (json) {
                weather_card.innerHTML = `${json.weather[0].description.toLowerCase()
                    .split(' ')
                    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                    .join(' ')
                    } ${json.main.temp}&deg;C`
            })
        }

        // Re-run 30 minutes later
        setTimeout(function () {
            update_weather(uid, db)
        }, 900000)
    })
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

function update_charger_status(uid, db) {
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
    db.ref(`users/${uid}/ev_chargers`).on("value", async function (snapshot) {
        let ev_chargers = Object.keys(snapshot.val());

        // Define an object for the status of all of our chargers
        let charger_status_obj = [];

        for (let index in ev_chargers) {
            let chargerID = ev_chargers[index];
            charger_status_obj[chargerID] = await db.ref(`users/${uid}/evc_inputs/${chargerID}/alive`).once("value");
            charger_status_obj[chargerID] = charger_status_obj[chargerID].val();
        }
        console.log(charger_status_obj);

        data_obj = calculate_number_of_online_chargers(charger_status_obj);
        charger_status_pie.data = data_obj;
        charger_status_pie.update();

        for (let index in ev_chargers) {
            let chargerID = ev_chargers[index];

            // Start a listener for the alive status of the charger
            db.ref(`users/${uid}/evc_inputs/${chargerID}/alive`).on("value", function (snapshot) {
                let temp_status = snapshot.val();

                // Check if our status has changed (to filter our first run)
                if (temp_status !== charger_status_obj[chargerID]) {
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

function update_last_charging_session(uid, db) {
    // Listen for any changes in ev_chargers registered
    db.ref(`users/${uid}/ev_chargers`).on("value", async function (snapshot) {
        let ev_chargers = Object.keys(snapshot.val());

        // Define latest_date as the date that is the newest
        let latest_date = moment('2000-01-01', 'YYYY-MM-DD');
        let latest_chargerID = "";

        // Loop through all of the ev chargers that are registered
        for (let index in ev_chargers) {

            // Define the charger ID
            let chargerID = ev_chargers[index];

            // Get the latest date in our analytics node
            let temp_date = await db.ref(`users/${uid}/analytics/charging_history_analytics/${chargerID}`).orderByKey().limitToLast(1).once("value");
            temp_date = temp_date.val();

            // If the retrieved date is valid
            if (temp_date !== null) {
                temp_date = Object.keys(temp_date)[0];

                // Get the latest time for that date
                let temp_time = await db.ref(`users/${uid}/analytics/charging_history_analytics/${chargerID}/${temp_date}`).orderByKey().limitToLast(1).once("value");
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
        let charging_analytics_obj = await db.ref(`users/${uid}/analytics/charging_history_analytics/${latest_chargerID}/${latest_date.format('YYYY-MM-DD')}/${latest_date.format('HHmm')}`)
            .orderByKey().once("value");

        // Store all of the analytics in an object and add the start date/time into the object too
        charging_analytics_obj = charging_analytics_obj.val();

        if (charging_analytics_obj !== null) {
            charging_analytics_obj['started'] = latest_date.format('DD/MM/YYYY HH:mm');

            // Update the table
            update_last_charging_session_table(latest_chargerID, charging_analytics_obj);

            // Now that our table is updated, we loop through our ev chargers again
            for (let index in ev_chargers) {
                let chargerID = ev_chargers[index];

                // Start a child removed listener to listen for any new completed charging sessions
                db.ref(`users/${uid}/charging_history/${chargerID}`).on("child_removed", async function (snapshot) {
                    // console.log(snapshot.key);
                    // console.log(chargerID);

                    // If there is a child removed, then we know this charge session just finished
                    let latest_date_time = snapshot.key;

                    console.log(`charging_history removed ${chargerID} ${latest_date_time}`);

                    // Need to take the key of this and get the analytics
                    let charging_analytics_obj = await db.ref(`users/${uid}/analytics/charging_history_analytics/${
                        chargerID}/${latest_date_time.split(' ')[0]}/${latest_date_time.split(' ')[1]}`)
                        .orderByKey().once("value");

                    // Put the analytics in an object and add the start date/time of the charging session
                    charging_analytics_obj = charging_analytics_obj.val();
                    charging_analytics_obj['started'] = moment(latest_date_time, 'YYYY-MM-DD HHmm').format('DD/MM/YYYY HH:mm');

                    // Update the table
                    update_last_charging_session_table(chargerID, charging_analytics_obj)
                });
            }
        } else {
            console.log('There have been no charging sessions');
            document.getElementById('last_charging_table').innerHTML = 'No charging sessions found';
        }
    });

}

function append_new_data_to_daily_charging_breakdown(data_obj, chargerID, new_data) {
    // This function takes a single value and appends it to the end of the data array for the chargerID

    for (let index in data_obj.datasets) {
        if (data_obj.datasets.hasOwnProperty(index)) {
            if (chargerID === data_obj.datasets[index]['label']) {
                data_obj.datasets[index].data.push(new_data.toFixed(2))
            }
        }
    }
    return data_obj
}

async function condition_analytics_values_for_daily_charger_breakdown(charger_analytics_values, ev_chargers) {
    // This function should take all the analytics values and condition them for chartJS stacked bar chart

    // Initialize our conditioned analytics values object
    let conditioned_charger_analytics_object = {
        labels: [],
        datasets: []
    };

    // Todo: maybe make this as long as the amount of chargers in Firebase
    // Define a colour array that will be referenced each time
    let colour_array = ['blue', 'pink', 'green', 'black'];

    for (let index in ev_chargers) {
        if (ev_chargers.hasOwnProperty(index)) {
            let chargerID = ev_chargers[index];

            conditioned_charger_analytics_object.datasets.push({
                type: 'bar',
                label: chargerID,
                data: [],
                backgroundColor: colour_array[index],
                fill: false
            })
        }

    }

    for (date in charger_analytics_values) {
        if (charger_analytics_values.hasOwnProperty(date)) {
            // Convert the dates to moment objects and append them to our labels
            conditioned_charger_analytics_object.labels.push(moment(date, 'YYYY-MM-DD'));

            // Now we have to go through all of the chargerIDs and find the total energy from each charge point for the day
            for (let chargerID in charger_analytics_values[date]) {
                let temp_charge_energy = 0;
                if (charger_analytics_values[date].hasOwnProperty(chargerID)) {
                    // If this chargerID has data for this particular date
                    if (charger_analytics_values[date][chargerID] !== null) {
                        // Then we loop through the charge sessions for that day for that charger ID and add up the energy
                        for (let charge_session_time in charger_analytics_values[date][chargerID]) {
                            if (charger_analytics_values[date][chargerID].hasOwnProperty(charge_session_time)) {
                                temp_charge_energy = temp_charge_energy + parseFloat(charger_analytics_values[date][chargerID][charge_session_time].energy)
                            }
                        }
                    }
                    // Once we finished this loop, we append the total energy in our conditioned analytics obj
                    conditioned_charger_analytics_object = append_new_data_to_daily_charging_breakdown(conditioned_charger_analytics_object, chargerID, temp_charge_energy)
                }
            }
        }
    }
    return conditioned_charger_analytics_object
}

async function grab_charger_analytics_values(uid, db, ev_chargers, num_days) {
    // This function serves update_daily_charger_breakdown and grabs all of the analytics values for the for the past num_days days
    let charger_analytics_values = {};

    // Loop through all of the ev chargers
    for (let index in ev_chargers) {
        if (ev_chargers.hasOwnProperty(index)) {
            let chargerID = ev_chargers[index];

            // Grab the charging history analytics values for the last 15 days
            let temp_data = await db.ref(`users/${uid}/analytics/charging_history_analytics/${chargerID}/`).limitToLast(num_days).once("value");
            temp_data = temp_data.val();

            // Loop through the past 15 dates
            for (let i = num_days; i >= 0; i--) {
                let day = moment().subtract(i, 'days').format('YYYY-MM-DD');

                // Check if our final object has a field for the current day
                if (!charger_analytics_values.hasOwnProperty(day)) {
                    // If not, make a blank object for the current day
                    charger_analytics_values[day] = {};
                }

                // If we have data for today then we append that data to the final object
                if (temp_data !== null && temp_data.hasOwnProperty(day)) {
                    charger_analytics_values[day][chargerID] = temp_data[day];
                }

                // If we do not have any data at all for the past 15 days OR if in our data, there is no data for the
                // current day we append null
                else {
                    charger_analytics_values[day][chargerID] = null
                }
            }
        }
    }
    return charger_analytics_values
}

function update_daily_charger_breakdown(uid, db) {
    let ev_chargers = [];
    let charging_ref = db.ref("users/" + uid + "/evc_inputs/charging/");

    // Get a list of all of our ev chargers
    charging_ref.once("value", function (snapshot) {
        ev_chargers = Object.keys(snapshot.val())
    })
        .then(function () {
            // Then we grab all of the analytics values for the past 15 days
            grab_charger_analytics_values(uid, db, ev_chargers, 15)
                .then(function (charger_analytics_values) {
                    // Then we condition the data in the way that we need to chart
                    condition_analytics_values_for_daily_charger_breakdown(charger_analytics_values, ev_chargers)
                        .then(function (final_analytics_values) {
                            // Then we plot it in a stacked bar chart
                            create_charts(final_analytics_values, 'daily_charging_breakdown_bar')
                        })
                })

        });


}

function initialiseUIElements(isCustomUID) {
    /** This function initializes all of our Materialize UI elements **/

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
        interval: 12000
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
        // Todo: make this value adjustable!!
        top: 64,
        // Stick at the stop of the page
        offset: 0,
        onPositionChange: function (state) {
            // Grab our title_pushpin class (the class of our title)
            let title = $("#title");

            // If the title is at the top, revert to big, black font with white background
            if (state === "pin-top") {
                title.addClass("title_unpinned").removeClass("title_pinned");

                // Revert to our original state
                $(".title_unpinned").css({'background-color': ''});
                $(".title_pinned").css({'background-color': ''});
            }

            // If title is pinned, make the text smaller, white and have a blue background
            else {
                title.addClass("title_pinned").removeClass("title_unpinned");

                // If we have a custom UID, then we have to set the pinned bar as light red
                if (isCustomUID) {
                    $(".title_pinned").css({'background-color': 'rgba(246, 137, 132, 0.65)'});
                }

                // If we don't have a custom UID, then we have to use light blue as the pinned bar's colour
                else {
                    $(".title_pinned").css({'background-color': 'rgba(100, 181, 246, 0.85)'});
                }
            }
        }
    });


}

function startDashboard(uid) {
    let test = randomColor({luminosity: 'dark'});
    console.log(test)

    let isCustomUID;

    // First check if the uid of page matches with our user's uid
    if (uid !== firebase.auth().currentUser.uid) {
        isCustomUID = true;

        // Link the more info button to the hardware_info page
        document.getElementById('more_info_button').addEventListener('click', function () {
            location.href = `/delta_dashboard/hardware_info/${uid}`;
        });
    } else {
        isCustomUID = false;

        // Link the more info button to the hardware_info page
        document.getElementById('more_info_button').addEventListener('click', function () {
            location.href = `/delta_dashboard/hardware_info/`;
        });
    }

    // Initialise our UI elements
    initialiseUIElements(isCustomUID);

    let db = firebase.database();

    // If this system is not running a multiple charger system, redirect to single charger homepage
    db.ref(`users/${uid}/system_type`).once("value", function (snapshot) {
        if (snapshot.val() !== "multiple") {
            window.location.replace("/delta_dashboard/");
        }
    });

    // Get the weather forecast for the location of the solar charger
    update_weather(uid, db);
    // Start updating our pie chart that shows charger online/offline status
    update_charger_status(uid, db);
    // Start listening for the latest charging session and push that to our table
    update_last_charging_session(uid, db);
    // Start
    update_daily_charger_breakdown(uid, db);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// EV CHARGING GRAPH ////////////////////////////////////////////////////////////////
    // Charging_ref is the Firebase reference to the parent of all charging stautses
    let charging_ref = db.ref("users/" + uid + "/evc_inputs/charging/");

    // isCharging_parent_node is an object whose KEYS are all of the registered chargers
    let isCharging_parent_node = null;

    // charging_chart_obj is the object of the ev charging chart
    let charging_chart_obj = null;

    charging_ref.once('value', async function (snapshot) {
        isCharging_parent_node = snapshot.val();
        let charging_data_obj = await grab_initial_charging_data(uid, db, isCharging_parent_node);
        charging_chart_obj = create_charts(charging_data_obj, 'ev_charging_chart');
        await start_charging_session_listeners(uid, db, charging_data_obj, charging_chart_obj, isCharging_parent_node)
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

    let inverter_history_analytics_ref = db.ref(`users/${uid}/analytics/inverter_history_analytics`);
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
        let analytics_ref = db.ref("users/" + uid + "/analytics/live_analytics/dcp_t");
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// LIVE INVERTER AND BATTERY GRAPHS ///////////////////////////////////////////////////
    // Now grab all of the historical values for today
    let history_ref = db.ref("users/" + uid + "/history/" + date);
    history_ref.orderByKey().limitToLast(70).once("value", function (snapshot) {
        let data = snapshot.val();

        // Grab the whole history
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
        document.getElementById("index2_master_row").style.visibility = 'initial';
        document.getElementById("loading_id").style.visibility = 'hidden';

        $("#index2_master_row").addClass("load");

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

        // Define our analytics listener and print info to all our top cards and update the last bar of our bar chart
        let analytics_ref = db.ref("users/" + uid + "/analytics/live_analytics");
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

function checkIfLoggedIn() {

    // Make all of the charts go away until we have data
    document.getElementById("index2_master_row").style.visibility = 'hidden';

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // This will update our global date variable
            generate_date();

            startDashboard(getPageUID(user));

        } else {
            window.location.replace("/delta_dashboard/login")
        }
    });

}

function update_live_data_tables(data_obj, purpose) {
    /// This function takes in a data object and updates the tables on the dashbaord

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

        // document.getElementById("utility_reveal_table").innerHTML = ac1_output;
        let $utility_reveal_table = $("#utility_reveal_table");
        $utility_reveal_table.empty();
        $utility_reveal_table.append(ac1_output);

        dcp_output += "<tr><td>" + "DC Total Power" + "</td><td>" + data_obj.dcp[data_obj.dcp.length - 1] + "W" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Voltage" + "</td><td>" + data_obj.dc1v[data_obj.dc1v.length - 1] + "V" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Current" + "</td><td>" + data_obj.dc1c[data_obj.dc1c.length - 1] + "A" + "</td>";
        dcp_output += "<tr><td>" + "DC1 Power" + "</td><td>" + data_obj.dc1p[data_obj.dc1p.length - 1] + "W" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Voltage" + "</td><td>" + data_obj.dc2v[data_obj.dc2v.length - 1] + "V" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Current" + "</td><td>" + data_obj.dc2c[data_obj.dc2c.length - 1] + "A" + "</td>";
        dcp_output += "<tr><td>" + "DC2 Power" + "</td><td>" + data_obj.dc2p[data_obj.dc2p.length - 1] + "W" + "</td>";

        // document.getElementById("dcp_reveal_table").innerHTML = dcp_output;
        let $dcp_reveal_table = $("#dcp_reveal_table");
        $dcp_reveal_table.empty();
        $dcp_reveal_table.append(dcp_output);

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