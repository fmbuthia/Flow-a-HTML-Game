var gameTable = $(".main-container");
var leftColumnCount = 0;
var rightColumnCount = 0;
var lastColumnAdded = 2;
var stateNames = ['A','B'];

function init() {
    //Add table header
    gameTable.append('<tr> <th class="column-header header-1" ></th> <th class="column-header header-2" ></th> </tr>');

    $.getJSON("data/rows.json", function (data) {

        $.each(data, function (key, val) {

            var boxState = val.states;
            var rowIndex = key + 1;

            //Add Table columns
            gameTable.append("<tr> <td class='column-a' ></td> <td class='column-b' > </td>  </tr>");

            var rowColumnA = $(".column-a").attr({class: ['col-1', 'row' + rowIndex].join(' ')});
            var rowColumnB = $(".column-b").attr({class: ['col-2', 'row' + rowIndex].join(' ')});

            addBoxes(rowColumnA, rowColumnB, val, boxState,rowIndex);
        });
    });
}

function addBoxes(rowColumnA, rowColumnB, val, boxState, rowIndex) {
    var state;
    var boxColor;

    $.each(val.sequence, function (index, value) {
        var boxId = index + 1;

        var box = new Box(value, boxState);

        boxColor = box.getBoxColor();
        state = box.getBoxState();

        var boxContainer = $("<div id='" + boxId + "' class='el' ></div>");
        boxContainer.attr({class: [boxColor, 'el'].join(' ')});

        if (state == 'A') {
            addABox(rowColumnA , boxContainer, box, rowIndex);
            leftColumnCount++;
        } else {
            addABox(rowColumnB , boxContainer, box, rowIndex);
            rightColumnCount++;
        }
        setUpHeaderTotalCount(leftColumnCount, rightColumnCount);
    });
}

function addABox(parentElement, childElement,  box, rowIndex) {
    if(box.getBoxState() == 'A'){
        childElement.data( "boxData", { col: 1, row: rowIndex } );
    } else{
        childElement.data( "boxData", { col: 2, row: rowIndex } );
    }
    childElement.attr({class: [box.getBoxColor(), 'el'].join(' ')}).appendTo(parentElement);
}

$(document).on('click', 'div', function (e) {
    e.stopPropagation();
    var $this = $(this);
    var boxColumn = $this.data( "boxData").col;
    var boxRow = $this.data( "boxData").row;

    if (getState( boxColumn )) {
        var newColumn = boxColumn+1;
        var rightRowContainer = 'table tr td.col-'+newColumn+'.row'+boxRow;
        $this.data( "boxData", { col: newColumn, row: boxRow } );

        $this.prependTo(rightRowContainer);
        sortElements(rightRowContainer);

        modifyHeaderCount('table tr th.header-'+boxColumn, false);
        modifyHeaderCount('table tr th.header-'+newColumn, true );

    } else {
        var leftRowContainer = 'table tr td.col-1.row'+boxRow;
        $this.data( "boxData", { col: 1, row: boxRow } );

        $this.prependTo(leftRowContainer);
        sortElements(leftRowContainer);

        modifyHeaderCount('table tr th.header-'+boxColumn, false);
        modifyHeaderCount('table tr th.header-1', true);

    }
});

function getState( boxColumn ){
    if(boxColumn >= lastColumnAdded){
        return false;
    } else{
        return true;
    }
}

function sortElements(parentElement) {
    $(parentElement + ' div').sort(function (a, b) {
        return parseInt(a.id) > parseInt(b.id);
    }).appendTo(parentElement);
}

function setUpHeaderTotalCount(leftCount, rightCount) {
    modifyValue('table tr th.header-1', 'A(' + leftCount + ')');
    modifyValue('table tr th.header-2', 'B(' + rightCount + ')');
}

function modifyHeaderCount(selector, add) {
    var newIntValue;
    var headerValue = $(selector).text();

    var regEx = /\((.+?)\)/g,
        countValue = regEx.exec(headerValue);

    if(countValue != null) {
        if(add){
            newIntValue = Number(countValue[1]) + 1;
        } else{
            newIntValue = countValue[1]-1;
        }
    } else{
        newIntValue =  1;
    }
    modifyValue(selector, headerValue.replace(/\((.+?)\)/g, '(' + newIntValue + ')'));
}

function modifyValue(selector, value) {
    $(selector).text(value);
}

function validateFirstLetter(columnName){
    var validationArrayAtoF = ['A','B','C','D','E','F'];
    var validationArrayNtoZ = ['N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];	
    return ((columnName.charAt(0) == columnName.charAt(0).toUpperCase()) 
		&& (validationArrayAtoF.contains( columnName.charAt(0)) || validationArrayNtoZ.contains(columnName.charAt(0))));
}

function validateFormat(columnName){
    var character = columnName.charAt(1);
    if(character != '') {
        if (!isNaN(character)) {
            return false;
        } else {
            if(columnName.match(/^\D{2}\d{1,3}$/g) != null) {
                return false;
            } else if ((columnName.match(/^\D{2}\d{4}$/g) != null) || (columnName.match(/^\D{2}\d{4}\D+/g) != null)) {
                return ( character == '-' || character == '_');
            } else if (columnName.match(/^\D{2}\d{4}\d+/g) != null) {
                return false;
            }
        }
    }
    return true;
}

Array.prototype.contains = function(value) {
    for(var i=0; i < this.length; i++){
        if(this[i].toLowerCase() === value.toLowerCase()){
            return true;
        }
    }
    return false;
}

function addANewColumn(){
    var rowCount = 0;
    var columnName = $('#columnname').val();

    if(stateNames.contains(columnName)){
        alert("That's a duplicate, please choose another one");
        return;
    } else if(!validateFirstLetter(columnName)){
        alert("First letter should be capital and between between A-F or N-Z");
        return;
    } else if(!validateFormat(columnName)){
        alert("the leading character may (but is not required to) be followed by a number up to four digits long, which must be separated from the leading character by an underscore or dash if used");
        return;
    }

    stateNames.push(columnName);

    lastColumnAdded = lastColumnAdded+1;

    $('table tr').each(function()
    {
        if ($(this).is('tr:first')) {
            $(this).append('<th class="column-header header-'+lastColumnAdded+'" >'+columnName+'(0)</th>');
        } else {
            $(this).append('<td class="col-'+lastColumnAdded+' row'+rowCount+'" ></td>');
        }
        rowCount++;
    });


}

//A box object
var Box = function(value, boxState){
    var boxColor;
    var boxState;

    var red = "red";
    var blue = "blue";
    var yellow = "yellow";
    var green = "green";

    switch (value) {
        case red:
            boxColor = red;
            boxState = boxState.red;
            break;
        case blue:
            boxColor = blue;
            boxState = boxState.blue;
            break;
        case yellow:
            boxColor = yellow;
            boxState = boxState.yellow;
            break;
        case green:
            boxColor = green;
            boxState = boxState.green;
            break;
    }
    this.boxColor = boxColor;
    this.boxState = boxState;
};

Box.prototype.getBoxColor = function() {
    return this.boxColor;
};

Box.prototype.getBoxState = function() {
    return this.boxState;
};




