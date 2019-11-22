var width = 700;
var height = 60;
var data;
var currentValue = 0;
var targetValue = width;
var maxJoyCount;
var maxMehCount;
var maxDespairCount;

var selected = "Joy"; // start showing joy data first

var joyCandyMap = new Map(); // key: age value: list of most joyous candy preferences
var joyCandyCalculationMap = new Map(); // key: age value: map: (key: candy value: joy count)
var joyAgeAgnosticCandyMap = new Map(); // key: candy value: joy count across all ages

var mehCandyMap = new Map(); // key: age value: list of most meh candy preferences
var mehCandyCalculationMap = new Map(); // key: age value: map: (key: candy value: meh count)
var mehAgeAgnosticCandyMap = new Map(); // key: candy value: meh count across all ages

var despairCandyMap = new Map(); // key: age value: list of most despair candy preferences
var despairCandyCalculationMap = new Map(); // key: age value: map: (key: candy value: despair count)
var despairAgeAgnosticCandyMap = new Map(); // key: candy value: despair count across all ages

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
function updateCandyPreferenceMap(data, map, calculationMap, preference) {
	updateCandyPreferenceCalculationMap(data, calculationMap, preference);

	for (var i = 0; i < data.length; i++) {
		var candyMap = calculationMap.get(data[i].AGE);
		var maxPreferenceCount = -1;
		var candyPreference = [];
		// find max joy count per age
		for (var candy of candies) {
			if (candyMap.get(candy) > maxPreferenceCount) {
				maxPreferenceCount = candyMap.get(candy);
			}
		}
		// get array of all candies that have that max joy count
		for (var candy of candies) {
			if (candyMap.get(candy) == maxPreferenceCount) {
				candyPreference.push(candy);
			}
		}
		// set map k: age, v: array of candy preferences
		map.set(data[i].AGE, candyPreference);
	}
}

function updateAgeAgnosticCandyMap(data, ageAgnosticMap, calculationMap, preference) {
	updateCandyPreferenceCalculationMap(data, calculationMap, preference);
	for (var i = 0; i < data.length; i++) {
		var candyMap = calculationMap.get(data[i].AGE);
		for (var candy of candies) {
			if (ageAgnosticMap.get(candy) == undefined) {
				ageAgnosticMap.set(candy, candyMap.get(candy));
			} else {
				var currPreferenceCount = ageAgnosticMap.get(candy);
				currPreferenceCount += candyMap.get(candy);
				ageAgnosticMap.set(candy, currPreferenceCount);
			}
		}
	}

}

function getMaxPreferenceCount(ageAgnosticMap, preference) {
	var currMaxPreferenceCount = -1
	for (var candy of candies) {
		if (ageAgnosticMap.get(candy) > currMaxPreferenceCount) {
			currMaxPreferenceCount = ageAgnosticMap.get(candy);
		}
	}
	if (preference == "JOY") {
		maxJoyCount = currMaxPreferenceCount
	} else if (preference == "MEH") {
		maxMehCount = currMaxPreferenceCount;
	} else {
		maxDespairCount = currMaxPreferenceCount;
	}
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

	// update the joy map with k -> age and v -> array of candy preferences
	updateCandyPreferenceMap(data, joyCandyMap, joyCandyCalculationMap, "JOY");
	updateAgeAgnosticCandyMap(data, joyAgeAgnosticCandyMap, joyCandyCalculationMap, "JOY");
	getMaxPreferenceCount(joyAgeAgnosticCandyMap, "JOY");

	// update the meh map with k -> age and v -> array of candy preferences
	updateCandyPreferenceMap(data, mehCandyMap, mehCandyCalculationMap, "MEH");
	updateAgeAgnosticCandyMap(data, mehAgeAgnosticCandyMap, mehCandyCalculationMap, "MEH");
	getMaxPreferenceCount(mehAgeAgnosticCandyMap, "MEH");

	// update the despair map with k -> age and v -> array of candy preferences
	updateCandyPreferenceMap(data, despairCandyMap, despairCandyCalculationMap, "DESPAIR");
	updateAgeAgnosticCandyMap(data, despairAgeAgnosticCandyMap, despairCandyCalculationMap, "DESPAIR");
	getMaxPreferenceCount(despairAgeAgnosticCandyMap, "DESPAIR");

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
		.attr("width", width + 700)
		.attr("height", height / 3 + 105);

	// create p to hold both play button and dropdown select
	var belowGraph = d3.select("#main")
		.append("p")
		.attr("class", "button-container")
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
		.attr("id", "selectDropdown")
		.attr("class", "dropdown")
		.selectAll("option")
		.data(["Joy", "Meh", "Despair"])
		.enter().append("option")
		.text(function (d) { return d; })
		.attr("value", function (d) {
			return d;
		});
	console.log(d3.select("#selectDropdown").node().value)

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
	var joyColors = ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"];
	var mehColors = ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"];
	var despairColors = ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"];

	// add bars in an overview: this means 
	// before you hit play we the joy count for all candies across all ages
	for (var i = 0; i < candies.length; i++) {
		bars.append("g")
			.append("rect")
			.attr("id", "bar" + i)
			.style("fill", function () {
				return joyColors[Math.trunc(joyAgeAgnosticCandyMap.get(candies[i]) / 10000 / 2)];
			})
			.attr("x", function () {
				return 63 + barX(candies[i]);
			})
			.attr("width", ((width + 600) / (candies.length)) - 6)
			.attr("y", function () { return barY(joyAgeAgnosticCandyMap.get(candies[i])); })
			.attr("height", function () {
				return (height * 8) - barY(joyAgeAgnosticCandyMap.get(candies[i]));
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
		.attr("width", "100px")
		.attr("transform", "translate(833," + (15) + ")")
		.attr("class", "candiesDetail")
	var candiesDetail1 = slider
		.append("text")
		.text("")
		.attr("transform", "translate(833," + (30) + ")")
		.attr("class", "candiesDetail")
	var candiesDetail2 = slider
		.append("text")
		.text("")
		.attr("transform", "translate(833," + (45) + ")")
		.attr("class", "candiesDetail")
	var candiesDetail3 = slider
		.append("text")
		.text("")
		.attr("transform", "translate(833," + (60) + ")")
		.attr("class", "candiesDetail")


	function update(age) {
		// update position and of handle according to slider scale
		handle.attr("cx", x(age));
		var map;
		var calculationMap;
		var colors;
		var candyText;
		var preference = d3.select("#selectDropdown").node().value;

		if (preference == "Joy") {
			map = joyCandyMap;
			calculationMap = joyCandyCalculationMap;
			colors = joyColors;
			candyText = "Favorite Candies: "
		} else if (preference == "Meh") {
			map = mehCandyMap;
			calculationMap = mehCandyCalculationMap;
			colors = mehColors;
			candyText = "Meh-est Candies: "
		} else {
			map = despairCandyMap;
			calculationMap = despairCandyCalculationMap;
			colors = despairColors;
			candyText = "Least Favorite Candies: "
		}

		// update detail on demand values for age and favorite candies
		ageDetail.text("Age: " + Math.round(age))
		updateCandyDetailX(age);
		var candyArr = map.get(Math.round(age));
		updateCandyText(candyArr, candyText);

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
						var maxValue = calculationMap.get(Math.round(age)).get(topCandy);
						var spread = maxValue / 5;
						if (calculationMap.get(Math.round(age)).get(candies[i]) < spread) {
							return colors[0];
						} else if (calculationMap.get(Math.round(age)).get(candies[i]) < spread * 2) {
							return colors[1];
						} else if (calculationMap.get(Math.round(age)).get(candies[i]) < spread * 3) {
							return colors[2];
						} else if (calculationMap.get(Math.round(age)).get(candies[i]) < maxValue) {
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
					if (calculationMap.get(Math.round(age)) == undefined) {
						return 480;
					} else {
						return barY(calculationMap.get(Math.round(age)).get(candies[i]));
					}
				})
				.attr("height", function () {
					if (calculationMap.get(Math.round(age)) == undefined) {
						return 0;
					} else {
						return (height * 8) - barY(calculationMap.get(Math.round(age)).get(candies[i]));
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

	function updateCandyText(arr, candyText) {
		if (arr == undefined) {
			candiesDetail.text(candyText);
			candiesDetail1.text("");
			candiesDetail2.text("");
			candiesDetail3.text("");
		} else {
			var arrSlices = arr.length / 4;
			if (arrSlices < 1) {
				candiesDetail.text(candyText
					+ formatCandyPreferenceArray(arr));
				candiesDetail1.text("");
				candiesDetail2.text("");
				candiesDetail3.text("");

			} else if (arrSlices < 2) {
				candiesDetail.text(candyText
					+ formatCandyPreferenceArray(arr.slice(0, 4)));
				candiesDetail1.text(formatCandyPreferenceArray(arr.slice(4, arr.length)));
				candiesDetail2.text("");
				candiesDetail3.text("");

			} else if (arrSlices < 3) {
				candiesDetail.text(candyText
					+ formatCandyPreferenceArray(arr.slice(0, 4)));
				candiesDetail1.text(formatCandyPreferenceArray(arr.slice(4, 8)));
				candiesDetail2.text(formatCandyPreferenceArray(arr.slice(8, arr.length)));
				candiesDetail3.text("");

			} else {
				var endSliceIndex = arr.length;
				if (arr.length > 16) {
					endSliceIndex = 16;
				}
				candiesDetail.text(candyText
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
				return "translate(824," + (15) + ")";
			} else {
				return "translate(833," + (15) + ")";
			}
		})
		candiesDetail1.attr("transform", function () {
			if (Math.round(age) > 9) {
				return "translate(824," + (30) + ")";
			} else {
				return "translate(833," + (30) + ")";
			}
		})
		candiesDetail2.attr("transform", function () {
			if (Math.round(age) > 9) {
				return "translate(824," + (45) + ")";
			} else {
				return "translate(833," + (45) + ")";
			}
		})
		candiesDetail3.attr("transform", function () {
			if (Math.round(age) > 9) {
				return "translate(824," + (60) + ")";
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
function updateCandyPreferenceCalculationMap(data, map, preference) {
	for (var i = 0; i < data.length; i++) {
		if (map.get(data[i].AGE) == undefined) {
			// create a new map that holds the candy and the joy count
			var currCandyMap = new Map();

			if (data[i].FULL_SIZED_CANDY_BAR == preference) {
				// set joy count to 1
				currCandyMap.set("Full Sized Candy Bar", 1);
			} else {
				// set joy count to 0 just to initialize this k-v pair
				currCandyMap.set("Full Sized Candy Bar", 0);
			}
			if (data[i].BUTTERFINGER == preference) {
				currCandyMap.set("Butterfinger", 1);
			} else {
				currCandyMap.set("Butterfinger", 0);
			}
			if (data[i].CANDY_CORN == preference) {
				currCandyMap.set("Candy Corn", 1);
			} else {
				currCandyMap.set("Candy Corn", 0);
			}
			if (data[i].CHICLETS == preference) {
				currCandyMap.set("Chiclets", 1);
			} else {
				currCandyMap.set("Chiclets", 0);
			}
			if (data[i].DOTS == preference) {
				currCandyMap.set("Dots", 1);
			} else {
				currCandyMap.set("Dots", 0);
			}
			if (data[i].FUZZY_PEACHES == preference) {
				currCandyMap.set("Fuzzy Peaches", 1);
			} else {
				currCandyMap.set("Fuzzy Peaches", 0);
			}
			if (data[i].GOOD_N_PLENTY == preference) {
				currCandyMap.set("Good N Plenty", 1);
			} else {
				currCandyMap.set("Good N Plenty", 0);
			}
			if (data[i].GUMMY_BEARS == preference) {
				currCandyMap.set("Gummy Bears", 1);
			} else {
				currCandyMap.set("Gummy Bears", 0);
			}
			if (data[i].HEALTHY_FRUIT == preference) {
				currCandyMap.set("Healthy Fruit", 1);
			} else {
				currCandyMap.set("Healthy Fruit", 0);
			}
			if (data[i].HEATH_BAR == preference) {
				currCandyMap.set("Heath Bar", 1);
			} else {
				currCandyMap.set("Heath Bar", 0);
			}
			if (data[i].HERSHEYS_DARK == preference) {
				currCandyMap.set("Hersheys Dark", 1);
			} else {
				currCandyMap.set("Hersheys Dark", 0);
			}
			if (data[i].HERSHEYS_MILK == preference) {
				currCandyMap.set("Hersheys Milk", 1);
			} else {
				currCandyMap.set("Hersheys Milk", 0);
			}
			if (data[i].HERSHEYS_KISSES == preference) {
				currCandyMap.set("Hersheys Kisses", 1);
			} else {
				currCandyMap.set("Hersheys Kisses", 0);
			}
			if (data[i].JOLLY_RANCHER == preference) {
				currCandyMap.set("Jolly Rancher", 1);
			} else {
				currCandyMap.set("Jolly Rancher", 0);
			}
			if (data[i].JUNIOR_MINTS == preference) {
				currCandyMap.set("Junior Mints", 1);
			} else {
				currCandyMap.set("Junior Mints", 0);
			}
			if (data[i].KITKAT == preference) {
				currCandyMap.set("KitKat", 1);
			} else {
				currCandyMap.set("KitKat", 0);
			}
			if (data[i].LAFFYTAFFY == preference) {
				currCandyMap.set("Laffy Taffy", 1);
			} else {
				currCandyMap.set("Laffy Taffy", 0);
			}
			if (data[i].LEMONHEADS == preference) {
				currCandyMap.set("Lemonheads", 1);
			} else {
				currCandyMap.set("Lemonheads", 0);
			}
			if (data[i].LICORICE == preference) {
				currCandyMap.set("Licorice", 1);
			} else {
				currCandyMap.set("Licorice", 0);
			}
			if (data[i].BLACK_LICORICE == preference) {
				currCandyMap.set("Black Licorice", 1);
			} else {
				currCandyMap.set("Black Licorice", 0);
			}
			if (data[i].LOLLIPOPS == preference) {
				currCandyMap.set("Lollipops", 1);
			} else {
				currCandyMap.set("Lollipops", 0);
			}
			if (data[i].MIKE_AND_IKE == preference) {
				currCandyMap.set("Mike and Ike", 1);
			} else {
				currCandyMap.set("Mike and Ike", 0);
			}
			if (data[i].MILK_DUDS == preference) {
				currCandyMap.set("Milk Duds", 1);
			} else {
				currCandyMap.set("Milk Duds", 0);
			}
			if (data[i].MILKYWAY == preference) {
				currCandyMap.set("Milky Way", 1);
			} else {
				currCandyMap.set("Milky Way", 0);
			}
			if (data[i].MNMS == preference) {
				currCandyMap.set("M&Ms", 1);
			} else {
				currCandyMap.set("M&Ms", 0);
			}
			if (data[i].PEANUT_MNMS == preference) {
				currCandyMap.set("Peanut M&Ms", 1);
			} else {
				currCandyMap.set("Peanut M&Ms", 0);
			}
			if (data[i].MINT_KISSES == preference) {
				currCandyMap.set("Mint Kisses", 1);
			} else {
				currCandyMap.set("Mint Kisses", 0);
			}
			if (data[i].MR_GOODBAR == preference) {
				currCandyMap.set("Mr Goodbar", 1);
			} else {
				currCandyMap.set("Mr Goodbar", 0);
			}
			if (data[i].NERDS == preference) {
				currCandyMap.set("Nerds", 1);
			} else {
				currCandyMap.set("Nerds", 0);
			}
			if (data[i].NESTLE_CRUNCH == preference) {
				currCandyMap.set("Nestle Crunch", 1);
			} else {
				currCandyMap.set("Nestle Crunch", 0);
			}
			if (data[i].PEEPS == preference) {
				currCandyMap.set("Peeps", 1);
			} else {
				currCandyMap.set("Peeps", 0);
			}
			if (data[i].PIXY_STIX == preference) {
				currCandyMap.set("Pixy Stix", 1);
			} else {
				currCandyMap.set("Pixy Stix", 0);
			}
			if (data[i].REESES_PB_CUPS == preference) {
				currCandyMap.set("Reeses PB Cups", 1);
			} else {
				currCandyMap.set("Reeses PB Cups", 0);
			}
			if (data[i].REESES_PIECES == preference) {
				currCandyMap.set("Reeses Pieces", 1);
			} else {
				currCandyMap.set("Reeses Pieces", 0);
			}
			if (data[i].ROLOS == preference) {
				currCandyMap.set("Rolos", 1);
			} else {
				currCandyMap.set("Rolos", 0);
			}
			if (data[i].SKITTLES == preference) {
				currCandyMap.set("Skittles", 1);
			} else {
				currCandyMap.set("Skittles", 0);
			}
			if (data[i].SNICKERS == preference) {
				currCandyMap.set("Snickers", 1);
			} else {
				currCandyMap.set("Snickers", 0);
			}
			if (data[i].SOURPATCH_KIDS == preference) {
				currCandyMap.set("Sour Patch Kids", 1);
			} else {
				currCandyMap.set("Sour Patch Kids", 0);
			}
			if (data[i].STARBURST == preference) {
				currCandyMap.set("Starburst", 1);
			} else {
				currCandyMap.set("Starburst", 0);
			}
			if (data[i].SWEDISH_FISH == preference) {
				currCandyMap.set("Swedish Fish", 1);
			} else {
				currCandyMap.set("Swedish Fish", 0);
			}
			if (data[i].TIC_TACS == preference) {
				currCandyMap.set("Tic Tacs", 1);
			} else {
				currCandyMap.set("Tic Tacs", 0);
			}
			if (data[i].THREE_MUSKETEERS == preference) {
				currCandyMap.set("Three Musketeers", 1);
			} else {
				currCandyMap.set("Three Musketeers", 0);
			}
			if (data[i].TOBLERONE == preference) {
				currCandyMap.set("Toblerone", 1);
			} else {
				currCandyMap.set("Toblerone", 0);
			}
			if (data[i].TRAIL_MIX == preference) {
				currCandyMap.set("Trail Mix", 1);
			} else {
				currCandyMap.set("Trail Mix", 0);
			}
			if (data[i].TWIX == preference) {
				currCandyMap.set("Twix", 1);
			} else {
				currCandyMap.set("Twix", 0);
			}
			if (data[i].WHATCHAMACALLIT_BARS == preference) {
				currCandyMap.set("Whatchamacallit Bars", 1);
			} else {
				currCandyMap.set("Whatchamacallit Bars", 0);
			}
			if (data[i].YORK_PEPPERMINT_PATTIES == preference) {
				currCandyMap.set("York Peppermint Patties", 1);
			} else {
				currCandyMap.set("York Peppermint Patties", 0);
			}

			// update candy calculation map to now have age and new currCandyMap
			map.set(data[i].AGE, currCandyMap);
		} else {
			var currCandyMap = map.get(data[i].AGE);
			if (data[i].FULL_SIZED_CANDY_BAR == preference) {
				// get the current joy count
				var currPrefCount = currCandyMap.get("Full Sized Candy Bar");
				// increment it
				currPrefCount++;
				// update the candy joy count;
				currCandyMap.set("Full Sized Candy Bar", currPrefCount);
			}

			if (data[i].BUTTERFINGER == preference) {
				var currPrefCount = currCandyMap.get("Butterfinger");
				currPrefCount++;
				currCandyMap.set("Butterfinger", currPrefCount);
			}
			if (data[i].CANDY_CORN == preference) {
				var currPrefCount = currCandyMap.get("Candy Corn");
				currPrefCount++;
				currCandyMap.set("Candy Corn", currPrefCount);
			}
			if (data[i].CHICLETS == preference) {
				var currPrefCount = currCandyMap.get("Chiclets");
				currPrefCount++;
				currCandyMap.set("Chiclets", currPrefCount);
			}
			if (data[i].DOTS == preference) {
				var currPrefCount = currCandyMap.get("Dots");
				currPrefCount++;
				currCandyMap.set("Dots", currPrefCount);
			}
			if (data[i].FUZZY_PEACHES == preference) {
				var currPrefCount = currCandyMap.get("Fuzzy Peaches");
				currPrefCount++;
				currCandyMap.set("Fuzzy Peaches", currPrefCount);
			}
			if (data[i].GOOD_N_PLENTY == preference) {
				var currPrefCount = currCandyMap.get("Good N Plenty");
				currPrefCount++;
				currCandyMap.set("Good N Plenty", currPrefCount);
			}
			if (data[i].GUMMY_BEARS == preference) {
				var currPrefCount = currCandyMap.get("Gummy Bears");
				currPrefCount++;
				currCandyMap.set("Gummy Bears", currPrefCount);
			}
			if (data[i].HEALTHY_FRUIT == preference) {
				var currPrefCount = currCandyMap.get("Healthy Fruit");
				currPrefCount++;
				currCandyMap.set("Healthy Fruit", currPrefCount);
			}
			if (data[i].HEATH_BAR == preference) {
				var currPrefCount = currCandyMap.get("Heath Bar");
				currPrefCount++;
				currCandyMap.set("Heath Bar", currPrefCount);
			}
			if (data[i].HERSHEYS_DARK == preference) {
				var currPrefCount = currCandyMap.get("Hersheys Dark");
				currPrefCount++;
				currCandyMap.set("Hersheys Dark", currPrefCount);
			}
			if (data[i].HERSHEYS_MILK == preference) {
				var currPrefCount = currCandyMap.get("Hersheys Milk");
				currPrefCount++;
				currCandyMap.set("Hersheys Milk", currPrefCount);
			}
			if (data[i].HERSHEYS_KISSES == preference) {
				var currPrefCount = currCandyMap.get("Hersheys Kisses");
				currPrefCount++;
				currCandyMap.set("Hersheys Kisses", currPrefCount);
			}
			if (data[i].JOLLY_RANCHER == preference) {
				var currPrefCount = currCandyMap.get("Jolly Rancher");
				currPrefCount++;
				currCandyMap.set("Jolly Rancher", currPrefCount);
			}
			if (data[i].JUNIOR_MINTS == preference) {
				var currPrefCount = currCandyMap.get("Junior Mints");
				currPrefCount++;
				currCandyMap.set("Junior Mints", currPrefCount);
			}
			if (data[i].KITKAT == preference) {
				var currPrefCount = currCandyMap.get("KitKat");
				currPrefCount++;
				currCandyMap.set("KitKat", currPrefCount);
			}
			if (data[i].LAFFYTAFFY == preference) {
				var currPrefCount = currCandyMap.get("Laffy Taffy");
				currPrefCount++;
				currCandyMap.set("Laffy Taffy", currPrefCount);
			}
			if (data[i].LEMONHEADS == preference) {
				var currPrefCount = currCandyMap.get("Lemonheads");
				currPrefCount++;
				currCandyMap.set("Lemonheads", currPrefCount);
			}
			if (data[i].LICORICE == preference) {
				var currPrefCount = currCandyMap.get("Licorice");
				currPrefCount++;
				currCandyMap.set("Licorice", currPrefCount);
			}
			if (data[i].BLACK_LICORICE == preference) {
				var currPrefCount = currCandyMap.get("Black Licorice");
				currPrefCount++;
				currCandyMap.set("Black Licorice", currPrefCount);
			}
			if (data[i].LOLLIPOPS == preference) {
				var currPrefCount = currCandyMap.get("Lollipops");
				currPrefCount++;
				currCandyMap.set("Lollipops", currPrefCount);
			}
			if (data[i].MIKE_AND_IKE == preference) {
				var currPrefCount = currCandyMap.get("Mike and Ike");
				currPrefCount++;
				currCandyMap.set("Mike and Ike", currPrefCount);
			}
			if (data[i].MILK_DUDS == preference) {
				var currPrefCount = currCandyMap.get("Milk Duds");
				currPrefCount++;
				currCandyMap.set("Milk Duds", currPrefCount);
			}
			if (data[i].MILKYWAY == preference) {
				var currPrefCount = currCandyMap.get("Milky Way");
				currPrefCount++;
				currCandyMap.set("Milky Way", currPrefCount);
			}
			if (data[i].MNMS == preference) {
				var currPrefCount = currCandyMap.get("M&Ms");
				currPrefCount++;
				currCandyMap.set("M&Ms", currPrefCount);
			}
			if (data[i].PEANUT_MNMS == preference) {
				var currPrefCount = currCandyMap.get("Peanut M&Ms");
				currPrefCount++;
				currCandyMap.set("Peanut M&Ms", currPrefCount);
			}
			if (data[i].MINT_KISSES == preference) {
				var currPrefCount = currCandyMap.get("Mint Kisses");
				currPrefCount++;
				currCandyMap.set("Mint Kisses", currPrefCount);
			}
			if (data[i].MR_GOODBAR == preference) {
				var currPrefCount = currCandyMap.get("Mr Goodbar");
				currPrefCount++;
				currCandyMap.set("Mr Goodbar", currPrefCount);
			}
			if (data[i].NERDS == preference) {
				var currPrefCount = currCandyMap.get("Nerds");
				currPrefCount++;
				currCandyMap.set("Nerds", currPrefCount);
			}
			if (data[i].NESTLE_CRUNCH == preference) {
				var currPrefCount = currCandyMap.get("Nestle Crunch");
				currPrefCount++;
				currCandyMap.set("Nestle Crunch", currPrefCount);
			}
			if (data[i].PEEPS == preference) {
				var currPrefCount = currCandyMap.get("Peeps");
				currPrefCount++;
				currCandyMap.set("Peeps", currPrefCount);
			}
			if (data[i].PIXY_STIX == preference) {
				var currPrefCount = currCandyMap.get("Pixy Stix");
				currPrefCount++;
				currCandyMap.set("Pixy Stix", currPrefCount);
			}
			if (data[i].REESES_PB_CUPS == preference) {
				var currPrefCount = currCandyMap.get("Reeses PB Cups");
				currPrefCount++;
				currCandyMap.set("Reeses PB Cups", currPrefCount);
			}
			if (data[i].REESES_PIECES == preference) {
				var currPrefCount = currCandyMap.get("Reeses Pieces");
				currPrefCount++;
				currCandyMap.set("Reeses Pieces", currPrefCount);
			}
			if (data[i].ROLOS == preference) {
				var currPrefCount = currCandyMap.get("Rolos");
				currPrefCount++;
				currCandyMap.set("Rolos", currPrefCount);
			}
			if (data[i].SKITTLES == preference) {
				var currPrefCount = currCandyMap.get("Skittles");
				currPrefCount++;
				currCandyMap.set("Skittles", currPrefCount);
			}
			if (data[i].SNICKERS == preference) {
				var currPrefCount = currCandyMap.get("Snickers");
				currPrefCount++;
				currCandyMap.set("Snickers", currPrefCount);
			}
			if (data[i].SOURPATCH_KIDS == preference) {
				var currPrefCount = currCandyMap.get("Sour Patch Kids");
				currPrefCount++;
				currCandyMap.set("Sour Patch Kids", currPrefCount);
			}
			if (data[i].STARBURST == preference) {
				var currPrefCount = currCandyMap.get("Starburst");
				currPrefCount++;
				currCandyMap.set("Starburst", currPrefCount);
			}
			if (data[i].SWEDISH_FISH == preference) {
				var currPrefCount = currCandyMap.get("Swedish Fish");
				currPrefCount++;
				currCandyMap.set("Swedish Fish", currPrefCount);
			}
			if (data[i].TIC_TACS == preference) {
				var currPrefCount = currCandyMap.get("Tic Tacs");
				currPrefCount++;
				currCandyMap.set("Tic Tacs", currPrefCount);
			}
			if (data[i].THREE_MUSKETEERS == preference) {
				var currPrefCount = currCandyMap.get("Three Musketeers");
				currPrefCount++;
				currCandyMap.set("Three Musketeers", currPrefCount);
			}
			if (data[i].TOBLERONE == preference) {
				var currPrefCount = currCandyMap.get("Toblerone");
				currPrefCount++;
				currCandyMap.set("Toblerone", currPrefCount);
			}
			if (data[i].TRAIL_MIX == preference) {
				var currPrefCount = currCandyMap.get("Trail Mix");
				currPrefCount++;
				currCandyMap.set("Trail Mix", currPrefCount);
			}
			if (data[i].TWIX == preference) {
				var currPrefCount = currCandyMap.get("Twix");
				currPrefCount++;
				currCandyMap.set("Twix", currPrefCount);
			}
			if (data[i].WHATCHAMACALLIT_BARS == preference) {
				var currPrefCount = currCandyMap.get("Whatchamacallit Bars");
				currPrefCount++;
				currCandyMap.set("Whatchamacallit Bars", currPrefCount);
			}
			if (data[i].YORK_PEPPERMINT_PATTIES == preference) {
				var currPrefCount = currCandyMap.get("York Peppermint Patties");
				currPrefCount++;
				currCandyMap.set("York Peppermint Patties", currPrefCount);
			}
			map.set(data[i].AGE, currCandyMap);
		}
	}
}


