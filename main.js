var width = 700;
var height = 60;
var data;
var currentValue = 0;
var targetValue = width;

d3.csv("candy.csv", function (csv) {
	for (var i = 0; i < csv.length; ++i) {
		csv[i].AGE = Number(csv[i].AGE);
	}
	data = csv;
	var minAge = d3.min(data, function (d) { return d.AGE; });
	var maxAge = d3.max(data, function (d) { return d.AGE; });
	currentValue = minAge;

	// initial svg
	var svg = d3.select("#main")
		.append("svg")
		.attr("id", "svg")
		.attr("width", width + 100)
		.attr("height", height + 100);

	// button to play the slider
	var playButton = d3.select("#main")
		.append("p")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "button-g")
		.append("button")
		.text("Play")
		.attr("class", "play-button")
		.on("click", function () {
			var button = d3.select(this);
			if (button.text() == "Pause") {
				clearInterval(timer);
				button.text("Play");
			} else {
				timer = setInterval(step, 200);
				button.text("Pause");
			}
		});

	// age scale
	var x = d3.scaleLinear()
		.domain([minAge, maxAge])
		.range([0, width])
		.clamp(true);

	// slider for storytelling vis - make a little person that grows over time
	var slider = svg.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(40, 100)");

	// add an interactive line where a user can adjust slider
	slider.append("line")
		.attr("class", "track")
		.attr("x1", x.range()[0])
		.attr("x2", x.range()[1])
		.select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
		.select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function () { slider.interrupt(); })
			.on("start drag", function () {
				currentValue = d3.event.x;
				update(x.invert(currentValue));
			})
		);

	// label ages under line appened to slider
	slider.insert("g", ".track-overlay")
		.attr("class", "ticks")
		.attr("transform", "translate(0," + 18 + ")")
		.selectAll("text")
		.data(x.ticks(20))
		.enter()
		.append("text")
		.attr("x", x)
		.attr("y", 10)
		.attr("text-anchor", "middle")
		.text(function (d) { return String(d); });

	// add circle on slider!
	var handle = slider.insert("circle", ".track-overlay")
		.attr("class", "handle")
		.attr("r", 9);

	// label where the slider is on the line	
	var label = slider.append("text")
		.attr("class", "label")
		.attr("text-anchor", "middle")
		.text(function (d) { return String(d); })
		.attr("transform", "translate(0," + (-25) + ")")

	function update(age) {
		// update position and text of label according to slider scale
		handle.attr("cx", x(age));
		label
			.attr("x", x(age))
			.text(String(age));

		// filter data set and redraw plot
		// var newData = dataset.filter(function(d) {
		//   return d.date < h;
		// })
		// drawPlot(newData);
	}

	function step() {
		update(x.invert(currentValue));
		currentValue = currentValue + (targetValue / 151);
		if (currentValue > targetValue) {
			currentValue = 0;
			clearInterval(timer);
			playButton.text("Play");
		}
	}

});


/*
consider referencing this code for auto-play story telling vis:
https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763

NON-CANDY DATA ATTRIBUTES IN CSV
--------------------------------
GOING_OUT
GENDER
AGE
COUNTRY
STATE

CANDY ATTRIBUTES IN CSV
-----------------------
note: candy is ranked by each individul as "JOY," "MEH," or "DESPAIR."
Joy :: likes this candy the most
Meh :: indifferent about this candy
Despair :: likes this candy the least
-----------------------
FULL_SIZED_CANDY_BAR
BUTTERFINGER
CANDY_CORN
CHICLETS
DOTS
FUZZY_PEACHES
GOOD_N_PLENTY
GUMMY_BEARS
HEALTHY_FRUIT
HEATH_BAR
HERSHEYS_DARK
HERSHEYS_MILK
HERSHEYS_KISSES
JOLLY_RANCHER
JUNIOR_MINTS
KITKAT
LAFFYTAFFY
LEMONHEADS
LICORICE
BLACK_LICORICE
LOLLIPOPS
MIKE_AND_IKE
MILK_DUDS
MILKYWAY
MNMS
PEANUT_MNMS
MINT_KISSES
MR_GOODBAR
NERDS
NESTLE_CRUNCH
PEEPS
PIXY_STIX
REESES_PB_CUPS
REESES_PIECES
ROLOS
SKITTLES
SNICKERS
SOURPATCH_KIDS
STARBURST
SWEDISH_FISH
TIC_TACS
THREE_MUSKETEERS
TOBLERONE
TRAIL_MIX
TWIX
WHATCHAMACALLIT_BARS
YORK_PEPPERMINT_PATTIES

*/