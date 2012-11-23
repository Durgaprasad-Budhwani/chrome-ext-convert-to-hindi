var x = 0;
var y = 0;

window.onmousedown = function(e){
	if (document.getElementById('rightclickandtranslate_tooltip')) {
		if (e.target.id != 'rightclickandtranslate_tooltip') {
			fade('rightclickandtranslate_tooltip', 0, 200, 0);
		}
	}
};

window.oncontextmenu = function(e) {
	x = e.pageX;
	y = e.pageY;
};

chrome.extension.onRequest.addListener(function(request) {
	if (request.action == "createTooltip") { createTooltip(request.text); }
});

var tooltip;

function createTooltip(tooltipSource) {
	tooltip = document.createElement("div");
	tooltip.id = "rightclickandtranslate_tooltip";
	tooltip.style.left = x + "px";
	tooltip.style.top = y + "px";
	tooltip.innerHTML = '<span class="info">'+ chrome.i18n.getMessage('translating') +'</span>';
	document.body.appendChild(tooltip);
	fade('rightclickandtranslate_tooltip', 1, 200, 0);

    callConverter(tooltipSource)  ;
}

function callConverter(sourceText) {
    if (sourceText != "") {       // TODO need to check the text
        var a = new XMLHttpRequest;
        a.onreadystatechange = readResponse;
        try {
            a.open("GET", "http://api.get-translator.com/translate/?to=hi&from=&text=" + sourceText, true);
            a.send(null);
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log("no content selected");
    }
}

function readResponse() {
    if (this.readyState == 4) try {
        if (this.status == 0) throw "Status = 0";
        var data = eval ("(" + this.responseText + ")");
        var displayResult = data["result"].replace(/\s/g, "&nbsp;");
        tooltip.innerHTML = '<span class="translation">' + displayResult + '</span>';
    } catch (b) {
    }
}

function fade(objToFadeID, IsFadeIn, timeToFade, delay)
{
	var objToFade = document.getElementById(objToFadeID);
	if(objToFade == null)
	return;

	var fadeXFactor = IsFadeIn==1?1:-1;

	if ((timeToFade==0)&&(delay==0))
	{
		objToFade.style.opacity = 1*IsFadeIn;
		objToFade.style.filter = 'alpha(opacity = ' + 100*IsFadeIn + ')';
		objToFade.fadeState=2*fadeXFactor;
		return;
	}

	if (delay == null)
	delay = 0;

	if (IsFadeIn)
	objToFade.OriginalFadeInTime = timeToFade;
	else
	objToFade.OriginalFadeOutTime = timeToFade;

	if(objToFade.fadeState != null)
	{

		if ((objToFade.fadeState==1*fadeXFactor)||(objToFade.fadeState==2*fadeXFactor)||(objToFade.fadeState==3*fadeXFactor))
		{
			return;
		}
		else if (objToFade.fadeState==-1*fadeXFactor)
		{
			objToFade.fadeState = 1*fadeXFactor;
			objToFade.timeToFade = timeToFade;
			if (IsFadeIn)
			{
				objToFade.fadeTimeLeft = timeToFade*(1-objToFade.fadeTimeLeft/objToFade.OriginalFadeOutTime);
			}
			else
			{
				objToFade.fadeTimeLeft = timeToFade*(1-objToFade.fadeTimeLeft/objToFade.OriginalFadeInTime);
			}

			return;
		}
		else if (objToFade.fadeState==-3*fadeXFactor)
		{
			objToFade.fadeState=3*fadeXFactor;
			objToFade.timeToFade = timeToFade;
			if (IsFadeIn)
			{
				objToFade.fadeTimeLeft = timeToFade*(1-objToFade.fadeTimeLeft/objToFade.OriginalFadeOutTime);
			}
			else
			{
				objToFade.fadeTimeLeft = timeToFade*(1-objToFade.fadeTimeLeft/objToFade.OriginalFadeInTime);
			}
			return;
		}
	}

	objToFade.timeToFade = timeToFade;
	objToFade.fadeTimeLeft = timeToFade;
	objToFade.fadeState = 3 * fadeXFactor;
	var now = new Date();
	now.setMilliseconds(now.getMilliseconds() + delay);
	setTimeout("animateFade(" + now.getTime() + ",'" + objToFadeID + "')", 10 + delay);
}

function animateFade(lastTick, elementID)
{
	var curTick = new Date().getTime();
	var elapsedTicks = curTick - lastTick;

	var element = document.getElementById(elementID);
	if (element.fadeState==3) element.fadeState=1;
	if (element.fadeState==-3) element.fadeState=-1;

	if(element.fadeTimeLeft <= elapsedTicks)
	{
		element.style.opacity = element.fadeState == 1 ? '1' : '0';
		element.style.filter = 'alpha(opacity = ' + (element.fadeState == 1 ? '100' : '0') + ')';
		if (element.fadeState == 1) {
			element.fadeState = 2;
		} else {
			element.fadeState = -2;
			element.parentNode.removeChild(element);
		}
		return;
	}

	element.fadeTimeLeft -= elapsedTicks;
	var newOpVal = element.fadeTimeLeft/element.timeToFade;
	if(element.fadeState == 1)
	newOpVal = 1 - newOpVal;
	element.style.opacity = newOpVal;
	element.style.filter = 'alpha(opacity = ' + (newOpVal*100) + ')';

	setTimeout("animateFade(" + curTick + ",'" + elementID + "')", 10);
}