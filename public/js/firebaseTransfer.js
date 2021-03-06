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
        let ev_charging_chart = new Chart(document.getElementById("ev_charging_chart"), {
            type: 'line',
            data: {
                labels: data_obj[0],
                datasets: [{
                    data: [],
                    label: "Solar Power",
                    borderColor: "#ffc107",
                    fill: false
                }, {
                    data: [],
                    label: "Battery Power",
                    borderColor: "#43a047",
                    fill: false
                }, {
                    data: [],
                    label: "EV Charging Power",
                    borderColor: "#f44336",
                    fill: false
                }, {
                    data: [],
                    label: "Grid Power",
                    borderColor: "#3366ff",
                    fill: false,
                    yAxisID: 'A',
                    hidden: false
                }, {
                    data: [],
                    label: "Battery Max Temp",
                    borderColor: "#6600cc",
                    fill: false,
                    yAxisID: 'B',
                    hidden: false

                }, {
                    data: [],
                    label: "Battery SOC",
                    borderColor: "#ef2fac",
                    fill: false,
                    yAxisID: 'B',
                    hidden: false

                }]
            },
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

        return {
            'ev_charging_chart': ev_charging_chart
        }
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

            'charging_history_bar_chart': new Chart(document.getElementById("charging_history_bar"), {
                type: 'bar',
                data: {
                    // labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    labels: data_obj['labels'],
                    datasets: [{
                        type: 'line',
                        // data: [0, 1, 4, 9, 16, 25, 36, 25, 1, 8, 64],
                        data: data_obj['charging_data'],
                        borderColor: "#000000",
                        backgroundColor: '#000000',
                        fill: false
                    }, {
                        // data: [0, 1, 4, 9, 16, 25, 36, 25, 1, 8, 64],
                        data: data_obj['charging_data'],
                        label: "EV Charging Power",
                        borderColor: "#ff1e19",
                        backgroundColor: '#ff1e19',
                        fill: false
                    }]
                },
                options: {
                    title: {
                        display: false,
                        text: 'EV Charging History'
                    },
                    legend: {
                        display: false
                    },
                    elements: {
                        line: {
                            tension: 0.3
                        }
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                display: true,
                                fontColor: '#ffffff',
                                source: 'auto'
                            },
                            gridLines: {
                                color: '#635e63'
                            },
                            type: 'time',
                            distribution: 'series',
                            time: {
                                displayFormats: {
                                    day: 'MMM D'
                                    // minute: 'h:mm a'
                                }
                            }
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
                                color: '#635e63'
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
            })
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

function start_master_listener(user) {

    // user.updateProfile({
    //     displayName: "CSIRO Test1",
    //     // photoURL: "https://example.com/jane-q-user/profile.jpg"
    // }).then(function() {
    //     console.log('done')
    // }).catch(function(error) {
    //     // An error happened.
    // });

    let db = firebase.database();

    // If this system is running a multiple charger system, then we need to redirect the page to the right homepage
    db.ref(`users/${user.uid}/system_type`).once("value", function (snapshot) {
        if (snapshot.val() === "multiple") {
            window.location.replace("/delta_dashboard/index2");
        }
    });

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

    let charging_data_obj = {
        'evc_charging': [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        'latest_timestamp': ""
    };

    let charging_table_data_obj = {
        'ac2p': 0,
        'ac2v': 0,
        'ac2c': 0
    };


    // Get the current charging mode from Firebase and intialize our charging mode input box
    db.ref("users/" + user.uid + "/evc_inputs/charging_mode").on('value', function (snapshot) {
        $('#chargemode_select').val(snapshot.val());
        let modeselect_elem = document.getElementById('chargemode_select');
        let modeselect_instance = M.FormSelect.init(modeselect_elem);
    });

    // Listen for a select in the dropdown box
    $('#chargemode_select').on('change', function () {
        // Send the new mode to Firebase to be picked up by our Analyse process
        db.ref("users/" + user.uid + "/evc_inputs").update({
            charging_mode: $(this).val()
        })
    });

    // Get the current charging mode from Firebase and intialize our charging mode input box
    db.ref("users/" + user.uid + "/evc_inputs/buffer_aggro_mode").on('value', function (snapshot) {
        $('#battery_buffer_select').val(snapshot.val());
        let battery_buffer_select_elem = document.getElementById('battery_buffer_select');
        let battery_buffer_select_instance = M.FormSelect.init(battery_buffer_select_elem);
    });

    // Listen for a select in the battery buffer dropdown box
    $('#battery_buffer_select').on('change', function () {
        // Send the new buffer aggressiveness mode to Firebase to be picked up by our Analyse process
        db.ref("users/" + user.uid + "/evc_inputs").update({
            buffer_aggro_mode: $(this).val()
        })
    });

    // Define the first row of sliders
    let first_row_slider_options = {
        height: 150,
        interval: 30000
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
    let media_elem4 = document.getElementById('charge_history_slider');
    M.Slider.init(media_elem4, second_row_slider_options);

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


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// EV CHARGING GRAPH ////////////////////////////////////////////////////////////////
    // Start a listener for the EV charging STATUS Todo: this URL will change when we migrate charging status into ID
    let charging_ref = db.ref("users/" + user.uid + "/evc_inputs/charging/");

    // _isCharging is the universal variable for whether or not there is an active charging session
    let _isCharging = false;

    // charging_chart_obj is the object of the ev charging chart
    let charging_chart_obj = null;

    // FIRST LOAD FLAG is for the ev charging chart. The value will depend on whether or not there is a charging session
    // active when we first load the page
    let FIRST_LOAD_FLAG = null;
    charging_chart_obj = create_charts(charging_data_obj.evc_charging, 'ev_charging_chart');

    charging_ref.once('value', function (snapshot) {
        // First we change the _isCharging variable for the whole webpage
        _isCharging = snapshot.val();

        // Our first load flag will also be isCharging. If it is true, then we need to run special code later
        FIRST_LOAD_FLAG = _isCharging;

    }).then(function () {
        // Start a listener for our charging status
        charging_ref.on('value', async function (snapshot) {
            _isCharging = snapshot.val();
            console.log("New value of _isCharging");
            console.log(_isCharging);

            if (_isCharging === true) {
                // First we need to get the time of the latest charging session
                let charging_history_keys_ref = db.ref(`users/${user.uid}/charging_history_keys/`);
                let latest_charging_time = await charging_history_keys_ref.orderByKey().limitToLast(1).once("value");
                latest_charging_time = Object.keys(latest_charging_time.val())[0];

                console.log('We are charging! Lets start a listener');
                console.log(latest_charging_time);

                // Navigate to the node of the latest charge session
                let charging_history_ref = db.ref(`users/${user.uid}/charging_history/${latest_charging_time}`);

                // If there is already a charging session active before we loaded the page, we grab the latest timestamp
                if (FIRST_LOAD_FLAG) {
                    let latest_timestamp = await charging_history_ref.orderByKey().limitToLast(1).once("value");
                    latest_timestamp = latest_timestamp.val();
                    charging_data_obj['latest_timestamp'] = latest_timestamp[Object.keys(latest_timestamp)[0]]['time'];
                }

                // Now start a listener for the latest charging session since we know a charging session is happening
                charging_history_ref.on("child_added", function (snapshot) {
                    let new_data = snapshot.val();

                    // Push all of the new data into the evc charging arrays
                    charging_data_obj.evc_charging[0].push(moment(new_data['time'], 'hhmmss'));
                    charging_data_obj.evc_charging[1].push(new_data['dctp']);
                    charging_data_obj.evc_charging[2].push(new_data['btp']);
                    charging_data_obj.evc_charging[3].push(new_data['ac2p']);
                    charging_data_obj.evc_charging[4].push(new_data['utility_p']);
                    charging_data_obj.evc_charging[5].push(new_data['bt_module1_temp_max']);
                    charging_data_obj.evc_charging[6].push(new_data['btsoc']);

                    charging_table_data_obj.ac2p = new_data['ac2p'];
                    charging_table_data_obj.ac2v = new_data['ac2v'];
                    charging_table_data_obj.ac2c = new_data['ac2c'];

                    // If the first load flag is no longer raised, we can update our charts
                    if (FIRST_LOAD_FLAG === false) {
                        update_charts(charging_chart_obj, charging_data_obj);
                        update_tables(charging_table_data_obj, 'evc_table');
                    }

                    // If the first load flag is raised, we have to check to see if the latest data coming in is the
                    // has the latest timestamp on it. If so, then we can clear the flag and start updating charts
                    if (FIRST_LOAD_FLAG === true) {
                        // console.log(new_data['time'] + ' ' + charging_data_obj['latest_timestamp']);
                        if (new_data['time'] === charging_data_obj['latest_timestamp']) {
                            console.log('We have found the latest time, lets trigger our flag');
                            FIRST_LOAD_FLAG = false;
                            update_charts(charging_chart_obj, charging_data_obj);
                            update_tables(charging_table_data_obj, 'evc_table')
                        }
                    }
                });

                // Update the text in our ev charging card to charging
                document.getElementById('evc_table').style.visibility = 'initial';
                document.getElementById('evc_status').innerHTML = "EV is Charging <i class=\"material-icons\">battery_charging_full\n</i>\n";
                document.getElementById('evc_status_body').innerText = "";
            } else {
                // Clear the array if we are not charging anymore
                for (let i = 0, length = charging_data_obj.evc_charging.length; i < length; i++) {
                    charging_data_obj.evc_charging[i].length = 0
                }
                update_charts(charging_chart_obj, charging_data_obj);

                // Update the text in our ev charging card to not charging
                document.getElementById('evc_table').style.visibility = 'hidden';
                document.getElementById('evc_status').innerHTML = "EV Disconnected ";
                document.getElementById('evc_status_body').innerText = "EV is disconnected and not charging"
            }
        });
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
    // Now let's get the last charging session
    let large_charge_session_data_obj;
    let last_ev_charge_line_chart;
    let latest_date_string;
    let url = "/delta_dashboard/last_charge_session_request";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            large_charge_session_data_obj = JSON.parse(xhr.response)['data_obj'];

            // Convert all of the time values into moment objects (depending on the format)
            large_charge_session_data_obj['time'].forEach(function (value, key, time_array) {
                time_array[key] = moment(time_array[key])
            });

            // Modify the card title with the date and time of the last charging session
            latest_date_string = JSON.parse(xhr.response)['date_string'];
            document.getElementById('last_ev_charging_session_title').innerHTML = `Last EV Charging Session: ${latest_date_string}`;
            last_ev_charge_line_chart = create_charts(large_charge_session_data_obj, 'last_ev_charge_line_chart');
        }
    };

    let last_charging_session_request_payload = JSON.stringify({
        'latest_date': 'first_grab',
        'uid': user.uid
    });
    xhr.send(last_charging_session_request_payload);

    // After we have gotten
    setInterval(function () {
        // let large_charge_session_data_obj;
        // let last_ev_charge_line_chart;
        let url = "/delta_dashboard/last_charge_session_request";
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (JSON.parse(xhr.response)['new_data']) {
                    large_charge_session_data_obj = JSON.parse(xhr.response)['data_obj'];

                    // Convert all of the time values into moment objects (depending on the format)
                    large_charge_session_data_obj['time'].forEach(function (value, key, time_array) {
                        time_array[key] = moment(time_array[key])
                    });

                    // Modify the card title with the date and time of the last charging session
                    document.getElementById('last_ev_charging_session_title').innerHTML = `Last EV Charging Session: ${JSON.parse(xhr.response)['date_string']}`
                    update_charts({
                        'last_ev_charge_line_chart': last_ev_charge_line_chart
                    }, large_charge_session_data_obj);
                }

                // If there is no new data
                else {
                    console.log('no new data')
                }
            }
        };

        let data = JSON.stringify({
            'latest_date': latest_date_string,
            'uid': user.uid
        });

        xhr.send(data);
    }, 60000);
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
            update_tables(data_obj, 'general table');
        });

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

function update_tables(data_obj, purpose) {

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