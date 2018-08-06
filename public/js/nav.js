$(function () {

    let a = {test1: 1, test2: 2, test4: 3};
    $.each(a, function (value) {
        console.log(value)
    });

    $('#nav').find('li').on('click', function () {
        e.preventDefault();
        console.log('click')
    })
});




function test() {
    console.log('hello');
    history.pushState(null, '', '/history')
}