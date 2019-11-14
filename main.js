var width = 700;
var height = 60;
var data;
var currentValue = 0;
var targetValue = width;

var candyPreferenceMap = new Map();
var candyCalculationmap = new Map();


var candies = [
	"FULL_SIZED_CANDY_BAR",
	"BUTTERFINGER",
	"CANDY_CORN",
	"CHICLETS",
	"DOTS",
	"FUZZY_PEACHES",
	"GOOD_N_PLENTY",
	"GUMMY_BEARS",
	"HEALTHY_FRUIT",
	"HEATH_BAR",
	"HERSHEYS_DARK",
	"HERSHEYS_MILK",
	"HERSHEYS_KISSES",
	"JOLLY_RANCHER",
	"JUNIOR_MINTS",
	"KITKAT",
	"LAFFYTAFFY",
	"LEMONHEADS",
	"LICORICE",
	"BLACK_LICORICE",
	"LOLLIPOPS",
	"MIKE_AND_IKE",
	"MILK_DUDS",
	"MILKYWAY",
	"MNMS",
	"PEANUT_MNMS",
	"MINT_KISSES",
	"MR_GOODBAR",
	"NERDS",
	"NESTLE_CRUNCH",
	"PEEPS",
	"PIXY_STIX",
	"REESES_PB_CUPS",
	"REESES_PIECES",
	"ROLOS",
	"SKITTLES",
	"SNICKERS",
	"SOURPATCH_KIDS",
	"STARBURST",
	"SWEDISH_FISH",
	"TIC_TACS",
	"THREE_MUSKETEERS",
	"TOBLERONE",
	"TRAIL_MIX",
	"TWIX",
	"WHATCHAMACALLIT_BARS",
	"YORK_PEPPERMINT_PATTIES"
]

/*
	
to get the data the way I want, meaning we determine the candy preference for each age,
we need the following data structures
	
first, we need a map with key: age, and value: array of top candy preferences (i.e. NERDS, MNMS, etc.)
but, to determine the candy preference, we need the following structure
	
a map that with key: age and value: another map (key: candy value: #JOY responses)
from this, we get the value and find the candy with the most joy reponses
	
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
	str = str.replace(/_/g, " ");
	str = str.toLowerCase();
	str = str[0].toUpperCase() + str.slice(1);
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
		return +d.AGE > 0;
	});

	// update the map with k -> age and v -> array of candy preferences
	updateCandyPreferenceMap(data);

	var minAge = d3.min(data, function (d) { return +d.AGE; });
	var maxAge = d3.max(data, function (d) { return +d.AGE; });
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
				update(Math.round(x.invert(currentValue)));
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
		.text(function (d) { return 0; })
		.attr("transform", "translate(0," + (-25) + ")")

	function update(age) {
		console.log(candyPreferenceMap.get(Math.round(age)));

		// update position and text of label according to slider scale
		handle.attr("cx", x(age));
		label
			.attr("x", x(age))
			.text(formatCandyPreferenceArray(candyPreferenceMap.get(Math.round(age))));
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
				currCandyMap.set("FULL_SIZED_CANDY_BAR", 1);
			} else {
				// set joy count to 0 just to initialize this k-v pair
				currCandyMap.set("FULL_SIZED_CANDY_BAR", 0);
			}
			if (data[i].BUTTERFINGER == "JOY") {
				currCandyMap.set("BUTTERFINGER", 1);
			} else {
				currCandyMap.set("BUTTERFINGER", 0);
			}
			if (data[i].CANDY_CORN == "JOY") {
				currCandyMap.set("CANDY_CORN", 1);
			} else {
				currCandyMap.set("CANDY_CORN", 0);
			}
			if (data[i].CHICLETS == "JOY") {
				currCandyMap.set("CHICLETS", 1);
			} else {
				currCandyMap.set("CHICLETS", 0);
			}
			if (data[i].DOTS == "JOY") {
				currCandyMap.set("DOTS", 1);
			} else {
				currCandyMap.set("DOTS", 0);
			}
			if (data[i].FUZZY_PEACHES == "JOY") {
				currCandyMap.set("FUZZY_PEACHES", 1);
			} else {
				currCandyMap.set("FUZZY_PEACHES", 0);
			}
			if (data[i].GOOD_N_PLENTY == "JOY") {
				currCandyMap.set("GOOD_N_PLENTY", 1);
			} else {
				currCandyMap.set("GOOD_N_PLENTY", 0);
			}
			if (data[i].GUMMY_BEARS == "JOY") {
				currCandyMap.set("GUMMY_BEARS", 1);
			} else {
				currCandyMap.set("GUMMY_BEARS", 0);
			}
			if (data[i].HEALTHY_FRUIT == "JOY") {
				currCandyMap.set("HEALTHY_FRUIT", 1);
			} else {
				currCandyMap.set("HEALTHY_FRUIT", 0);
			}
			if (data[i].HEATH_BAR == "JOY") {
				currCandyMap.set("HEATH_BAR", 1);
			} else {
				currCandyMap.set("HEATH_BAR", 0);
			}
			if (data[i].HERSHEYS_DARK == "JOY") {
				currCandyMap.set("HERSHEYS_DARK", 1);
			} else {
				currCandyMap.set("HERSHEYS_DARK", 0);
			}
			if (data[i].HERSHEYS_MILK == "JOY") {
				currCandyMap.set("HERSHEYS_MILK", 1);
			} else {
				currCandyMap.set("HERSHEYS_MILK", 0);
			}
			if (data[i].HERSHEYS_KISSES == "JOY") {
				currCandyMap.set("HERSHEYS_KISSES", 1);
			} else {
				currCandyMap.set("HERSHEYS_KISSES", 0);
			}
			if (data[i].JOLLY_RANCHER == "JOY") {
				currCandyMap.set("JOLLY_RANCHER", 1);
			} else {
				currCandyMap.set("JOLLY_RANCHER", 0);
			}
			if (data[i].JUNIOR_MINTS == "JOY") {
				currCandyMap.set("JUNIOR_MINTS", 1);
			} else {
				currCandyMap.set("JUNIOR_MINTS", 0);
			}
			if (data[i].KITKAT == "JOY") {
				currCandyMap.set("KITKAT", 1);
			} else {
				currCandyMap.set("KITKAT", 0);
			}
			if (data[i].LAFFYTAFFY == "JOY") {
				currCandyMap.set("LAFFYTAFFY", 1);
			} else {
				currCandyMap.set("LAFFYTAFFY", 0);
			}
			if (data[i].LEMONHEADS == "JOY") {
				currCandyMap.set("LEMONHEADS", 1);
			} else {
				currCandyMap.set("LEMONHEADS", 0);
			}
			if (data[i].LICORICE == "JOY") {
				currCandyMap.set("LICORICE", 1);
			} else {
				currCandyMap.set("LICORICE", 0);
			}
			if (data[i].BLACK_LICORICE == "JOY") {
				currCandyMap.set("BLACK_LICORICE", 1);
			} else {
				currCandyMap.set("BLACK_LICORICE", 0);
			}
			if (data[i].LOLLIPOPS == "JOY") {
				currCandyMap.set("LOLLIPOPS", 1);
			} else {
				currCandyMap.set("LOLLIPOPS", 0);
			}
			if (data[i].MIKE_AND_IKE == "JOY") {
				currCandyMap.set("MIKE_AND_IKE", 1);
			} else {
				currCandyMap.set("MIKE_AND_IKE", 0);
			}
			if (data[i].MILK_DUDS == "JOY") {
				currCandyMap.set("MILK_DUDS", 1);
			} else {
				currCandyMap.set("MILK_DUDS", 0);
			}
			if (data[i].MILKYWAY == "JOY") {
				currCandyMap.set("MILKYWAY", 1);
			} else {
				currCandyMap.set("MILKYWAY", 0);
			}
			if (data[i].MNMS == "JOY") {
				currCandyMap.set("MNMS", 1);
			} else {
				currCandyMap.set("MNMS", 0);
			}
			if (data[i].PEANUT_MNMS == "JOY") {
				currCandyMap.set("PEANUT_MNMS", 1);
			} else {
				currCandyMap.set("PEANUT_MNMS", 0);
			}
			if (data[i].MINT_KISSES == "JOY") {
				currCandyMap.set("MINT_KISSES", 1);
			} else {
				currCandyMap.set("MINT_KISSES", 0);
			}
			if (data[i].MR_GOODBAR == "JOY") {
				currCandyMap.set("MR_GOODBAR", 1);
			} else {
				currCandyMap.set("MR_GOODBAR", 0);
			}
			if (data[i].NERDS == "JOY") {
				currCandyMap.set("NERDS", 1);
			} else {
				currCandyMap.set("NERDS", 0);
			}
			if (data[i].NESTLE_CRUNCH == "JOY") {
				currCandyMap.set("NESTLE_CRUNCH", 1);
			} else {
				currCandyMap.set("NESTLE_CRUNCH", 0);
			}
			if (data[i].PEEPS == "JOY") {
				currCandyMap.set("PEEPS", 1);
			} else {
				currCandyMap.set("PEEPS", 0);
			}
			if (data[i].PIXY_STIX == "JOY") {
				currCandyMap.set("PIXY_STIX", 1);
			} else {
				currCandyMap.set("PIXY_STIX", 0);
			}
			if (data[i].REESES_PB_CUPS == "JOY") {
				currCandyMap.set("REESES_PB_CUPS", 1);
			} else {
				currCandyMap.set("REESES_PB_CUPS", 0);
			}
			if (data[i].REESES_PIECES == "JOY") {
				currCandyMap.set("REESES_PIECES", 1);
			} else {
				currCandyMap.set("REESES_PIECES", 0);
			}
			if (data[i].ROLOS == "JOY") {
				currCandyMap.set("ROLOS", 1);
			} else {
				currCandyMap.set("ROLOS", 0);
			}
			if (data[i].SKITTLES == "JOY") {
				currCandyMap.set("SKITTLES", 1);
			} else {
				currCandyMap.set("SKITTLES", 0);
			}
			if (data[i].SNICKERS == "JOY") {
				currCandyMap.set("SNICKERS", 1);
			} else {
				currCandyMap.set("SNICKERS", 0);
			}
			if (data[i].SOURPATCH_KIDS == "JOY") {
				currCandyMap.set("SOURPATCH_KIDS", 1);
			} else {
				currCandyMap.set("SOURPATCH_KIDS", 0);
			}
			if (data[i].SWEDISH_FISH == "JOY") {
				currCandyMap.set("SWEDISH_FISH", 1);
			} else {
				currCandyMap.set("SWEDISH_FISH", 0);
			}
			if (data[i].TIC_TACS == "JOY") {
				currCandyMap.set("TIC_TACS", 1);
			} else {
				currCandyMap.set("TIC_TACS", 0);
			}
			if (data[i].THREE_MUSKETEERS == "JOY") {
				currCandyMap.set("THREE_MUSKETEERS", 1);
			} else {
				currCandyMap.set("THREE_MUSKETEERS", 0);
			}
			if (data[i].TOBLERONE == "JOY") {
				currCandyMap.set("TOBLERONE", 1);
			} else {
				currCandyMap.set("TOBLERONE", 0);
			}
			if (data[i].TRAIL_MIX == "JOY") {
				currCandyMap.set("TRAIL_MIX", 1);
			} else {
				currCandyMap.set("TRAIL_MIX", 0);
			}
			if (data[i].TWIX == "JOY") {
				currCandyMap.set("TWIX", 1);
			} else {
				currCandyMap.set("TWIX", 0);
			}
			if (data[i].WHATCHAMACALLIT_BARS == "JOY") {
				currCandyMap.set("WHATCHAMACALLIT_BARS", 1);
			} else {
				currCandyMap.set("WHATCHAMACALLIT_BARS", 0);
			}
			if (data[i].YORK_PEPPERMINT_PATTIES == "JOY") {
				currCandyMap.set("YORK_PEPPERMINT_PATTIES", 1);
			} else {
				currCandyMap.set("YORK_PEPPERMINT_PATTIES", 0);
			}

			// update candy calculation map to now have age and new currCandyMap
			candyCalculationmap.set(data[i].AGE, currCandyMap);
		} else {
			var currCandyMap = candyCalculationmap.get(data[i].AGE);
			if (data[i].FULL_SIZED_CANDY_BAR == "JOY") {
				// get the current joy count
				var currJoyCount = currCandyMap.get("FULL_SIZED_CANDY_BAR");
				// increment it
				currJoyCount++;
				// update the candy joy count;
				currCandyMap.set("FULL_SIZED_CANDY_BAR", currJoyCount);
			}

			if (data[i].BUTTERFINGER == "JOY") {
				var currJoyCount = currCandyMap.get("BUTTERFINGER");
				currJoyCount++;
				currCandyMap.set("BUTTERFINGER", currJoyCount);
			}
			if (data[i].CANDY_CORN == "JOY") {
				var currJoyCount = currCandyMap.get("CANDY_CORN");
				currJoyCount++;
				currCandyMap.set("CANDY_CORN", currJoyCount);
			}
			if (data[i].CHICLETS == "JOY") {
				var currJoyCount = currCandyMap.get("CHICLETS");
				currJoyCount++;
				currCandyMap.set("CHICLETS", currJoyCount);
			}
			if (data[i].DOTS == "JOY") {
				var currJoyCount = currCandyMap.get("DOTS");
				currJoyCount++;
				currCandyMap.set("DOTS", currJoyCount);
			}
			if (data[i].FUZZY_PEACHES == "JOY") {
				var currJoyCount = currCandyMap.get("FUZZY_PEACHES");
				currJoyCount++;
				currCandyMap.set("FUZZY_PEACHES", currJoyCount);
			}
			if (data[i].GOOD_N_PLENTY == "JOY") {
				var currJoyCount = currCandyMap.get("GOOD_N_PLENTY");
				currJoyCount++;
				currCandyMap.set("GOOD_N_PLENTY", currJoyCount);
			}
			if (data[i].GUMMY_BEARS == "JOY") {
				var currJoyCount = currCandyMap.get("GUMMY_BEARS");
				currJoyCount++;
				currCandyMap.set("GUMMY_BEARS", currJoyCount);
			}
			if (data[i].HEALTHY_FRUIT == "JOY") {
				var currJoyCount = currCandyMap.get("HEALTHY_FRUIT");
				currJoyCount++;
				currCandyMap.set("HEALTHY_FRUIT", currJoyCount);
			}
			if (data[i].HEATH_BAR == "JOY") {
				var currJoyCount = currCandyMap.get("HEATH_BAR");
				currJoyCount++;
				currCandyMap.set("HEATH_BAR", currJoyCount);
			}
			if (data[i].HERSHEYS_DARK == "JOY") {
				var currJoyCount = currCandyMap.get("HERSHEYS_DARK");
				currJoyCount++;
				currCandyMap.set("HERSHEYS_DARK", currJoyCount);
			}
			if (data[i].HERSHEYS_MILK == "JOY") {
				var currJoyCount = currCandyMap.get("HERSHEYS_MILK");
				currJoyCount++;
				currCandyMap.set("HERSHEYS_MILK", currJoyCount);
			}
			if (data[i].HERSHEYS_KISSES == "JOY") {
				var currJoyCount = currCandyMap.get("HERSHEYS_KISSES");
				currJoyCount++;
				currCandyMap.set("HERSHEYS_KISSES", currJoyCount);
			}
			if (data[i].JOLLY_RANCHER == "JOY") {
				var currJoyCount = currCandyMap.get("JOLLY_RANCHER");
				currJoyCount++;
				currCandyMap.set("JOLLY_RANCHER", currJoyCount);
			}
			if (data[i].JUNIOR_MINTS == "JOY") {
				var currJoyCount = currCandyMap.get("JUNIOR_MINTS");
				currJoyCount++;
				currCandyMap.set("JUNIOR_MINTS", currJoyCount);
			}
			if (data[i].KITKAT == "JOY") {
				var currJoyCount = currCandyMap.get("KITKAT");
				currJoyCount++;
				currCandyMap.set("KITKAT", currJoyCount);
			}
			if (data[i].LAFFYTAFFY == "JOY") {
				var currJoyCount = currCandyMap.get("LAFFYTAFFY");
				currJoyCount++;
				currCandyMap.set("LAFFYTAFFY", currJoyCount);
			}
			if (data[i].LEMONHEADS == "JOY") {
				var currJoyCount = currCandyMap.get("LEMONHEADS");
				currJoyCount++;
				currCandyMap.set("LEMONHEADS", currJoyCount);
			}
			if (data[i].LICORICE == "JOY") {
				var currJoyCount = currCandyMap.get("LICORICE");
				currJoyCount++;
				currCandyMap.set("LICORICE", currJoyCount);
			}
			if (data[i].BLACK_LICORICE == "JOY") {
				var currJoyCount = currCandyMap.get("BLACK_LICORICE");
				currJoyCount++;
				currCandyMap.set("BLACK_LICORICE", currJoyCount);
			}
			if (data[i].LOLLIPOPS == "JOY") {
				var currJoyCount = currCandyMap.get("LOLLIPOPS");
				currJoyCount++;
				currCandyMap.set("LOLLIPOPS", currJoyCount);
			}
			if (data[i].MIKE_AND_IKE == "JOY") {
				var currJoyCount = currCandyMap.get("MIKE_AND_IKE");
				currJoyCount++;
				currCandyMap.set("MIKE_AND_IKE", currJoyCount);
			}
			if (data[i].MILK_DUDS == "JOY") {
				var currJoyCount = currCandyMap.get("MILK_DUDS");
				currJoyCount++;
				currCandyMap.set("MILK_DUDS", currJoyCount);
			}
			if (data[i].MILKYWAY == "JOY") {
				var currJoyCount = currCandyMap.get("MILKYWAY");
				currJoyCount++;
				currCandyMap.set("MILKYWAY", currJoyCount);
			}
			if (data[i].MNMS == "JOY") {
				var currJoyCount = currCandyMap.get("MNMS");
				currJoyCount++;
				currCandyMap.set("MNMS", currJoyCount);
			}
			if (data[i].PEANUT_MNMS == "JOY") {
				var currJoyCount = currCandyMap.get("PEANUT_MNMS");
				currJoyCount++;
				currCandyMap.set("PEANUT_MNMS", currJoyCount);
			}
			if (data[i].MINT_KISSES == "JOY") {
				var currJoyCount = currCandyMap.get("MINT_KISSES");
				currJoyCount++;
				currCandyMap.set("MINT_KISSES", currJoyCount);
			}
			if (data[i].MR_GOODBAR == "JOY") {
				var currJoyCount = currCandyMap.get("MR_GOODBAR");
				currJoyCount++;
				currCandyMap.set("MR_GOODBAR", currJoyCount);
			}
			if (data[i].NERDS == "JOY") {
				var currJoyCount = currCandyMap.get("NERDS");
				currJoyCount++;
				currCandyMap.set("NERDS", currJoyCount);
			}
			if (data[i].NESTLE_CRUNCH == "JOY") {
				var currJoyCount = currCandyMap.get("NESTLE_CRUNCH");
				currJoyCount++;
				currCandyMap.set("NESTLE_CRUNCH", currJoyCount);
			}
			if (data[i].PEEPS == "JOY") {
				var currJoyCount = currCandyMap.get("PEEPS");
				currJoyCount++;
				currCandyMap.set("PEEPS", currJoyCount);
			}
			if (data[i].PIXY_STIX == "JOY") {
				var currJoyCount = currCandyMap.get("PIXY_STIX");
				currJoyCount++;
				currCandyMap.set("PIXY_STIX", currJoyCount);
			}
			if (data[i].REESES_PB_CUPS == "JOY") {
				var currJoyCount = currCandyMap.get("REESES_PB_CUPS");
				currJoyCount++;
				currCandyMap.set("REESES_PB_CUPS", currJoyCount);
			}
			if (data[i].REESES_PIECES == "JOY") {
				var currJoyCount = currCandyMap.get("REESES_PIECES");
				currJoyCount++;
				currCandyMap.set("REESES_PIECES", currJoyCount);
			}
			if (data[i].ROLOS == "JOY") {
				var currJoyCount = currCandyMap.get("ROLOS");
				currJoyCount++;
				currCandyMap.set("ROLOS", currJoyCount);
			}
			if (data[i].SKITTLES == "JOY") {
				var currJoyCount = currCandyMap.get("SKITTLES");
				currJoyCount++;
				currCandyMap.set("SKITTLES", currJoyCount);
			}
			if (data[i].SNICKERS == "JOY") {
				var currJoyCount = currCandyMap.get("SNICKERS");
				currJoyCount++;
				currCandyMap.set("SNICKERS", currJoyCount);
			}
			if (data[i].SOURPATCH_KIDS == "JOY") {
				var currJoyCount = currCandyMap.get("SOURPATCH_KIDS");
				currJoyCount++;
				currCandyMap.set("SOURPATCH_KIDS", currJoyCount);
			}
			if (data[i].SWEDISH_FISH == "JOY") {
				var currJoyCount = currCandyMap.get("SWEDISH_FISH");
				currJoyCount++;
				currCandyMap.set("SWEDISH_FISH", currJoyCount);
			}
			if (data[i].TIC_TACS == "JOY") {
				var currJoyCount = currCandyMap.get("TIC_TACS");
				currJoyCount++;
				currCandyMap.set("TIC_TACS", currJoyCount);
			}
			if (data[i].THREE_MUSKETEERS == "JOY") {
				var currJoyCount = currCandyMap.get("THREE_MUSKETEERS");
				currJoyCount++;
				currCandyMap.set("THREE_MUSKETEERS", currJoyCount);
			}
			if (data[i].TOBLERONE == "JOY") {
				var currJoyCount = currCandyMap.get("TOBLERONE");
				currJoyCount++;
				currCandyMap.set("TOBLERONE", currJoyCount);
			}
			if (data[i].TRAIL_MIX == "JOY") {
				var currJoyCount = currCandyMap.get("TRAIL_MIX");
				currJoyCount++;
				currCandyMap.set("TRAIL_MIX", currJoyCount);
			}
			if (data[i].TWIX == "JOY") {
				var currJoyCount = currCandyMap.get("TWIX");
				currJoyCount++;
				currCandyMap.set("TWIX", currJoyCount);
			}
			if (data[i].WHATCHAMACALLIT_BARS == "JOY") {
				var currJoyCount = currCandyMap.get("WHATCHAMACALLIT_BARS");
				currJoyCount++;
				currCandyMap.set("WHATCHAMACALLIT_BARS", currJoyCount);
			}
			if (data[i].YORK_PEPPERMINT_PATTIES == "JOY") {
				var currJoyCount = currCandyMap.get("YORK_PEPPERMINT_PATTIES");
				currJoyCount++;
				currCandyMap.set("YORK_PEPPERMINT_PATTIES", currJoyCount);
			}
			candyCalculationmap.set(data[i].AGE, currCandyMap);
		}
	}
}
