`use strict`;

//import "../modules/jquery/js/jquery-3.6.0"
//import "../modules/chartjs/js/chart.min.js"

function change_theme() {
  let current_theme = $("meta[name=theme]").attr("content");

  if (current_theme == "light") {
    $("meta[name=theme]").attr("content", "dark");
    $("body").removeClass("bg-light").removeClass("text-bg-light");
    $("body").addClass("bg-dark").addClass("text-bg-dark");
    $(".chart").addClass("inverted")
  } else {
    $("meta[name=theme]").attr("content", "light");
    $("body").removeClass("bg-dark").removeClass("text-bg-dark");
    $("body").addClass("bg-light").addClass("text-bg-light");
    $(".chart").removeClass("inverted")
  }

}

const draw = () => {
  let data = {
    labels: [1, 2, 3, 4],
    datasets: [
      {
        label: "Machine Temperature",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  let config = {
    type: 'line',
    data: data,
  };

  let ctx = document.getElementById("temp-chart");
  let myChart = new Chart(ctx, config);
};
