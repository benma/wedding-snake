var allowPressKeys = false;
var ctx, startLength, snakeSpeed, snakeDirection, headAngle, headFlip;
var headImg, headImg2, skinImg;
var foodImgs;
var foodIndex;

var size = 15;

function orient() {
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    
    if(!is_chrome) {
	$(window)    
	    .bind('orientationchange', function(){
		if (window.orientation % 180 == 0){
		    $(document.body).css("-webkit-transform-origin", "")
		        .css("-webkit-transform", "");               
		} 
		else {                   
		    if ( window.orientation > 0) { //clockwise
		        $(document.body).css("-webkit-transform-origin", "280px 190px")
		            .css("-webkit-transform",  "rotate(-90deg)");  
		    }
		    else {
		        $(document.body).css("-webkit-transform-origin", "280px 190px")
		            .css("-webkit-transform",  "rotate(90deg)"); 
		    }
		}
	    })
	    .trigger('orientationchange');
    }
}

function drawHeart() {

    ctx.save();
    var w = 150, h = 150;

    ctx.strokeStyle = "#000000";
    ctx.strokeWeight = 3;
    ctx.shadowOffsetX = 4.0;
    ctx.shadowOffsetY = 4.0;
    ctx.lineWidth = 3.0;
    ctx.fillStyle = "#FF0000";
    var d = Math.min(w, h);
    var k = 120;


    ctx.moveTo(k, k + d / 4);
    ctx.quadraticCurveTo(k, k, k + d / 4, k);
    ctx.quadraticCurveTo(k + d / 2, k, k + d / 2, k + d / 4);
    ctx.quadraticCurveTo(k + d / 2, k, k + d * 3/4, k);
    ctx.quadraticCurveTo(k + d, k, k + d, k + d / 4);
    ctx.quadraticCurveTo(k + d, k + d / 2, k + d * 3/4, k + d * 3/4);
    ctx.lineTo(k + d / 2, k + d);
    ctx.lineTo(k + d / 4, k + d * 3/4);
    ctx.quadraticCurveTo(k, k + d / 2, k, k + d / 4);

    ctx.stroke();
    ctx.fill();
    ctx.restore();
}

function runSnake() {
    canvas = document.getElementById('canvas');

    
    jCanvas = $('canvas');
    jCanvas.width("100%");
    jCanvas.height($(window).height() - $('#header').height() - 20);

    var smaller = jCanvas.height() < jCanvas.width() ? jCanvas.height() : jCanvas.width();
    
    smaller -= smaller % size;
    jCanvas.width(smaller);
    jCanvas.height(smaller);

    gridSize = smaller / size;
    canvas.width = jCanvas.width();
    canvas.height = jCanvas.height();

    
    
    if (canvas.getContext) {
	mainMenu();
	ctx = canvas.getContext('2d');

        var newImg = function(src) { var img = new Image(); img.src = src; return img; }
        headImg = newImg("head.png");
        headImg2 = newImg("head2.png");
        foodImgs = [
            newImg("food/pizza.png"),
            newImg("food/sandwich.png"),
            newImg("food/redbull.png"),
            newImg("food/cookie.png"),
            newImg("food/pizza.png"),
            newImg("food/redbull.png"),
            newImg("food/sandwich.png"),
            newImg("food/cookie.png"),
            newImg("food/cake2.png"),
            newImg("food/heart.png")

        ];
        foodIndex = 0;
        // foodImg = new Image();
        // foodImg.src = "food.png";
        // skinImg = new Image();
        // skinImg.src = "skin1.jpg";
        
	startLength = 3;
	snakeSpeed = 140;
    } else {
	alert("You need a new browser");
    }
}

function mainMenu() {
    $("#main-menu").modal({
	opacity:80,
	overlayCss: {backgroundColor:"#000"},
	onClose: function() {
	    $("#gameover-content").hide();
	    $.modal.close(); // must call this!
	}, persist: true
    });
}

function hide() {
    $("#main-content").hide();
    $("#pause-content").hide();
    $("#gameover-content").hide();
}


function pauseMenu() {
    $("#main-content").hide();
    $("#about-content").hide();
    $("#pause-content").show();
    $("#gameover-content").hide();
    mainMenu();
}

function gameMenu() {
    $("#main-content").hide();
    $("#about-content").hide();
    $("#pause-content").hide();
    $("#gameover-content").show();
    mainMenu();
}

function start(sl) {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    this.currentPosition = {'x':gridSize*3,'y':gridSize*3};
    snakeBody = [];
    snakeLength = sl || startLength;
    headAngle = 0;
    headFlip = 1;
    makeFood();
    drawSnake();
    snakeDirection = 'right';
    play();
}

function pause() {
    clearInterval(interval);
    allowPressKeys = false;
}

function play(){
    interval = setInterval(moveSnake,snakeSpeed);
    allowPressKeys = true;
    hide();
}

function togglePause() {
    if(allowPressKeys) {
        pause();
    } else {
        play();
    }
}

function restart() {
    pause();
    start();
}

document.onkeydown = function(event) {
    
    var keyCode = event ? event.keyCode : window.event.keyCode;

    if(keyCode == 80) { // P
        togglePause();
    }
    
    if (!allowPressKeys){
    	return;
    }
    switch(keyCode)
    {
        case 37:
	// left arrow key
	if (snakeDirection != 'left' && snakeDirection != 'right') {
	    moveLeft();
	}
	break;
	
	case 38:
	// up arrow key
	if (snakeDirection != 'up' && snakeDirection != 'down') {
	    moveUp();
	}
	break;
	
	case 39:
	// right arrow key
	if (snakeDirection != 'left' && snakeDirection != 'right') {
	    moveRight();
	}
	break;
	
	case 40:
	// down arrow key
	if (snakeDirection != 'up' && snakeDirection != 'down') {
	    moveDown();
	}
	break;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function makeFood() {
    suggestedPoint = null;

    
    hasPoint = function(element, index, array) {
        return (element[0] == suggestedPoint[0] && element[1] == suggestedPoint[1]);
    };
    while(!suggestedPoint || snakeBody.some(hasPoint)) {
        // no food on the borders, otherwise the food's image will be partly invisible
        var px = getRandomInt(1, size-1);
        var py = getRandomInt(1, size-1);
    
        suggestedPoint = [px * gridSize, py * gridSize];
    }
}



function biteMe(element, index, array) {
    return (element[0] == currentPosition['x'] && element[1] == currentPosition['y']);
}



function drawSnake() {

    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    if (snakeBody.some(biteMe)) {
	gameOver();
	return false;
    }

    

    // draw food
    //ctx.fillStyle = "rgb(10,100,0)";
    //ctx.fillRect(suggestedPoint[0], suggestedPoint[1], gridSize, gridSize);
    var foodSize = gridSize * 2;
    ctx.drawImage(foodImgs[foodIndex], suggestedPoint[0] + gridSize / 2 - foodSize / 2, suggestedPoint[1] + gridSize / 2 - foodSize / 2, foodSize, foodSize);
    
    
    snakeBody.push([currentPosition['x'], currentPosition['y']]);
    $(snakeBody).each(function(i, pos) {

        if(i < snakeBody.length - 2) {
            ctx.fillStyle = "#454545";
            ctx.fillRect(pos[0], pos[1], gridSize, gridSize);
            //ctx.drawImage(skinImg, pos[0], pos[1], gridSize, gridSize);
        }
    });

    var drawHead = function(headImg, pos, flip, angle) {

        
        headSize = gridSize*2.5;
        
            
        ctx.save();
        ctx.translate(pos[0] + gridSize / 2, pos[1] + gridSize / 2);
        ctx.scale(flip, 1);
        ctx.rotate(angle*Math.PI/180);
        ctx.drawImage(headImg,  - headSize / 2, -headSize / 2, headSize, headSize);
        ctx.restore();
        // }
        // else if (i == snakeBody.length - 2) {
        //     ctx.save();
        //     ctx.translate(pos[0] + gridSize / 2, pos[1] + gridSize / 2);
        //     ctx.scale(headFlip, 1);
        //     ctx.rotate(headAngle*Math.PI/180);
        //     ctx.drawImage(headImg2,  - headSize / 2, -headSize / 2, headSize, headSize);
        //     ctx.restore();
        // }
    };
    drawHead(headImg, snakeBody[snakeBody.length - 1], headFlip, headAngle);
    if(snakeBody.length > 1)
        drawHead(headImg2, snakeBody[snakeBody.length - 2], 1, 0);
    

    // ctx.fillStyle = "#ff0000";
    // ctx.fillRect(currentPosition['x'], currentPosition['y'], gridSize, gridSize);
    if (snakeBody.length > snakeLength) {
	var itemToRemove = snakeBody.shift();
	//ctx.clearRect(itemToRemove[0], itemToRemove[1], gridSize, gridSize);
    }

    if (currentPosition['x'] == suggestedPoint[0] && currentPosition['y'] == suggestedPoint[1]) {
	makeFood();
        foodIndex = (foodIndex + 1) % foodImgs.length;

	snakeLength += 1;
	updateScore();
    }
}

function moveSnake() {
    switch(snakeDirection)
    {
	case 'up':
	moveUp();
	break;
	case 'down':
	moveDown();
	break;
	case 'left':
	moveLeft();
	break;
	case 'right':
	moveRight();
	break;		
    }
}

function leftPosition() {
    return (currentPosition['x'] + canvas.width - gridSize) % canvas.width;
}

function rightPosition() {
    return (currentPosition['x'] + gridSize) % canvas.width;
}

function upPosition() {
    return (currentPosition['y'] + canvas.height - gridSize) % canvas.height;
}

function downPosition() {
    return (currentPosition['y'] + gridSize) % canvas.height;
}

function moveUp() {
    executeMove('up', 'y', upPosition());
}

function moveDown() {
    executeMove('down', 'y', downPosition());
}

function moveLeft() {
    executeMove('left', 'x', leftPosition());
}

function moveRight() {
    executeMove('right', 'x', rightPosition());
}

function executeMove(dirValue, axisType, axisValue) {
    if(snakeDirection == 'right' && dirValue == 'down') {
        headAngle = 90;
        headFlip = 1;
    }
    else if(snakeDirection == 'right' && dirValue == 'up') {
        headAngle = -90;
        headFlip = 1;
    }
    else if(snakeDirection == 'down' && dirValue == 'left') {
        headAngle = 0;
        headFlip = -1;
    }
    else if(snakeDirection == 'down' && dirValue == 'right') {
        headAngle = 0;
        headFlip = 1;
    }
    else if(snakeDirection == 'left' && dirValue == 'up') {
        headAngle = -90;
        headFlip = -1;
    }
    else if(snakeDirection == 'left' && dirValue == 'down') {
        headAngle = 90;
        headFlip = -1;
    }
    else if(snakeDirection == 'up' && dirValue == 'right') {
        headAngle = 0;
        headFlip = 1;
    }
    else if(snakeDirection == 'up' && dirValue == 'left') {
        headAngle = 0;
        headFlip = -1;
    }
    
    
    snakeDirection = dirValue;
    currentPosition[axisType] = axisValue;
    drawSnake();
}

function whichWay(axisType) {
    if (axisType == 'x') {
        if(snakeDirection == 'up' || snakeDirection == 'down') {
	    if(currentPosition['x'] > canvas.width / 2) {
                moveLeft();
            } else {
                moveRight();
            }
        }
    } else {
        if(snakeDirection == 'left' || snakeDirection == 'right') {
	    if(currentPosition['y'] > canvas.height / 2) {
                moveUp();
            } else {
                moveDown();
            }
        }
    }
}

function gameOver() {
    // var score = (snakeLength - startLength) * 10;
    // gameScore();
    // pause();
    // snakeLength = startLength;
    // score = 0;
    // updateScore();
    // allowPressKeys = false;

    // game over is not the end; decrease snake length and go again.
    pause();
    ctx.clearRect(0,0, canvas.width, canvas.height);
    start(snakeLength - 1);
    updateScore();
}

function updateScore() {
    var score = (snakeLength - startLength)*10
    document.getElementById('score').innerHTML = score;
}

function gameScore() {
    $('#ribbon').addClass('hide');
    var highScore = 0; //localStorage.getItem("high-score");
    
    var score = (snakeLength - startLength) * 10;
    $('.current-score').html(score);
    
    if (score > highScore) {
	$('#ribbon').removeClass('hide');
	//localStorage.setItem('high-score', score);	
    }
    
    gameMenu();
}

/*
 * SimpleModal 1.4.1 - jQuery Plugin
 * http://www.ericmmartin.com/projects/simplemodal/
 * Copyright (c) 2010 Eric Martin (http://twitter.com/ericmmartin)
 * Dual licensed under the MIT and GPL licenses
 * Revision: $Id: jquery.simplemodal.js 261 2010-11-05 21:16:20Z emartin24 $
 */
(function(d){var k=d.browser.msie&&parseInt(d.browser.version)===6&&typeof window.XMLHttpRequest!=="object",m=d.browser.msie&&parseInt(d.browser.version)===7,l=null,f=[];d.modal=function(a,b){return d.modal.impl.init(a,b)};d.modal.close=function(){d.modal.impl.close()};d.modal.focus=function(a){d.modal.impl.focus(a)};d.modal.setContainerDimensions=function(){d.modal.impl.setContainerDimensions()};d.modal.setPosition=function(){d.modal.impl.setPosition()};d.modal.update=function(a,b){d.modal.impl.update(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            b)};d.fn.modal=function(a){return d.modal.impl.init(this,a)};d.modal.defaults={appendTo:"body",focus:true,opacity:50,overlayId:"simplemodal-overlay",overlayCss:{},containerId:"simplemodal-container",containerCss:{},dataId:"simplemodal-data",dataCss:{},minHeight:null,minWidth:null,maxHeight:null,maxWidth:null,autoResize:false,autoPosition:true,zIndex:1E3,close:true,closeHTML:'<a class="modalCloseImg" title="Close"></a>',closeClass:"simplemodal-close",escClose:true,overlayClose:false,position:null,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           persist:false,modal:true,onOpen:null,onShow:null,onClose:null};d.modal.impl={d:{},init:function(a,b){var c=this;if(c.d.data)return false;l=d.browser.msie&&!d.boxModel;c.o=d.extend({},d.modal.defaults,b);c.zIndex=c.o.zIndex;c.occb=false;if(typeof a==="object"){a=a instanceof jQuery?a:d(a);c.d.placeholder=false;if(a.parent().parent().size()>0){a.before(d("<span></span>").attr("id","simplemodal-placeholder").css({display:"none"}));c.d.placeholder=true;c.display=a.css("display");if(!c.o.persist)c.d.orig=
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   a.clone(true)}}else if(typeof a==="string"||typeof a==="number")a=d("<div></div>").html(a);else{alert("SimpleModal Error: Unsupported data type: "+typeof a);return c}c.create(a);c.open();d.isFunction(c.o.onShow)&&c.o.onShow.apply(c,[c.d]);return c},create:function(a){var b=this;f=b.getDimensions();if(b.o.modal&&k)b.d.iframe=d('<iframe src="javascript:false;"></iframe>').css(d.extend(b.o.iframeCss,{display:"none",opacity:0,position:"fixed",height:f[0],width:f[1],zIndex:b.o.zIndex,top:0,left:0})).appendTo(b.o.appendTo);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               b.d.overlay=d("<div></div>").attr("id",b.o.overlayId).addClass("simplemodal-overlay").css(d.extend(b.o.overlayCss,{display:"none",opacity:b.o.opacity/100,height:b.o.modal?f[0]:0,width:b.o.modal?f[1]:0,position:"fixed",left:0,top:0,zIndex:b.o.zIndex+1})).appendTo(b.o.appendTo);b.d.container=d("<div></div>").attr("id",b.o.containerId).addClass("simplemodal-container").css(d.extend(b.o.containerCss,{display:"none",position:"fixed",zIndex:b.o.zIndex+2})).append(b.o.close&&b.o.closeHTML?d(b.o.closeHTML).addClass(b.o.closeClass):
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             "").appendTo(b.o.appendTo);b.d.wrap=d("<div></div>").attr("tabIndex",-1).addClass("simplemodal-wrap").css({height:"100%",outline:0,width:"100%"}).appendTo(b.d.container);b.d.data=a.attr("id",a.attr("id")||b.o.dataId).addClass("simplemodal-data").css(d.extend(b.o.dataCss,{display:"none"})).appendTo("body");b.setContainerDimensions();b.d.data.appendTo(b.d.wrap);if(k||l)b.fixIE()},bindEvents:function(){var a=this;d("."+a.o.closeClass).bind("click.simplemodal",function(b){b.preventDefault();a.close()});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                a.o.modal&&a.o.close&&a.o.overlayClose&&a.d.overlay.bind("click.simplemodal",function(b){b.preventDefault();a.close()});d(document).bind("keydown.simplemodal",function(b){if(a.o.modal&&b.keyCode===9)a.watchTab(b);else if(a.o.close&&a.o.escClose&&b.keyCode===27){b.preventDefault();a.close()}});d(window).bind("resize.simplemodal",function(){f=a.getDimensions();a.o.autoResize?a.setContainerDimensions():a.o.autoPosition&&a.setPosition();if(k||l)a.fixIE();else if(a.o.modal){a.d.iframe&&a.d.iframe.css({height:f[0],
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      width:f[1]});a.d.overlay.css({height:f[0],width:f[1]})}})},unbindEvents:function(){d("."+this.o.closeClass).unbind("click.simplemodal");d(document).unbind("keydown.simplemodal");d(window).unbind("resize.simplemodal");this.d.overlay.unbind("click.simplemodal")},fixIE:function(){var a=this,b=a.o.position;d.each([a.d.iframe||null,!a.o.modal?null:a.d.overlay,a.d.container],function(c,h){if(h){var g=h[0].style;g.position="absolute";if(c<2){g.removeExpression("height");g.removeExpression("width");g.setExpression("height",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      'document.body.scrollHeight > document.body.clientHeight ? document.body.scrollHeight : document.body.clientHeight + "px"');g.setExpression("width",'document.body.scrollWidth > document.body.clientWidth ? document.body.scrollWidth : document.body.clientWidth + "px"')}else{var e;if(b&&b.constructor===Array){c=b[0]?typeof b[0]==="number"?b[0].toString():b[0].replace(/px/,""):h.css("top").replace(/px/,"");c=c.indexOf("%")===-1?c+' + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"':
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          parseInt(c.replace(/%/,""))+' * ((document.documentElement.clientHeight || document.body.clientHeight) / 100) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"';if(b[1]){e=typeof b[1]==="number"?b[1].toString():b[1].replace(/px/,"");e=e.indexOf("%")===-1?e+' + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"':parseInt(e.replace(/%/,""))+' * ((document.documentElement.clientWidth || document.body.clientWidth) / 100) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"'}}else{c=
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"';e='(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"'}g.removeExpression("top");g.removeExpression("left");g.setExpression("top",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             c);g.setExpression("left",e)}}})},focus:function(a){var b=this;a=a&&d.inArray(a,["first","last"])!==-1?a:"first";var c=d(":input:enabled:visible:"+a,b.d.wrap);setTimeout(function(){c.length>0?c.focus():b.d.wrap.focus()},10)},getDimensions:function(){var a=d(window);return[d.browser.opera&&d.browser.version>"9.5"&&d.fn.jquery<"1.3"||d.browser.opera&&d.browser.version<"9.5"&&d.fn.jquery>"1.2.6"?a[0].innerHeight:a.height(),a.width()]},getVal:function(a,b){return a?typeof a==="number"?a:a==="auto"?0:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      a.indexOf("%")>0?parseInt(a.replace(/%/,""))/100*(b==="h"?f[0]:f[1]):parseInt(a.replace(/px/,"")):null},update:function(a,b){var c=this;if(!c.d.data)return false;c.d.origHeight=c.getVal(a,"h");c.d.origWidth=c.getVal(b,"w");c.d.data.hide();a&&c.d.container.css("height",a);b&&c.d.container.css("width",b);c.setContainerDimensions();c.d.data.show();c.o.focus&&c.focus();c.unbindEvents();c.bindEvents()},setContainerDimensions:function(){var a=this,b=k||m,c=a.d.origHeight?a.d.origHeight:d.browser.opera?
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             a.d.container.height():a.getVal(b?a.d.container[0].currentStyle.height:a.d.container.css("height"),"h");b=a.d.origWidth?a.d.origWidth:d.browser.opera?a.d.container.width():a.getVal(b?a.d.container[0].currentStyle.width:a.d.container.css("width"),"w");var h=a.d.data.outerHeight(true),g=a.d.data.outerWidth(true);a.d.origHeight=a.d.origHeight||c;a.d.origWidth=a.d.origWidth||b;var e=a.o.maxHeight?a.getVal(a.o.maxHeight,"h"):null,i=a.o.maxWidth?a.getVal(a.o.maxWidth,"w"):null;e=e&&e<f[0]?e:f[0];i=i&&i<
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             f[1]?i:f[1];var j=a.o.minHeight?a.getVal(a.o.minHeight,"h"):"auto";c=c?a.o.autoResize&&c>e?e:c<j?j:c:h?h>e?e:a.o.minHeight&&j!=="auto"&&h<j?j:h:j;e=a.o.minWidth?a.getVal(a.o.minWidth,"w"):"auto";b=b?a.o.autoResize&&b>i?i:b<e?e:b:g?g>i?i:a.o.minWidth&&e!=="auto"&&g<e?e:g:e;a.d.container.css({height:c,width:b});a.d.wrap.css({overflow:h>c||g>b?"auto":"visible"});a.o.autoPosition&&a.setPosition()},setPosition:function(){var a=this,b,c;b=f[0]/2-a.d.container.outerHeight(true)/2;c=f[1]/2-a.d.container.outerWidth(true)/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     2;if(a.o.position&&Object.prototype.toString.call(a.o.position)==="[object Array]"){b=a.o.position[0]||b;c=a.o.position[1]||c}else{b=b;c=c}a.d.container.css({left:c,top:b})},watchTab:function(a){var b=this;if(d(a.target).parents(".simplemodal-container").length>0){b.inputs=d(":input:enabled:visible:first, :input:enabled:visible:last",b.d.data[0]);if(!a.shiftKey&&a.target===b.inputs[b.inputs.length-1]||a.shiftKey&&a.target===b.inputs[0]||b.inputs.length===0){a.preventDefault();b.focus(a.shiftKey?"last":
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              "first")}}else{a.preventDefault();b.focus()}},open:function(){var a=this;a.d.iframe&&a.d.iframe.show();if(d.isFunction(a.o.onOpen))a.o.onOpen.apply(a,[a.d]);else{a.d.overlay.show();a.d.container.show();a.d.data.show()}a.o.focus&&a.focus();a.bindEvents()},close:function(){var a=this;if(!a.d.data)return false;a.unbindEvents();if(d.isFunction(a.o.onClose)&&!a.occb){a.occb=true;a.o.onClose.apply(a,[a.d])}else{if(a.d.placeholder){var b=d("#simplemodal-placeholder");if(a.o.persist)b.replaceWith(a.d.data.removeClass("simplemodal-data").css("display",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         a.display));else{a.d.data.hide().remove();b.replaceWith(a.d.orig)}}else a.d.data.hide().remove();a.d.container.hide().remove();a.d.overlay.hide();a.d.iframe&&a.d.iframe.hide().remove();setTimeout(function(){a.d.overlay.remove();a.d={}},10)}}}})(jQuery);
