// Music
var allNotes = [
    "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"
];
var allNotesEnh = [
    "c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"
];
var colors = ['white', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'black']
//var colors = ["red", "green", "blue", "black", "purple", "gray", "orange", "lightgray"];

var Scales = {
    // scales in C, can be transposed
    lydian: "c d e f# g a b",
    major: "c d e f g a b",
    mixolydian: "c d e f g a bb",
    dorian: "c d eb f g a bb",
    aeolian: "c d eb f g ab bb",
    phrygian: "c db eb f g ab bb",
    locrian: "c db eb f gb ab bb",
    "minor-pentatonic": "c eb f g bb",
    "minor-blues": "c eb f f# g bb",
    "major-pentatonic": "c d e g a",
    "major-blues": "c d d# e g a",
    "dom-pentatonic": "c e f g bb",
    japanese: "c db f g ab",
    // chords
    maj: "c e g",
    aug: "c e g#",
    min: "c eb g",
    dim: "c eb gb",
    maj7: "c e g b",
    7: "c e g bb",
    min7: "c eb g bb",
    m7b5: "c eb gb bb",
    dim7: "c eb gb a",
    _: function(scale) { return Scales[scale].split(" "); },
};

// Figure out whether to flatten or sharpen
function asOffset(note) {
    note = note.toLowerCase();
    var offset = allNotes.indexOf(note);
    if(offset === -1) {
        offset = allNotesEnh.indexOf(note);
    }
    return offset;
}

// Return pitch value for a note
function absNote(note) {
    var octave = note[note.length - 1];
    var pitch = asOffset(note.slice(0, -1));
    if (pitch > -1) {
        return pitch + octave * 12;
    }
}

// Transpose scale to new root
function asNotes(scale) {
    let [root, type] = scale.split(" ");
    var scaleInC = Scales._(type);
    var offset = asOffset(root);
    var scaleTransposed = scaleInC.map(function(note) {
        return allNotes[(asOffset(note) + offset) % 12];
    });
    return scaleTransposed.join(" ");
}

// Returns something exactly?
var verbatim = function(d) { return d; };


// Fretboard, needs to be extended for custom tunings
var Tunings = {
    E_4ths: ["e2", "a2", "d3", "g3", "c4", "f4"],
    E_std: ["e2", "a2", "d3", "g3", "b3", "e4"],
    Drop_D: ["d2", "a2", "d3", "g3", "b3", "e4"],
    G_open: ["d2", "g2", "d3", "g3", "b4", "d4"]
};

// Workhorse of the project
var Fretboard = function(config) {
    config = config || {};
    // not sure why we need a random id here
    var id = "fretboard-" + Math.floor(Math.random() * 1000000);

    // Params of Fretboard, where to customize tunings
    var instance = {
        frets: config.frets || 12,
        strings: config.strings || 6,
        tuning: config.tuning || Tunings.E_std,
        fretWidth: 50,
        fretHeight: 20
    };

    // Return frets to draw dots on
    instance.fretsWithDots = function () {
        var allDots = [3, 5, 7, 9, 15, 17, 19, 21];
        return allDots.filter(function(v) { return v <= instance.frets; });
    };
    // Return frets to draw double dots on, current config only 12
    instance.fretsWithDoubleDots = function () {
        var allDots = [12, 24];
        return allDots.filter(function(v) { return v <= instance.frets; });
    };

    // Figure out height
    instance.fretboardHeight = function () {
        return (instance.strings - 1) * instance.fretHeight + 2;
    };
    // Figure out weight
    instance.fretboardWidth = function() {
        return instance.frets * instance.fretWidth + 2;
    };

    // Figure out margins
    instance.XMARGIN = function() { return instance.fretWidth; };
    instance.YMARGIN = function() { return instance.fretHeight; };

    // Draw the container
    instance.makeContainer = function() {
        return d3
            .select("body")
            .append("div")
            .attr("class", "fretboard")
            .attr("id", id)
            .append("svg")
            .attr("width", instance.fretboardWidth() + instance.XMARGIN() * 2)
            .attr("height", instance.fretboardHeight() + instance.YMARGIN() * 2);
    };

    instance.svgContainer = instance.makeContainer();

    // Draw fretlines
    instance.drawFrets = function() {
        for(i=0; i<=instance.frets; i++) {
            let x = i * instance.fretWidth + 1 + instance.XMARGIN();
            instance.svgContainer
                .append("line")
                .attr("x1", x)
                .attr("y1", instance.YMARGIN())
                .attr("x2", x)
                .attr("y2", instance.YMARGIN() + instance.fretboardHeight())
                .attr("stroke", "lightgray")
                .attr("stroke-width", i==0? 8:2);
            d3.select("#" + id)
                .append("p")
                .attr("class", "fretnum")
                .style("top", (instance.fretboardHeight() + instance.YMARGIN() + 5) + "px")
                .style("left", x - 4 + "px")
                .text(i)
                ;
        }
    }

    // Draw strings
    instance.drawStrings = function() {
        for(i=0; i<instance.strings; i++) {
            instance.svgContainer
                .append("line")
                .attr("x1", instance.XMARGIN())
                .attr("y1", i * instance.fretHeight + 1 + instance.YMARGIN())
                .attr("x2", instance.XMARGIN() + instance.fretboardWidth())
                .attr("y2", i * instance.fretHeight + 1 + instance.YMARGIN())
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                ;
        }
        // Adapt to tuning
        var placeTuning = function(d, i) {
            return (instance.strings - i) * instance.fretHeight - 5 + "px";
        };
        d3.select("#" + id)
            .selectAll(".tuning")
            .data(instance.tuning.slice(0, instance.strings))
            .style("top", placeTuning)
            .text(verbatim)
            .enter()
            .append("p")
            .attr("class", "tuning")
            .style("top", placeTuning)
            .text(verbatim)
            ;
    };

    // Draw fretDots
    instance.drawDots = function() {
        var p = instance.svgContainer
            .selectAll("circle")
            .data(instance.fretsWithDots());

        p.enter()
            .append("circle")
            .attr("cx", function(d) { return (d - 1) * instance.fretWidth + instance.fretWidth/2 + instance.XMARGIN(); })
            .attr("cy", instance.fretboardHeight()/2 + instance.YMARGIN())
            .attr("r", 4).style("fill", "#8B4513");

        var p = instance.svgContainer
            .selectAll(".octave")
            .data(instance.fretsWithDoubleDots);

        p.enter()
            .append("circle")
            .attr("class", "octave")
            .attr("cx", function(d) { return (d - 1) * instance.fretWidth + instance.fretWidth/2 + instance.XMARGIN(); })
            .attr("cy", instance.fretHeight * 3/2 + instance.YMARGIN())
            .attr("r", 4).style("fill", "#8B4513");
        p.enter()
            .append("circle")
            .attr("class", "octave")
            .attr("cx", function(d) { return (d - 1) * instance.fretWidth + instance.fretWidth/2 + instance.XMARGIN(); })
            .attr("cy", instance.fretHeight * 7/2 + instance.YMARGIN())
            .attr("r", 4).style("fill", "#8B4513");
    };

    // Initialize drawings
    instance.draw = function() {
        instance.drawFrets();
        instance.drawStrings();
        instance.drawDots();
    };


    // Notes on fretboard

    instance.addNoteOnString = function(note, string, color) {
        var absPitch = absNote(note);
        color = color || "black";
        var absString = (instance.strings - string);
        var basePitch = absNote(instance.tuning[absString]);
        if((absPitch >= basePitch) && (absPitch <= basePitch + instance.frets)) {
            instance.svgContainer
                .append("circle")
                .attr("class", "note")
                .attr("stroke-width", 1)
                // 0.75 is the offset into the fret (higher is closest to fret)
                .attr("cx", (absPitch - basePitch + 0.75) * instance.fretWidth)
                .attr("cy", (string - 1) * instance.fretHeight + 1 + instance.YMARGIN())
                .attr("r", 6).style("stroke", color).style("fill", "burlywood")
                .on("click", function(d) {
                    let fill = this.style.fill;
                    this.setAttribute("stroke-width", 5 - parseInt(this.getAttribute("stroke-width")));
                    this.style.fill = fill == "burlywood"? "lightgray" : "burlywood";
                })
                    .append("title").text(note.toUpperCase())
                ;
        }
    };


    instance.addNote = function(note, color) {
        for(string=1; string<=instance.strings; string++) {
            instance.addNoteOnString(note, string, color);
        }
    };


    instance.addNotes = function(notes, color) {
        var allNotes = notes.split(" ");
        for (i=0; i<allNotes.length; i++) {
            var showColor = color || colors[i];
            var note = allNotes[i];
            for (octave=2; octave<7; octave++) {
                instance.addNote(note + octave, showColor);
            }
        }
    };


    instance.scale = function(scaleName) {
        instance.clear();
        instance.addNotes(asNotes(scaleName));
    };


    instance.placeNotes = function(sequence) {
        // Sequence of string:note
        // e.g. "6:g2 5:b2 4:d3 3:g3 2:d4 1:g4"
        instance.clear();
        var pairs = sequence.split(" ");
        pairs.forEach(function(pair, i) {
            let [string, note] = pair.split(":");
            string = parseInt(string);
            instance.addNoteOnString(note, string, i==0? "red":"black");
        });
    };

    // Reset notes
    instance.clearNotes = function() {
        instance.svgContainer
            .selectAll(".note")
            .remove();
    };

    // Reset fretboard
    instance.clear = function() {
        d3.select("#" + id).selectAll(".fretnum,.tuning").remove();
        instance.svgContainer
            .selectAll("line")
            .remove();
        instance.svgContainer
            .selectAll("circle")
            .remove();
        instance.draw();
    };

    instance.delete = function() {
        d3.select("#" + id).remove();
    };

    instance.draw();

    return instance;
}




// Code taken from http://bl.ocks.org/williaster/10ef968ccfdc71c30ef8 as example of dropdown
// Function unchanged from example
var updateBars = function(data) {
    // First update the y-axis domain to match data
    yScale.domain( d3.extent(data) );
    yAxisHandleForUpdate.call(yAxis);

    var bars = canvas.selectAll(".bar").data(data);

    // Add bars for new data
    bars.enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function(d,i) { return xScale( nutritionFields[i] ); })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d,i) { return yScale(d); })
        .attr("height", function(d,i) { return height - yScale(d); });

    // Update old ones, already have x / width from before
    bars
        .transition().duration(250)
        .attr("y", function(d,i) { return yScale(d); })
        .attr("height", function(d,i) { return height - yScale(d); });

    // Remove old ones
    bars.exit().remove();
};

var dropdownChange = function() {
    // need to grab other drop down as well
    var newVal = d3.select(this).property('value')
        // how to
        newData = root + ' ' + newVal
        // function to perform on above notes
        function(d) {
                    let fill = this.style.fill;
                    this.setAttribute("stroke-width", 5 - parseInt(this.getAttribute("stroke-width")));
                    this.style.fill = fill == "burlywood"? "lightgray" : "burlywood";
}

var dropdown = d3.select('fretboard')
    .insert('select', 'svg')
    .on('change', dropdownChange);

dropdown.selectAll('root')
    .data( var union = [...new Set([...allNotes, ...allNotesEnh])];)
    .enter().append('root')
    .attr('value', function(d) { return d; })
    .text(function(d) {
        return d[0].toUpperCase() + d.slice(1, d.length);
    })

dropdown.selectAll('scale')
    .data( var scale_names = Object.keys(Scales);)
    .enter().append('scale')
    .attr('value', function(d) { return d; })
    .text(function(d) {
        return d[0].toLowerCase() + d.slice(1, d.length);
    })


var initialData = "C major"
;
