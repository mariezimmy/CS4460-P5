var width = 700;
var height = 60;
var data;
var currentValue = 0;
var targetValue = width;
var maxJoyCount;

var candyPreferenceMap = new Map(); // key: age value: list of top candy preferences
var candyCalculationmap = new Map(); // key: age value: map: (key: candy value: joy count)
var ageAgnosticCandyMap = new Map(); // key: candy value: joy count across all ages

var candies = [
	"Full Sized Candy Bar",
	"Butterfinger",
	"Candy Corn",
	"Chiclets",
	"Dots",
	"Fuzzy Peaches",
	"Good N Plenty",
	"Gummy Bears",
	"Healthy Fruit",
	"Heath Bar",
	"Hersheys Dark",
	"Hersheys Milk",
	"Hersheys Kisses",
	"Jolly Rancher",
	"Junior Mints",
	"KitKat",
	"Laffy Taffy",
	"Lemonheads",
	"Licorice",
	"Black Licorice",
	"Lollipops",
	"Mike and Ike",
	"Milk Duds",
	"Milky Way",
	"M&Ms",
	"Peanut M&Ms",
	"Mint Kisses",
	"Mr Goodbar",
	"Nerds",
	"Nestle Crunch",
	"Peeps",
	"Pixy Stix",
	"Reeses PB Cups",
	"Reeses Pieces",
	"Rolos",
	"Skittles",
	"Snickers",
	"Sour Patch Kids",
	"Starburst",
	"Swedish Fish",
	"Tic Tacs",
	"Three Musketeers",
	"Toblerone",
	"Trail Mix",
	"Twix",
	"Whatchamacallit Bars",
	"York Peppermint Patties"
]

/*

to get the data the way I want, meaning we determine the candy preferences for each age,
we need the following data structures:

first, we need a map with key: age, and value: array of top candy preferences (i.e. NERDS, MNMS, etc.)
but, to determine the candy preference, we need the following structure

a map that with key: age and value: another map (key: candy value: #JOY responses)
from this, we get the value and find the candies with the most joy reponses

*/
function updateCandyPreferenceMap(data) {
	updateCalculationMap(data);

	for (var i = 0; i < data.length; i++) {
		var candyMap = candyCalculationmap.get(data[i].AGE);
		var maxJoyCount = -1;
		var candyPreference = [];
		// find max joy count per age
		for (var candy of candies) {
			if (candyMap.get(candy) > maxJoyCount) {
				maxJoyCount = candyMap.get(candy);
			}
		}
		// get array of all candies that have that max joy count
		for (var candy of candies) {
			if (candyMap.get(candy) == maxJoyCount) {
				candyPreference.push(candy);
			}
		}
		// set map k: age, v: array of candy preferences
		candyPreferenceMap.set(data[i].AGE, candyPreference);
	}
}

function updateAgeAgnosticCandyMap(data) {
	updateCalculationMap(data);
	for (var i = 0; i < data.length; i++) {
		var candyMap = candyCalculationmap.get(data[i].AGE);
		for (var candy of candies) {
			if (ageAgnosticCandyMap.get(candy) == undefined) {
				ageAgnosticCandyMap.set(candy, candyMap.get(candy));
			} else {
				var currJoyCount = ageAgnosticCandyMap.get(candy);
				currJoyCount += candyMap.get(candy);
				ageAgnosticCandyMap.set(candy, currJoyCount);
			}
		}
	}

}

function getMaxJoyCount() {
	var currMaxJoyCount = -1
	for (var candy of candies) {
		if (ageAgnosticCandyMap.get(candy) > currMaxJoyCount) {
			currMaxJoyCount = ageAgnosticCandyMap.get(candy);
		}
	}
	maxJoyCount = currMaxJoyCount;
}

// create a formatted string of the contents of the array
function formatCandyPreferenceArray(arr) {
	var formattedArray = "";
	if (arr == undefined) {
		return formattedArray;
	}
	for (var i = 0; i < arr.length - 1; i++) {
		formattedArray = formattedArray.concat(formatCandyWord(arr[i]));
		formattedArray = formattedArray.concat(", ");
	}
	formattedArray = formattedArray.concat(formatCandyWord(arr[arr.length - 1]));
	return formattedArray;
}

// replace "_" with spaces and only make first letter capitalized
function formatCandyWord(str) {
	if (str == undefined) {
		return "";
	}
	return str;
}

/*

When our dataset contains more items than there are
available DOM elements, the surplus data items are
stored in a sub set of this selection called the
enter selection.

really helpful article on enter, update, exit:
https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36

*/

d3.csv("candy.csv", function (csv) {
	for (var i = 0; i < csv.length; i++) {
		csv[i].AGE = Number(csv[i].AGE);
	}

	data = csv.filter(function (d) {
		// if there is no age input, forget about the data
		return +d.AGE > 4;
	});

	// update the map with k -> age and v -> array of candy preferences
	updateCandyPreferenceMap(data);
	updateAgeAgnosticCandyMap(data);
	getMaxJoyCount();

	var minAge = d3.min(data, function (d) { return +d.AGE; });
	var maxAge = d3.max(data, function (d) { return +d.AGE; });
	currentValue = minAge;


	// create bar chart
	var barChart = d3.select("#main")
		.append("svg")
		.attr("width", width * 2)
		.attr("height", height * 8 + 120)
		.attr("class", "barChart");
	var bars = barChart.append("g");

	// initial svg
	var svg = d3.select("#main")
		.append("svg")
		.attr("id", "svg")
		.attr("width", width + 600)
		.attr("height", height / 3 + 105);

	// create p to hold both play button and dropdown select
	var belowGraph = d3.select("#main")
		.append("p")
		.style("padding-left", "2%")
		.style("padding-bottom", "2%")
		.attr("width", width)
		.attr("height", height)

	// play button for slider
	belowGraph.append("button")
		.text("Play")
		.attr("class", "play-button")
		.on("click", function () {
			var button = d3.select(this);
			if (button.text() == "Pause") {
				clearInterval(timer);
				button.text("Play");
			} else {
				timer = setInterval(step, 800);
				button.text("Pause");
			}
		});

	/*
	for whatever reason, css would not work with me to create a space
	between the play button and the dropdown select, so I added
	this empty, wide svg
	*/
	belowGraph.append("svg").attr("width", 20)
		.attr("height", 1);

	// dropdown select
	belowGraph
		.append("select")
		.attr("class", "dropdown")
		.selectAll("option")
		.data(["Joy", "Meh", "Despair"])
		.enter().append("option")
		.text(function (d) { return d; })
		.attr("value", function (d) {
			return d;
		});

	// scales for bar chart
	var barX = d3.scaleBand().domain(candies).range([0, width + 600]);
	var barY = d3.scaleLinear().domain([0, maxJoyCount]).range([height * 8, 0]);

	var barXAxis = d3.axisBottom(barX)
	var barYAxis = d3.axisLeft(barY);

	bars.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(60, " + ((height) * 8) + ")")
		.call(barXAxis)
		.selectAll("text")
		.attr("y", 0)
		.attr("x", 9)
		.attr("dy", ".35em")
		.attr("transform", "rotate(90)")
		.style("text-anchor", "start");
	bars.append("g")
		.attr("transform", "translate(60, 0)")
		.attr("class", "y axis")
		.attr("id", "yAxis")
		.call(barYAxis);

	// colors for bars - fix later to be related to candy color
	var colors = ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"];

	// add bars in an overview: this means 
	// before you hit play we the joy count for all candies across all ages
	for (var i = 0; i < candies.length; i++) {
		bars.append("g")
			.append("rect")
			.attr("id", "bar" + i)
			.style("fill", function () {
				return colors[Math.trunc(ageAgnosticCandyMap.get(candies[i]) / 10000 / 2)];
			})
			.attr("x", function () {
				return 63 + barX(candies[i]);
			})
			.attr("width", ((width + 600) / (candies.length)) - 6)
			.attr("y", function () { return barY(ageAgnosticCandyMap.get(candies[i])); })
			.attr("height", function () {
				return (height * 8) - barY(ageAgnosticCandyMap.get(candies[i]));
			});
	}

	// age scale
	var x = d3.scaleLinear()
		.domain([minAge, maxAge])
		.range([0, width])
		.clamp(true);

	// slider for storytelling vis - make a little person that grows over time
	var slider = svg.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(40, 65)");

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
				update(Math.round(x.invert(currentValue)), data);
			})
		);

	// label ages under line appened to slider
	slider.insert("g", ".track-overlay")
		.attr("class", "ticks")
		.attr("transform", "translate(0," + 18 + ")")
		.selectAll("text")
		.data(x.ticks(10))
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

	// provide details on demand about age and favorite candies
	var ageDetail = slider
		.append("text")
		.attr("class", "label")
		.attr("text-anchor", "middle")
		.text("Age:   ")
		.attr("transform", "translate(850," + (-15) + ")")

	var candiesDetail = slider
		.append("text")
		.text("Favorite Candies:")
		.attr("transform", "translate(838," + (15) + ")")
		.attr("class", "candiesDetail")
	var candiesDetail1 = slider
		.append("text")
		.text("")
		.attr("transform", "translate(838," + (30) + ")")
		.attr("class", "candiesDetail")
	var candiesDetail2 = slider
		.append("text")
		.text("")
		.attr("transform", "translate(838," + (45) + ")")
		.attr("class", "candiesDetail")
	var candiesDetail3 = slider
		.append("text")
		.text("")
		.attr("transform", "translate(838," + (60) + ")")
		.attr("class", "candiesDetail")


	function update(age) {
		// update position and of handle according to slider scale
		handle.attr("cx", x(age));

		// update detail on demand values for age and favorite candies
		ageDetail.text("Age: " + Math.round(age))
		updateCandyDetailX(age);
		var candyArr = candyPreferenceMap.get(Math.round(age));
		updateCandyText(candyArr);

		// change y scale now that we're looking at individual ages
		barY = d3.scaleLinear().domain([0, 105]).range([height * 8, 0]);
		barYAxis = d3.axisLeft(barY);
		bars.select("#yAxis")
			.attr("transform", "translate(60, 0)")
			.attr('class', 'y axis')
			.call(barYAxis);

		// update bars in bar chart
		// this is a detail view of joy count of all candies PER age
		for (var i = 0; i < candies.length; i++) {
			bars.select("#bar" + i)
				.transition()
				.style("fill", function () {
					if (candyArr != null) {
						var topCandy = candyArr[0];
						var maxValue = candyCalculationmap.get(Math.round(age)).get(topCandy);
						var spread = maxValue / 5;
						if (candyCalculationmap.get(Math.round(age)).get(candies[i]) < spread) {
							return colors[0];
						} else if (candyCalculationmap.get(Math.round(age)).get(candies[i]) < spread * 2) {
							return colors[1];
						} else if (candyCalculationmap.get(Math.round(age)).get(candies[i]) < spread * 3) {
							return colors[2];
						} else if (candyCalculationmap.get(Math.round(age)).get(candies[i]) < maxValue) {
							return colors[3];
						} else {
							return colors[4];
						}
					}
					return colors[0];
				})
				.attr("x", function () {
					return 63 + barX(candies[i]);
				})
				.attr("width", ((width + 600) / (candies.length)) - 6)
				.attr("y", function () {
					if (candyCalculationmap.get(Math.round(age)) == undefined) {
						return 480;
					} else {
						return barY(candyCalculationmap.get(Math.round(age)).get(candies[i]));
					}
				})
				.attr("height", function () {
					if (candyCalculationmap.get(Math.round(age)) == undefined) {
						return 0;
					} else {
						return (height * 8) - barY(candyCalculationmap.get(Math.round(age)).get(candies[i]));
					}
				})
		}
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

	function updateCandyText(arr) {
		if (arr == undefined) {
			candiesDetail.text("Favorite Candies:");
			candiesDetail1.text("");
			candiesDetail2.text("");
			candiesDetail3.text("");
		} else {
			var arrSlices = arr.length / 4;
			if (arrSlices < 1) {
				candiesDetail.text("Favorite Candies: "
					+ formatCandyPreferenceArray(arr));
				candiesDetail1.text("");
				candiesDetail2.text("");
				candiesDetail3.text("");

			} else if (arrSlices < 2) {
				candiesDetail.text("Favorite Candies: "
					+ formatCandyPreferenceArray(arr.slice(0, 4)));
				candiesDetail1.text(formatCandyPreferenceArray(arr.slice(4, arr.length)));
				candiesDetail2.text("");
				candiesDetail3.text("");

			} else if (arrSlices < 3) {
				candiesDetail.text("Favorite Candies: "
					+ formatCandyPreferenceArray(arr.slice(0, 4)));
				candiesDetail1.text(formatCandyPreferenceArray(arr.slice(4, 8)));
				candiesDetail2.text(formatCandyPreferenceArray(arr.slice(8, arr.length)));
				candiesDetail3.text("");

			} else {
				var endSliceIndex = arr.length;
				if (arr.length > 16) {
					endSliceIndex = 16;
				}
				candiesDetail.text("Favorite Candies: "
					+ formatCandyPreferenceArray(arr.slice(0, 4)));
				candiesDetail1.text(formatCandyPreferenceArray(arr.slice(4, 8)));
				candiesDetail2.text(formatCandyPreferenceArray(arr.slice(8, 12)));
				candiesDetail3.text(formatCandyPreferenceArray(arr.slice(12, endSliceIndex)));
			}
		}
	}

	function updateCandyDetailX(age) {
		candiesDetail.attr("transform", function () {
			if (Math.round(age) > 9) {
				return "translate(829," + (15) + ")";
			} else {
				return "translate(833," + (15) + ")";
			}
		})
		candiesDetail1.attr("transform", function () {
			if (Math.round(age) > 9) {
				return "translate(829," + (30) + ")";
			} else {
				return "translate(833," + (30) + ")";
			}
		})
		candiesDetail2.attr("transform", function () {
			if (Math.round(age) > 9) {
				return "translate(829," + (45) + ")";
			} else {
				return "translate(833," + (45) + ")";
			}
		})
		candiesDetail3.attr("transform", function () {
			if (Math.round(age) > 9) {
				return "translate(829," + (60) + ")";
			} else {
				return "translate(833," + (60) + ")";
			}
		})
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


/*
I know this is incredibly disgusting, but I don't know how to access data[i].SOMECANDY
programmatically - I tried to do some type of enum thingy, but it didn't consider SOMECANDY
a valid type :(

I know there should be a way to fix this, but for now, we're keeping this miserable code :(

 */

function updateCalculationMap(data) {
	for (var i = 0; i < data.length; i++) {
		if (candyCalculationmap.get(data[i].AGE) == undefined) {
			// create a new map that holds the candy and the joy count
			var currCandyMap = new Map();

			if (data[i].FULL_SIZED_CANDY_BAR == "JOY") {
				// set joy count to 1
				currCandyMap.set("Full Sized Candy Bar", 1);
			} else {
				// set joy count to 0 just to initialize this k-v pair
				currCandyMap.set("Full Sized Candy Bar", 0);
			}
			if (data[i].BUTTERFINGER == "JOY") {
				currCandyMap.set("Butterfinger", 1);
			} else {
				currCandyMap.set("Butterfinger", 0);
			}
			if (data[i].CANDY_CORN == "JOY") {
				currCandyMap.set("Candy Corn", 1);
			} else {
				currCandyMap.set("Candy Corn", 0);
			}
			if (data[i].CHICLETS == "JOY") {
				currCandyMap.set("Chiclets", 1);
			} else {
				currCandyMap.set("Chiclets", 0);
			}
			if (data[i].DOTS == "JOY") {
				currCandyMap.set("Dots", 1);
			} else {
				currCandyMap.set("Dots", 0);
			}
			if (data[i].FUZZY_PEACHES == "JOY") {
				currCandyMap.set("Fuzzy Peaches", 1);
			} else {
				currCandyMap.set("Fuzzy Peaches", 0);
			}
			if (data[i].GOOD_N_PLENTY == "JOY") {
				currCandyMap.set("Good N Plenty", 1);
			} else {
				currCandyMap.set("Good N Plenty", 0);
			}
			if (data[i].GUMMY_BEARS == "JOY") {
				currCandyMap.set("Gummy Bears", 1);
			} else {
				currCandyMap.set("Gummy Bears", 0);
			}
			if (data[i].HEALTHY_FRUIT == "JOY") {
				currCandyMap.set("Healthy Fruit", 1);
			} else {
				currCandyMap.set("Healthy Fruit", 0);
			}
			if (data[i].HEATH_BAR == "JOY") {
				currCandyMap.set("Heath Bar", 1);
			} else {
				currCandyMap.set("Heath Bar", 0);
			}
			if (data[i].HERSHEYS_DARK == "JOY") {
				currCandyMap.set("Hersheys Dark", 1);
			} else {
				currCandyMap.set("Hersheys Dark", 0);
			}
			if (data[i].HERSHEYS_MILK == "JOY") {
				currCandyMap.set("Hersheys Milk", 1);
			} else {
				currCandyMap.set("Hersheys Milk", 0);
			}
			if (data[i].HERSHEYS_KISSES == "JOY") {
				currCandyMap.set("Hersheys Kisses", 1);
			} else {
				currCandyMap.set("Hersheys Kisses", 0);
			}
			if (data[i].JOLLY_RANCHER == "JOY") {
				currCandyMap.set("Jolly Rancher", 1);
			} else {
				currCandyMap.set("Jolly Rancher", 0);
			}
			if (data[i].JUNIOR_MINTS == "JOY") {
				currCandyMap.set("Junior Mints", 1);
			} else {
				currCandyMap.set("Junior Mints", 0);
			}
			if (data[i].KITKAT == "JOY") {
				currCandyMap.set("KitKat", 1);
			} else {
				currCandyMap.set("KitKat", 0);
			}
			if (data[i].LAFFYTAFFY == "JOY") {
				currCandyMap.set("Laffy Taffy", 1);
			} else {
				currCandyMap.set("Laffy Taffy", 0);
			}
			if (data[i].LEMONHEADS == "JOY") {
				currCandyMap.set("Lemonheads", 1);
			} else {
				currCandyMap.set("Lemonheads", 0);
			}
			if (data[i].LICORICE == "JOY") {
				currCandyMap.set("Licorice", 1);
			} else {
				currCandyMap.set("Licorice", 0);
			}
			if (data[i].BLACK_LICORICE == "JOY") {
				currCandyMap.set("Black Licorice", 1);
			} else {
				currCandyMap.set("Black Licorice", 0);
			}
			if (data[i].LOLLIPOPS == "JOY") {
				currCandyMap.set("Lollipops", 1);
			} else {
				currCandyMap.set("Lollipops", 0);
			}
			if (data[i].MIKE_AND_IKE == "JOY") {
				currCandyMap.set("Mike and Ike", 1);
			} else {
				currCandyMap.set("Mike and Ike", 0);
			}
			if (data[i].MILK_DUDS == "JOY") {
				currCandyMap.set("Milk Duds", 1);
			} else {
				currCandyMap.set("Milk Duds", 0);
			}
			if (data[i].MILKYWAY == "JOY") {
				currCandyMap.set("Milky Way", 1);
			} else {
				currCandyMap.set("Milky Way", 0);
			}
			if (data[i].MNMS == "JOY") {
				currCandyMap.set("M&Ms", 1);
			} else {
				currCandyMap.set("M&Ms", 0);
			}
			if (data[i].PEANUT_MNMS == "JOY") {
				currCandyMap.set("Peanut M&Ms", 1);
			} else {
				currCandyMap.set("Peanut M&Ms", 0);
			}
			if (data[i].MINT_KISSES == "JOY") {
				currCandyMap.set("Mint Kisses", 1);
			} else {
				currCandyMap.set("Mint Kisses", 0);
			}
			if (data[i].MR_GOODBAR == "JOY") {
				currCandyMap.set("Mr Goodbar", 1);
			} else {
				currCandyMap.set("Mr Goodbar", 0);
			}
			if (data[i].NERDS == "JOY") {
				currCandyMap.set("Nerds", 1);
			} else {
				currCandyMap.set("Nerds", 0);
			}
			if (data[i].NESTLE_CRUNCH == "JOY") {
				currCandyMap.set("Nestle Crunch", 1);
			} else {
				currCandyMap.set("Nestle Crunch", 0);
			}
			if (data[i].PEEPS == "JOY") {
				currCandyMap.set("Peeps", 1);
			} else {
				currCandyMap.set("Peeps", 0);
			}
			if (data[i].PIXY_STIX == "JOY") {
				currCandyMap.set("Pixy Stix", 1);
			} else {
				currCandyMap.set("Pixy Stix", 0);
			}
			if (data[i].REESES_PB_CUPS == "JOY") {
				currCandyMap.set("Reeses PB Cups", 1);
			} else {
				currCandyMap.set("Reeses PB Cups", 0);
			}
			if (data[i].REESES_PIECES == "JOY") {
				currCandyMap.set("Reeses Pieces", 1);
			} else {
				currCandyMap.set("Reeses Pieces", 0);
			}
			if (data[i].ROLOS == "JOY") {
				currCandyMap.set("Rolos", 1);
			} else {
				currCandyMap.set("Rolos", 0);
			}
			if (data[i].SKITTLES == "JOY") {
				currCandyMap.set("Skittles", 1);
			} else {
				currCandyMap.set("Skittles", 0);
			}
			if (data[i].SNICKERS == "JOY") {
				currCandyMap.set("Snickers", 1);
			} else {
				currCandyMap.set("Snickers", 0);
			}
			if (data[i].SOURPATCH_KIDS == "JOY") {
				currCandyMap.set("Sour Patch Kids", 1);
			} else {
				currCandyMap.set("Sour Patch Kids", 0);
			}
			if (data[i].STARBURST == "JOY") {
				currCandyMap.set("Starburst", 1);
			} else {
				currCandyMap.set("Starburst", 0);
			}
			if (data[i].SWEDISH_FISH == "JOY") {
				currCandyMap.set("Swedish Fish", 1);
			} else {
				currCandyMap.set("Swedish Fish", 0);
			}
			if (data[i].TIC_TACS == "JOY") {
				currCandyMap.set("Tic Tacs", 1);
			} else {
				currCandyMap.set("Tic Tacs", 0);
			}
			if (data[i].THREE_MUSKETEERS == "JOY") {
				currCandyMap.set("Three Musketeers", 1);
			} else {
				currCandyMap.set("Three Musketeers", 0);
			}
			if (data[i].TOBLERONE == "JOY") {
				currCandyMap.set("Toblerone", 1);
			} else {
				currCandyMap.set("Toblerone", 0);
			}
			if (data[i].TRAIL_MIX == "JOY") {
				currCandyMap.set("Trail Mix", 1);
			} else {
				currCandyMap.set("Trail Mix", 0);
			}
			if (data[i].TWIX == "JOY") {
				currCandyMap.set("Twix", 1);
			} else {
				currCandyMap.set("Twix", 0);
			}
			if (data[i].WHATCHAMACALLIT_BARS == "JOY") {
				currCandyMap.set("Whatchamacallit Bars", 1);
			} else {
				currCandyMap.set("Whatchamacallit Bars", 0);
			}
			if (data[i].YORK_PEPPERMINT_PATTIES == "JOY") {
				currCandyMap.set("York Peppermint Patties", 1);
			} else {
				currCandyMap.set("York Peppermint Patties", 0);
			}

			// update candy calculation map to now have age and new currCandyMap
			candyCalculationmap.set(data[i].AGE, currCandyMap);
		} else {
			var currCandyMap = candyCalculationmap.get(data[i].AGE);
			if (data[i].FULL_SIZED_CANDY_BAR == "JOY") {
				// get the current joy count
				var currJoyCount = currCandyMap.get("Full Sized Candy Bar");
				// increment it
				currJoyCount++;
				// update the candy joy count;
				currCandyMap.set("Full Sized Candy Bar", currJoyCount);
			}

			if (data[i].BUTTERFINGER == "JOY") {
				var currJoyCount = currCandyMap.get("Butterfinger");
				currJoyCount++;
				currCandyMap.set("Butterfinger", currJoyCount);
			}
			if (data[i].CANDY_CORN == "JOY") {
				var currJoyCount = currCandyMap.get("Candy Corn");
				currJoyCount++;
				currCandyMap.set("Candy Corn", currJoyCount);
			}
			if (data[i].CHICLETS == "JOY") {
				var currJoyCount = currCandyMap.get("Chiclets");
				currJoyCount++;
				currCandyMap.set("Chiclets", currJoyCount);
			}
			if (data[i].DOTS == "JOY") {
				var currJoyCount = currCandyMap.get("Dots");
				currJoyCount++;
				currCandyMap.set("Dots", currJoyCount);
			}
			if (data[i].FUZZY_PEACHES == "JOY") {
				var currJoyCount = currCandyMap.get("Fuzzy Peaches");
				currJoyCount++;
				currCandyMap.set("Fuzzy Peaches", currJoyCount);
			}
			if (data[i].GOOD_N_PLENTY == "JOY") {
				var currJoyCount = currCandyMap.get("Good N Plenty");
				currJoyCount++;
				currCandyMap.set("Good N Plenty", currJoyCount);
			}
			if (data[i].GUMMY_BEARS == "JOY") {
				var currJoyCount = currCandyMap.get("Gummy Bears");
				currJoyCount++;
				currCandyMap.set("Gummy Bears", currJoyCount);
			}
			if (data[i].HEALTHY_FRUIT == "JOY") {
				var currJoyCount = currCandyMap.get("Healthy Fruit");
				currJoyCount++;
				currCandyMap.set("Healthy Fruit", currJoyCount);
			}
			if (data[i].HEATH_BAR == "JOY") {
				var currJoyCount = currCandyMap.get("Heath Bar");
				currJoyCount++;
				currCandyMap.set("Heath Bar", currJoyCount);
			}
			if (data[i].HERSHEYS_DARK == "JOY") {
				var currJoyCount = currCandyMap.get("Hersheys Dark");
				currJoyCount++;
				currCandyMap.set("Hersheys Dark", currJoyCount);
			}
			if (data[i].HERSHEYS_MILK == "JOY") {
				var currJoyCount = currCandyMap.get("Hersheys Milk");
				currJoyCount++;
				currCandyMap.set("Hersheys Milk", currJoyCount);
			}
			if (data[i].HERSHEYS_KISSES == "JOY") {
				var currJoyCount = currCandyMap.get("Hersheys Kisses");
				currJoyCount++;
				currCandyMap.set("Hersheys Kisses", currJoyCount);
			}
			if (data[i].JOLLY_RANCHER == "JOY") {
				var currJoyCount = currCandyMap.get("Jolly Rancher");
				currJoyCount++;
				currCandyMap.set("Jolly Rancher", currJoyCount);
			}
			if (data[i].JUNIOR_MINTS == "JOY") {
				var currJoyCount = currCandyMap.get("Junior Mints");
				currJoyCount++;
				currCandyMap.set("Junior Mints", currJoyCount);
			}
			if (data[i].KITKAT == "JOY") {
				var currJoyCount = currCandyMap.get("KitKat");
				currJoyCount++;
				currCandyMap.set("KitKat", currJoyCount);
			}
			if (data[i].LAFFYTAFFY == "JOY") {
				var currJoyCount = currCandyMap.get("Laffy Taffy");
				currJoyCount++;
				currCandyMap.set("Laffy Taffy", currJoyCount);
			}
			if (data[i].LEMONHEADS == "JOY") {
				var currJoyCount = currCandyMap.get("Lemonheads");
				currJoyCount++;
				currCandyMap.set("Lemonheads", currJoyCount);
			}
			if (data[i].LICORICE == "JOY") {
				var currJoyCount = currCandyMap.get("Licorice");
				currJoyCount++;
				currCandyMap.set("Licorice", currJoyCount);
			}
			if (data[i].BLACK_LICORICE == "JOY") {
				var currJoyCount = currCandyMap.get("Black Licorice");
				currJoyCount++;
				currCandyMap.set("Black Licorice", currJoyCount);
			}
			if (data[i].LOLLIPOPS == "JOY") {
				var currJoyCount = currCandyMap.get("Lollipops");
				currJoyCount++;
				currCandyMap.set("Lollipops", currJoyCount);
			}
			if (data[i].MIKE_AND_IKE == "JOY") {
				var currJoyCount = currCandyMap.get("Mike and Ike");
				currJoyCount++;
				currCandyMap.set("Mike and Ike", currJoyCount);
			}
			if (data[i].MILK_DUDS == "JOY") {
				var currJoyCount = currCandyMap.get("Milk Duds");
				currJoyCount++;
				currCandyMap.set("Milk Duds", currJoyCount);
			}
			if (data[i].MILKYWAY == "JOY") {
				var currJoyCount = currCandyMap.get("Milky Way");
				currJoyCount++;
				currCandyMap.set("Milky Way", currJoyCount);
			}
			if (data[i].MNMS == "JOY") {
				var currJoyCount = currCandyMap.get("M&Ms");
				currJoyCount++;
				currCandyMap.set("M&Ms", currJoyCount);
			}
			if (data[i].PEANUT_MNMS == "JOY") {
				var currJoyCount = currCandyMap.get("Peanut M&Ms");
				currJoyCount++;
				currCandyMap.set("Peanut M&Ms", currJoyCount);
			}
			if (data[i].MINT_KISSES == "JOY") {
				var currJoyCount = currCandyMap.get("Mint Kisses");
				currJoyCount++;
				currCandyMap.set("Mint Kisses", currJoyCount);
			}
			if (data[i].MR_GOODBAR == "JOY") {
				var currJoyCount = currCandyMap.get("Mr Goodbar");
				currJoyCount++;
				currCandyMap.set("Mr Goodbar", currJoyCount);
			}
			if (data[i].NERDS == "JOY") {
				var currJoyCount = currCandyMap.get("Nerds");
				currJoyCount++;
				currCandyMap.set("Nerds", currJoyCount);
			}
			if (data[i].NESTLE_CRUNCH == "JOY") {
				var currJoyCount = currCandyMap.get("Nestle Crunch");
				currJoyCount++;
				currCandyMap.set("Nestle Crunch", currJoyCount);
			}
			if (data[i].PEEPS == "JOY") {
				var currJoyCount = currCandyMap.get("Peeps");
				currJoyCount++;
				currCandyMap.set("Peeps", currJoyCount);
			}
			if (data[i].PIXY_STIX == "JOY") {
				var currJoyCount = currCandyMap.get("Pixy Stix");
				currJoyCount++;
				currCandyMap.set("Pixy Stix", currJoyCount);
			}
			if (data[i].REESES_PB_CUPS == "JOY") {
				var currJoyCount = currCandyMap.get("Reeses PB Cups");
				currJoyCount++;
				currCandyMap.set("Reeses PB Cups", currJoyCount);
			}
			if (data[i].REESES_PIECES == "JOY") {
				var currJoyCount = currCandyMap.get("Reeses Pieces");
				currJoyCount++;
				currCandyMap.set("Reeses Pieces", currJoyCount);
			}
			if (data[i].ROLOS == "JOY") {
				var currJoyCount = currCandyMap.get("Rolos");
				currJoyCount++;
				currCandyMap.set("Rolos", currJoyCount);
			}
			if (data[i].SKITTLES == "JOY") {
				var currJoyCount = currCandyMap.get("Skittles");
				currJoyCount++;
				currCandyMap.set("Skittles", currJoyCount);
			}
			if (data[i].SNICKERS == "JOY") {
				var currJoyCount = currCandyMap.get("Snickers");
				currJoyCount++;
				currCandyMap.set("Snickers", currJoyCount);
			}
			if (data[i].SOURPATCH_KIDS == "JOY") {
				var currJoyCount = currCandyMap.get("Sour Patch Kids");
				currJoyCount++;
				currCandyMap.set("Sour Patch Kids", currJoyCount);
			}
			if (data[i].STARBURST == "JOY") {
				var currJoyCount = currCandyMap.get("Starburst");
				currJoyCount++;
				currCandyMap.set("Starburst", currJoyCount);
			}
			if (data[i].SWEDISH_FISH == "JOY") {
				var currJoyCount = currCandyMap.get("Swedish Fish");
				currJoyCount++;
				currCandyMap.set("Swedish Fish", currJoyCount);
			}
			if (data[i].TIC_TACS == "JOY") {
				var currJoyCount = currCandyMap.get("Tic Tacs");
				currJoyCount++;
				currCandyMap.set("Tic Tacs", currJoyCount);
			}
			if (data[i].THREE_MUSKETEERS == "JOY") {
				var currJoyCount = currCandyMap.get("Three Musketeers");
				currJoyCount++;
				currCandyMap.set("Three Musketeers", currJoyCount);
			}
			if (data[i].TOBLERONE == "JOY") {
				var currJoyCount = currCandyMap.get("Toblerone");
				currJoyCount++;
				currCandyMap.set("Toblerone", currJoyCount);
			}
			if (data[i].TRAIL_MIX == "JOY") {
				var currJoyCount = currCandyMap.get("Trail Mix");
				currJoyCount++;
				currCandyMap.set("Trail Mix", currJoyCount);
			}
			if (data[i].TWIX == "JOY") {
				var currJoyCount = currCandyMap.get("Twix");
				currJoyCount++;
				currCandyMap.set("Twix", currJoyCount);
			}
			if (data[i].WHATCHAMACALLIT_BARS == "JOY") {
				var currJoyCount = currCandyMap.get("Whatchamacallit Bars");
				currJoyCount++;
				currCandyMap.set("Whatchamacallit Bars", currJoyCount);
			}
			if (data[i].YORK_PEPPERMINT_PATTIES == "JOY") {
				var currJoyCount = currCandyMap.get("York Peppermint Patties");
				currJoyCount++;
				currCandyMap.set("York Peppermint Patties", currJoyCount);
			}
			candyCalculationmap.set(data[i].AGE, currCandyMap);
		}
	}
}
